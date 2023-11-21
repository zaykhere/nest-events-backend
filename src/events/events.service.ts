import { Repository } from "typeorm";
import { Event } from "./event.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {Logger, Injectable} from "@nestjs/common"
import { AttendeeAnswerEnum } from "./attendee.entity";

@Injectable()
export class EventService {
  private logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  private getEventsBaseQuery() {
    return this.eventsRepository.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  private getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap(
        'e.attendeeCount', 'e.attendees'
      )
      .loadRelationCountAndMap(
        'e.attendeeAccepted', 'e.attendees',
        'attendee', (qb) => qb.where(
          'attendee.answer = :answer',
          {answer: AttendeeAnswerEnum.Accepted}
        )
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected', 'e.attendees',
        'attendee', (qb) => qb.where(
          'attendee.answer = :answer',
          {answer: AttendeeAnswerEnum.Rejected}
        )
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe', 'e.attendees',
        'attendee', (qb) => qb.where(
          'attendee.answer = :answer',
          {answer: AttendeeAnswerEnum.Maybe}
        )
      )
     
  }

  public async getEvent(id: number): Promise<Event> | undefined {
    const query =  this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', {id});

    this.logger.debug(query.getSql());

    return await query.getOne();
  }
}
import { DeleteResult, Repository } from "typeorm";
import { Event } from "./event.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {Logger, Injectable} from "@nestjs/common"
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";
import { PaginateOptions, paginate } from '../pagination/paginator';

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

  private async getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

    if(!filter) return query;

    if(filter.when) {
      if(filter.when == WhenEventFilter.All) {
        return query;
      }

      else if(filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
        )
      }

      else if(filter.when == WhenEventFilter.Tomorrow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
        )
      }

      else if(filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      }

      else if(filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1');
      }
    }

    return query;
  }
  
  public async getEventsWithAttendeeCountFilteredPaginated (
    filter: ListEvents,
    paginateOptions: PaginateOptions
  ) {
    return await paginate(
      await this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions
    );
  }

  public async getEvent(id: number): Promise<Event> | undefined {
    const query =  this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', {id});

    this.logger.debug(query.getSql());

    return await query.getOne();
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository.createQueryBuilder('e').delete().where('id = :id', {id}).execute();
  }

}
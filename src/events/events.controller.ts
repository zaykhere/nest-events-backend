import { Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { CreateEventDto } from './input/create-event-dto';
import { Event } from './event.entity';
import { UpdateEventDto } from "./input/update-event-dto";
import { Like, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attendee } from "./attendee.entity";
import { EventService } from "./events.service";
import { ListEvents } from "./input/list.events";

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventService
  ) {}

  private readonly logger = new Logger(EventsController.name);

  @Get()
  async findAll(@Query() filter: ListEvents) {
    this.logger.log("Hit the findAll Route");
    const events =  await this.eventsService.getEventsWithAttendeeCountFiltered(filter);
    this.logger.debug(`Found ${events.length} events`);
    return events;
  }

  @Get('/practice')
  async practice() {
    const event = await this.repository.find({
      where: [
        {
          id: MoreThan(2),
        },
        {
          description: Like('%meet%')
        }
      ],
      take: 2
    })
    return event;
  }

  @Get('/practice2')
  async practice2() {
    // const event = await this.repository.findOne({
    //   where: {
    //     id: 1
    //   },
    //   relations: ['attendees']
    // })
    // return event;

    const event = new Event();
    event.id = 1;

    const attendee = new Attendee();
    attendee.name = "Jerry The Second";
    attendee.event = event;

    await this.attendeeRepository.save(attendee);

    return event;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    const event = await this.eventsService.getEvent(id);
    if(!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when)
    })
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOneBy({
      id
    });

    if(!event) {
      throw new NotFoundException();
    }

    return await this.repository.save({
      ...event,
      ...input,
      when: input?.when ?
        new Date(input.when) : event.when
    })
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOneBy({id});

    if(!event) {
      throw new NotFoundException();
    }

    await this.repository.remove(event);
  }
}
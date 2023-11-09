import { Body, Controller, Delete, Get, HttpCode, Logger, Param, ParseIntPipe, Patch, Post, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from './create-event-dto';
import { Event } from './event.entity';
import { UpdateEventDto } from "./update-event-dto";
import { Like, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>
  ) {}

  private readonly logger = new Logger(EventsController.name);

  @Get()
  async findAll() {
    this.logger.log("Hit the findAll Route");
    const events =  await this.repository.find();
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    console.log(typeof id);

    const event = await this.repository.findOneBy({
      id: id
    })
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

    await this.repository.remove(event);
  }
}
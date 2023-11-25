import { Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, ForbiddenException, Param, ParseIntPipe, Patch, Post, UseGuards, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from './input/create-event-dto';
import { UpdateEventDto } from "./input/update-event-dto";
import { EventService } from "./events.service";
import { ListEvents } from "./input/list.events";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AuthGuardJwt } from "src/auth/auth-guard.jwt";

@Controller('/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventService
  ) {}

  private readonly logger = new Logger(EventsController.name);

  @Get()
  @UsePipes(new ValidationPipe({transform: true}))
  async findAll(@Query() filter: ListEvents) {
    this.logger.log("Hit the findAll Route");
    const events =  await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(filter, {
      total: true,
      currentPage: filter.page,
      limit: 2
    });
    return events;
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
  @UseGuards(AuthGuardJwt)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  async update(@Param('id') id, @Body() input: UpdateEventDto, @CurrentUser() user: User) {
    const event = await this.eventsService.getEvent(id);

    if(!event) {
      throw new NotFoundException();
    }

    if(event.organizerId !== user.id) {
      throw new ForbiddenException("You are not authorized to edit this event");
    }

    return this.eventsService.updateEvent(event, UpdateEventDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id') id, @CurrentUser() user: User) {
    const event = await this.eventsService.getEvent(id);

    if(!event) {
      throw new NotFoundException();
    }

    if(event.organizerId !== user.id) {
      throw new ForbiddenException("You are not authorized to delete this event");
    }

    return await this.eventsService.deleteEvent(id);
    
  }
}
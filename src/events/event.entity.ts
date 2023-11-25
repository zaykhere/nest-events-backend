import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendee } from "./attendee.entity";
import {User} from "../auth/user.entity";
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  when: Date;

  @Column()
  address: string;

  @OneToMany(() => Attendee, (attendee) => attendee.event)
  attendees: Attendee[]

  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({name: 'organizerId'})
  organizer: User;

  @Column({nullable: true})
  organizerId: number;

  attendeeCount?: number;

  attendeeRejected?: number;

  attendeeMaybe?: number;

  attendeeAccepted?: number;
}
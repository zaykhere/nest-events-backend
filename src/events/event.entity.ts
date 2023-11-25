import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendee } from "./attendee.entity";
import {User} from "../auth/user.entity";
import { Expose } from "class-transformer";
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  when: Date;

  @Column()
  @Expose()
  address: string;

  @OneToMany(() => Attendee, (attendee) => attendee.event)
  @Expose()
  attendees: Attendee[]

  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({name: 'organizerId'})
  organizer: User;

  @Column({nullable: true})
  organizerId: number;

  @Expose()
  attendeeCount?: number;

  @Expose()
  attendeeRejected?: number;

  @Expose()
  attendeeMaybe?: number;

  @Expose()
  attendeeAccepted?: number;
}
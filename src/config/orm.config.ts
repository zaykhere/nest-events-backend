import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Event } from "src/events/event.entity";
import {registerAs} from "@nestjs/config"
import { Attendee } from "src/events/attendee.entity";
import { User } from "src/auth/user.entity";
import { Profile } from "src/auth/profile.entity";

export default registerAs('orm.config', (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Event, Attendee, User, Profile],
  synchronize: true
}))  
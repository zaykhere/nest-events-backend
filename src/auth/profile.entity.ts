import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from "class-transformer";
@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  age: number;
}
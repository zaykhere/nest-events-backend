import { Length, IsDateString } from "class-validator";

export class CreateEventDto {
  @Length(5,255)
  name: string;
  description: string;
  @IsDateString()
  when: string;
  address: string;
  
}
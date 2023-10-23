import { IsEmail, IsNotEmpty } from 'class-validator';

export class createSubscribeDto {
  @IsNotEmpty({ message: 'Email is empty' })
  @IsEmail()
  email: string;
}


import { IsNotEmpty, Matches } from 'class-validator';

export class createFeatureDto {
  @IsNotEmpty({ message: 'Title is empty' })
  @Matches(new RegExp("^[A-Z a-z-]{3,50}$"))
  title: string;
  @IsNotEmpty({ message: 'Description is empty' })
  description: string;
  icon: string;
}


export class updateFeatureDto {
  @IsNotEmpty({ message: 'Title is empty' })
  @Matches(new RegExp("^[A-Z a-z-]{3,50}$"))
  title: string;
  @IsNotEmpty({ message: 'Description is empty' })
  description: string;
  icon: string;
}


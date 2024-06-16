import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, IsDateString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, {message: 'Password must be at least 8 characters long'})
  password: string;

  @IsOptional()
  @IsString()
  @Length(9, 14 , {message: 'Number Phone must be at least 9 until 14 characters long'})
  no_phone: string;

  @IsOptional()
  @IsDateString()
  created_at?: Date;

  @IsOptional()
  @IsDateString()
  updated_at?: Date;
}

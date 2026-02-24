import { IsEmail, IsString, MinLength, Matches, IsOptional, IsEnum } from 'class-validator';

export class CreateAgentDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  line_id?: string;

  @IsOptional()
  @IsEnum(['agent', 'admin'], { message: 'Role must be either agent or admin' })
  role?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

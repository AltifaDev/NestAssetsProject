import { IsString, IsEmail, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  property_id: string;

  @IsString()
  @MinLength(2)
  customer_name: string;

  @IsString()
  @MinLength(10)
  customer_phone: string;

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

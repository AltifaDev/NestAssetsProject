import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { LeadStatus } from './update-lead-status.dto';

export class LeadFiltersDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsUUID()
  property_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}

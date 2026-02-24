import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportType {
  AGENT_PERFORMANCE = 'agent-performance',
}

export class ReportTypeDto {
  @ApiProperty({
    enum: ReportType,
    description: 'Type of report to generate',
    example: ReportType.AGENT_PERFORMANCE,
  })
  @IsEnum(ReportType)
  type: ReportType;
}

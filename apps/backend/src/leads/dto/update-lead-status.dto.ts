import { IsEnum } from 'class-validator';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  NEGOTIATING = 'negotiating',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus, {
    message: 'Status must be one of: new, contacted, qualified, negotiating, closed_won, closed_lost',
  })
  status: LeadStatus;
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadStatusDto, LeadFiltersDto, AddLeadNoteDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth('JWT-auth')
@Controller('api/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create lead', description: 'Create a new lead. Lead is automatically assigned to the authenticated agent.' })
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createLead(
    @CurrentUser() user: any,
    @Body() createLeadDto: CreateLeadDto,
  ) {
    return this.leadsService.createLead(user.id, createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads', description: 'Retrieve leads with filtering. Agents see only their own leads, admins see all.' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeads(
    @CurrentUser() user: any,
    @Query() filters: LeadFiltersDto,
  ) {
    return this.leadsService.getLeads(user.id, user.role, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID', description: 'Retrieve detailed information about a specific lead' })
  @ApiParam({ name: 'id', description: 'Lead UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not lead owner' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeadById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const lead = await this.leadsService.getLeadById(id);
    
    // Verify ownership or admin role
    if (user.role !== 'admin' && lead.agent_id !== user.id) {
      throw new Error('You do not have permission to view this lead');
    }

    return lead;
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update lead status', description: 'Update the status of a lead. Agents can only update their own leads.' })
  @ApiParam({ name: 'id', description: 'Lead UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateLeadStatusDto })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - not lead owner' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateLeadStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateLeadStatus(id, user.id, user.role, updateLeadStatusDto);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to lead', description: 'Add a note to a lead for tracking communication history. Agents can only add notes to their own leads.' })
  @ApiParam({ name: 'id', description: 'Lead UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: AddLeadNoteDto })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not lead owner' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addLeadNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() addLeadNoteDto: AddLeadNoteDto,
  ) {
    return this.leadsService.addLeadNote(id, user.id, user.role, addLeadNoteDto.note);
  }
}

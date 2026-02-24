import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create agent (Admin only)', description: 'Create a new agent account. Only accessible by administrators.' })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({ status: 201, description: 'Agent created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or email already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async createAgent(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.createAgent(createAgentDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all agents (Admin only)', description: 'Retrieve a list of all agents. Only accessible by administrators.' })
  @ApiResponse({ status: 200, description: 'Agents retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  async getAllAgents() {
    return this.agentsService.getAllAgents();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own profile', description: 'Retrieve the profile of the currently authenticated agent' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOwnProfile(@CurrentUser() user: any) {
    return this.agentsService.getAgentById(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update own profile', description: 'Update own profile with restricted fields (name, phone, bio, line_id only)' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateOwnProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.agentsService.updateOwnProfile(user.id, updateProfileDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID', description: 'Retrieve detailed information about a specific agent' })
  @ApiParam({ name: 'id', description: 'Agent UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Agent retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async getAgentById(@Param('id') id: string) {
    return this.agentsService.getAgentById(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update agent (Admin only)', description: 'Update agent information. Only accessible by administrators.' })
  @ApiParam({ name: 'id', description: 'Agent UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({ status: 200, description: 'Agent updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async updateAgent(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentsService.updateAgent(id, updateAgentDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete agent (Admin only)', description: 'Soft delete an agent (sets status to inactive). Only accessible by administrators.' })
  @ApiParam({ name: 'id', description: 'Agent UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Agent deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'Agent not found' })
  async deleteAgent(@Param('id') id: string) {
    await this.agentsService.deleteAgent(id);
    return { message: 'Agent deleted successfully' };
  }
}

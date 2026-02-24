import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import {
  SystemOverview,
  AgentPerformance,
  PropertyStats,
  Activity,
  AgentPerformanceReport,
} from './interfaces/admin.interface';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get system overview (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'System overview retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getSystemOverview(): Promise<SystemOverview> {
    return this.adminService.getSystemOverview();
  }

  @Get('top-agents')
  @ApiOperation({ summary: 'Get top performing agents (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of agents to return' })
  @ApiResponse({
    status: 200,
    description: 'Top performing agents retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getTopPerformingAgents(@Query('limit') limit?: number): Promise<AgentPerformance[]> {
    return this.adminService.getTopPerformingAgents(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('top-properties')
  @ApiOperation({ summary: 'Get most viewed properties (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of properties to return' })
  @ApiResponse({
    status: 200,
    description: 'Most viewed properties retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getMostViewedProperties(@Query('limit') limit?: number): Promise<PropertyStats[]> {
    return this.adminService.getMostViewedProperties(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of activities to return' })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getRecentActivities(@Query('limit') limit?: number): Promise<Activity[]> {
    return this.adminService.getRecentActivities(limit ? parseInt(limit.toString()) : 50);
  }

  @Get('reports/agent-performance')
  @ApiOperation({ summary: 'Get agent performance report (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Agent performance report generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAgentPerformanceReport(): Promise<AgentPerformanceReport[]> {
    return this.adminService.getAgentPerformanceReport();
  }
}

import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DateRangeDto } from './dto/date-range.dto';
import { AgentDashboard, AdminDashboard } from './interfaces/dashboard.interface';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('agent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get agent dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Agent dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAgentDashboard(
    @Request() req,
    @Query() dateRange?: DateRangeDto,
  ): Promise<AgentDashboard> {
    const agentId = req.user.id;
    return this.dashboardService.getAgentDashboard(agentId, dateRange);
  }

  @Get('admin')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard data (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async getAdminDashboard(): Promise<AdminDashboard> {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('trends')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance trends for agent' })
  @ApiResponse({
    status: 200,
    description: 'Performance trends retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getPerformanceTrends(
    @Request() req,
    @Query() dateRange?: DateRangeDto,
  ): Promise<{ monthly_trends: any[] }> {
    const agentId = req.user.id;
    return this.dashboardService.getPerformanceTrends(agentId, dateRange);
  }
}

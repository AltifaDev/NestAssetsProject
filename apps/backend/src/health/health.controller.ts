import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { SupabaseService } from '../supabase/supabase.service';
import { MetricsService } from './metrics.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private supabaseService: SupabaseService,
    private metricsService: MetricsService,
  ) {}

  @Get('health')
  @HealthCheck()
  @ApiOperation({ 
    summary: 'Health check endpoint', 
    description: 'Check the health status of the application including database and Supabase connections' 
  })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'System is unhealthy - database connection failed' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.checkDatabase(),
      async () => this.checkSupabase(),
    ]);
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'System metrics endpoint', 
    description: 'Get system metrics including request count, error count, and average response time' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        requestCount: { type: 'number', example: 1234 },
        errorCount: { type: 'number', example: 5 },
        totalResponseTime: { type: 'number', example: 12345.67 },
        averageResponseTime: { type: 'number', example: 10.02 },
      },
    },
  })
  getMetrics() {
    return this.metricsService.getMetrics();
  }

  private async checkDatabase(): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      
      // Simple query to check database connection
      const { error } = await supabase
        .from('agents')
        .select('id')
        .limit(1);

      if (error) {
        return {
          database: {
            status: 'down',
            message: error.message,
          },
        };
      }

      return {
        database: {
          status: 'up',
        },
      };
    } catch (error: any) {
      return {
        database: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }

  private async checkSupabase(): Promise<any> {
    try {
      const supabase = this.supabaseService.getClient();
      
      // Check Supabase connection
      const { error } = await supabase
        .from('agents')
        .select('count')
        .limit(1);

      if (error) {
        return {
          supabase: {
            status: 'down',
            message: error.message,
          },
        };
      }

      return {
        supabase: {
          status: 'up',
        },
      };
    } catch (error: any) {
      return {
        supabase: {
          status: 'down',
          message: error.message,
        },
      };
    }
  }
}

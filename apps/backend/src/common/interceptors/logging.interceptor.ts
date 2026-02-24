import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../health/metrics.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const startTime = Date.now();

    // Increment request count
    this.metricsService.incrementRequestCount();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const { statusCode } = response;

          // Add response time to metrics
          this.metricsService.addResponseTime(responseTime);

          // Log request details
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${ip}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Increment error count
          this.metricsService.incrementErrorCount();

          // Add response time to metrics
          this.metricsService.addResponseTime(responseTime);

          // Log error request
          this.logger.error(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${ip}`,
          );
        },
      }),
    );
  }
}

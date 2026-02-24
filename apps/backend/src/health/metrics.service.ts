import { Injectable } from '@nestjs/common';

export interface Metrics {
  requestCount: number;
  errorCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
}

@Injectable()
export class MetricsService {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;

  incrementRequestCount(): void {
    this.requestCount++;
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  addResponseTime(time: number): void {
    this.totalResponseTime += time;
  }

  getMetrics(): Metrics {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      totalResponseTime: this.totalResponseTime,
      averageResponseTime:
        this.requestCount > 0
          ? this.totalResponseTime / this.requestCount
          : 0,
    };
  }

  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }
}

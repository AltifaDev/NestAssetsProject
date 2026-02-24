import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Remove password_hash from response data
        return this.removePasswordHash(data);
      }),
    );
  }

  private removePasswordHash(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.removePasswordHash(item));
    }

    if (typeof data === 'object') {
      const cleaned: any = {};
      for (const key in data) {
        if (key === 'password_hash') {
          continue; // Skip password_hash field
        }
        if (data.hasOwnProperty(key)) {
          cleaned[key] = this.removePasswordHash(data[key]);
        }
      }
      return cleaned;
    }

    return data;
  }
}

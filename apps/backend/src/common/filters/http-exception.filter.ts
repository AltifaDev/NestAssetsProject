import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      // Log full error with stack trace for debugging
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
      // In development, return detailed error message
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
        errors = { stack: exception.stack };
      } else {
        message = 'Internal server error';
      }
    }

    // Mask sensitive data in logs
    const sanitizedRequest = this.sanitizeRequest(request);
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      JSON.stringify({
        body: sanitizedRequest,
        query: request.query,
        params: request.params,
      }),
    );

    response.status(status).json({
      status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private sanitizeRequest(request: Request): any {
    if (!request.body) return {};

    const sanitized = { ...request.body };

    // Mask password fields
    if (sanitized.password) {
      sanitized.password = '***';
    }

    // Mask email addresses
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }

    // Mask customer email if present
    if (sanitized.customer_email) {
      sanitized.customer_email = this.maskEmail(sanitized.customer_email);
    }

    // Mask phone numbers
    if (sanitized.phone) {
      sanitized.phone = this.maskPhone(sanitized.phone);
    }

    if (sanitized.customer_phone) {
      sanitized.customer_phone = this.maskPhone(sanitized.customer_phone);
    }

    return sanitized;
  }

  private maskEmail(email: string): string {
    if (!email || typeof email !== 'string') return email;
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    return `${local[0]}***@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return phone;
    // Mask middle digits, keep first and last few
    if (phone.length > 6) {
      return `${phone.substring(0, 3)}***${phone.substring(phone.length - 2)}`;
    }
    return '***';
  }
}

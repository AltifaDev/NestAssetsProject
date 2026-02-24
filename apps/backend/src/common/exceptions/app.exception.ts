import { HttpException, HttpStatus } from '@nestjs/common';

export interface ValidationError {
  field: string;
  message: string;
}

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    errors?: ValidationError[],
  ) {
    super(
      {
        message,
        errors,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

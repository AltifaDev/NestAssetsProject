import { HttpStatus } from '@nestjs/common';
import { AppException, ValidationError } from './app.exception';

export class ValidationException extends AppException {
  constructor(errors: ValidationError[]) {
    super('Validation failed', HttpStatus.BAD_REQUEST, errors);
  }
}

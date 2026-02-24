import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { AppException } from '../exceptions';
import { maskSensitiveData } from '../utils/logger.util';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  async executeQuery<T>(query: () => Promise<T>): Promise<T> {
    try {
      return await query();
    } catch (error: any) {
      // Log full error for debugging with sensitive data masked
      this.logger.error('Database error:', maskSensitiveData({
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack,
      }));

      // Return generic error to client based on error code
      if (error.code === '23505') {
        // Unique constraint violation
        throw new AppException(
          'A record with this value already exists',
          HttpStatus.CONFLICT,
        );
      } else if (error.code === '23503') {
        // Foreign key violation
        throw new AppException(
          'Referenced record does not exist',
          HttpStatus.BAD_REQUEST,
        );
      } else if (error.code === '23502') {
        // Not null violation
        throw new AppException(
          'Required field is missing',
          HttpStatus.BAD_REQUEST,
        );
      } else if (error.code === '22P02') {
        // Invalid text representation
        throw new AppException(
          'Invalid data format',
          HttpStatus.BAD_REQUEST,
        );
      } else if (error.code === '42P01') {
        // Undefined table
        this.logger.error('Database schema error: table does not exist');
        throw new AppException(
          'Database operation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        // Generic database error
        throw new AppException(
          'Database operation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Handle Supabase-specific errors
   */
  handleSupabaseError(error: any): never {
    this.logger.error('Supabase error:', maskSensitiveData({
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    }));

    // Map Supabase error codes to appropriate HTTP responses
    if (error.code === 'PGRST116') {
      // No rows returned
      throw new AppException('Record not found', HttpStatus.NOT_FOUND);
    } else if (error.code === '23505') {
      throw new AppException(
        'A record with this value already exists',
        HttpStatus.CONFLICT,
      );
    } else {
      throw new AppException(
        'Database operation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

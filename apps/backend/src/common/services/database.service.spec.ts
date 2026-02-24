import { DatabaseService } from './database.service';
import { HttpStatus } from '@nestjs/common';
import { AppException } from '../exceptions';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService();
  });

  describe('executeQuery', () => {
    it('should return result when query succeeds', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ data: 'test' });

      const result = await service.executeQuery(mockQuery);

      expect(result).toEqual({ data: 'test' });
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle unique constraint violation (23505)', async () => {
      const mockQuery = jest.fn().mockRejectedValue({
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      });

      await expect(service.executeQuery(mockQuery)).rejects.toThrow(
        AppException,
      );

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(HttpStatus.CONFLICT);
        expect((error as AppException).message).toContain('already exists');
      }
    });

    it('should handle foreign key violation (23503)', async () => {
      const mockQuery = jest.fn().mockRejectedValue({
        code: '23503',
        message: 'foreign key constraint violation',
      });

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as AppException).message).toContain('does not exist');
      }
    });

    it('should handle not null violation (23502)', async () => {
      const mockQuery = jest.fn().mockRejectedValue({
        code: '23502',
        message: 'null value in column violates not-null constraint',
      });

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as AppException).message).toContain('Required field');
      }
    });

    it('should handle invalid text representation (22P02)', async () => {
      const mockQuery = jest.fn().mockRejectedValue({
        code: '22P02',
        message: 'invalid input syntax for type uuid',
      });

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as AppException).message).toContain('Invalid data');
      }
    });

    it('should handle generic database errors', async () => {
      const mockQuery = jest.fn().mockRejectedValue({
        code: 'UNKNOWN',
        message: 'Unknown database error',
      });

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect((error as AppException).message).toBe(
          'Database operation failed',
        );
      }
    });

    it('should log full error details for debugging', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      const mockQuery = jest.fn().mockRejectedValue({
        code: '23505',
        message: 'duplicate key',
        detail: 'Key (email)=(test@example.com) already exists',
        stack: 'Error stack trace',
      });

      try {
        await service.executeQuery(mockQuery);
      } catch (error) {
        // Error is expected
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Database error:',
        expect.objectContaining({
          message: 'duplicate key',
          code: '23505',
          detail: 'Key (email)=(test@example.com) already exists',
        }),
      );
    });
  });

  describe('handleSupabaseError', () => {
    it('should handle PGRST116 (no rows returned)', () => {
      const error = {
        code: 'PGRST116',
        message: 'No rows returned',
      };

      try {
        service.handleSupabaseError(error);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((error as AppException).message).toContain('not found');
      }
    });

    it('should handle generic Supabase errors', () => {
      const error = {
        code: 'UNKNOWN',
        message: 'Unknown Supabase error',
      };

      try {
        service.handleSupabaseError(error);
      } catch (error) {
        expect(error).toBeInstanceOf(AppException);
        expect((error as AppException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });

    it('should log Supabase error details', () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error');
      const error = {
        code: 'PGRST116',
        message: 'No rows returned',
        details: 'Additional details',
        hint: 'Check your query',
      };

      try {
        service.handleSupabaseError(error);
      } catch (error) {
        // Error is expected
      }

      expect(loggerSpy).toHaveBeenCalledWith(
        'Supabase error:',
        expect.objectContaining({
          message: 'No rows returned',
          code: 'PGRST116',
          details: 'Additional details',
          hint: 'Check your query',
        }),
      );
    });
  });
});

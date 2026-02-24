import { GlobalExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ValidationException } from '../exceptions';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'POST',
      url: '/api/test',
      body: {
        email: 'test@example.com',
        password: 'secret123',
        phone: '0812345678',
      },
      query: {},
      params: {},
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  describe('HTTP Exception Handling', () => {
    it('should handle ValidationException with proper format', () => {
      const exception = new ValidationException([
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ]);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Password too short' },
          ],
          timestamp: expect.any(String),
          path: '/api/test',
        }),
      );
    });

    it('should handle generic HttpException', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.NOT_FOUND,
          message: 'Not found',
          timestamp: expect.any(String),
          path: '/api/test',
        }),
      );
    });

    it('should handle unexpected errors with generic message', () => {
      const exception = new Error('Database connection failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          timestamp: expect.any(String),
          path: '/api/test',
        }),
      );
    });
  });

  describe('Sensitive Data Masking', () => {
    it('should mask password in logs', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const loggedData = JSON.parse(loggerSpy.mock.calls[0][1]);
      expect(loggedData.body.password).toBe('***');
    });

    it('should mask email in logs', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const loggedData = JSON.parse(loggerSpy.mock.calls[0][1]);
      expect(loggedData.body.email).toMatch(/^t\*\*\*@example\.com$/);
    });

    it('should mask phone number in logs', () => {
      const loggerSpy = jest.spyOn(filter['logger'], 'error');
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      const loggedData = JSON.parse(loggerSpy.mock.calls[0][1]);
      expect(loggedData.body.phone).toMatch(/^081\*\*\*78$/);
    });
  });

  describe('Error Response Format', () => {
    it('should include all required fields in error response', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(Number),
          message: expect.any(String),
          timestamp: expect.any(String),
          path: expect.any(String),
        }),
      );
    });

    it('should include errors array when present', () => {
      const exception = new ValidationException([
        { field: 'test', message: 'Test error' },
      ]);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        }),
      );
    });
  });
});

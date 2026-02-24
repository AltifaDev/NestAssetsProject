# Common Module

This directory contains shared utilities, filters, guards, interceptors, and services used across the application.

## Error Handling

### Custom Exception Classes

The application uses a hierarchy of custom exception classes for consistent error handling:

#### AppException (Base Class)
Base exception class that all custom exceptions extend from.

```typescript
import { AppException } from './common/exceptions';

throw new AppException('Custom error message', HttpStatus.BAD_REQUEST);
```

#### ValidationException
Used for validation errors with field-level error details.

```typescript
import { ValidationException } from './common/exceptions';

throw new ValidationException([
  { field: 'email', message: 'Invalid email format' },
  { field: 'password', message: 'Password too short' }
]);
```

#### UnauthorizedException
Used for authentication failures (401).

```typescript
import { UnauthorizedException } from './common/exceptions';

throw new UnauthorizedException('Invalid credentials');
```

#### ForbiddenException
Used for authorization failures (403).

```typescript
import { ForbiddenException } from './common/exceptions';

throw new ForbiddenException('You do not have permission to access this resource');
```

#### NotFoundException
Used when a resource is not found (404).

```typescript
import { NotFoundException } from './common/exceptions';

throw new NotFoundException('Property');
// Returns: "Property not found"
```

### Global Exception Filter

The `GlobalExceptionFilter` catches all exceptions and formats them consistently:

**Features:**
- Consistent error response format
- Automatic logging with sensitive data masking
- Stack trace logging for debugging (server-side only)
- Generic error messages for database errors (security)

**Error Response Format:**
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

**Sensitive Data Masking:**
The filter automatically masks sensitive data in logs:
- Passwords: `***`
- Emails: `u***@example.com`
- Phone numbers: `081***78`

### Database Service

The `DatabaseService` provides a wrapper for database operations with error handling:

```typescript
import { DatabaseService } from './common/services/database.service';

@Injectable()
export class MyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createRecord(data: any) {
    return this.databaseService.executeQuery(async () => {
      // Your database operation here
      return await this.supabase.from('table').insert(data);
    });
  }
}
```

**Features:**
- Automatic error logging with full details
- Maps database error codes to appropriate HTTP responses
- Returns generic error messages to clients (security)
- Handles common PostgreSQL error codes:
  - `23505`: Unique constraint violation → 409 Conflict
  - `23503`: Foreign key violation → 400 Bad Request
  - `23502`: Not null violation → 400 Bad Request
  - `22P02`: Invalid data format → 400 Bad Request

### Validation Pipe

The global validation pipe is configured in `main.ts` with the following options:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip unknown properties
    forbidNonWhitelisted: true,   // Throw error for unknown properties
    transform: true,              // Auto-transform to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

**Usage in DTOs:**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## HTTP Status Codes

The application uses standard HTTP status codes:

- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Validation errors, invalid data
- **401 Unauthorized**: Authentication failures
- **403 Forbidden**: Authorization failures
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **500 Internal Server Error**: Unexpected server errors

## Logging Strategy

The application uses NestJS Logger with the following levels:

- **ERROR**: Exceptions, failed operations, authentication failures
- **WARN**: Deprecated API usage, rate limit warnings
- **INFO**: Successful operations, user actions (not implemented yet)
- **DEBUG**: Detailed execution flow (development only)

**Sensitive Data Protection:**
All logs automatically mask:
- Password fields
- Email addresses (partial masking)
- Phone numbers (partial masking)

## Best Practices

1. **Always use custom exceptions** instead of throwing generic errors
2. **Use DatabaseService.executeQuery()** for all database operations
3. **Never expose database error details** to clients
4. **Log full error details** server-side for debugging
5. **Use appropriate HTTP status codes** for different error types
6. **Validate all input** using class-validator decorators in DTOs
7. **Never log sensitive data** in plain text

## Example Usage

### Service with Error Handling

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService, NotFoundException } from '../common';

@Injectable()
export class PropertyService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getPropertyById(id: string) {
    const result = await this.databaseService.executeQuery(async () => {
      return await this.supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
    });

    if (!result.data) {
      throw new NotFoundException('Property');
    }

    return result.data;
  }
}
```

### Controller with Validation

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
export class PropertyController {
  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    // Validation happens automatically via ValidationPipe
    // If validation fails, ValidationException is thrown
    return this.propertyService.create(createPropertyDto);
  }
}
```

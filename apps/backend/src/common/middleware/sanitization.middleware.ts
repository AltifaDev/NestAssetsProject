import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters (create new object instead of modifying)
    if (req.query && Object.keys(req.query).length > 0) {
      const sanitizedQuery = this.sanitizeObject(req.query);
      // Replace query object properties instead of reassigning
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, sanitizedQuery);
    }

    // Sanitize URL parameters (create new object instead of modifying)
    if (req.params && Object.keys(req.params).length > 0) {
      const sanitizedParams = this.sanitizeObject(req.params);
      // Replace params object properties instead of reassigning
      Object.keys(req.params).forEach(key => delete req.params[key]);
      Object.assign(req.params, sanitizedParams);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove potential SQL injection patterns
    // This is a basic sanitization - Supabase client already uses parameterized queries
    // which is the primary defense against SQL injection
    
    // Remove null bytes
    str = str.replace(/\0/g, '');
    
    // Remove potential XSS patterns (basic)
    str = str.replace(/<script[^>]*>.*?<\/script>/gi, '');
    str = str.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    
    // Note: We don't escape SQL characters here because:
    // 1. Supabase client uses parameterized queries
    // 2. class-validator handles input validation
    // 3. Escaping here could interfere with legitimate data
    
    return str;
  }
}

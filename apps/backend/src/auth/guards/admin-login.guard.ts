import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminLoginGuard implements CanActivate {
  private readonly logger = new Logger(AdminLoginGuard.name);
  private readonly loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 300000; // 5 minutes
  private readonly ATTEMPT_WINDOW = 900000; // 15 minutes

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const email = request.body?.email;

    // Check if IP is locked out
    const attempts = this.loginAttempts.get(ip);
    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

      // Reset if outside attempt window
      if (timeSinceLastAttempt > this.ATTEMPT_WINDOW) {
        this.loginAttempts.delete(ip);
      }
      // Check if locked out
      else if (attempts.count >= this.MAX_ATTEMPTS && timeSinceLastAttempt < this.LOCKOUT_TIME) {
        this.logger.warn(`Admin login blocked - too many attempts from IP: ${ip}, Email: ${email}`);
        throw new UnauthorizedException(
          `Too many login attempts. Please try again in ${Math.ceil((this.LOCKOUT_TIME - timeSinceLastAttempt) / 60000)} minutes.`,
        );
      }
      // Reset after lockout period
      else if (timeSinceLastAttempt >= this.LOCKOUT_TIME) {
        this.loginAttempts.delete(ip);
      }
    }

    return true;
  }

  recordFailedAttempt(ip: string, email: string): void {
    const attempts = this.loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(ip, attempts);

    this.logger.warn(`Failed admin login attempt ${attempts.count}/${this.MAX_ATTEMPTS} from IP: ${ip}, Email: ${email}`);
  }

  resetAttempts(ip: string): void {
    this.loginAttempts.delete(ip);
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { User } from './interfaces/user.interface';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { ValidationException } from '../common/exceptions/validation.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const supabase = this.supabaseService.getClient();

    // Check if email already exists (requirement 3.5)
    const { data: existingUser } = await supabase
      .from('agents')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      throw new ValidationException([
        { field: 'email', message: 'Email already exists' },
      ]);
    }

    // Hash password before storing (requirement 1.3)
    const passwordHash = await this.hashPassword(dto.password);

    // Create agent record in database
    const { data, error } = await supabase
      .from('agents')
      .insert({
        email: dto.email,
        password_hash: passwordHash,
        name: dto.name,
        phone: dto.phone || null,
        line_id: dto.line_id || null,
        role: 'agent',
        verified: false,
      })
      .select('id, email, name, phone, line_id, role, bio, verified, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to register: ${error.message}`);
    }

    // Generate JWT token (requirement 1.1)
    const accessToken = await this.generateToken({
      ...data,
      password_hash: passwordHash,
    });

    return {
      access_token: accessToken,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Validate user credentials
    const user = await this.validateUser(dto.email, dto.password);

    // Generate JWT token for valid credentials (requirement 1.1)
    const accessToken = await this.generateToken(user);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const supabase = this.supabaseService.getClient();

    // Find user by email
    const { data: user, error } = await supabase
      .from('agents')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Return 401 error for invalid credentials (requirement 1.2)
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password with hash in database (requirement 1.3)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Return 401 error for invalid credentials (requirement 1.2)
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Minimum 10 salt rounds as per requirement 1.3
    return bcrypt.hash(password, saltRounds);
  }

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    // JWT expiration is set to 24 hours in the module configuration (requirement 1.7)
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string): Promise<Omit<User, 'password_hash'>> {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('agents')
      .select('id, email, name, phone, line_id, role, bio, verified, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    // Return user information excluding password_hash (requirement 14.4)
    return user;
  }
}

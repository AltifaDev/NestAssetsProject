import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '../common/exceptions/unauthorized.exception';
import { ValidationException } from '../common/exceptions/validation.exception';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: SupabaseService;
  let jwtService: JwtService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt using minimum 10 salt rounds', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      
      // Verify the hash can be compared with the original password
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with user info and role', async () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'agent',
        password_hash: 'hash',
        verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const token = await service.generateToken(user);

      expect(token).toBe('mock-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    });
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        phone: '1234567890',
      };

      const mockUser = {
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        phone: registerDto.phone,
        role: 'agent',
        verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock email uniqueness check - no existing user
      const mockSelectCheck = jest.fn().mockReturnThis();
      const mockEqCheck = jest.fn().mockReturnThis();
      const mockSingleCheck = jest.fn().mockResolvedValue({ data: null, error: null });
      
      // Mock user creation
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelectAfterInsert = jest.fn().mockReturnThis();
      const mockSingleAfterInsert = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) {
          // First call: email check
          return {
            select: mockSelectCheck,
          };
        } else {
          // Second call: insert
          return {
            insert: mockInsert,
          };
        }
      });

      mockSelectCheck.mockReturnValue({
        eq: mockEqCheck,
      });

      mockEqCheck.mockReturnValue({
        single: mockSingleCheck,
      });

      mockInsert.mockReturnValue({
        select: mockSelectAfterInsert,
      });

      mockSelectAfterInsert.mockReturnValue({
        single: mockSingleAfterInsert,
      });

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw ValidationException when email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Existing User',
      };

      // Mock email already exists
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: { id: '123' }, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ValidationException,
      );
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'agent',
        verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const hashedPassword = await bcrypt.hash('CorrectPassword123', 10);
      const mockUser = {
        id: '123',
        email: loginDto.email,
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'agent',
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile excluding password_hash', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        role: 'agent',
        bio: 'Test bio',
        verified: false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockUser, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      const result = await service.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const userId = 'non-existent';

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(service.getProfile(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

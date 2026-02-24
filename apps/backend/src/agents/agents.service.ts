import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Agent } from './interfaces/agent.interface';
import { ValidationException } from '../common/exceptions/validation.exception';
import { NotFoundException } from '../common/exceptions/not-found.exception';

@Injectable()
export class AgentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createAgent(dto: CreateAgentDto): Promise<Omit<Agent, 'password_hash'>> {
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

    // Create agent record in database (requirement 3.1)
    const { data, error } = await supabase
      .from('agents')
      .insert({
        email: dto.email,
        password_hash: passwordHash,
        name: dto.name,
        phone: dto.phone || null,
        line_id: dto.line_id || null,
        role: dto.role || 'agent',
        bio: dto.bio || null,
        verified: false,
        status: 'active',
      })
      .select('id, email, name, phone, line_id, role, bio, verified, status, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    return data;
  }

  async getAllAgents(): Promise<Omit<Agent, 'password_hash'>[]> {
    const supabase = this.supabaseService.getClient();

    // Return all agents with their profile information (requirement 3.2)
    const { data, error } = await supabase
      .from('agents')
      .select('id, email, name, phone, line_id, role, bio, verified, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get agents: ${error.message}`);
    }

    return data || [];
  }

  async getAgentById(id: string): Promise<Omit<Agent, 'password_hash'>> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('agents')
      .select('id, email, name, phone, line_id, role, bio, verified, status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Agent not found');
    }

    return data;
  }

  async updateAgent(id: string, dto: UpdateAgentDto): Promise<Omit<Agent, 'password_hash'>> {
    const supabase = this.supabaseService.getClient();

    // Check if agent exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    // Check email uniqueness if email is being updated (requirement 3.5)
    if (dto.email) {
      const { data: emailExists } = await supabase
        .from('agents')
        .select('id')
        .eq('email', dto.email)
        .neq('id', id)
        .single();

      if (emailExists) {
        throw new ValidationException([
          { field: 'email', message: 'Email already exists' },
        ]);
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.line_id !== undefined) updateData.line_id = dto.line_id;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.verified !== undefined) updateData.verified = dto.verified;
    if (dto.status !== undefined) updateData.status = dto.status;

    // Update agent profile (requirement 3.3)
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select('id, email, name, phone, line_id, role, bio, verified, status, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update agent: ${error.message}`);
    }

    return data;
  }

  async deleteAgent(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Check if agent exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    // Soft delete by setting status to inactive (requirement 3.4)
    const { error } = await supabase
      .from('agents')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete agent: ${error.message}`);
    }
  }

  async updateOwnProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<Agent, 'password_hash'>> {
    const supabase = this.supabaseService.getClient();

    // Check if agent exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingAgent) {
      throw new NotFoundException('Agent not found');
    }

    // Build update object with restricted fields (requirement 3.6)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.line_id !== undefined) updateData.line_id = dto.line_id;

    // Update own profile with restricted fields (requirement 3.6)
    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, name, phone, line_id, role, bio, verified, status, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Minimum 10 salt rounds as per requirement 1.3
    return bcrypt.hash(password, saltRounds);
  }
}

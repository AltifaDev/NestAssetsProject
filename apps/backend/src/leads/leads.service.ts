import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLeadDto, UpdateLeadStatusDto, LeadFiltersDto } from './dto';
import { Lead } from './interfaces';

@Injectable()
export class LeadsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createLead(agentId: string, createLeadDto: CreateLeadDto): Promise<Lead> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('leads')
      .insert({
        agent_id: agentId,
        property_id: createLeadDto.property_id,
        customer_name: createLeadDto.customer_name,
        customer_phone: createLeadDto.customer_phone,
        customer_email: createLeadDto.customer_email,
        notes: createLeadDto.notes,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return data;
  }

  async getLeads(userId: string, role: string, filters?: LeadFiltersDto): Promise<Lead[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('leads').select('*');

    // Role-based filtering: agents see only their leads, admins see all
    if (role !== 'admin') {
      query = query.eq('agent_id', userId);
    }

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.property_id) {
      query = query.eq('property_id', filters.property_id);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    return data || [];
  }

  async getLeadById(id: string): Promise<Lead> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        properties:property_id (
          id,
          title,
          price,
          location,
          property_type
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return data;
  }

  async updateLeadStatus(id: string, userId: string, role: string, updateLeadStatusDto: UpdateLeadStatusDto): Promise<Lead> {
    // First verify the lead exists and check ownership
    const lead = await this.getLeadById(id);

    if (role !== 'admin' && lead.agent_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this lead');
    }

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('leads')
      .update({
        status: updateLeadStatusDto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`);
    }

    return data;
  }

  async addLeadNote(id: string, userId: string, role: string, note: string): Promise<Lead> {
    // First verify the lead exists and check ownership
    const lead = await this.getLeadById(id);

    if (role !== 'admin' && lead.agent_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this lead');
    }

    const supabase = this.supabaseService.getClient();

    // Append note to existing notes
    const existingNotes = lead.notes || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

    const { data, error } = await supabase
      .from('leads')
      .update({
        notes: updatedNotes,
        updated_at: timestamp,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add note to lead: ${error.message}`);
    }

    return data;
  }
}

/**
 * OWNERSHIP VERIFICATION HELPER - USAGE EXAMPLES
 * 
 * This file demonstrates how to use the ownership verification helpers
 * in your controllers and services to implement role-based access control.
 */

import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { verifyOwnership, verifyOwnershipOrAdmin, isOwner } from './ownership.helper';

// Example 1: Property Controller with Ownership Verification
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyControllerExample {
  constructor(private readonly propertyService: any) {}

  /**
   * Update property - Only owner can update
   * Validates: Requirements 2.4, 2.5, 4.5
   */
  @Put(':id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updateData: any,
    @CurrentUser() user: any,
  ) {
    // Get the property to check ownership
    const property = await this.propertyService.getPropertyById(id);
    
    // Verify that the current user owns this property
    // Throws ForbiddenException (403) if ownership verification fails
    verifyOwnership(property.agent_id, user.id, 'property');
    
    // If we reach here, user owns the property
    return this.propertyService.updateProperty(id, updateData);
  }

  /**
   * Delete property - Only owner can delete
   * Validates: Requirements 2.4, 2.5, 4.6
   */
  @Delete(':id')
  async deleteProperty(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    
    // Verify ownership before allowing deletion
    verifyOwnership(property.agent_id, user.id, 'property');
    
    return this.propertyService.deleteProperty(id);
  }

  /**
   * Get property - Owner or Admin can view
   * Validates: Requirements 2.2, 2.4, 4.3
   */
  @Get(':id')
  async getProperty(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    
    // Allow access if user is owner OR admin
    verifyOwnershipOrAdmin(property.agent_id, user.id, user.role, 'property');
    
    return property;
  }
}

// Example 2: Lead Controller with Ownership Verification
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadControllerExample {
  constructor(private readonly leadService: any) {}

  /**
   * Update lead status - Only assigned agent can update
   * Validates: Requirements 2.4, 6.3, 6.4
   */
  @Put(':id/status')
  async updateLeadStatus(
    @Param('id') id: string,
    @Body() statusData: any,
    @CurrentUser() user: any,
  ) {
    const lead = await this.leadService.getLeadById(id);
    
    // Verify that the current user is the assigned agent
    verifyOwnership(lead.agent_id, user.id, 'lead');
    
    return this.leadService.updateLeadStatus(id, statusData.status);
  }

  /**
   * Get all leads - Agent sees only their leads, Admin sees all
   * Validates: Requirements 2.2, 6.2, 6.6
   */
  @Get()
  async getLeads(@CurrentUser() user: any) {
    // Admin gets all leads, agents get only their own
    if (user.role === 'admin') {
      return this.leadService.getAllLeads();
    }
    
    return this.leadService.getLeadsByAgentId(user.id);
  }
}

// Example 3: Agent Profile Controller
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentControllerExample {
  constructor(private readonly agentService: any) {}

  /**
   * Update agent profile - Only owner can update their own profile
   * Validates: Requirements 2.4, 2.5, 3.6
   */
  @Put('me')
  async updateOwnProfile(
    @Body() updateData: any,
    @CurrentUser() user: any,
  ) {
    // For self-update, we already know the user from JWT
    // Just ensure they can only update allowed fields
    const allowedFields = ['name', 'phone', 'bio', 'line_id'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});
    
    return this.agentService.updateAgent(user.id, filteredData);
  }

  /**
   * Update any agent - Admin only
   * Validates: Requirements 2.1, 2.2, 3.3
   */
  @Put(':id')
  @Roles('admin')
  async updateAgent(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    // RolesGuard already verified admin role
    // No ownership check needed - admins can update any agent
    return this.agentService.updateAgent(id, updateData);
  }

  /**
   * Get agent profile - Owner or Admin can view
   * Validates: Requirements 2.2, 2.4
   */
  @Get(':id')
  async getAgent(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // Allow access if viewing own profile OR if admin
    verifyOwnershipOrAdmin(id, user.id, user.role, 'agent profile');
    
    return this.agentService.getAgentById(id);
  }
}

// Example 4: Using isOwner for conditional logic
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyViewControllerExample {
  constructor(private readonly propertyService: any) {}

  /**
   * Get property with conditional data based on ownership
   */
  @Get(':id')
  async getProperty(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const property = await this.propertyService.getPropertyById(id);
    
    // Use isOwner for conditional logic without throwing exceptions
    if (isOwner(property.agent_id, user.id) || user.role === 'admin') {
      // Owner or admin sees full details including private notes
      return {
        ...property,
        privateNotes: property.private_notes,
        analytics: await this.propertyService.getPropertyAnalytics(id),
      };
    } else {
      // Others see only public information
      return {
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        images: property.images,
      };
    }
  }
}

// Example 5: Service-level ownership verification
export class PropertyServiceExample {
  constructor(private readonly supabaseService: any) {}

  /**
   * Update property with ownership verification in service layer
   */
  async getPropertyById(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) throw new Error('Property not found');
    return data;
  }

  async updateProperty(id: string, userId: string, updateData: any) {
    // Get property
    const property = await this.getPropertyById(id);
    
    // Verify ownership at service level
    verifyOwnership(property.agent_id, userId, 'property');
    
    // Proceed with update
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw new Error('Failed to update property');
    return data[0];
  }

  /**
   * Get properties filtered by ownership
   */
  async getProperties(userId: string, userRole: string) {
    const client = this.supabaseService.getClient();
    
    let query = client
      .from('properties')
      .select('*')
      .eq('status', 'active');
    
    // Agents see only their own properties
    if (userRole !== 'admin') {
      query = query.eq('agent_id', userId);
    }
    // Admins see all properties (no additional filter)
    
    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch properties');
    return data;
  }
}

/**
 * KEY POINTS:
 * 
 * 1. verifyOwnership(resourceOwnerId, userId, resourceType)
 *    - Throws ForbiddenException if ownership check fails
 *    - Use when ONLY the owner should have access
 *    - Returns 403 error to client
 * 
 * 2. verifyOwnershipOrAdmin(resourceOwnerId, userId, userRole, resourceType)
 *    - Throws ForbiddenException if user is neither owner nor admin
 *    - Use when owner OR admin should have access
 *    - Admins bypass ownership check
 * 
 * 3. isOwner(resourceOwnerId, userId)
 *    - Returns boolean without throwing exceptions
 *    - Use for conditional logic
 *    - Useful when you need to show different data based on ownership
 * 
 * 4. Always use with @UseGuards(JwtAuthGuard) to ensure user is authenticated
 * 
 * 5. Use @CurrentUser() decorator to get user info from JWT
 * 
 * 6. Resource type parameter helps create clear error messages
 * 
 * 7. Can be used in both controllers and services
 */

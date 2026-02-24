# Ownership Verification Helpers

This directory contains helper functions for implementing role-based access control (RBAC) and ownership verification in the backend system.

## Overview

The ownership helpers provide a consistent way to verify that users have permission to access or modify resources. They implement the security requirements for:

- **Requirement 2.4**: Agents can access their own resources
- **Requirement 2.5**: Agents cannot modify other agents' resources
- **Requirement 4.5**: Property ownership verification
- **Requirement 6.2**: Lead ownership verification

## Available Functions

### `verifyOwnership(resourceOwnerId, userId, resourceType)`

Verifies that a resource is owned by the specified user. Throws `ForbiddenException` (403) if verification fails.

**Parameters:**
- `resourceOwnerId` (string): The ID of the resource owner (e.g., agent_id from property)
- `userId` (string): The ID of the current user from JWT token
- `resourceType` (string, optional): Type of resource for error message (default: 'resource')

**Usage:**
```typescript
// In a controller
@Put(':id')
async updateProperty(
  @Param('id') id: string,
  @CurrentUser() user: any,
) {
  const property = await this.propertyService.getPropertyById(id);
  verifyOwnership(property.agent_id, user.id, 'property');
  // ... proceed with update
}
```

**When to use:**
- When ONLY the owner should have access
- For update and delete operations on owned resources
- When you want to throw an exception if verification fails

---

### `verifyOwnershipOrAdmin(resourceOwnerId, userId, userRole, resourceType)`

Verifies that a user is either the owner of a resource OR has admin role. Admins bypass ownership checks.

**Parameters:**
- `resourceOwnerId` (string): The ID of the resource owner
- `userId` (string): The ID of the current user from JWT token
- `userRole` (string): The role of the current user from JWT token
- `resourceType` (string, optional): Type of resource for error message (default: 'resource')

**Usage:**
```typescript
@Get(':id')
async getProperty(
  @Param('id') id: string,
  @CurrentUser() user: any,
) {
  const property = await this.propertyService.getPropertyById(id);
  verifyOwnershipOrAdmin(property.agent_id, user.id, user.role, 'property');
  return property;
}
```

**When to use:**
- When both owners and admins should have access
- For read operations where admins need visibility
- When implementing admin override capabilities

---

### `isOwner(resourceOwnerId, userId)`

Checks if a user owns a resource without throwing exceptions. Returns a boolean.

**Parameters:**
- `resourceOwnerId` (string): The ID of the resource owner
- `userId` (string): The ID of the current user from JWT token

**Returns:** `boolean` - true if user owns the resource, false otherwise

**Usage:**
```typescript
@Get(':id')
async getProperty(
  @Param('id') id: string,
  @CurrentUser() user: any,
) {
  const property = await this.propertyService.getPropertyById(id);
  
  if (isOwner(property.agent_id, user.id) || user.role === 'admin') {
    // Return full details for owner/admin
    return { ...property, privateNotes: property.private_notes };
  } else {
    // Return public details only
    return { id: property.id, title: property.title, price: property.price };
  }
}
```

**When to use:**
- For conditional logic based on ownership
- When you need to show different data to owners vs non-owners
- When you don't want to throw exceptions

---

## Integration with Guards

These helpers work in conjunction with NestJS guards:

1. **JwtAuthGuard**: Ensures user is authenticated and extracts user info from JWT
2. **RolesGuard**: Checks if user has required role (admin, agent)
3. **Ownership Helpers**: Verify resource-level permissions

**Typical usage pattern:**
```typescript
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply guards
export class PropertyController {
  @Put(':id')
  async updateProperty(
    @Param('id') id: string,
    @Body() updateData: any,
    @CurrentUser() user: any,  // User extracted by JwtAuthGuard
  ) {
    const property = await this.propertyService.getPropertyById(id);
    verifyOwnership(property.agent_id, user.id, 'property');  // Verify ownership
    return this.propertyService.updateProperty(id, updateData);
  }
}
```

## Error Handling

All verification functions throw `ForbiddenException` with descriptive messages:

```typescript
// Example error response (403 Forbidden)
{
  "statusCode": 403,
  "message": "You do not have permission to access this property",
  "error": "Forbidden"
}
```

The error message includes the resource type for clarity.

## Best Practices

1. **Always authenticate first**: Use `@UseGuards(JwtAuthGuard)` before ownership checks
2. **Fetch resource first**: Get the resource to check its owner_id
3. **Use appropriate function**: 
   - `verifyOwnership` for owner-only access
   - `verifyOwnershipOrAdmin` for owner or admin access
   - `isOwner` for conditional logic
4. **Provide resource type**: Include meaningful resource type in error messages
5. **Service layer verification**: Can also verify ownership in service methods for reusability

## Testing

Unit tests are provided in `ownership.helper.spec.ts` covering:
- Successful ownership verification
- Failed ownership verification (throws exception)
- Admin bypass functionality
- Error message formatting
- Edge cases (empty strings, etc.)

Run tests:
```bash
npm test -- ownership.helper.spec.ts
```

## Examples

See `ownership.helper.example.ts` for comprehensive usage examples including:
- Property controller with ownership verification
- Lead controller with ownership verification
- Agent profile management
- Conditional data based on ownership
- Service-level ownership verification

## Requirements Validation

These helpers validate the following requirements:

- **2.1**: Agents cannot access admin-only endpoints (use with RolesGuard)
- **2.2**: Admins have full access (verifyOwnershipOrAdmin)
- **2.3**: Role verification from JWT (use with RolesGuard)
- **2.4**: Agents can access their own resources (verifyOwnership)
- **2.5**: Agents cannot modify other agents' resources (verifyOwnership)
- **4.2**: Agents see only their own properties
- **4.5**: Property ownership verification before updates
- **6.2**: Agents see only their own leads

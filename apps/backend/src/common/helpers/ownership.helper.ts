import { ForbiddenException } from '@nestjs/common';

/**
 * Verify that a resource is owned by the specified user
 * @param resourceOwnerId - The ID of the resource owner (agent_id)
 * @param userId - The ID of the current user from JWT
 * @param resourceType - Type of resource for error message (e.g., 'property', 'lead')
 * @throws ForbiddenException if ownership verification fails
 */
export function verifyOwnership(
  resourceOwnerId: string,
  userId: string,
  resourceType: string = 'resource',
): void {
  if (resourceOwnerId !== userId) {
    throw new ForbiddenException(
      `You do not have permission to access this ${resourceType}`,
    );
  }
}

/**
 * Check if a resource is owned by the specified user
 * @param resourceOwnerId - The ID of the resource owner (agent_id)
 * @param userId - The ID of the current user from JWT
 * @returns true if the user owns the resource, false otherwise
 */
export function isOwner(resourceOwnerId: string, userId: string): boolean {
  return resourceOwnerId === userId;
}

/**
 * Verify ownership or admin role
 * @param resourceOwnerId - The ID of the resource owner (agent_id)
 * @param userId - The ID of the current user from JWT
 * @param userRole - The role of the current user from JWT
 * @param resourceType - Type of resource for error message
 * @throws ForbiddenException if user is neither owner nor admin
 */
export function verifyOwnershipOrAdmin(
  resourceOwnerId: string,
  userId: string,
  userRole: string,
  resourceType: string = 'resource',
): void {
  if (userRole === 'admin') {
    return; // Admins have full access
  }

  if (resourceOwnerId !== userId) {
    throw new ForbiddenException(
      `You do not have permission to access this ${resourceType}`,
    );
  }
}

import { ForbiddenException } from '@nestjs/common';
import {
  verifyOwnership,
  isOwner,
  verifyOwnershipOrAdmin,
} from './ownership.helper';

describe('Ownership Helper', () => {
  const userId = 'user-123';
  const otherUserId = 'user-456';
  const resourceOwnerId = 'user-123';

  describe('verifyOwnership', () => {
    it('should not throw when user owns the resource', () => {
      expect(() => {
        verifyOwnership(resourceOwnerId, userId, 'property');
      }).not.toThrow();
    });

    it('should throw ForbiddenException when user does not own the resource', () => {
      expect(() => {
        verifyOwnership(resourceOwnerId, otherUserId, 'property');
      }).toThrow(ForbiddenException);
    });

    it('should include resource type in error message', () => {
      try {
        verifyOwnership(resourceOwnerId, otherUserId, 'property');
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('property');
      }
    });

    it('should use default resource type when not provided', () => {
      try {
        verifyOwnership(resourceOwnerId, otherUserId);
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('resource');
      }
    });
  });

  describe('isOwner', () => {
    it('should return true when user owns the resource', () => {
      expect(isOwner(resourceOwnerId, userId)).toBe(true);
    });

    it('should return false when user does not own the resource', () => {
      expect(isOwner(resourceOwnerId, otherUserId)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isOwner('', '')).toBe(true);
      expect(isOwner('user-123', '')).toBe(false);
      expect(isOwner('', 'user-123')).toBe(false);
    });
  });

  describe('verifyOwnershipOrAdmin', () => {
    it('should not throw when user owns the resource', () => {
      expect(() => {
        verifyOwnershipOrAdmin(resourceOwnerId, userId, 'agent', 'property');
      }).not.toThrow();
    });

    it('should not throw when user is admin regardless of ownership', () => {
      expect(() => {
        verifyOwnershipOrAdmin(resourceOwnerId, otherUserId, 'admin', 'property');
      }).not.toThrow();
    });

    it('should throw ForbiddenException when user is not owner and not admin', () => {
      expect(() => {
        verifyOwnershipOrAdmin(resourceOwnerId, otherUserId, 'agent', 'property');
      }).toThrow(ForbiddenException);
    });

    it('should include resource type in error message', () => {
      try {
        verifyOwnershipOrAdmin(resourceOwnerId, otherUserId, 'agent', 'lead');
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('lead');
      }
    });

    it('should use default resource type when not provided', () => {
      try {
        verifyOwnershipOrAdmin(resourceOwnerId, otherUserId, 'agent');
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('resource');
      }
    });

    it('should allow admin with different casing', () => {
      // Test case sensitivity - should be exact match
      expect(() => {
        verifyOwnershipOrAdmin(resourceOwnerId, otherUserId, 'Admin', 'property');
      }).toThrow(ForbiddenException);
    });
  });
});

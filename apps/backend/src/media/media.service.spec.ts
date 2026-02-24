import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaService } from './media.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseStorageService } from './supabase-storage.service';

describe('MediaService', () => {
  let service: MediaService;
  let supabaseService: SupabaseService;
  let storageService: SupabaseStorageService;

  const mockSupabaseClient = {
    from: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn(() => mockSupabaseClient),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    storageService = module.get<SupabaseStorageService>(SupabaseStorageService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFileType', () => {
    it('should accept jpg files', () => {
      const file = {
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      expect(service.validateFileType(file)).toBe(true);
    });

    it('should accept png files', () => {
      const file = {
        mimetype: 'image/png',
      } as Express.Multer.File;

      expect(service.validateFileType(file)).toBe(true);
    });

    it('should accept webp files', () => {
      const file = {
        mimetype: 'image/webp',
      } as Express.Multer.File;

      expect(service.validateFileType(file)).toBe(true);
    });

    it('should reject pdf files', () => {
      const file = {
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      expect(service.validateFileType(file)).toBe(false);
    });

    it('should reject gif files', () => {
      const file = {
        mimetype: 'image/gif',
      } as Express.Multer.File;

      expect(service.validateFileType(file)).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should accept files under 5MB', () => {
      const file = {
        size: 4 * 1024 * 1024, // 4MB
      } as Express.Multer.File;

      expect(service.validateFileSize(file)).toBe(true);
    });

    it('should accept files exactly 5MB', () => {
      const file = {
        size: 5 * 1024 * 1024, // 5MB
      } as Express.Multer.File;

      expect(service.validateFileSize(file)).toBe(true);
    });

    it('should reject files over 5MB', () => {
      const file = {
        size: 6 * 1024 * 1024, // 6MB
      } as Express.Multer.File;

      expect(service.validateFileSize(file)).toBe(false);
    });
  });

  describe('uploadFile', () => {
    const validFile = {
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should upload a valid file successfully', async () => {
      const publicUrl = 'https://example.com/media/test.jpg';
      const mediaData = {
        id: 'media-id',
        url: publicUrl,
        type: 'image',
        uploaded_by: userId,
        status: 'active',
        created_at: new Date(),
      };

      mockStorageService.uploadFile.mockResolvedValue(publicUrl);
      
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mediaData, error: null }),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await service.uploadFile(validFile, userId);

      expect(result).toEqual(mediaData);
      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(validFile);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('media');
      expect(mockChain.insert).toHaveBeenCalledWith({
        url: publicUrl,
        type: 'image',
        uploaded_by: userId,
        related_to: undefined,
        related_id: undefined,
        status: 'active',
      });
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = {
        ...validFile,
        mimetype: 'application/pdf',
      };

      await expect(service.uploadFile(invalidFile, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(invalidFile, userId)).rejects.toThrow(
        'Invalid file type',
      );
    });

    it('should throw BadRequestException for file size exceeding 5MB', async () => {
      const largeFile = {
        ...validFile,
        size: 6 * 1024 * 1024, // 6MB
      };

      await expect(service.uploadFile(largeFile, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(largeFile, userId)).rejects.toThrow(
        'File size exceeds 5MB limit',
      );
    });

    it('should include related_to and related_id when provided', async () => {
      const publicUrl = 'https://example.com/media/test.jpg';
      const mediaData = {
        id: 'media-id',
        url: publicUrl,
        type: 'image',
        uploaded_by: userId,
        related_to: 'property',
        related_id: 'property-id',
        status: 'active',
        created_at: new Date(),
      };

      mockStorageService.uploadFile.mockResolvedValue(publicUrl);
      
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mediaData, error: null }),
      };
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await service.uploadFile(validFile, userId, 'property', 'property-id');

      expect(mockChain.insert).toHaveBeenCalledWith({
        url: publicUrl,
        type: 'image',
        uploaded_by: userId,
        related_to: 'property',
        related_id: 'property-id',
        status: 'active',
      });
    });
  });

  describe('uploadMultipleFiles', () => {
    const validFiles = [
      {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        originalname: 'test1.jpg',
        buffer: Buffer.from('test1'),
      },
      {
        mimetype: 'image/png',
        size: 2 * 1024 * 1024,
        originalname: 'test2.png',
        buffer: Buffer.from('test2'),
      },
    ] as Express.Multer.File[];

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const propertyId = 'property-id';

    it('should upload multiple files successfully', async () => {
      const publicUrls = [
        'https://example.com/media/test1.jpg',
        'https://example.com/media/test2.png',
      ];

      mockStorageService.uploadFile
        .mockResolvedValueOnce(publicUrls[0])
        .mockResolvedValueOnce(publicUrls[1]);

      const mockMediaChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: { id: 'media-1', url: publicUrls[0] },
            error: null,
          })
          .mockResolvedValueOnce({
            data: { id: 'media-2', url: publicUrls[1] },
            error: null,
          }),
      };

      const mockLinkChain = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'media') return mockMediaChain;
        if (table === 'properties_images') return mockLinkChain;
        return mockMediaChain;
      });

      const result = await service.uploadMultipleFiles(
        validFiles,
        userId,
        propertyId,
      );

      expect(result).toHaveLength(2);
      expect(mockStorageService.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when no files provided', async () => {
      await expect(
        service.uploadMultipleFiles([], userId, propertyId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.uploadMultipleFiles([], userId, propertyId),
      ).rejects.toThrow('No files provided');
    });

    it('should validate all files before uploading', async () => {
      const invalidFiles = [
        ...validFiles,
        {
          mimetype: 'application/pdf',
          size: 1024,
          originalname: 'test.pdf',
          buffer: Buffer.from('test'),
        } as Express.Multer.File,
      ];

      await expect(
        service.uploadMultipleFiles(invalidFiles, userId, propertyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should link images to property with tags and captions', async () => {
      const tags = ['exterior', 'interior'];
      const captions = ['Front view', 'Living room'];
      const publicUrls = [
        'https://example.com/media/test1.jpg',
        'https://example.com/media/test2.png',
      ];

      mockStorageService.uploadFile
        .mockResolvedValueOnce(publicUrls[0])
        .mockResolvedValueOnce(publicUrls[1]);

      const mockMediaChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({
            data: { id: 'media-1', url: publicUrls[0] },
            error: null,
          })
          .mockResolvedValueOnce({
            data: { id: 'media-2', url: publicUrls[1] },
            error: null,
          }),
      };

      const mockLinkChain = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'media') return mockMediaChain;
        if (table === 'properties_images') return mockLinkChain;
        return mockMediaChain;
      });

      await service.uploadMultipleFiles(
        validFiles,
        userId,
        propertyId,
        tags,
        captions,
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('properties_images');
    });
  });

  describe('deleteMedia', () => {
    const mediaId = 'media-id';
    const userId = 'user-id';

    it('should soft delete media successfully', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: mediaId, uploaded_by: userId },
          error: null,
        }),
      };

      const mockUpdateChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValueOnce(mockUpdateChain);

      await service.deleteMedia(mediaId, userId);

      expect(mockUpdateChain.update).toHaveBeenCalledWith({
        status: 'deleted',
      });
      expect(mockUpdateChain.eq).toHaveBeenCalledWith('id', mediaId);
    });

    it('should throw NotFoundException when media not found', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelectChain);

      await expect(service.deleteMedia(mediaId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMediaUrl', () => {
    const mediaId = 'media-id';

    it('should return media URL successfully', async () => {
      const url = 'https://example.com/media/test.jpg';
      
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { url },
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await service.getMediaUrl(mediaId);

      expect(result).toBe(url);
      expect(mockChain.eq).toHaveBeenCalledWith('id', mediaId);
      expect(mockChain.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should throw NotFoundException when media not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(service.getMediaUrl(mediaId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markPropertyMediaAsDeleted', () => {
    const propertyId = 'property-id';

    it('should mark all property media as deleted', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // The last eq() call should return the result
      mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null });

      mockSupabaseClient.from.mockReturnValue(mockChain);

      await service.markPropertyMediaAsDeleted(propertyId);

      expect(mockChain.update).toHaveBeenCalledWith({
        status: 'deleted',
      });
      expect(mockChain.eq).toHaveBeenCalledWith('related_to', 'property');
      expect(mockChain.eq).toHaveBeenCalledWith('related_id', propertyId);
    });
  });
});

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { Media, PropertyImage } from './interfaces/media.interface';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Validate file type (jpg, png, webp only)
   */
  validateFileType(file: Express.Multer.File): boolean {
    return this.allowedMimeTypes.includes(file.mimetype);
  }

  /**
   * Validate file size (max 5MB)
   */
  validateFileSize(file: Express.Multer.File): boolean {
    return file.size <= this.maxFileSize;
  }

  /**
   * Validate a file before upload
   */
  private validateFile(file: Express.Multer.File): void {
    if (!this.validateFileType(file)) {
      throw new BadRequestException(
        `Invalid file type. Only jpg, png, and webp images are allowed. Received: ${file.mimetype}`,
      );
    }

    if (!this.validateFileSize(file)) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size exceeds 5MB limit. File size: ${fileSizeMB}MB`,
      );
    }
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    relatedTo?: string,
    relatedId?: string,
  ): Promise<Media> {
    this.validateFile(file);

    try {
      // Upload to Supabase Storage
      const publicUrl = await this.storageService.uploadFile(file);

      // Store metadata in database
      const client = this.supabaseService.getClient();
      const { data, error } = await client
        .from('media')
        .insert({
          url: publicUrl,
          type: 'image',
          uploaded_by: userId,
          related_to: relatedTo,
          related_id: relatedId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Failed to store media metadata: ${error.message}`);
        throw new Error(`Failed to store media metadata: ${error.message}`);
      }

      this.logger.log(`Media uploaded successfully: ${data.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload multiple files and link to property
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    userId: string,
    propertyId: string,
    tags?: string[],
    captions?: string[],
  ): Promise<Media[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Validate all files first
    files.forEach((file) => this.validateFile(file));

    const uploadedMedia: Media[] = [];

    try {
      const client = this.supabaseService.getClient();

      // Upload files concurrently
      const uploadPromises = files.map(async (file, index) => {
        // Upload to storage
        const publicUrl = await this.storageService.uploadFile(file);

        // Store media metadata
        const { data: mediaData, error: mediaError } = await client
          .from('media')
          .insert({
            url: publicUrl,
            type: 'image',
            uploaded_by: userId,
            related_to: 'property',
            related_id: propertyId,
            status: 'active',
          })
          .select()
          .single();

        if (mediaError) {
          throw new Error(`Failed to store media metadata: ${mediaError.message}`);
        }

        // Link to property via properties_images table
        const { error: linkError } = await client
          .from('properties_images')
          .insert({
            property_id: propertyId,
            media_id: mediaData.id,
            tag: tags && tags[index] ? tags[index] : null,
            caption: captions && captions[index] ? captions[index] : null,
            display_order: index,
          });

        if (linkError) {
          throw new Error(`Failed to link media to property: ${linkError.message}`);
        }

        return mediaData;
      });

      const results = await Promise.all(uploadPromises);
      uploadedMedia.push(...results);

      this.logger.log(
        `Successfully uploaded ${uploadedMedia.length} files for property ${propertyId}`,
      );
      return uploadedMedia;
    } catch (error) {
      this.logger.error(`Error uploading multiple files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete media (soft delete)
   */
  async deleteMedia(id: string, userId: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      // Check if media exists and user has permission
      const { data: media, error: fetchError } = await client
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !media) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }

      // Soft delete by setting status to 'deleted'
      const { error: updateError } = await client
        .from('media')
        .update({ status: 'deleted' })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to delete media: ${updateError.message}`);
      }

      this.logger.log(`Media ${id} marked as deleted`);
    } catch (error) {
      this.logger.error(`Error deleting media: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get media URL by ID
   */
  async getMediaUrl(id: string): Promise<string> {
    try {
      const client = this.supabaseService.getClient();

      const { data, error } = await client
        .from('media')
        .select('url')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        throw new NotFoundException(`Media with ID ${id} not found`);
      }

      return data.url;
    } catch (error) {
      this.logger.error(`Error getting media URL: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark associated media as deleted when property is deleted
   */
  async markPropertyMediaAsDeleted(propertyId: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();

      const { error } = await client
        .from('media')
        .update({ status: 'deleted' })
        .eq('related_to', 'property')
        .eq('related_id', propertyId);

      if (error) {
        throw new Error(`Failed to mark property media as deleted: ${error.message}`);
      }

      this.logger.log(`Media for property ${propertyId} marked as deleted`);
    } catch (error) {
      this.logger.error(`Error marking property media as deleted: ${error.message}`);
      throw error;
    }
  }
}

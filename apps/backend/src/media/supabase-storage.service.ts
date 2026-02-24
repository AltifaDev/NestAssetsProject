import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly bucketName = 'media';

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param folder - Optional folder path within the bucket
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    try {
      const client = this.supabaseService.getClient();
      
      // Generate unique filename with UUID
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFilename}`;

      // Upload file to Supabase Storage
      const { data, error } = await client.storage
        .from(this.bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Failed to upload file: ${error.message}`);
        throw new Error(`File upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      this.logger.log(`File uploaded successfully: ${filePath}`);
      return urlData.publicUrl;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param fileUrl - The public URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const client = this.supabaseService.getClient();
      
      // Extract file path from URL
      const urlParts = fileUrl.split(`/${this.bucketName}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL');
      }
      const filePath = urlParts[1];

      const { error } = await client.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        this.logger.error(`Failed to delete file: ${error.message}`);
        throw new Error(`File deletion failed: ${error.message}`);
      }

      this.logger.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
}

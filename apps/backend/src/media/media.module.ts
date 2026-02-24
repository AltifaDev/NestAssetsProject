import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { SupabaseStorageService } from './supabase-storage.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MediaController],
  providers: [MediaService, SupabaseStorageService],
  exports: [MediaService],
})
export class MediaModule {}

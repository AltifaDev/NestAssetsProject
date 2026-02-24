import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error(
                `Supabase configuration missing: URL=${!!supabaseUrl}, Key=${!!supabaseKey}`
            );
            this.logger.warn(
                'Supabase URL or Key is missing in environment variables. Provide SUPABASE_URL and SUPABASE_KEY.',
            );
        } else {
            this.logger.log(`Supabase client initialized successfully with URL: ${supabaseUrl}`);
            this.supabase = createClient(supabaseUrl, supabaseKey);
            this.logger.log('Supabase client initialized successfully.');
        }
    }

    getClient(): SupabaseClient {
        if (!this.supabase) {
            throw new Error(
                'Supabase client is not initialized. Please configure SUPABASE_URL and SUPABASE_KEY correctly.',
            );
        }
        return this.supabase;
    }
}

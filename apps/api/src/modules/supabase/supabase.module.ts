import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthController } from './supabase-auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [SupabaseAuthController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}

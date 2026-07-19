import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  private ensureClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const anonKey = process.env.SUPABASE_ANON_KEY;
      if (!url || !anonKey) throw new Error('Supabase credentials missing');
      this.client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: WebSocket } });
    }
    return this.client;
  }

  private ensureAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      const url = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !serviceRoleKey) throw new Error('Supabase admin credentials missing');
      this.adminClient = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: WebSocket } });
    }
    return this.adminClient;
  }

  async registerUser(email: string, password: string, name: string) {
    const { data, error } = await this.ensureAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;
    return data;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.ensureClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async getUserById(supabaseUserId: string) {
    const { data, error } = await this.ensureAdminClient().auth.admin.getUserById(supabaseUserId);
    if (error) throw error;
    return data;
  }
}

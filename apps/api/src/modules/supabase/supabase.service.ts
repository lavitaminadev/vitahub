import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceRoleKey) {
      console.warn('Supabase credentials missing — Supabase features disabled');
      return;
    }

    const options = {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { channels: [] },
    };
    this.client = createClient(url, anonKey, options);
    this.adminClient = createClient(url, serviceRoleKey, options);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  async registerUser(email: string, password: string, name: string) {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;
    return data;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async getUserById(supabaseUserId: string) {
    const { data, error } = await this.adminClient.auth.admin.getUserById(supabaseUserId);
    if (error) throw error;
    return data;
  }
}

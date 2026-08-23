/**
 * @fileoverview Thin wrapper around the Supabase JS client.
 */
import { Inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { POLL_APP_CONFIG, PollAppSettings } from '../config/poll-app.config';

/**
 * Creates a Supabase client when URL and anon key are configured.
 */
@Injectable()
export class SupabaseService {
  /** Live client, or `null` when local fallback data should be used. */
  readonly client: SupabaseClient | null;
  /** True when environment credentials are present. */
  readonly isConfigured: boolean;

  /**
   * @param config - Injected Poll App settings.
   */
  constructor(@Inject(POLL_APP_CONFIG) config: PollAppSettings) {
    this.isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
    this.client = this.isConfigured
      ? createClient(config.supabaseUrl, config.supabaseAnonKey)
      : null;
  }
}

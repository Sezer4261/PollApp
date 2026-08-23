/**
 * @fileoverview `providePollAppConfig` registers app settings and singleton services in `appConfig`.
 */
import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OverlayService } from '../services/overlay.service';
import { SupabaseService } from '../services/supabase.service';
import { SurveyService } from '../services/survey.service';

/** Injected settings for Supabase and the ending-soon list. */
export interface PollAppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  endingSoonDays: number;
  endingSoonLimit: number;
}

/** DI token for {@link PollAppSettings}. */
export const POLL_APP_CONFIG = new InjectionToken<PollAppSettings>('POLL_APP_CONFIG');

/** Default settings used when `providePollAppConfig()` is called without arguments. */
export const defaultPollAppSettings: PollAppSettings = {
  supabaseUrl: environment.supabaseUrl,
  supabaseAnonKey: environment.supabaseAnonKey,
  endingSoonDays: 7,
  endingSoonLimit: 3,
};

/**
 * Provides Poll App settings plus the survey, overlay and Supabase services.
 *
 * @param settings - Optional override of {@link defaultPollAppSettings}.
 * @returns Environment providers for `appConfig.providers`.
 */
export function providePollAppConfig(
  settings: PollAppSettings = defaultPollAppSettings,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: POLL_APP_CONFIG, useValue: settings },
    SupabaseService,
    SurveyService,
    OverlayService,
  ]);
}

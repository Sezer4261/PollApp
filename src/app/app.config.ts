/**
 * @fileoverview Application-wide providers: router, zoneless CD, animations and Poll App config.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePollAppConfig } from './core/config/poll-app.config';
import { routes } from './app.routes';

/**
 * Global Angular `ApplicationConfig` registered in `main.ts`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    providePollAppConfig(),
  ],
};

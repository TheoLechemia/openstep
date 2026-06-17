import { APP_INITIALIZER } from '@angular/core';

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { lastValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding(), withHashLocation()), 
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ConfigService, AuthService],
      useFactory: (configService: ConfigService, authService: AuthService) => {
        return async () => {
          await configService.loadAppConfig();
          await lastValueFrom(authService.init());
        };
      },
    },
  ],
};

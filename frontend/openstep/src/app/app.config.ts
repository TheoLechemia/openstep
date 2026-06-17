import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';
import { ConfigService } from './config.service';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { lastValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule),
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

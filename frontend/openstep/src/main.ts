import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { register as registerSwiperElements } from 'swiper/element/bundle';

export function initializeApp(http: HttpClient) {
  return (): Promise<any> =>
    firstValueFrom(
      http
        .get("./config/config.json")
    );
}
registerSwiperElements();
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

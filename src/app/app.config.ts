// import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { HttpClient, provideHttpClient } from '@angular/common/http';
// import { provideTranslateService, TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// export function HttpLoaderFactory(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideRouter(routes),
//     provideHttpClient(),
//     importProvidersFrom(
//       TranslateModule.forRoot({
//         loader: {
//           provide: TranslateLoader,
//           useFactory: HttpLoaderFactory,
//           deps: [HttpClient]
//         }
//       })
//     )
//   ]
// };

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { Observable } from 'rxjs';

// ១. បង្កើត Factory សម្រាប់ Load ឯកសារ JSON
// export function createTranslateLoader(http: HttpClient) {
//   return new (TranslateHttpLoader as any)(http, './assets/i18n/', '.json');
// }
export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // importProvidersFrom(
    //   TranslateModule.forRoot({
    //     defaultLanguage: 'en', // កំណត់ភាសាដើមនៅទីនេះ
    //     loader: {
    //       provide: TranslateLoader,
    //       useFactory: createTranslateLoader,
    //       deps: [HttpClient]
    //     }
    //   })
    // )
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomLoader, // ប្តូរមកប្រើ Class យើងវិញ
          deps: [HttpClient]
        }
      })
    )
  ]
};
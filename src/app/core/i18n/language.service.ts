// language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private translate: TranslateService) {
    // ទាញយកភាសាដែលធ្លាប់រើសពី LocalStorage ឬប្រើ 'en' ជា Default
    const savedLang = localStorage.getItem('user_lang') || 'en';
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('user_lang', lang); // រក្សាទុកដើម្បីកុំឱ្យបាត់ពេល Refresh
  }

  getCurrentLang() {
    return this.translate.currentLang;
  }
}
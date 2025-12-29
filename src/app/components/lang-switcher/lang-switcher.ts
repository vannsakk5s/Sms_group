import { Component } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-lang-switcher',
  imports: [TranslateModule, CommonModule],
  templateUrl: './lang-switcher.html',
  styleUrl: './lang-switcher.css',
})
export class LangSwitcher {
  constructor(public langService: LanguageService) {}
}

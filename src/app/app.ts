import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LangSwitcher } from "./components/lang-switcher/lang-switcher";
import { ThemeSwitcher } from "./components/theme-switcher/theme-switcher";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LangSwitcher, ThemeSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private translate: TranslateService) {
    // ១. កំណត់ភាសាដំបូងដែល App ត្រូវប្រើ
    this.translate.addLangs(['en', 'kh']);
    
    // ២. ទាញយកភាសាដែលធ្លាប់រើស (បើមាន) ឬប្រើភាសាដើម 'en'
    const browserLang = localStorage.getItem('lang') || 'en';
    this.translate.use(browserLang);
  }

  ngOnInit() {}
}

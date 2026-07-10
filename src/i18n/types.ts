
// src/i18n/types.ts
export type TranslationKey = keyof typeof import('./translations/zh-TW.json');

export type Language = 'zh-TW' | 'zh-CN' | 'en';

export interface I18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  fallbackLanguage: Language;
}



// src/i18n/types.ts
// export type Language = 'zh-TW' | 'zh-CN' | 'en' | 'ja';

export interface I18nConfig {
  defaultLanguage: Language;
  supportedLanguages: Language[];
  fallbackLanguage: Language;
}

// 从 AstroWind 配置扩展
export interface AstroWindI18nConfig {
  language: Language;
  textDirection: 'ltr' | 'rtl';
  // 其他配置
}

// src/i18n/index.ts
import type { Language } from './types';

// 直接导入所有翻译文件（确保在服务端和客户端都能正确加载）
import zhTW from './translations/zh-TW.json';
import zhCN from './translations/zh-CN.json';
import enUS from './translations/en-US.json';

const DEFAULT_LANG: Language = 'zh-TW';
const SUPPORTED_LANGUAGES: Language[] = ['zh-TW', 'zh-CN', 'en'];

// 直接构建翻译映射表（无需使用 import.meta.glob）
const translationMap: Record<Language, Record<string, string>> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'en': enUS,
};

/**
 * 获取 base URL（兼容多种配置方式）
 */
function getBaseURL(): string {
  // 方式1：从 Astro 环境变量获取
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    return import.meta.env.BASE_URL;
  }
  return '';
}



export default DEFAULT_LANG;



/**
 * 从 URL 路径中提取语言代码
 * 支持：
 * - 无 base: /zh-TW/services → zh-TW
 * - 有 base: /my-app/zh-TW/services → zh-TW
 * - 默认语言: / → zh-TW
 * - 无效语言: /invalid/services → zh-TW (回退到默认)
 */
export function getLanguageFromURL(pathname: string): Language {
  // 1. 获取并移除 base 前缀
  const base = getBaseURL();
  let path = pathname;
  
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  
  // 2. 处理根路径
  if (!path || path === '/') {
    return DEFAULT_LANG;
  }
  
  // 3. 提取第一段作为语言
  const segments = path.split('/').filter(Boolean);
  const lang = segments[0] as Language;
  
  // 4. 验证语言是否支持
  return SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANG;
}

/**
 * ✅ 获取指定语言的所有翻译
 */
export function getTranslations(lang: Language): Record<string, string> {
  // 优先返回目标语言的翻译
  if (translationMap[lang]) {
    return translationMap[lang];
  }
  
  // 回退到默认语言
  if (translationMap[DEFAULT_LANG]) {
    return translationMap[DEFAULT_LANG];
  }
  
  // 如果都没有，返回空对象
  return {};
}

/**
 * 
      // 不传 params——可以正常工作
      t('welcome')                    // 返回 "欢迎"
      t('welcome', 'en')              // 返回 "Welcome"

      // 传 params——用于插值
      t('greeting', 'zh-TW', { name: '小明' })
      // 如果翻译是 "你好，{{name}}！" → 返回 "你好，小明！"
 * 
 * ✅ 核心翻译函数
 */
export function t(
  key: string,
  lang: Language = DEFAULT_LANG,
  params?: Record<string, string | number>
): string {
  // 获取当前语言的翻译表
  const translations = getTranslations(lang);
  let translation = translations[key];
  
  // 如果找不到，尝试回退到默认语言
  if (!translation && lang !== DEFAULT_LANG) {
    const defaultTranslations = getTranslations(DEFAULT_LANG);
    translation = defaultTranslations[key];
  }
  
  // 如果还是找不到，返回键名本身
  if (!translation) {
    console.warn(`Translation key "${key}" not found for language "${lang}"`);
    return key;
  }
  
  // 支持插值 {{variable}}
  if (params) {
    return translation.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{{${paramKey}}}`);
    });
  }
  
  return translation;
}

/**
 * 从 URL 中移除语言前缀和 base 前缀
 * 例如：/my-app/zh-TW/services → /services
 */
export function getPathWithoutLanguage(pathname: string): string {
  const lang = getLanguageFromURL(pathname);
  const base = getBaseURL();
  
  let path = pathname;
  
  // 移除 base
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  
  // 移除语言前缀
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0] === lang) {
    segments.shift();
  }
  
  return '/' + segments.join('/');
}

/**
 * 构建带语言和 base 的 URL
 * 例如：/zh-TW/services → /my-app/zh-TW/services
 */
export function buildLocalizedURL(
  path: string, 
  lang: Language, 
  includeBase: boolean = true
): string {
  const base = includeBase ? getBaseURL() : '';
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // 如果路径已经包含语言前缀，先移除
  const pathWithoutLang = getPathWithoutLanguage(cleanPath);
  
  // 构建新路径
  const basePart = base || '';
  const langPart = '/' + lang;
  const pathPart = pathWithoutLang === '/' ? '' : pathWithoutLang;
  
  return basePart + langPart + pathPart;
}

/**
 * 获取所有支持的语言
 */
export function getSupportedLanguages(): Language[] {
  return SUPPORTED_LANGUAGES;
}

/**
 * 检查语言是否支持
 */
export function isLanguageSupported(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

/**
 * ✅ 在 Astro 组件中获取语言（推荐使用）
 * 用法：const lang = getLang(Astro);
 */
export function getLang(astro: any): Language {
  // 1. 优先使用动态路由参数
  if (astro.params?.lang) {
    const lang = astro.params.lang as Language;
    if (SUPPORTED_LANGUAGES.includes(lang)) return lang;
  }
  
  // 2. 从 URL 检测
  return getLanguageFromURL(astro.url?.pathname || '');
}

/**
 * ✅ 在 Astro 组件中一键获取翻译能力（推荐使用）
 * 用法：const { t, lang, translations } = useTranslations(Astro);
 * 或更简洁：const { t } = useTranslations(Astro);
 */
export function useTranslations(astro: any) {
  const lang = getLang(astro);
  const translations = getTranslations(lang);
  return {
    lang,
    translations,
    t: (key: string, params?: Record<string, string | number>) =>
      t(key, lang, params),
  };
}

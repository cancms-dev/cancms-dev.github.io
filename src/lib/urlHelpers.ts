// src/lib/urlHelpers.ts
import { getLanguageFromURL } from '~/i18n';

const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN', 'en', 'ja'];

/**
 * 获取 base URL
 */
export function getBaseURL(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    return import.meta.env.BASE_URL;
  }
  return '';
}

/**
 * 移除 base 前缀
 */
export function removeBase(pathname: string): string {
  const base = getBaseURL();
  if (base && pathname.startsWith(base)) {
    const result = pathname.slice(base.length);
    return result || '/';
  }
  return pathname;
}

/**
 * 添加 base 前缀
 */
export function addBase(path: string): string {
  const base = getBaseURL();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base + cleanPath;
}

/**
 * 判断是否在首页
 */
export function isHomePage(pathname: string): boolean {
  const cleanPath = removeBase(pathname);
  
  // 根路径
  if (cleanPath === '/' || cleanPath === '') {
    return true;
  }
  
  // 只有语言前缀
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length === 1) {
    return SUPPORTED_LANGUAGES.includes(segments[0]);
  }
  
  return false;
}

/**
 * 判断是否在首页（带语言参数）
 */
export function isHomePageWithLang(pathname: string, lang: string): boolean {
  const cleanPath = removeBase(pathname);
  return cleanPath === '/' || cleanPath === `/${lang}`;
}

/**
 * 判断是否在某个路径
 */
export function isPath(pathname: string, target: string): boolean {
  const cleanPath = removeBase(pathname);
  const cleanTarget = target.startsWith('/') ? target : '/' + target;
  return cleanPath === cleanTarget;
}

/**
 * 判断是否在某个路径下（包含子路径）
 */
export function isPathStartsWith(pathname: string, target: string): boolean {
  const cleanPath = removeBase(pathname);
  const cleanTarget = target.startsWith('/') ? target : '/' + target;
  return cleanPath.startsWith(cleanTarget);
}

/**
 * 获取当前语言路径（带 base）
 */
export function getLocalizedPath(lang: string, path: string = ''): string {
  const base = getBaseURL();
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return base + '/' + lang + cleanPath;
}

/**
 * 获取不带语言的路径（移除语言前缀和 base）
 */
export function getPathWithoutLanguage(pathname: string): string {
  const lang = getLanguageFromURL(pathname);
  const cleanPath = removeBase(pathname);
  
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0] === lang) {
    segments.shift();
  }
  
  return '/' + segments.join('/');
}

/**
 * URL 对象（包含所有信息）
 */
export function parseURL(pathname: string) {
  const base = getBaseURL();
  const cleanPath = removeBase(pathname);
  const lang = getLanguageFromURL(pathname);
  const pathWithoutLang = getPathWithoutLanguage(pathname);
  const isHome = isHomePage(pathname);
  const segments = cleanPath.split('/').filter(Boolean);
  
  return {
    base,
    cleanPath,
    lang,
    pathWithoutLang,
    isHome,
    segments,
    isRoot: cleanPath === '/',
    isLangOnly: segments.length === 1 && SUPPORTED_LANGUAGES.includes(segments[0]),
  };
}

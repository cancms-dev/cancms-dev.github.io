// src/utils/permalinks.ts (完整增强版)
import slugify from 'limax';
import { SITE, APP_BLOG } from 'astrowind:config';
import { trim } from '~/utils/utils';
import type { Language } from '~/i18n/types';
import { getLanguageFromURL } from '~/i18n';

// 扩展 Window 类型
declare global {
  interface Window {
    __GLOBAL: Record<string, any>;
  }
}

// ============================================================================
// 基础工具函数
// ============================================================================

export const trimSlash = (s: string) => trim(trim(s, '/'));

const createPath = (...params: string[]) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return '/' + paths + (SITE.trailingSlash && paths ? '/' : '');
};

const BASE_PATHNAME = SITE.base || '/';

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

// ============================================================================
// 博客配置
// ============================================================================

export const BLOG_BASE = cleanSlug(APP_BLOG?.list?.pathname);
export const CATEGORY_BASE = cleanSlug(APP_BLOG?.category?.pathname);
export const TAG_BASE = cleanSlug(APP_BLOG?.tag?.pathname) || 'tag';
export const POST_PERMALINK_PATTERN = trimSlash(
  APP_BLOG?.post?.permalink || `${BLOG_BASE}/%slug%`
);

// ============================================================================
// 多语言配置
// ============================================================================

// 从 AstroWind 配置中获取默认语言（直接使用 config.yaml 中的值）
const DEFAULT_LANG: Language = 'zh-TW';

// 支持的语言列表
const SUPPORTED_LANGUAGES: Language[] = ['zh-TW', 'zh-CN', 'en'];

// ============================================================================
// getAsset - 获取资源路径（带 base）
// ============================================================================

/**
 * 获取资源文件路径（带 base 前缀）
 * 例如：getAsset('images/logo.png') → /my-app/images/logo.png
 */
export const getAsset = (path: string): string => {
  if (!path) return '';
  
  // 如果是外部链接，直接返回
  if (
    path.startsWith('https://') ||
    path.startsWith('http://') ||
    path.startsWith('//') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  
  // 清理路径
  const cleanPath = trimSlash(path);
  
  // 构建完整路径
  return (
    '/' +
    [BASE_PATHNAME, cleanPath]
      .map((el) => trimSlash(el))
      .filter((el) => !!el)
      .join('/')
  );
};

/**
 * 获取资源文件路径（支持多语言）
 * 例如：getAssetLang('images/logo.png') → /my-app/zh-TW/images/logo.png
 */
export const getAssetLang = (path: string, lang?: Language, astro?: any): string => {
  const targetLang = lang || getCurrentLang(astro);
  const assetPath = getAsset(path);
  
  // 如果 assetPath 是外部链接，直接返回
  if (
    assetPath.startsWith('https://') ||
    assetPath.startsWith('http://') ||
    assetPath.startsWith('//') ||
    assetPath.startsWith('data:')
  ) {
    return assetPath;
  }
  
  // 移除 base 前缀
  const relativePath = assetPath.replace(BASE_PATHNAME, '');
  
  // 构建带语言的路径
  return createPath(BASE_PATHNAME, targetLang, relativePath);
};

// ============================================================================
// applyGetPermalinks - 递归处理菜单/对象中的链接
// ============================================================================

type MenuHref = { type?: string; url?: string };

/**
 * 递归处理菜单或对象，将所有 href 转换为永久链接
 * 支持嵌套对象和数组
 */
export const applyGetPermalinks = (menu: unknown = {}): unknown => {
  if (Array.isArray(menu)) {
    return menu.map((item) => applyGetPermalinks(item));
  } else if (typeof menu === 'object' && menu !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(menu)) {
      if (key === 'href') {
        if (typeof value === 'string') {
          result[key] = getPermalink(value);
        } else if (typeof value === 'object' && value !== null) {
          const href = value as MenuHref;
          if (href.type === 'home') {
            result[key] = getHomePermalink();
          } else if (href.type === 'blog') {
            result[key] = getBlogPermalink();
          } else if (href.type === 'asset') {
            result[key] = getAsset(href.url ?? '');
          } else if (href.url) {
            result[key] = getPermalink(href.url, href.type);
          }
        }
      } else {
        result[key] = applyGetPermalinks(value);
      }
    }
    return result;
  }
  return menu;
};

/**
 * 递归处理菜单或对象，将所有 href 转换为多语言永久链接
 */
export const applyLangPermalinks = (
  menu: unknown = {},
  lang?: Language,
  astro?: any
): unknown => {
  const targetLang = lang || getCurrentLang(astro);
  
  if (Array.isArray(menu)) {
    return menu.map((item) => applyLangPermalinks(item, targetLang, astro));
  } else if (typeof menu === 'object' && menu !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(menu)) {
      if (key === 'href') {
        if (typeof value === 'string') {
          result[key] = langLink(value, targetLang, 'page', astro);
        } else if (typeof value === 'object' && value !== null) {
          const href = value as MenuHref;
          if (href.type === 'home') {
            result[key] = getHomePermalink(targetLang, astro);
          } else if (href.type === 'blog') {
            result[key] = getBlogPermalink(targetLang, astro);
          } else if (href.type === 'asset') {
            result[key] = getAssetLang(href.url ?? '', targetLang, astro);
          } else if (href.url) {
            result[key] = langLink(href.url, targetLang, href.type as any, astro);
          }
        }
      } else {
        result[key] = applyLangPermalinks(value, targetLang, astro);
      }
    }
    return result;
  }
  return menu;
};

// ============================================================================
// 核心函数（保留原有功能）
// ============================================================================

/** */
export const getCanonical = (path = ''): string | URL => {
  const url = String(new URL(path, SITE.site));
  if (SITE.trailingSlash == false && path && url.endsWith('/')) {
    return url.slice(0, -1);
  } else if (SITE.trailingSlash == true && path && !url.endsWith('/')) {
    return url + '/';
  }
  return url;
};

/** */
export const getPermalink = (slug = '', type = 'page'): string => {
  let permalink: string;

  if (
    slug.startsWith('https://') ||
    slug.startsWith('http://') ||
    slug.startsWith('://') ||
    slug.startsWith('#') ||
    slug.startsWith('javascript:')
  ) {
    return slug;
  }

  switch (type) {
    case 'home':
      permalink = getHomePermalink();
      break;
    case 'blog':
      permalink = getBlogPermalink();
      break;
    case 'asset':
      permalink = getAsset(slug);
      break;
    case 'category':
      permalink = createPath(CATEGORY_BASE, trimSlash(slug));
      break;
    case 'tag':
      permalink = createPath(TAG_BASE, trimSlash(slug));
      break;
    case 'post':
      permalink = createPath(trimSlash(slug));
      break;
    case 'services':
      permalink = createPath('services', trimSlash(slug));
      break;
    case 'service':
      permalink = createPath('services', trimSlash(slug));
      break;
    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

// ============================================================================
// 多语言增强函数（新增）
// ============================================================================

/**
 * 获取当前语言（从 Astro 或全局状态）
 */
export function getCurrentLang(astro?: any): Language {
  // 优先从 Astro.locals 获取
  if (astro?.locals?.__global?.lang) {
    return astro.locals.__global.lang;
  }
  
  // 其次从 Astro.params 获取
  if (astro?.params?.lang) {
    const lang = astro.params.lang as Language;
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      return lang;
    }
  }
  
  // 从 URL 检测
  if (astro?.url?.pathname) {
    const detected = getLanguageFromURL(astro.url.pathname);
    if (detected) return detected;
  }
  
  // 客户端检测
  if (typeof window !== 'undefined' && window.__GLOBAL?.lang) {
    return window.__GLOBAL.lang;
  }
  
  // 从 AstroWind 配置获取
  return DEFAULT_LANG;
}

/**
 * 生成多语言链接（增强版 langLink）
 */
export function langLink(
  slug = '',
  lang?: Language,
  type: 'page' | 'post' | 'category' | 'tag' | 'services' | 'service' | 'home' | 'blog' | 'asset'  = 'page',
  astro?: any
): string {
  const targetLang = lang || getCurrentLang(astro);
  
  // 处理外部链接
  if (
    slug.startsWith('https://') ||
    slug.startsWith('http://') ||
    slug.startsWith('://') ||
    slug.startsWith('#') ||
    slug.startsWith('javascript:')
  ) {
    return slug;
  }

  // 如果是首页
  if (type === 'home' || slug === '/') {
    return getHomePermalink(targetLang, astro);
  }

  // 如果是资源
  if (type === 'asset') {
    return getAssetLang(slug, targetLang, astro);
  }

  // 获取不带语言前缀的基础路径
  const basePermalink = getPermalink(slug, type);
  // 移除 base 前缀
  const relativePath = basePermalink.replace(BASE_PATHNAME, '');
  // 构建带语言的路径
  const langPath = createPath(targetLang, relativePath);
  // 添加 base 前缀
  return createPath(BASE_PATHNAME, langPath);
}

/**
 * 获取首页链接（支持多语言）
 */
export function getHomePermalink(lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  return createPath(BASE_PATHNAME, targetLang);
}

/**
 * 获取博客列表链接（支持多语言）
 */
export function getBlogPermalink(lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  const blogPath = getPermalink(BLOG_BASE, 'page');
  const relativePath = blogPath.replace(BASE_PATHNAME, '');
  return createPath(BASE_PATHNAME, targetLang, relativePath);
}

/**
 * 获取服务列表链接
 */
export function getServicesPermalink(lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  return createPath(BASE_PATHNAME, targetLang, 'services');
}

/**
 * 获取服务详情链接
 */
export function getServicePermalink(slug: string, lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  return createPath(BASE_PATHNAME, targetLang, 'services', trimSlash(slug));
}

/**
 * 获取分类链接（支持多语言）
 */
export function getCategoryPermalink(category: string, lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  const categoryPath = getPermalink(category, 'category');
  const relativePath = categoryPath.replace(BASE_PATHNAME, '');
  return createPath(BASE_PATHNAME, targetLang, relativePath);
}

/**
 * 获取标签链接（支持多语言）
 */
export function getTagPermalink(tag: string, lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  const tagPath = getPermalink(tag, 'tag');
  const relativePath = tagPath.replace(BASE_PATHNAME, '');
  return createPath(BASE_PATHNAME, targetLang, relativePath);
}

/**
 * 获取关于页面链接
 */
export function getAboutPermalink(lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  return createPath(BASE_PATHNAME, targetLang, 'about');
}

/**
 * 获取联系我们链接
 */
export function getContactPermalink(lang?: Language, astro?: any): string {
  const targetLang = lang || getCurrentLang(astro);
  return createPath(BASE_PATHNAME, targetLang, 'contact');
}

/**
 * 获取语言切换链接
 */
export function getLanguageSwitchPermalink(
  targetLang: Language,
  astro?: any
): string {
  const currentLang = getCurrentLang(astro);
  
  // 获取当前路径（不含语言前缀和 base）
  let currentPath = '';
  
  if (astro?.url?.pathname) {
    const cleanPath = trimSlash(astro.url.pathname.replace(BASE_PATHNAME, ''));
    const segments = cleanPath.split('/').filter(Boolean);
    
    if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0] as Language)) {
      segments.shift();
    }
    currentPath = '/' + segments.join('/');
  } else if (typeof window !== 'undefined') {
    const cleanPath = trimSlash(window.location.pathname.replace(BASE_PATHNAME, ''));
    const segments = cleanPath.split('/').filter(Boolean);
    
    if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0] as Language)) {
      segments.shift();
    }
    currentPath = '/' + segments.join('/');
  }
  
  // 如果当前路径是根路径或只有语言前缀，指向首页
  if (currentPath === '' || currentPath === '/' || currentPath === `/${currentLang}`) {
    return getHomePermalink(targetLang);
  }
  
  // 否则保持相同路径，只切换语言
  return createPath(BASE_PATHNAME, targetLang, currentPath);
}

/**
 * 获取当前路径（不含语言前缀和 base）
 */
export function getCurrentCleanPath(astro?: any): string {
  let pathname = '';
  
  if (astro?.url?.pathname) {
    pathname = astro.url.pathname;
  } else if (typeof window !== 'undefined') {
    pathname = window.location.pathname;
  } else {
    return '/';
  }
  
  const cleanPath = trimSlash(pathname.replace(BASE_PATHNAME, ''));
  const lang = getCurrentLang(astro);
  const segments = cleanPath.split('/').filter(Boolean);
  
  if (segments.length > 0 && segments[0] === lang) {
    segments.shift();
  }
  
  return '/' + segments.join('/');
}

/**
 * 判断当前页面是否与给定路径匹配
 */
export function isActivePath(permalink: string, astro?: any): boolean {
  let currentPath = '';
  
  if (astro?.url?.pathname) {
    currentPath = astro.url.pathname;
  } else if (typeof window !== 'undefined') {
    currentPath = window.location.pathname;
  } else {
    return false;
  }
  
  // 移除 base 进行比较
  const cleanCurrent = trimSlash(currentPath.replace(BASE_PATHNAME, ''));
  const cleanTarget = trimSlash(permalink.replace(BASE_PATHNAME, ''));
  
  // 完全匹配
  if (cleanCurrent === cleanTarget) {
    return true;
  }
  
  // 检查是否是子路径（用于导航高亮）
  if (cleanTarget && cleanCurrent.startsWith(cleanTarget + '/')) {
    return true;
  }
  
  return false;
}

/**
 * 获取导航链接
 */
export function getNavLinks(astro?: any): Array<{ label: string; href: string }> {
  const lang = getCurrentLang(astro);
  
  const menu = SITE.menu || [];
  return menu.map((item: any) => {
    if (typeof item === 'string') {
      return { label: item, href: langLink(item, lang, 'page', astro) };
    }
    return {
      label: item.label || item.text || '',
      href: item.href ? langLink(item.href, lang, item.type || 'page', astro) : '#',
    };
  });
}

/**
 * 获取当前路径的 SEO 信息
 */
export function getCurrentSEO(astro?: any) {
  const lang = getCurrentLang(astro);
  const path = getCurrentCleanPath(astro);
  const isHome = path === '/' || path === '';
  
  return {
    lang,
    path,
    isHome,
    canonical: getCanonical(astro?.url?.pathname || '/'),
    title: isHome ? SITE.title : undefined,
    description: isHome ? SITE.description : undefined,
  };
}

// ============================================================================
// 导出所有函数
// ============================================================================

// 核心导出
export const definitivePermalink = (permalink: string): string => 
  createPath(BASE_PATHNAME, permalink);

// 默认导出对象（方便统一使用）
export const Permalinks = {
  // 工具函数
  trimSlash,
  cleanSlug,
  createPath,
  getAsset,
  getAssetLang,
  
  // 原有功能
  getCanonical,
  getPermalink,
  getHomePermalink: (lang?: Language, astro?: any) => 
    getHomePermalink(lang, astro),
  getBlogPermalink: (lang?: Language, astro?: any) => 
    getBlogPermalink(lang, astro),
  applyGetPermalinks,
  applyLangPermalinks,
  
  // 新增多语言功能
  getCurrentLang,
  langLink,
  getServicesPermalink,
  getServicePermalink,
  getCategoryPermalink,
  getTagPermalink,
  getAboutPermalink,
  getContactPermalink,
  getLanguageSwitchPermalink,
  getCurrentCleanPath,
  isActivePath,
  getNavLinks,
  getCurrentSEO,
};

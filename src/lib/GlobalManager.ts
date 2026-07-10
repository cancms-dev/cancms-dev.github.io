// src/lib/GlobalManager.ts
import type { Language } from '../i18n/types';

/**
 * 简化的全局状态管理器
 * 不依赖 Astro.locals，避免初始化顺序问题
 */
export class GlobalManager {
  private static instance: GlobalManager;
  private _data: Record<string, any> = {};
  private _initialized: boolean = false;

  private constructor() {}

  static getInstance(): GlobalManager {
    if (!GlobalManager.instance) {
      GlobalManager.instance = new GlobalManager();
    }
    return GlobalManager.instance;
  }

  /**
   * 初始化管理器（在 Layout.astro 中调用）
   */
  init(astro: any): void {
    if (this._initialized) return;
    
    // 检测当前语言
    const lang = this.detectLanguage(astro.url.pathname);
    
    this._data.lang = lang;
    this._data.astro = astro;
    this._initialized = true;
  }

  private detectLanguage(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean);
    const supported = ['zh-TW', 'zh-CN', 'en'];
    const lang = segments[0];
    return supported.includes(lang) ? lang : 'zh-TW';
  }

  get<T = any>(key: string, defaultValue?: T): T {
    return this._data[key] ?? defaultValue as T;
  }

  set<T = any>(key: string, value: T): void {
    this._data[key] = value;
  }

  setMultiple(vars: Record<string, any>): void {
    for (const [key, value] of Object.entries(vars)) {
      this._data[key] = value;
    }
  }

  has(key: string): boolean {
    return key in this._data;
  }

  getAll(): Record<string, any> {
    return { ...this._data };
  }

  isInitialized(): boolean {
    return this._initialized;
  }
}

// 导出单例实例
export const Global = GlobalManager.getInstance();

// 导出类型
export type GlobalKey = 
  | 'lang'
  | 'translations'
  | 't'
  | 'siteTitle'
  | 'siteDescription'
  | 'currentPath'
  | 'isHome'
  | 'user'
  | 'theme'
  | 'cart'
  | 'permalinks'

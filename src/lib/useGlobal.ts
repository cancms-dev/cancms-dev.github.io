// src/lib/useGlobal.ts
import { Global } from './GlobalManager';

/**
 * 在 Astro 组件中使用全局变量的 Hook
 * 适配简化后的 GlobalManager
 */
export function useGlobal(astro?: any) {
  // 如果传入了 astro 且 Global 未初始化，则初始化
  if (astro && !Global.isInitialized()) {
    Global.init(astro);
  }
  
  return {
    // 获取
    get: <T = any>(key: string, defaultValue?: T): T => {
      return Global.get<T>(key, defaultValue);
    },
    
    // 设置
    set: <T = any>(key: string, value: T) => {
      Global.set(key, value);
    },
    
    // 批量设置
    setMultiple: (vars: Record<string, any>) => {
      Global.setMultiple(vars);
    },
    
    // 检查
    has: (key: string) => {
      return Global.has(key);
    },
    
    // 获取所有
    getAll: () => {
      return Global.getAll();
    },
    
    // 检查是否已初始化
    isInitialized: () => {
      return Global.isInitialized();
    },
  };
}

/**
 * 简化的 Hook：只获取语言和翻译
 */
export function useLang(): string {
  return Global.get('lang', 'zh-TW');
}

export function useTranslations() {
  const lang = useLang();
  const translations = Global.get('translations', {});
  const t = Global.get('t', (key: string) => key);
  
  return { lang, translations, t };
}

// src/lib/GlobalManager.typed.ts
import { Global } from './GlobalManager';
import type { Language } from '~/i18n/types';

/**
 * 定义全局变量的类型
 */
interface GlobalState {
  lang: Language;
  translations: Record<string, string>;
  t: (key: string, params?: Record<string, any>) => string;
  siteTitle: string;
  siteDescription: string;
  currentPath: string;
  isHome: boolean;
  theme: 'light' | 'dark';
  user: { id: string; name: string } | null;
  cart: { items: any[]; total: number };
}

/**
 * 类型安全的全局访问器
 */
export const GlobalState = {
  // 语言相关
  lang: Global.createAccessor<Language>('lang'),
  translations: Global.createAccessor<Record<string, string>>('translations'),
  t: Global.createAccessor<(key: string, params?: any) => string>('t'),

  // 页面相关
  currentPath: Global.createAccessor<string>('currentPath'),
  isHome: Global.createAccessor<boolean>('isHome'),

  // 站点配置
  siteTitle: Global.createAccessor<string>('siteTitle'),
  siteDescription: Global.createAccessor<string>('siteDescription'),

  // 用户相关
  theme: Global.createAccessor<'light' | 'dark'>('theme'),
  user: Global.createAccessor<{ id: string; name: string } | null>('user'),
  cart: Global.createAccessor<{ items: any[]; total: number }>('cart'),
};

import React, { useState, useEffect } from 'react';

/**
 * 根据 content.config.ts 中 spaCollection 的 schema 定义
 * 匹配 Astro 从 src/data/spa/** /*.md 加载的数据结构
 */
interface SpaData {
  id: string;
  slug: string;
  name: string;
  description: string;
  // 封面图片 (对应 schema 中的 cover 字段)
  cover: string;
  // 用于 WebP 格式的封面 (由前端组件自行构造或从数据中读取)
  coverWebp?: string;
  // 右上角标签 (在 MD 中定义) - 改为 tags 数组
  tags: string[];
  tagColor?: 'red' | 'gold' | 'black';
  // 分类标识 (对应 schema 中的 buckets 数组)
  buckets: string[];
  // 状态: active / paused (由组件自己控制)
  status?: 'active' | 'paused';
  // 以下为 UI 增强字段，可在 MD 中自定义，也可在组件内硬编码
  spotlight?: 'red' | 'gold' | 'silver' | 'none';
  borderStyle?: 'red' | 'gold' | 'silver' | 'none';
  glowAnimation?: 'redGlow' | 'goldGlow' | 'silverGlow' | 'none';
  // 其他可能从 MD 传入的字段
  district?: '澳门半岛' | '氹仔';
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  overnightAllowed?: boolean;
  freeOvernightRoom?: boolean;
  open24h?: boolean;
  ktv?: boolean;
  themeRooms?: boolean;
  isNew?: boolean;
  features?: string[];
  staffCount?: string;
  staffNationalities?: string;
  openingHours?: string;
  staffHours?: string;
  address?: string;
  images?: Array<{ id: number; url: string; caption: string; alt: string }>;
  seoTitle?: string;
  seoDescription?: string;
}

interface FeaturedSpasProps {
  spas: any[]; // Astro collection 数据
}

// 过滤按钮配置
const FILTER_BUCKETS = [
  { key: 'all', label: '全部' },
  { key: 'theme', label: '主題房' },
  { key: 'value', label: '高性價' },
  { key: 'lineup', label: '陣容' },
  { key: 'new', label: '新場' },
  { key: 'ktv', label: 'KTV' },
];

 

export default function FeaturedSpas({ spas }: FeaturedSpasProps) {
  // 状态管理：当前选中的过滤条件
  const [activeBucket, setActiveBucket] = useState<string>('all');


  // 映射数据到组件需要的格式
  const spaData: SpaData[] = spas.map((spa) => {
    const spaDataModified = {
      id: spa.id,
      slug: spa.slug || spa.data.slug,
      name: spa.data.name,
      description: spa.data.seoDescription,
      cover: spa.data.cover,
      // 自动生成 WebP 路径：将 .jpg/.jpeg/.png 替换为 .webp
      coverWebp: spa.data.coverWebp || spa.data.cover?.replace(/\.(jpe?g|png)$/, '.webp'),
      tags: spa.data.tags || [],
      tagColor: spa.data.tagColor || 'gold',
      buckets: spa.data.buckets || [],
      status: spa.data.status || 'active',
      spotlight: spa.data.spotlight || 'gold',
      borderStyle: spa.data.borderStyle || 'gold',
      glowAnimation: spa.data.glowAnimation || 'goldGlow',
    }
    // 主推spa, 边框红色
    if(spa.data.recommendedShow === true) {
      spaDataModified.borderStyle = 'red';
      spaDataModified.tagColor = 'red';
    }
    return spaDataModified;
  });

  // 过滤计算
  const filteredSpas = activeBucket === 'all'
    ? spaData
    : spaData.filter((spa) => spa.buckets.includes(activeBucket));

  // 隐藏卡片数量
  const hiddenCount = spaData.length - filteredSpas.length;



  // 组件挂载后启动 IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    document.querySelectorAll('.fade-up:not(.in-view)').forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [filteredSpas]);


  // 处理过滤点击
  const handleFilter = (bucket: string) => {
    setActiveBucket(bucket);
  };

  // 重置过滤到"全部"
  const handleReset = () => {
    setActiveBucket('all');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="fade-up text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">精選會所</h2>
          <div className="w-20 h-0.5 bg-gold mx-auto mb-6"></div>
          <p className="text-white/50 max-w-none mx-auto sm:whitespace-nowrap">
            {spaData.length} 間持牌會所・每間都有獨家走秀模式・專業按摩與舒適專屬私密服務・含餐飲與過夜
          </p>
        </div>

        {/* 过滤器按钮 */}
        <div className=" top-16 sm:top-20 z-30 -mx-4 px-4 py-2 mb-7 bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/5">
          <div className="flex sm:flex-wrap sm:justify-center gap-1.5 sm:gap-2 max-w-7xl mx-auto" role="group" aria-label="全部" data-spa-filter="">
            {FILTER_BUCKETS.map(({ key, label }) => {
              const isActive = activeBucket === key;
              return (
                <button
                  key={key}
                  type="button"
                  data-bucket={key}
                  aria-pressed={isActive ? "true" : "false"}
                  onClick={() => handleFilter(key)}
                  className={`flex-1 sm:flex-none min-w-0 rounded-full px-2 sm:px-3.5 py-1.5 text-xs sm:text-[13px] font-semibold text-center border border-white/12 bg-white/[0.04] text-white/70 whitespace-nowrap transition-colors hover:bg-white/[0.08] aria-pressed:bg-gold aria-pressed:text-black aria-pressed:border-transparent ${
                    isActive ? 'bg-gold text-black border-transparent' : ''
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-spa-grid="">
          {filteredSpas.map((spa, index) => {
            const delay = (index * 0.03).toFixed(2);
            const isPaused = spa.status === 'paused';
            
            // 边框样式
            let borderClass = 'border border-gold/25 hover:border-gold/40';
            let glowStyle = {};
            
            if (spa.borderStyle === 'red') {
              borderClass = 'border-2 border-red-400/60 hover:border-red-400/80';
              glowStyle = { animation: 'goldGlow 2s ease-in-out infinite' };
            } else if (spa.borderStyle === 'gold') {
              borderClass = 'border-2 border-gold/60 hover:border-gold/80';
              glowStyle = { animation: 'goldGlow 2s ease-in-out infinite' };
            } else if (spa.borderStyle === 'silver') {
              borderClass = 'border-2 border-white/30 hover:border-gold/40';
              glowStyle = { animation: 'silverGlow 3s ease-in-out infinite' };
            }

            // 标签样式
            let tagClass = 'bg-gold text-black';
            if (spa.tagColor === 'red') {
              tagClass = 'bg-red-400 text-white';
            }

            return (
              <div 
                key={spa.id} 
                // className={`fade-up ${index < 9 ? 'in-view' : ''}`} 
                className={`fade-up`} 
                style={{ transitionDelay: `${delay}s` }}
                data-testid="spa-card"
                data-buckets={spa.buckets.join(' ')}
              >
                <a 
                  href={`/zh-TW/spa/${spa.slug}/`} 
                  className={`group block bg-[#141414] rounded-2xl overflow-hidden transition-all duration-500 shadow-lg hover:shadow-gold/5 ${borderClass}`}
                  style={glowStyle}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* 暂停预约标签 */}
                    {isPaused && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <span className="px-5 py-2 rounded-full border border-gold/60 bg-black/55 text-gold-light text-sm font-bold tracking-wide shadow-lg">
                          暫停預約
                        </span>
                      </div>
                    )}
                    
                    {/* 右上角标签 */}
                    {!isPaused && spa.tags.length > 0 && (
                      <span className={`absolute top-3 right-3 z-10 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ${tagClass}`}>
                        {spa.tags.join(' & ')}
                      </span>
                    )}

                    <picture>
                      <source srcSet={spa.coverWebp} type="image/webp" />
                      <img 
                        src={spa.cover} 
                        alt={`${spa.name} — 澳門頂級桑拿會所`} 
                        loading={index < 3 ? 'eager' : 'lazy'} 
                        decoding="async" 
                        width="800" 
                        height="600" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    </picture>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors duration-300 mb-2">
                      {spa.name}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                      {spa.description}
                    </p>
                    <div className="mt-4 flex items-center text-gold text-sm font-medium opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <span>了解更多</span>
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* 底部隐藏提示 */}
        {hiddenCount > 0 && (
          <p className="text-center text-sm text-white/50 mt-8" data-spa-hidden-note="">
            另有 <strong className="text-white" data-hidden-count="">{hiddenCount}</strong> 間未顯示・ 
            <button 
              type="button" 
              className="text-gold underline underline-offset-2 hover:text-gold-light" 
              data-spa-jump-all=""
              onClick={handleReset}
            >
              查看全部
            </button>
          </p>
        )}
      </div>
    </>
  );
}



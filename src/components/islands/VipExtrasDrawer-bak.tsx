import { useState, useEffect, useCallback } from 'react';

interface VipExtra {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: string;
}

export interface Props {
  extras?: VipExtra[];
  title?: string;
  subtitle?: string;
}

const DEFAULT_EXTRAS: VipExtra[] = [
  {
    id: 'back-scrub',
    name: '擦背服務',
    desc: '專業擦背服務，舒緩肩頸與背部緊繃。',
    icon: '🧎‍♀️',
    price: '298 MOP',
  },
  {
    id: 'leg-massage',
    name: '腿部按摩',
    desc: '大腿前後深層放鬆，桑拿後最對症。',
    icon: '🦵',
    price: '288 MOP',
  },
  {
    id: 'head-massage',
    name: '頭部按摩',
    desc: '頭皮揉壓，緩解頭痛與精神疲勞。',
    icon: '💆',
    price: '230 MOP',
  },
  {
    id: 'foot-massage',
    name: '足底按摩',
    desc: '穴位按壓，喚醒疲憊雙足。',
    icon: '🦶',
    price: '230 MOP',
  },
  {
    id: 'finger-nail',
    name: '修手指甲',
    desc: '修剪、塑形、護理甲緣。',
    icon: '🤚',
    price: '220 MOP',
  },
  {
    id: 'toe-nail',
    name: '修腳指甲',
    desc: '泡腳、修甲、甲緣護理、足部放鬆。',
    icon: '🧴',
    price: '220 MOP',
  },
  {
    id: 'hand-massage',
    name: '手部按摩',
    desc: '釋放手腕與前臂的緊繃感。',
    icon: '🤲',
    price: '200 MOP',
  },
  {
    id: 'ear-cleaning',
    name: '採耳',
    desc: '傳統採耳體驗，意外地讓人放鬆。',
    icon: '👂',
    price: '200 MOP',
  },
];

function VipExtrasDrawer2({
  extras = DEFAULT_EXTRAS,
  title = '您的 VIP 尊享',
  subtitle = '任選 1 項——我們會事先通知場地您的到訪，到場時可直接挑選。',
}: Props) {
  return (
    <>Test</>
  );
};

export default function VipExtrasDrawer({
  extras = DEFAULT_EXTRAS,
  title = '您的 VIP 尊享',
  subtitle = '任選 1 項——我們會事先通知場地您的到訪，到場時可直接挑選。',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  // 安全拆分 title，避免 undefined 导致 React #418 错误
  const vipText = 'VIP 尊享';
  const titleParts = title.split(vipText);
  const titleStart = titleParts[0] || '';
  const titleEnd = titleParts[1] || '';

  // 监听全局自定义事件，从外部触发抽屉打开
  useEffect(() => {
    const handleOpenDrawer = () => openDrawer();
    window.addEventListener('open-vip-drawer', handleOpenDrawer);
    return () => {
      window.removeEventListener('open-vip-drawer', handleOpenDrawer);
    };
  }, [openDrawer]);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, closeDrawer]);

  return (
    <>
      <div
        data-testid="vip-extras-drawer"
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* 遮罩层 */}
        <div
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeDrawer}
        />

        {/* 抽屉主体 - 从右边滑入 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-extras-drawer-title"
          className={`fixed bg-[#0f0f0f] border-white/10 shadow-2xl flex flex-col inset-0 pb-[env(safe-area-inset-bottom)] sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[440px] sm:border-l sm:pb-0 transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
            {/* 头部 */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-white/5">
              <div>
                <h2
                  id="vip-extras-drawer-title"
                  className="text-xl sm:text-2xl font-bold text-white"
                >
                  {titleStart}
                  <span className="text-gold">{vipText}</span>
                  {titleEnd}
                </h2>
                <p className="text-sm text-white/60 mt-2">
                  {subtitle}
                  <span className="text-gold font-semibold"></span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="關閉 VIP 尊享"
                className="flex-shrink-0 p-2.5 rounded-full bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 active:bg-white/25 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x w-6 h-6"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* 内容列表 */}
            <div className="relative flex-1 min-h-0">
              <div className="scrollbar-hide absolute inset-0 overflow-y-auto px-5 sm:px-6 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th
                        scope="col"
                        className="text-left pb-2 text-xs uppercase tracking-wider text-white/40 font-normal"
                      >
                        服務項目
                      </th>
                      <th
                        scope="col"
                        className="text-right pb-2 text-xs uppercase tracking-wider text-white/40 font-normal"
                      >
                        價值
                      </th>
                      <th
                        scope="col"
                        className="text-right pb-2 pl-2 text-xs uppercase tracking-wider text-gold font-normal"
                      >
                        VIP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {extras.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="py-3 pr-2 align-top">
                          <div className="flex items-start gap-2">
                            <span
                              className="text-xl flex-shrink-0 leading-none mt-0.5"
                              aria-hidden="true"
                            >
                              {item.icon}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-white">
                                {item.name}
                              </div>
                              <div className="text-xs text-white/55 mt-0.5 leading-relaxed">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right text-white/45 align-top py-3 whitespace-nowrap line-through">
                          {item.price}
                        </td>
                        <td className="text-right text-gold font-semibold align-top py-3 pl-2 pr-1 whitespace-nowrap">
                          免費
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="p-5 sm:p-6 border-t border-white/5 bg-black/40">
              <p className="text-xs text-white/50 text-center">
                我們會事先通知場地您的到訪——到場時可直接挑選您喜歡的。
              </p>
            </div>
          </div>
        </div>
    </>
  );
}

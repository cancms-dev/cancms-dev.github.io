import { useState, useMemo, useCallback, useEffect  } from 'react';
import { getAsset } from '~/utils/permalinks';
/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Venue {
  slug: string;
  district: string;
  priceMin: number;
  priceMax: number;
  freeOvernightRoom: boolean;
  overnightAllowed: boolean;
  open24h: boolean;
  ktv: boolean;
  themeRooms: boolean;
  recommendedShow: boolean;
  isNew: boolean;
  rating: number;
  buckets: string[];
  name: string;
  cover: string;
}

export interface Props {
  venues: Venue[];
  lang?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PARTY_OPTIONS = [
  { key: '1', label: '1 位' },
  { key: '2', label: '2 位' },
  { key: '3-4', label: '3-4 位' },
  { key: '5+', label: '5 位以上' },
] as const;

const EXPERIENCE_OPTIONS = [
  { key: 'lineup', label: '主舞台盛秀' },
  { key: 'theme', label: '主題情境' },
  { key: 'value', label: '買一送一' },
  { key: 'japanese', label: '日韓極致' },
  { key: 'new', label: '全新登場' },
  { key: 'ktv', label: 'KTV 包廂' },
  { key: 'classic', label: '經典臻選' },
] as const;

const TIME_OPTIONS = [
  { key: 'now', label: '即刻' },
  { key: 'tonight', label: '今晚' },
  { key: 'tomorrow', label: '明天' },
  { key: 'sat', label: '週六晚' },
  { key: 'sun', label: '週日晚' },
  { key: 'other', label: '其他' },
] as const;

const ORIGIN_OPTIONS = [
  { key: 'border', label: '口岸' },
  { key: 'hotel', label: '酒店' },
  { key: 'airport', label: '機場' },
  { key: 'other', label: '其他' },
] as const;

const CONTACT_INFO = {
  whatsapp: '85365670348',
  telegram: 'Aomensauna',
  line: 'https://line.me/ti/p/VZHFDSZnq9',
};

const preloadImages = [
  'images/whatsapp.svg',
  'images/telegram.svg',
  'images/wechat.svg',
  'images/line.svg',
];

/* ------------------------------------------------------------------ */
/*  Experience → Venue Priority Map (from production D table)          */
/* ------------------------------------------------------------------ */

const EXPERIENCE_PRIORITY: Record<string, string[]> = {
  lineup: ['manhao-spa', 'oceanic-royal-spa', 'number-one-sauna'],
  theme: ['east-castle-spa', 'majesty-spa', 'the-excellent-spa'],
  value: ['victoria-sauna', 'shang-pin-spa', 'majesty-spa'],
  japanese: ['oceanic-royal-spa', 'victoria-sauna', 'number-nine-sauna'],
  new: ['manhao-spa', 'empire-spa', 'number-nine-sauna'],
  ktv: ['majesty-spa', 'm-club'],
  classic: ['familia-nobre', 'number-one-spa', 'oceanic-royal-spa'],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function btnClass(active: boolean) {
  return active
    ? 'rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors bg-gradient-to-r from-gold-light to-gold-dark text-black'
    : 'rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors border border-white/12 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]';
}

function scoreVenue(
  v: Venue,
  index: number,
  prefs: { party: string; experience: string; time: string; origin: string; overnight: boolean },
): number {
  // A. Base score
  let score = 50;

  // B. Experience priority weighting (from production logic)
  const priorityList = EXPERIENCE_PRIORITY[prefs.experience];
  if (priorityList) {
    const rank = priorityList.indexOf(v.slug);
    if (rank === 0) score += 40;
    else if (rank === 1) score += 30;
    else if (rank === 2) score += 20;
    else score += 6; // Even if not in the top 3, having the tag gives a bonus
  }

  // C. Overnight correction (from production logic)
  if (prefs.overnight) {
    if (v.overnightAllowed) {
      if (v.freeOvernightRoom) score += 22;
      else if (v.rating >= 5 || v.themeRooms) score += 8;
      else score -= 2;
    } else {
      score -= 12; // Heavy penalty if user wants overnight but venue doesn't allow it
    }
  }

  // D. Party size correction (from production logic)
  if (prefs.party === '5+' || prefs.party === '3-4') {
    if (v.isNew || v.ktv || v.recommendedShow) score += 6;
  } else if (prefs.party === '1') {
    if (v.themeRooms || v.freeOvernightRoom) score += 4;
  }

  // E. Time correction (from production logic)
  if (prefs.time === 'now') {
    if (v.open24h || v.isNew || v.themeRooms) score += 4;
  } else if (prefs.time === 'tonight' || prefs.time === 'tomorrow') {
    if (v.open24h || v.isNew) score += 3;
  } else if (prefs.time === 'sat' || prefs.time === 'sun') {
    if (v.isNew || v.ktv || v.recommendedShow) score += 4;
  }

  // F. Origin correction (from production logic, including airport -1)
  if (prefs.origin === 'border') {
    if (v.district === '澳門半島') score += 3;
  } else if (prefs.origin === 'airport') {
    if (v.district === '氹仔') score += 5;
    else score -= 1; // Penalty if airport selected but venue not in Taipa
  }

  // G. Index tiebreaker & cap (from production logic)
  score -= index * 0.01; // Prevents ordering flickering on identical scores
  score = Math.min(100, Math.round(score));

  return score;
}

function buildContactMessage(
  venueName: string,
  prefs: { party: string; time: string; origin: string; overnight: boolean; experience: string },
  lang: string, // Added lang parameter for i18n
) {
  const expLabel = EXPERIENCE_OPTIONS.find((o) => o.key === prefs.experience)?.label ?? '';
  const timeLabel = TIME_OPTIONS.find((o) => o.key === prefs.time)?.label ?? '';
  const originLabel = ORIGIN_OPTIONS.find((o) => o.key === prefs.origin)?.label ?? '';
  const partyLabel = PARTY_OPTIONS.find((o) => o.key === prefs.party)?.label ?? '';

  // Multi-language prefill templates (from production logic, without Japanese)
  if (lang === 'en') {
    const lines = [
      `Hi, I matched a venue on your site. Experience: ${expLabel}`,
      `· Group: ${partyLabel}`,
      `· Time: ${timeLabel}`,
      `· Coming from: ${originLabel}`,
      prefs.overnight ? '· Overnight: yes (booking perk / private sleep room)' : '· Overnight: no',
      venueName ? `· Interested in: ${venueName}` : '',
      '',
      'Please confirm pricing and VIP arrangements. Thanks!',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }

  if (lang === 'zh-CN') {
    const lines = [
      `你好，我在网站上匹配好了心水。体验：${expLabel}`,
      `・人数：${partyLabel}`,
      `・时间：${timeLabel}`,
      `・出发地：${originLabel}`,
      prefs.overnight ? '・过夜：要（预约优惠・独立睡房优先）' : '・过夜：不用',
      venueName ? `・目前想去：${venueName}` : '',
      '',
      '麻烦帮我确认价钱及 VIP 安排，谢谢！',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }

  // Default: zh-TW
  const lines = [
    `你好，我在網站上配對好了心水。體驗：${expLabel}`,
    `・人數：${partyLabel}`,
    `・時間：${timeLabel}`,
    `・出發地：${originLabel}`,
    prefs.overnight ? '・過夜：要（預約優惠・獨立睡房優先）' : '・過夜：不用',
    venueName ? `・目前想去：${venueName}` : '',
    '',
    '麻煩幫我確認價錢及 VIP 安排，謝謝！',
  ].filter(Boolean);
  return encodeURIComponent(lines.join('\n'));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QuickMatch({ venues, lang = 'zh-TW' }: Props) {
  const [party, setParty] = useState('2');
  const [experience, setExperience] = useState('new');
  const [time, setTime] = useState('tonight');
  const [origin, setOrigin] = useState('hotel');
  const [overnight, setOvernight] = useState(false); // Changed name and semantics
  const [animKey, setAnimKey] = useState(0);

  const prefs = useMemo(
    () => ({ party, experience, time, origin, overnight }), // Updated to use 'overnight'
    [party, experience, time, origin, overnight], // Updated dependency
  );

  const ranked = useMemo(() => {
    const scored = venues.map((v, i) => ({ venue: v, score: scoreVenue(v, i, prefs) })); // Pass index to scoring function
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [venues, prefs]);

  const topVenue = ranked[0];
  const runnersUp = ranked.slice(1, 3);

  const handlePrefChange = useCallback((setter: (v: any) => void, value: any) => {
    setter(value);
    setAnimKey((k) => k + 1);
  }, []);

  const msg = useMemo(
    () => buildContactMessage(topVenue?.venue.name ?? '', prefs, lang), // Pass 'lang' for i18n
    [topVenue, prefs, lang], // Add 'lang' to dependency
  );


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
    }, []);



  const detailHref = `/${lang}/spa/${topVenue?.venue.slug}/`;
  const maxScore = 100;
  const pct = Math.min(Math.round(((topVenue?.score ?? 0) / maxScore) * 100), 99);

  return (
    <div className="fade-up">
      {preloadImages.map((src, idx) => (
        <link key={`preImg-${idx}`} rel="preload" as="image" href={`${getAsset(src)}`} />
      ))} 

      <div className="qm-root rounded-3xl border border-gold/25 bg-gradient-to-b from-gold/[0.07] to-white/[0.02] p-5 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block text-gold text-xs sm:text-sm font-bold tracking-[0.18em] mb-3">
            ★ 智能配對
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
            一分鐘，找出最適合你的<span className="text-gold">桑拿</span>
          </h2>
          <p className="text-white/55 text-sm sm:text-base max-w-xl mx-auto mt-3 text-balance">
            回答幾條問題，我們即時為你配對 {venues.length} 間中最契合的一間。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8 items-start">
          {/* ---- Left: Filters ---- */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">幾位？</div>
              <div className="flex flex-wrap gap-1.5">
                {PARTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={party === opt.key}
                    className={btnClass(party === opt.key)}
                    onClick={() => handlePrefChange(setParty, opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">想要什麼體驗？</div>
              <div className="flex flex-wrap gap-1.5">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={experience === opt.key}
                    className={btnClass(experience === opt.key)}
                    onClick={() => handlePrefChange(setExperience, opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">什麼時候？</div>
              <div className="flex flex-wrap gap-1.5">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={time === opt.key}
                    className={btnClass(time === opt.key)}
                    onClick={() => handlePrefChange(setTime, opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">從哪裡出發？</div>
              <div className="flex flex-wrap gap-1.5">
                {ORIGIN_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    aria-pressed={origin === opt.key}
                    className={btnClass(origin === opt.key)}
                    onClick={() => handlePrefChange(setOrigin, opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={overnight} // Updated to use 'overnight'
              className="flex w-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
              onClick={() => handlePrefChange(setOvernight, !overnight)} // Updated to use 'overnight'
            >
              <span className="flex items-center gap-3">
                <span
                  className={`relative h-6 w-11 flex-shrink-0 rounded-full border transition-colors ${
                    overnight ? 'border-gold/50 bg-gold' : 'border-white/15 bg-white/15' // Updated styling logic
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
                      overnight ? 'translate-x-[22px]' : 'translate-x-0.5' // Updated translate logic
                    }`}
                  />
                </span>
                <span className={`text-sm font-bold ${overnight ? 'text-white' : 'text-white/55'}`}> {/* Updated text logic */}
                  {overnight ? '要過夜' : '不過夜'}
                </span>
              </span>
              <span className="text-xs text-white/45">預約優惠・獨立睡房優先</span>
            </button>
          </div>

          {/* ---- Right: Results ---- */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold">為你推薦</span>
              <span className="text-xs text-white/45">由 {venues.length} 間中精選</span>
            </div>

            {topVenue && (
              <div
                key={animKey}
                className="qm-hero relative overflow-hidden rounded-2xl border border-gold/40 bg-black/40"
              >
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    alt={topVenue.venue.name}
                    className="qm-hero-img h-full w-full object-cover"
                    loading="lazy"
                    src={topVenue.venue.cover}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                  <span className="qm-sweep pointer-events-none absolute inset-0" aria-hidden="true" />
                  <span className="absolute left-3 top-3 rounded-md bg-gradient-to-br from-gold-light to-gold-dark px-2.5 py-1 text-[11px] font-black tracking-wider text-black shadow">
                    最佳配對
                  </span>
                  <span className="absolute right-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-sm font-extrabold text-gold backdrop-blur-sm">
                    {pct}% 契合
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <h3 className="truncate text-xl sm:text-2xl font-black text-white">
                      {topVenue.venue.name}
                    </h3>
                    <a
                      href={detailHref}
                      className="flex-shrink-0 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
                    >
                      詳情 →
                    </a>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="mb-2.5 text-[11px] font-bold tracking-[0.08em] text-white/55">
                    立即預訂・選你慣用的
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=${msg}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] px-3 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                    >
                      <img alt="" width="16" height="16" src={getAsset(preloadImages[0])}  />
                      WhatsApp
                    </a>
                    <a
                      href={`https://t.me/${CONTACT_INFO.telegram}?text=${msg}`}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#229ed9] px-3 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                    >
                      <img alt="" width="16" height="16" src={getAsset(preloadImages[1])}  />
                      Telegram
                    </a>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      data-wechat-trigger="true"
                      aria-label="微信"
                      title="微信"
                      className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-2 transition-colors hover:bg-white/[0.08]"
                    >
                      <img alt="WeChat" className="h-5 w-5 rounded-md" src={getAsset(preloadImages[2])} />
                    </button>
                    <a
                      href={CONTACT_INFO.line}
                      target="_blank"
                      rel="noopener"
                      aria-label="LINE"
                      title="LINE"
                      className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-2 transition-colors hover:bg-white/[0.08]"
                    >
                      <img alt="LINE" className="h-5 w-5 rounded-md" src={getAsset(preloadImages[3])} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {runnersUp.length > 0 && (
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {runnersUp.map(({ venue, score }) => {
                  const runnerPct = Math.min(Math.round((score / maxScore) * 100), 99);
                  return (
                    <a
                      key={venue.slug}
                      href={`/${lang}/spa/${venue.slug}/`}
                      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2 text-left transition-colors hover:border-gold/30 hover:bg-white/[0.05]"
                    >
                      <img
                        alt={venue.name}
                        className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
                        loading="lazy"
                        src={venue.cover}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-white">
                          {venue.name}
                        </span>
                        <span className="block text-[11px] font-semibold text-gold">
                          {runnerPct}% 契合
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .qm-hero-img {
          animation: qm-fade 0.45s ease;
        }
        @keyframes qm-fade {
          from { opacity: 0.25; transform: scale(1.04); }
          to   { opacity: 1;    transform: scale(1); }
        }
        .qm-sweep {
          background: linear-gradient(105deg, transparent 35%, rgba(212,175,55,0.35) 50%, transparent 65%);
          transform: translateX(-120%);
          animation: qm-sweep 0.7s ease;
        }
        @keyframes qm-sweep {
          to { transform: translateX(120%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .qm-hero-img, .qm-sweep { animation: none; }
          .qm-sweep { display: none; }
        }
      `}</style>
    </div>
  );
}

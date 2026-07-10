import { useState } from 'react';

interface FilterBarProps {
  buckets: string[];
  onFilterChange: (bucket: string) => void;
}

const bucketLabels: Record<string, string> = {
  all: '全部',
  new: '最新',
  overnight: '過夜',
  theme: '主題房',
  ktv: 'KTV',
  lineup: '技師陣容',
  value: '性價比',
};

export default function FilterBar({ buckets, onFilterChange }: FilterBarProps) {
  const [activeBucket, setActiveBucket] = useState('all');

  const handleClick = (bucket: string) => {
    setActiveBucket(bucket);
    onFilterChange(bucket);
  };

  return (
    <div className="sticky top-[72px] z-40 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gold/15 mb-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleClick('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeBucket === 'all'
              ? 'bg-[#D4AF37] text-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
        >
          全部
        </button>
        {buckets.map((bucket) => (
          <button
            key={bucket}
            type="button"
            onClick={() => handleClick(bucket)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeBucket === bucket
                ? 'bg-[#D4AF37] text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {bucketLabels[bucket] || bucket}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function QuickMatch({ lang }: { lang: string }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({ budget: '', overnight: false });

  const handleNext = (key: string, value: any) => {
    setPrefs({ ...prefs, [key]: value });
    setStep(step + 1);
  };

  return (
    <div className="bg-[#141414] p-8 rounded-2xl border border-[#D4AF37]/20 text-center">
      <h2 className="text-2xl font-bold mb-6">智能匹配您的專屬體驗</h2>
      {step === 0 && (
        <div className="space-y-4">
          <p>您的預算範圍是？</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleNext('budget', 'low')} className="px-6 py-2 bg-[#D4AF37]/20 rounded-full">中低預算</button>
            <button onClick={() => handleNext('budget', 'high')} className="px-6 py-2 bg-[#D4AF37]/20 rounded-full">高預算</button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <p>是否需要過夜？</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleNext('overnight', true)} className="px-6 py-2 bg-[#D4AF37]/20 rounded-full">是</button>
            <button onClick={() => handleNext('overnight', false)} className="px-6 py-2 bg-[#D4AF37]/20 rounded-full">否</button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <p className="mb-4">根據您的選擇，推薦會所：</p>
          <a href={`/${lang}/ranking/`} className="text-gold font-bold">查看推薦清單 →</a>
        </div>
      )}
    </div>
  );
}

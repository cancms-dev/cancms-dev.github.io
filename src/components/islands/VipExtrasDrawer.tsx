import { useState } from 'react';

export default function VipExtrasDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  
  const extras = [
    { name: '免費擦背', desc: '專業技師精緻擦背服務' },
    { name: '按摩套餐', desc: '45分鐘深度放鬆' },
    { name: '特色茶飲', desc: '精選養生茶品' }
  ];

  return (
    <div>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 bg-gold text-black font-bold rounded-full hover:bg-[#B8960F] transition-all"
      >
        查看 VIP 尊享禮遇
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="bg-[#141414] w-full max-w-md p-6 rounded-2xl relative border border-gold/30">
            <h3 className="text-xl font-bold mb-4 text-gold">VIP 尊享禮遇</h3>
            <ul className="space-y-4 mb-6">
              {extras.map(e => (
                <li key={e.name} className="border-b border-white/5 pb-2">
                  <p className="font-bold">{e.name}</p>
                  <p className="text-sm text-white/60">{e.desc}</p>
                </li>
              ))}
            </ul>
            <button onClick={() => setIsOpen(false)} className="w-full py-2 border border-white/20 rounded-full">關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}

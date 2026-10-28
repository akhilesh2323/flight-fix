import React from 'react';
import { ShieldCheck, AlertCircle, Wrench, AlertTriangle } from 'lucide-react';

export const StatusLegend = () => {
  const items = [
    { label: 'Operational', color: 'bg-emerald-400', border: 'border-emerald-500/40', text: 'text-emerald-300' },
    { label: 'Maintenance Due', color: 'bg-amber-400', border: 'border-amber-500/40', text: 'text-amber-300' },
    { label: 'Under Maintenance', color: 'bg-rose-500 animate-pulse', border: 'border-rose-500/40', text: 'text-rose-300' },
    { label: 'Warning / Alert', color: 'bg-yellow-400', border: 'border-yellow-500/40', text: 'text-yellow-300' },
  ];

  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl max-w-[220px]">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
        Component Status Legend
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm`} />
            <span className={`font-medium ${item.text}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'sky', alert = false }) => {
  const colorMap = {
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const currentTheme = colorMap[color] || colorMap.sky;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:border-slate-600 bg-slate-900/60 backdrop-blur-md ${
        alert ? 'border-rose-500/40 shadow-lg shadow-rose-950/20' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${currentTheme}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono text-white tracking-tight">
          {value}
        </span>
        {alert && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300">
            ACTION REQ
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}

      {/* Subtle indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800">
        <div className={`h-full ${alert ? 'bg-rose-500' : 'bg-sky-500/60'} w-1/3`} />
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Menu, Clock, Shield, Bell, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ onToggleSidebar, title = 'Aviation Fleet Overview' }) => {
  const { user } = useAuth();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC / Z`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-[#090e17]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>{title}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        {/* Aviation Zulu Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-sky-400">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* System Telemetry Status */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-medium">MRO CORE ONLINE</span>
        </div>

        {/* User Role Tag */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xs font-bold">
            {user?.role === 'ADMIN' ? 'AD' : user?.role === 'MANAGER' ? 'MG' : 'TC'}
          </div>
          <span className="text-xs font-medium text-slate-300 hidden sm:inline">
            {user?.role || 'TECHNICIAN'}
          </span>
        </div>
      </div>
    </header>
  );
};

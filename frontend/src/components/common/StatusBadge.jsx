import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase().replace(/[\s-]/g, '_');

  const configs = {
    // Aircraft & Component Statuses
    OPERATIONAL: {
      label: 'Operational',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    MAINTENANCE_DUE: {
      label: 'Maintenance Due',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    UNDER_MAINTENANCE: {
      label: 'Under Maintenance',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 animate-ping',
    },
    AOG: {
      label: 'AOG (Grounded)',
      bg: 'bg-red-600/20 text-red-300 border-red-500/50',
      dot: 'bg-red-500 animate-ping',
    },
    WARNING: {
      label: 'Warning Alert',
      bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      dot: 'bg-yellow-400',
    },

    // Work Order & Maintenance Statuses
    OPEN: {
      label: 'Open',
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dot: 'bg-sky-400',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      dot: 'bg-indigo-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
      dot: 'bg-blue-400 animate-pulse',
    },
    WAITING_FOR_PARTS: {
      label: 'Waiting for Parts',
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-400',
    },
    COMPLETED: {
      label: 'Completed',
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      dot: 'bg-teal-400',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    SCHEDULED: {
      label: 'Scheduled',
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400',
    },
    OVERDUE: {
      label: 'Overdue',
      bg: 'bg-red-500/15 text-red-400 border-red-500/40',
      dot: 'bg-red-400 animate-ping',
    },

    // Technician Statuses
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    ON_DUTY: {
      label: 'On Duty',
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dot: 'bg-sky-400',
    },
    ON_LEAVE: {
      label: 'On Leave',
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },

    // Priorities
    CRITICAL: {
      label: 'AOG Critical',
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      dot: 'bg-rose-400 animate-ping',
    },
    HIGH: {
      label: 'High',
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      dot: 'bg-sky-400',
    },
    LOW: {
      label: 'Low',
      bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-700/50 text-slate-300 border-slate-600',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

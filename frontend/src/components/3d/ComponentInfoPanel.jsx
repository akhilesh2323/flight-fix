import React from 'react';
import { X, Wrench, Shield, Calendar, User, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { Link } from 'react-router-dom';

export const ComponentInfoPanel = ({ component, onClose, onOpenCreateWorkOrder }) => {
  if (!component) return null;

  const conditionColor =
    component.condition_score >= 85
      ? 'text-emerald-400 bg-emerald-500'
      : component.condition_score >= 70
      ? 'text-amber-400 bg-amber-500'
      : 'text-rose-400 bg-rose-500';

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-auto w-84 sm:w-96 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-5 shadow-2xl shadow-sky-950/40 text-slate-100 max-h-[calc(100%-2rem)] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
              {component.component_id}
            </span>
            <StatusBadge status={component.status} />
          </div>
          <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
            {component.name}
          </h3>
          <p className="text-xs text-slate-400">
            Aircraft: <span className="font-mono text-slate-200">{component.aircraft_registration || 'Fleet Unit'}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Condition Metric */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Airworthiness Condition Score
          </span>
          <span className="font-mono font-bold text-sm text-white">
            {component.condition_score}%
          </span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              component.condition_score >= 85
                ? 'bg-emerald-400'
                : component.condition_score >= 70
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, component.condition_score))}%` }}
          />
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-400" />
            Last Inspection
          </span>
          <p className="font-mono text-xs font-semibold text-slate-200 mt-1">
            {component.last_inspection || 'Pending Log'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-400" />
            Next Inspection
          </span>
          <p className="font-mono text-xs font-semibold text-slate-200 mt-1">
            {component.next_inspection || 'Due Soon'}
          </p>
        </div>
      </div>

      {/* Assigned Technician */}
      <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <User className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
            Lead Technician
          </span>
          <p className="text-xs font-medium text-slate-200 truncate">
            {component.assigned_technician_name || 'No Lead Assigned'}
          </p>
        </div>
      </div>

      {/* Related Work Orders */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-sky-400" />
            Related Work Orders
          </span>
          <span className="text-xs font-mono text-slate-400">
            ({component.related_work_orders?.length || 0})
          </span>
        </div>

        {component.related_work_orders && component.related_work_orders.length > 0 ? (
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {component.related_work_orders.map((wo) => (
              <Link
                key={wo.id}
                to={`/work-orders/${wo.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono text-sky-400 font-semibold">
                    {wo.work_order_number}
                  </span>
                  <p className="text-xs text-slate-200 font-medium truncate">
                    {wo.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={wo.status} className="scale-90" />
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-3 px-4 rounded-xl bg-slate-800/30 text-center text-xs text-slate-400 border border-dashed border-slate-800">
            No active work orders open for this component.
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
        {onOpenCreateWorkOrder && (
          <button
            onClick={() => onOpenCreateWorkOrder(component)}
            className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition shadow-md shadow-sky-600/30 flex items-center justify-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5" />
            Create Work Order
          </button>
        )}
      </div>
    </div>
  );
};

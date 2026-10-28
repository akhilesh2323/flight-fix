import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  Package,
  Users,
  Download,
  Printer,
  TrendingUp,
  Activity
} from 'lucide-react';
import { reportApi } from '../api/dashboardApi';
import { StatusBadge } from '../components/common/StatusBadge';

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await reportApi.getReportsData();
        setData(res);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data?.maintenance_history) return;
    const headers = ['Record Number', 'Aircraft', 'Type', 'Completed Date', 'Technician', 'Flight Hours', 'Findings'];
    const rows = data.maintenance_history.map((r) => [
      r.record_number,
      r.aircraft_registration,
      `"${r.maintenance_type}"`,
      r.completed_date,
      `"${r.technician_name || ''}"`,
      r.flight_hours_at_maintenance,
      `"${r.findings?.replace(/"/g, '""') || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FlightFix_MRO_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const wo = data?.work_order_metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileBarChart2 className="w-5 h-5 text-sky-400" />
            <span>MRO Analytical Audits & Regulatory Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            FAA Part 121/145 airworthiness compliance records, maintenance KPIs, and downtime logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Work-Order Completion Rate
          </span>
          <span className="font-mono text-2xl font-bold text-emerald-400 block">
            {wo.completion_rate_percentage || 0}%
          </span>
          <span className="text-xs text-slate-400">
            {wo.completed} completed of {wo.total} total orders
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Orders In Progress
          </span>
          <span className="font-mono text-2xl font-bold text-sky-400 block">
            {wo.in_progress || 0}
          </span>
          <span className="text-xs text-slate-400">
            Active technician assignments
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Awaiting Spares / Logistics
          </span>
          <span className="font-mono text-2xl font-bold text-amber-400 block">
            {wo.waiting_parts || 0}
          </span>
          <span className="text-xs text-slate-400">
            Pending warehouse replenishment
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Historical Audit Logs
          </span>
          <span className="font-mono text-2xl font-bold text-purple-400 block">
            {data?.maintenance_history?.length || 0}
          </span>
          <span className="text-xs text-slate-400">
            Certified signoff records on file
          </span>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition relative ${
            activeTab === 'history'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Maintenance History Logbook
        </button>
        <button
          onClick={() => setActiveTab('downtime')}
          className={`pb-3 transition relative ${
            activeTab === 'downtime'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Fleet Downtime Analytics
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`pb-3 transition relative ${
            activeTab === 'parts'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Spare Parts Consumption
        </button>
        <button
          onClick={() => setActiveTab('workload')}
          className={`pb-3 transition relative ${
            activeTab === 'workload'
              ? 'text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Technician Workload Roster
        </button>
      </div>

      {/* Tab 1: Maintenance History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Full Historical Logbook Audit Trail</h3>
            <span className="text-xs font-mono text-slate-400">FAA 14-CFR-43 Compliant</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Record ID</th>
                  <th className="py-3 px-4 font-semibold">Aircraft</th>
                  <th className="py-3 px-4 font-semibold">Check Type</th>
                  <th className="py-3 px-4 font-semibold">Completed Date</th>
                  <th className="py-3 px-4 font-semibold">Lead Inspector</th>
                  <th className="py-3 px-4 font-semibold">Airframe Hours</th>
                  <th className="py-3 px-4 font-semibold">Corrective Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {data?.maintenance_history?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{r.record_number}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-white">{r.aircraft_registration}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{r.maintenance_type}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{r.completed_date}</td>
                    <td className="py-3 px-4 text-slate-300">{r.technician_name || 'FAA Certified Inspector'}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{r.flight_hours_at_maintenance} hrs</td>
                    <td className="py-3 px-4 text-slate-400 max-w-sm truncate">{r.actions_taken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Aircraft Downtime */}
      {activeTab === 'downtime' && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Fleet Downtime Analysis</h3>
              <p className="text-xs text-slate-400">Total hangar dwell and unscheduled maintenance hours this quarter</p>
            </div>
          </div>

          <div className="space-y-3">
            {data?.aircraft_downtime?.map((ac) => {
              const maxHours = 60;
              const percent = Math.min(100, (ac.downtime_hours / maxHours) * 100);

              return (
                <div key={ac.registration} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{ac.registration}</span>
                      <span className="text-slate-400">({ac.model})</span>
                      <StatusBadge status={ac.status} className="scale-90" />
                    </div>
                    <span className="font-mono font-bold text-sky-400 text-sm">
                      {ac.downtime_hours} hrs downtime
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        ac.downtime_hours > 30 ? 'bg-rose-500' : ac.downtime_hours > 10 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Spare Parts Usage */}
      {activeTab === 'parts' && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Recent Spare Parts Inventory Outflows</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Part Number</th>
                  <th className="py-3 px-4 font-semibold">Part Description</th>
                  <th className="py-3 px-4 font-semibold">Quantity</th>
                  <th className="py-3 px-4 font-semibold">Work Order Reference</th>
                  <th className="py-3 px-4 font-semibold">Logged Date</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {data?.spare_parts_usage?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{u.part_number}</td>
                    <td className="py-3 px-4 font-medium text-white">{u.part_name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">{u.quantity} units</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{u.work_order_number || 'Direct Consumption'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-400">{u.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Technician Workload */}
      {activeTab === 'workload' && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Technician Active Workload Distribution</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.technician_workload?.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-sky-400 font-semibold">{t.employee_id}</span>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <span className="text-[11px] text-slate-400">{t.specialization}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-sky-300">{t.active_orders}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Work Orders</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, t.active_orders * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

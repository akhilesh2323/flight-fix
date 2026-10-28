import React, { useState, useEffect } from 'react';
import {
  Plane,
  Wrench,
  AlertTriangle,
  ClipboardList,
  Users,
  Package,
  Calendar,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi';
import { aircraftApi } from '../api/aircraftApi';
import { workOrderApi } from '../api/workOrderApi';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AircraftCanvas } from '../components/3d/AircraftCanvas';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAircraftId, setSelectedAircraftId] = useState(null);
  const [selectedAircraftDetail, setSelectedAircraftDetail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Work Order modal
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [selectedComponentForWo, setSelectedComponentForWo] = useState(null);
  const [newWoTitle, setNewWoTitle] = useState('');
  const [newWoPriority, setNewWoPriority] = useState('MEDIUM');
  const [newWoDesc, setNewWoDesc] = useState('');
  const [submittingWo, setSubmittingWo] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await dashboardApi.getStats();
      setData(res);

      if (res.aircraft_summary?.length > 0 && !selectedAircraftId) {
        setSelectedAircraftId(res.aircraft_summary[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch full details (including components) for 3D visualization when aircraft selector changes
  useEffect(() => {
    if (!selectedAircraftId) return;
    const fetchAircraft = async () => {
      try {
        const ac = await aircraftApi.getById(selectedAircraftId);
        setSelectedAircraftDetail(ac);
      } catch (err) {
        console.error('Failed to fetch aircraft details for 3D view:', err);
      }
    };
    fetchAircraft();
  }, [selectedAircraftId]);

  const handleOpenCreateWorkOrder = (comp) => {
    setSelectedComponentForWo(comp);
    setNewWoTitle(`Routine Service on ${comp.name}`);
    setNewWoPriority('MEDIUM');
    setNewWoDesc(`Initiated from 3D Inspection terminal for component ID: ${comp.component_id}.`);
    setIsWoModalOpen(true);
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    if (!selectedAircraftDetail) return;
    setSubmittingWo(true);
    try {
      await workOrderApi.create({
        aircraft: selectedAircraftDetail.id,
        component: selectedComponentForWo?.id || null,
        title: newWoTitle,
        priority: newWoPriority,
        description: newWoDesc,
        status: 'OPEN',
      });
      setIsWoModalOpen(false);
      fetchDashboardData();
      // refresh aircraft
      const ac = await aircraftApi.getById(selectedAircraftDetail.id);
      setSelectedAircraftDetail(ac);
    } catch (err) {
      alert('Failed to create work order: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingWo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-400">CONNECTING TO MRO FLEET TELEMETRY...</span>
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Fleet Operations & Real-Time MRO Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time commercial airframe status, maintenance cycles, and component diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Aircraft"
          value={m.total_aircraft ?? 0}
          subtitle="Commercial fleet units"
          icon={Plane}
          color="sky"
        />
        <StatCard
          title="Under Maintenance"
          value={m.under_maintenance ?? 0}
          subtitle="Hangar bays occupied"
          icon={Wrench}
          color="rose"
          alert={m.under_maintenance > 0}
        />
        <StatCard
          title="Upcoming Maint."
          value={m.upcoming_maintenance ?? 0}
          subtitle="Checks due this week"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Open Work Orders"
          value={m.open_work_orders ?? 0}
          subtitle="Active job packages"
          icon={ClipboardList}
          color="indigo"
        />
        <StatCard
          title="Avail. Technicians"
          value={`${m.available_technicians ?? 0}/${m.total_technicians ?? 0}`}
          subtitle="On-duty engineers"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Low Stock Spares"
          value={m.low_stock_parts ?? 0}
          subtitle="Below safety threshold"
          icon={Package}
          color="rose"
          alert={m.low_stock_parts > 0}
        />
      </div>

      {/* 3D Aircraft Centerpiece Viewport */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Interactive 3D Aircraft Diagnostics View
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rotate, zoom, and click parts (Engines, Wings, Gear, Fuselage, Cockpit, Tail, Brakes) to inspect condition
            </p>
          </div>

          {/* Aircraft Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Select Unit:</span>
            <select
              value={selectedAircraftId || ''}
              onChange={(e) => setSelectedAircraftId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-sky-400 font-semibold focus:outline-none focus:border-sky-500"
            >
              {data?.aircraft_summary?.map((ac) => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration_number} – {ac.model} ({ac.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <AircraftCanvas
          aircraft={selectedAircraftDetail}
          components={selectedAircraftDetail?.components || []}
          onOpenCreateWorkOrder={handleOpenCreateWorkOrder}
          height="h-[520px] lg:h-[580px]"
        />
      </div>

      {/* Middle Row: Recent Work Orders & Maintenance Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Orders */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Recent Work Orders</h3>
              </div>
              <Link
                to="/work-orders"
                className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2">
              {data?.recent_work_orders?.length > 0 ? (
                data.recent_work_orders.map((wo) => (
                  <div key={wo.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400">
                          {wo.work_order_number}
                        </span>
                        <StatusBadge status={wo.priority} className="scale-90" />
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1 truncate">
                        {wo.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Aircraft: <span className="text-slate-300 font-mono">{wo.aircraft_registration}</span> &bull; Lead: {wo.assigned_technician_name || 'Unassigned'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={wo.status} />
                      <Link
                        to={`/work-orders/${wo.id}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active work orders in the system.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Schedule Timeline */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Upcoming Maintenance Schedules</h3>
              </div>
              <Link
                to="/maintenance"
                className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                <span>Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2">
              {data?.upcoming_schedules?.length > 0 ? (
                data.upcoming_schedules.map((sc) => (
                  <div key={sc.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {sc.maintenance_type.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">
                          {sc.aircraft_registration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {sc.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Due Date: <span className="font-mono text-amber-300">{sc.due_date}</span> &bull; Lead: {sc.assigned_technician_name || 'TBD'}
                      </p>
                    </div>

                    <StatusBadge status={sc.status} />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming maintenance checks scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Spare Part Alerts & Maintenance Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spare Part Alerts */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Spare-Part Stock Alerts</h3>
            </div>
            <Link
              to="/spare-parts"
              className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <span>Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.low_stock_alerts?.length > 0 ? (
              data.low_stock_alerts.map((part) => (
                <div
                  key={part.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] text-slate-400 font-semibold block">
                      {part.part_number}
                    </span>
                    <p className="text-xs font-medium text-white truncate">
                      {part.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Loc: {part.location}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400 block">
                      {part.quantity_in_stock} / min {part.minimum_stock}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                      REORDER
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                All spare parts are within safety thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Activity Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">MRO Maintenance Activity Trend (6 Months)</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                  <span className="text-slate-400">Inspections</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                  <span className="text-slate-400">Repairs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span className="text-slate-400">Overhauls</span>
                </div>
              </div>
            </div>

            {/* Custom Aviation SVG / CSS Trend Bars */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2">
                {data?.activity_chart?.map((item) => {
                  const maxVal = 60;
                  const inspHeight = (item.inspections / maxVal) * 100;
                  const repHeight = (item.repairs / maxVal) * 100;
                  const ovhHeight = (item.overhauls / maxVal) * 100;

                  return (
                    <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        {/* Inspections Bar */}
                        <div
                          style={{ height: `${inspHeight}%` }}
                          className="w-2.5 sm:w-3.5 rounded-t bg-sky-500/80 hover:bg-sky-400 transition-all relative group/bar"
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-[10px] font-mono px-1 rounded text-white pointer-events-none transition">
                            {item.inspections}
                          </span>
                        </div>
                        {/* Repairs Bar */}
                        <div
                          style={{ height: `${repHeight}%` }}
                          className="w-2.5 sm:w-3.5 rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition-all relative group/bar"
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-[10px] font-mono px-1 rounded text-white pointer-events-none transition">
                            {item.repairs}
                          </span>
                        </div>
                        {/* Overhauls Bar */}
                        <div
                          style={{ height: `${ovhHeight}%` }}
                          className="w-2.5 sm:w-3.5 rounded-t bg-amber-500/80 hover:bg-amber-400 transition-all relative group/bar"
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-[10px] font-mono px-1 rounded text-white pointer-events-none transition">
                            {item.overhauls}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 mt-2 font-medium">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Overall Fleet Dispatch Reliability: <strong className="text-emerald-400 font-mono">99.4%</strong></span>
            <span>Target MTBF: <strong className="text-sky-400 font-mono">850 Flight Hours</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Create Work Order Modal */}
      <Modal
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
        title="Initiate MRO Work Order"
      >
        <form onSubmit={handleCreateWorkOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Work Order Title
            </label>
            <input
              type="text"
              required
              value={newWoTitle}
              onChange={(e) => setNewWoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Target Aircraft
              </label>
              <input
                type="text"
                disabled
                value={selectedAircraftDetail?.registration_number || ''}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-800 text-sm font-mono text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Priority
              </label>
              <select
                value={newWoPriority}
                onChange={(e) => setNewWoPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">AOG Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Maintenance Scope & Action Description
            </label>
            <textarea
              rows={3}
              required
              value={newWoDesc}
              onChange={(e) => setNewWoDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsWoModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingWo}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
            >
              {submittingWo ? 'Submitting...' : 'Dispatch Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

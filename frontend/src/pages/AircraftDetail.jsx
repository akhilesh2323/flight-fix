import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plane,
  ArrowLeft,
  Calendar,
  Clock,
  Wrench,
  Activity,
  User,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Box
} from 'lucide-react';
import { aircraftApi } from '../api/aircraftApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { AircraftCanvas } from '../components/3d/AircraftCanvas';
import { Modal } from '../components/common/Modal';
import { workOrderApi } from '../api/workOrderApi';

export const AircraftDetail = () => {
  const { id } = useParams();
  const [aircraft, setAircraft] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Work Order Modal
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [woTitle, setWoTitle] = useState('');
  const [woPriority, setWoPriority] = useState('MEDIUM');
  const [woDesc, setWoDesc] = useState('');
  const [submittingWo, setSubmittingWo] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [acData, histData] = await Promise.all([
        aircraftApi.getById(id),
        aircraftApi.getMaintenanceHistory(id)
      ]);
      setAircraft(acData);
      setHistory(histData);
    } catch (err) {
      console.error('Failed to load aircraft details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleOpenWo = (comp) => {
    setSelectedComp(comp);
    setWoTitle(`Maintenance Task on ${comp.name}`);
    setWoPriority('MEDIUM');
    setWoDesc(`Scheduled maintenance and inspection for component ID: ${comp.component_id}.`);
    setIsWoModalOpen(true);
  };

  const handleCreateWo = async (e) => {
    e.preventDefault();
    if (!aircraft) return;
    setSubmittingWo(true);
    try {
      await workOrderApi.create({
        aircraft: aircraft.id,
        component: selectedComp?.id || null,
        title: woTitle,
        priority: woPriority,
        description: woDesc,
        status: 'OPEN',
      });
      setIsWoModalOpen(false);
      fetchDetails();
    } catch (err) {
      alert('Error creating work order: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingWo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!aircraft) {
    return (
      <div className="p-8 text-center text-slate-400">
        Aircraft not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back and Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/aircraft"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black text-white tracking-wider">
                {aircraft.registration_number}
              </span>
              <StatusBadge status={aircraft.status} />
            </div>
            <p className="text-xs text-slate-400">
              {aircraft.model} &bull; {aircraft.manufacturer} (MSN: {aircraft.serial_number})
            </p>
          </div>
        </div>

        {/* Telemetry quick pills */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Flight Hours</span>
            <span className="font-mono text-xs font-bold text-sky-400">
              {Number(aircraft.flight_hours).toLocaleString()} hrs
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Flight Cycles</span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {aircraft.flight_cycles.toLocaleString()} cyc
            </span>
          </div>
        </div>
      </div>

      {/* 3D Aircraft Inspection Viewport */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live 3D Component Inspection Terminal
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Interactive Diagnostics Mode
          </span>
        </div>

        <AircraftCanvas
          aircraft={aircraft}
          components={aircraft.components || []}
          onOpenCreateWorkOrder={handleOpenWo}
          height="h-[520px] lg:h-[620px]"
        />
      </div>

      {/* Components Table Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Installed Aircraft Components ({aircraft.components?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click component in 3D or list to view telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="pb-3 font-semibold">Component Name</th>
                <th className="pb-3 font-semibold">Part / ID Code</th>
                <th className="pb-3 font-semibold">Airframe Area</th>
                <th className="pb-3 font-semibold">Condition Rating</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Last Checked</th>
                <th className="pb-3 font-semibold">Assigned Lead</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {aircraft.components?.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 font-medium text-white">{c.name}</td>
                  <td className="py-3 font-mono text-sky-400">{c.component_id}</td>
                  <td className="py-3 uppercase font-mono text-[11px] text-slate-400">{c.component_type}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            c.condition_score >= 85 ? 'bg-emerald-400' : c.condition_score >= 70 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${c.condition_score}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-200">{c.condition_score}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 font-mono text-slate-400">{c.last_inspection || 'Pending'}</td>
                  <td className="py-3 text-slate-300">{c.assigned_technician_name || 'Unassigned'}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenWo(c)}
                      className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white text-[11px] font-medium transition"
                    >
                      Issue Work Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance History Records */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Historical Maintenance Logbook</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Records: {history.length}</span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400">{record.record_number}</span>
                    <span className="text-xs font-semibold text-white">{record.maintenance_type}</span>
                    <span className="text-xs text-slate-400">&bull; {record.completed_date}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 font-medium">
                    Findings: <span className="text-slate-400 font-normal">{record.findings}</span>
                  </p>
                  <p className="text-xs text-slate-300 mt-1 font-medium">
                    Actions Taken: <span className="text-slate-400 font-normal">{record.actions_taken}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0 text-xs">
                  <span className="text-slate-400 block">Signoff Tech:</span>
                  <span className="text-slate-200 font-medium">{record.technician_name || 'Inspector'}</span>
                  <span className="text-[11px] font-mono text-slate-400 block mt-1">
                    Airframe: {record.flight_hours_at_maintenance} hrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No historical records logged yet for this airframe.
          </div>
        )}
      </div>

      {/* Quick WO Modal */}
      <Modal
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
        title={`Work Order for ${selectedComp?.name || 'Component'}`}
      >
        <form onSubmit={handleCreateWo} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Work Order Title</label>
            <input
              type="text"
              required
              value={woTitle}
              onChange={(e) => setWoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Component ID</label>
              <input
                type="text"
                disabled
                value={selectedComp?.component_id || ''}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 font-mono text-sm text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <select
                value={woPriority}
                onChange={(e) => setWoPriority(e.target.value)}
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={woDesc}
              onChange={(e) => setWoDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsWoModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingWo}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition disabled:opacity-50"
            >
              {submittingWo ? 'Submitting...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

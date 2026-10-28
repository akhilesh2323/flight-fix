import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Filter,
  Search,
  ArrowRight,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plane,
  Wrench,
  Trash2
} from 'lucide-react';
import { workOrderApi } from '../api/workOrderApi';
import { aircraftApi } from '../api/aircraftApi';
import { technicianApi } from '../api/technicianApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const WorkOrderList = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    aircraft: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assigned_technician: '',
    description: '',
    notes: '',
  });

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [woData, acData, techData] = await Promise.all([
        workOrderApi.getAll(),
        aircraftApi.getAll(),
        technicianApi.getAll()
      ]);
      setWorkOrders(woData);
      setAircraftList(acData);
      setTechnicians(techData);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      aircraft: aircraftList[0]?.id || '',
      priority: 'MEDIUM',
      status: 'OPEN',
      assigned_technician: technicians[0]?.id || '',
      description: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await workOrderApi.create({
        ...formData,
        aircraft: Number(formData.aircraft),
        assigned_technician: formData.assigned_technician ? Number(formData.assigned_technician) : null,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to create work order: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const filtered = workOrders.filter((wo) => {
    const matchesSearch =
      wo.work_order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wo.aircraft_registration && wo.aircraft_registration.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-400" />
            <span>MRO Engineering Work Orders</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active maintenance packages, task checklists, parts allocations, and sign-offs
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search WO #, aircraft tail, title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-400 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses ({workOrders.length})</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-400 font-medium focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">AOG Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((wo) => {
            const totalTasks = wo.tasks?.length || 0;
            const completedTasks = wo.tasks?.filter((t) => t.is_completed).length || 0;
            const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={wo.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-sky-400">
                      {wo.work_order_number}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {wo.aircraft_registration}
                    </span>
                    {wo.component_name && (
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                        ({wo.component_name})
                      </span>
                    )}
                    <StatusBadge status={wo.priority} className="scale-90" />
                    <StatusBadge status={wo.status} />
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition">
                    {wo.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {wo.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-sky-400" />
                      Lead: <strong className="text-slate-300 font-normal">{wo.assigned_technician_name || 'Unassigned'}</strong>
                    </span>
                    <span>
                      Created: {new Date(wo.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      Parts: {wo.part_usages?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Open Button */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Task Progress */}
                  <div className="w-36 text-right">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 text-[10px] uppercase font-mono">Tasks</span>
                      <span className="font-mono text-xs font-bold text-white">
                        {completedTasks}/{totalTasks} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/work-orders/${wo.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/15 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/30 text-xs font-semibold transition"
                  >
                    <span>Manage Order</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No work orders found.</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue MRO Work Order"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Work Order Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Engine Oil Filter Replacement & Boroscope Scan"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Aircraft *</label>
              <select
                required
                value={formData.aircraft}
                onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
              >
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.registration_number} ({ac.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">AOG Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Technician</label>
              <select
                value={formData.assigned_technician}
                onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">-- Select Technician --</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.employee_id} - {t.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description & Findings *</label>
            <textarea
              rows={3}
              required
              placeholder="Detailed description of defect or maintenance checklist procedure..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition"
            >
              Issue Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

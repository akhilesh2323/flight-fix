import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { maintenanceApi } from '../api/maintenanceApi';
import { aircraftApi } from '../api/aircraftApi';
import { technicianApi } from '../api/technicianApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export const MaintenanceList = () => {
  const [schedules, setSchedules] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    aircraft: '',
    maintenance_type: 'A_CHECK',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    scheduled_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    assigned_technician: '',
    description: '',
  });

  // Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintData, acData, techData] = await Promise.all([
        maintenanceApi.getAll(),
        aircraftApi.getAll(),
        technicianApi.getAll()
      ]);
      setSchedules(maintData);
      setAircraftList(acData);
      setTechnicians(techData);
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      aircraft: aircraftList[0]?.id || '',
      maintenance_type: 'A_CHECK',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      scheduled_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigned_technician: technicians[0]?.id || '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setIsEditing(true);
    setEditingId(m.id);
    setFormData({
      aircraft: m.aircraft,
      maintenance_type: m.maintenance_type,
      priority: m.priority,
      status: m.status,
      scheduled_date: m.scheduled_date,
      due_date: m.due_date,
      assigned_technician: m.assigned_technician || '',
      description: m.description,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        assigned_technician: formData.assigned_technician ? Number(formData.assigned_technician) : null,
      };
      if (isEditing) {
        await maintenanceApi.update(editingId, payload);
      } else {
        await maintenanceApi.create(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save maintenance schedule: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await maintenanceApi.update(id, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await maintenanceApi.delete(deleteId);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to delete maintenance: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filtered = schedules.filter((m) => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || m.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-400" />
            <span>Aircraft Maintenance Schedules</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Routine A/B/C/D checks, line maintenance overhauls, and compliance planning
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Maintenance</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-400 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses ({schedules.length})</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Priority:</span>
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

      {/* Maintenance Cards / List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {m.maintenance_type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {m.aircraft_registration}
                  </span>
                  <span className="text-xs text-slate-400">({m.aircraft_model})</span>
                  <StatusBadge status={m.priority} className="scale-90" />
                  <StatusBadge status={m.status} />
                </div>

                <p className="text-sm font-medium text-slate-200">
                  {m.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Scheduled: <strong className="text-slate-300">{m.scheduled_date}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Due Date: <strong className="text-amber-300">{m.due_date}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    Lead Tech: <strong className="text-slate-300">{m.assigned_technician_name || 'Unassigned'}</strong>
                  </span>
                </div>
              </div>

              {/* Status Update Quick Dropdown & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                <select
                  value={m.status}
                  onChange={(e) => handleQuickStatusChange(m.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-sky-300 focus:outline-none"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {canManage && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Schedule"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(m.id);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No maintenance schedules match criteria.</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modify Maintenance Schedule' : 'Schedule Aircraft Maintenance Check'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Aircraft *</label>
              <select
                required
                value={formData.aircraft}
                onChange={(e) => setFormData({ ...formData, aircraft: Number(e.target.value) })}
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
              <label className="block text-xs font-medium text-slate-400 mb-1">Maintenance Type *</label>
              <select
                value={formData.maintenance_type}
                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="A_CHECK">A-Check (Routine ~500 hrs)</option>
                <option value="B_CHECK">B-Check</option>
                <option value="C_CHECK">C-Check (Extensive ~24 mos)</option>
                <option value="D_CHECK">D-Check (Heavy Overhaul)</option>
                <option value="LINE_MAINTENANCE">Line Maintenance</option>
                <option value="UNSCHEDULED">Unscheduled Repair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Assign Lead Technician</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Scheduled Date *</label>
              <input
                type="date"
                required
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description & Scope of Work *</label>
            <textarea
              rows={3}
              required
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
              {isEditing ? 'Save Changes' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Maintenance Schedule"
        message="Are you sure you want to cancel and delete this maintenance schedule?"
      />
    </div>
  );
};

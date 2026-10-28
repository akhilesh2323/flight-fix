import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Shield,
  Phone,
  Wrench,
  CheckCircle,
  Clock,
  Briefcase,
  Edit2,
  Trash2,
  UserCheck
} from 'lucide-react';
import { technicianApi } from '../api/technicianApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export const TechnicianList = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    certification: 'FAA A&P / EASA Part-66 B1',
    specialization: 'GENERAL',
    phone: '',
    status: 'AVAILABLE',
  });

  // Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const data = await technicianApi.getAll();
      setTechnicians(data);
    } catch (err) {
      console.error('Failed to load technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      employee_id: `TECH-${Math.floor(1000 + Math.random() * 9000)}`,
      first_name: '',
      last_name: '',
      certification: 'FAA A&P / EASA Part-66 B1/B2',
      specialization: 'GENERAL',
      phone: '+1 (555) 000-0000',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setIsEditing(true);
    setEditingId(t.id);
    setFormData({
      employee_id: t.employee_id,
      first_name: t.first_name,
      last_name: t.last_name,
      certification: t.certification,
      specialization: t.specialization,
      phone: t.phone || '',
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await technicianApi.update(editingId, formData);
      } else {
        await technicianApi.create(formData);
      }
      setIsModalOpen(false);
      fetchTechnicians();
    } catch (err) {
      alert('Failed to save technician: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await technicianApi.delete(deleteId);
      setIsDeleteOpen(false);
      fetchTechnicians();
    } catch (err) {
      alert('Failed to delete technician: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>MRO Certified Engineering Roster</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            FAA A&P and EASA Part-66 licensed engineers, work order allocations, and duty rosters
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : technicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technicians.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600/20 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold font-mono text-base">
                    {t.first_name[0]}{t.last_name[0]}
                  </div>
                  <StatusBadge status={t.status} />
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[11px] text-sky-400 font-semibold block">
                    {t.employee_id}
                  </span>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {t.full_name}
                  </h3>
                  <span className="inline-block text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 mt-1">
                    {t.specialization?.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                  <div className="flex items-start gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight text-slate-300">{t.certification}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-300">{t.phone || 'No phone recorded'}</span>
                  </div>
                </div>

                {/* Workload Indicator */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Active Work Orders</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {t.open_work_orders_count || 0}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Technician"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(t.id);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Remove Technician"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No technicians registered.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Update Technician Roster Entry' : 'Enroll Certified Aviation Technician'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Availability Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="AVAILABLE">Available</option>
                <option value="ON_DUTY">On Duty</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Specialization</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="GENERAL">General Systems & Inspections</option>
                <option value="POWERPLANT">Powerplant & Turbofans</option>
                <option value="AVIONICS">Avionics & Electrical</option>
                <option value="AIRFRAME">Airframe & Structures</option>
                <option value="HYDRAULICS">Hydraulics & Landing Gear</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">License & Certification *</label>
            <input
              type="text"
              required
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
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
              {isEditing ? 'Save Changes' : 'Enroll Technician'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Technician"
        message="Are you sure you want to remove this technician from active roster?"
      />
    </div>
  );
};

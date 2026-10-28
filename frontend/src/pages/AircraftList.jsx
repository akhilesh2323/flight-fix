import React, { useState, useEffect } from 'react';
import {
  Plane,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Box
} from 'lucide-react';
import { aircraftApi } from '../api/aircraftApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AircraftList = () => {
  const [aircraftList, setAircraftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    flight_hours: 0,
    flight_cycles: 0,
    status: 'OPERATIONAL',
    last_maintenance: '',
    next_maintenance: '',
  });

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);
  const navigate = useNavigate();

  const fetchAircraft = async () => {
    try {
      setLoading(true);
      const data = await aircraftApi.getAll();
      setAircraftList(data);
    } catch (err) {
      console.error('Failed to fetch aircraft fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircraft();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      registration_number: '',
      model: '',
      manufacturer: 'Boeing Commercial Airplanes',
      serial_number: '',
      flight_hours: 0,
      flight_cycles: 0,
      status: 'OPERATIONAL',
      last_maintenance: '',
      next_maintenance: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ac) => {
    setIsEditing(true);
    setEditingId(ac.id);
    setFormData({
      registration_number: ac.registration_number,
      model: ac.model,
      manufacturer: ac.manufacturer,
      serial_number: ac.serial_number,
      flight_hours: ac.flight_hours,
      flight_cycles: ac.flight_cycles,
      status: ac.status,
      last_maintenance: ac.last_maintenance || '',
      next_maintenance: ac.next_maintenance || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await aircraftApi.update(editingId, formData);
      } else {
        await aircraftApi.create(formData);
      }
      setIsModalOpen(false);
      fetchAircraft();
    } catch (err) {
      alert('Failed to save aircraft: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await aircraftApi.delete(deleteId);
      setIsDeleteOpen(false);
      fetchAircraft();
    } catch (err) {
      alert('Failed to delete aircraft: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredAircraft = aircraftList.filter((ac) => {
    const matchesSearch =
      ac.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ac.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-400" />
            <span>Aircraft Fleet Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Commercial aircraft inventory, operational logs, and 3D inspection terminals
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Aircraft</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tail number, model, MSN..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-400 font-medium focus:outline-none"
          >
            <option value="ALL">All Aircraft ({aircraftList.length})</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="MAINTENANCE_DUE">Maintenance Due</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="AOG">AOG (Grounded)</option>
          </select>
        </div>
      </div>

      {/* Fleet Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAircraft.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAircraft.map((ac) => (
            <div
              key={ac.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-lg font-bold text-white tracking-wider">
                      {ac.registration_number}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200 mt-0.5">
                      {ac.model}
                    </h3>
                    <p className="text-xs text-slate-400">{ac.manufacturer}</p>
                  </div>
                  <StatusBadge status={ac.status} />
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Flight Hours
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {Number(ac.flight_hours).toLocaleString()} hrs
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Flight Cycles
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {ac.flight_cycles.toLocaleString()} cyc
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Serial / MSN:</span>
                    <span className="font-mono text-slate-300">{ac.serial_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Maintenance:</span>
                    <span className="font-mono text-amber-300">
                      {ac.next_maintenance || 'Not Scheduled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Work Orders:</span>
                    <span className="font-mono font-semibold text-sky-400">
                      {ac.open_work_orders_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/aircraft/${ac.id}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600/15 hover:bg-sky-600/25 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Inspection</span>
                </Link>

                {canManage && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(ac)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Edit Aircraft"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(ac.id);
                        setIsDeleteOpen(true);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Delete Aircraft"
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
          <Plane className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No aircraft matching current filters.</p>
        </div>
      )}

      {/* Add / Edit Aircraft Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Aircraft Specifications' : 'Register New Commercial Aircraft'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Registration / Tail Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. N737AA"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Aircraft Model *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Boeing 737-800"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Manufacturer *
              </label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Serial Number (MSN) *
              </label>
              <input
                type="text"
                required
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Flight Hours
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.flight_hours}
                onChange={(e) => setFormData({ ...formData, flight_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Flight Cycles
              </label>
              <input
                type="number"
                value={formData.flight_cycles}
                onChange={(e) => setFormData({ ...formData, flight_cycles: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="MAINTENANCE_DUE">Maintenance Due</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="AOG">AOG (Grounded)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Last Maintenance Date
              </label>
              <input
                type="date"
                value={formData.last_maintenance}
                onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Next Scheduled Maintenance
              </label>
              <input
                type="date"
                value={formData.next_maintenance}
                onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition"
            >
              {isEditing ? 'Save Changes' : 'Register Aircraft'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Deregister Aircraft"
        message="Are you sure you want to remove this aircraft from the fleet? All linked component telemetry and records will be deleted."
        confirmText="Confirm Deregistration"
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Package,
  Wrench,
  Clock,
  User,
  Plane,
  Save,
  CheckCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { workOrderApi } from '../api/workOrderApi';
import { sparePartApi } from '../api/sparePartApi';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';

export const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New task input
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Log Part Usage Modal
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partUsageNotes, setPartUsageNotes] = useState('');
  const [loggingPart, setLoggingPart] = useState(false);

  // Complete Order
  const [completing, setCompleting] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const [orderData, partsData] = await Promise.all([
        workOrderApi.getById(id),
        sparePartApi.getAll()
      ]);
      setOrder(orderData);
      setNotes(orderData.notes || '');
      setSpareParts(partsData);
      if (partsData.length > 0 && !selectedPartId) {
        setSelectedPartId(partsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load work order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleToggleTask = async (taskId) => {
    try {
      await workOrderApi.toggleTask(id, taskId);
      fetchOrder();
    } catch (err) {
      alert('Failed to update task: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    setAddingTask(true);
    try {
      await workOrderApi.addTask(id, newTaskDesc);
      setNewTaskDesc('');
      fetchOrder();
    } catch (err) {
      alert('Failed to add task: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAddingTask(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await workOrderApi.update(id, { notes });
      alert('Maintenance notes saved successfully.');
    } catch (err) {
      alert('Failed to save notes: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUsePart = async (e) => {
    e.preventDefault();
    setLoggingPart(true);
    try {
      await workOrderApi.usePart(id, selectedPartId, partQty, partUsageNotes);
      setIsPartModalOpen(false);
      setPartUsageNotes('');
      fetchOrder();
    } catch (err) {
      alert('Failed to log part usage: ' + (err.response?.data?.error || err.response?.data?.detail || err.message));
    } finally {
      setLoggingPart(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this work order as COMPLETED? This will restore component condition and log an audit record.')) return;
    setCompleting(true);
    try {
      await workOrderApi.markComplete(id);
      fetchOrder();
    } catch (err) {
      alert('Failed to complete work order: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCompleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await workOrderApi.update(id, { status: newStatus });
      fetchOrder();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-400">
        Work order not found.
      </div>
    );
  }

  const tasks = order.tasks || [];
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const isFinished = order.status === 'COMPLETED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/work-orders"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl font-black text-white tracking-wider">
                {order.work_order_number}
              </span>
              <StatusBadge status={order.priority} />
              <StatusBadge status={order.status} />
            </div>
            <h2 className="text-base font-bold text-slate-200 mt-0.5">
              {order.title}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!isFinished && (
            <>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-sky-400 focus:outline-none"
              >
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{completing ? 'Completing...' : 'Mark Work Complete'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Aircraft Unit</span>
          <span className="font-mono text-base font-bold text-white block">
            {order.aircraft_registration}
          </span>
          <span className="text-xs text-slate-400">{order.aircraft_model}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Component Target</span>
          <span className="text-sm font-semibold text-sky-300 block truncate">
            {order.component_name || 'General Airframe Inspection'}
          </span>
          <span className="text-xs text-slate-400">Subsystem</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Lead Technician</span>
          <span className="text-sm font-semibold text-white block">
            {order.assigned_technician_name || 'Unassigned'}
          </span>
          <span className="text-xs text-slate-400">Signoff Engineer</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Created At</span>
          <span className="font-mono text-sm font-semibold text-slate-200 block">
            {new Date(order.created_at).toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            {order.completed_at ? `Done: ${new Date(order.completed_at).toLocaleDateString()}` : 'In Service'}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Tasks & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Task Checklist & Parts Allocated */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Maintenance Action Checklist</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tasks completed: <strong className="text-white font-mono">{completedCount} of {tasks.length}</strong>
                </p>
              </div>

              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-2 mb-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      task.is_completed
                        ? 'bg-slate-900/50 border-emerald-500/20 text-slate-400 line-through'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-100'
                    }`}
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5 hover:text-sky-400" />
                    )}
                    <div className="flex-1 min-w-0 text-xs font-medium leading-relaxed">
                      <span>{task.description}</span>
                      {task.completed_at && (
                        <span className="block text-[10px] font-mono text-slate-400 no-underline mt-0.5">
                          Signed off: {new Date(task.completed_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No tasks defined for this work order yet.
                </div>
              )}
            </div>

            {/* Add Task input */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-3 border-t border-slate-800">
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Add procedure or inspection task step..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={addingTask || !newTaskDesc.trim()}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>
          </div>

          {/* Spare Parts Consumed */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Spare Parts Consumed / Allocated ({order.part_usages?.length || 0})
                </h3>
              </div>

              {!isFinished && (
                <button
                  onClick={() => setIsPartModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Part Usage</span>
                </button>
              )}
            </div>

            {order.part_usages?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="pb-2 font-semibold">Part Number</th>
                      <th className="pb-2 font-semibold">Description</th>
                      <th className="pb-2 font-semibold">Qty Used</th>
                      <th className="pb-2 font-semibold">Notes</th>
                      <th className="pb-2 font-semibold text-right">Logged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-300">
                    {order.part_usages.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2.5 font-mono text-sky-400 font-semibold">{tx.part_number}</td>
                        <td className="py-2.5 font-medium text-white">{tx.part_name}</td>
                        <td className="py-2.5 font-mono font-bold text-amber-300">{tx.quantity} pcs</td>
                        <td className="py-2.5 text-slate-400">{tx.notes || '-'}</td>
                        <td className="py-2.5 font-mono text-slate-400 text-right">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No spare parts have been logged for this work order yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Description & Notes */}
        <div className="space-y-6">
          {/* Order Scope */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
            <h3 className="text-xs uppercase font-mono font-bold text-slate-400 mb-2">
              Work Order Scope & Description
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              {order.description}
            </p>
          </div>

          {/* Maintenance Technician Notes */}
          <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-mono font-bold text-slate-400">
                Technician Notes & Signoff Log
              </h3>
            </div>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record inspection observations, torque specs applied, part serial numbers, or test results..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>{savingNotes ? 'Saving...' : 'Save Maintenance Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Part Usage Modal */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title="Log Spare Part Consumption"
      >
        <form onSubmit={handleUsePart} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Select Spare Part from Warehouse *
            </label>
            <select
              required
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
            >
              {spareParts.map((sp) => (
                <option key={sp.id} value={sp.id} disabled={sp.quantity_in_stock <= 0}>
                  {sp.part_number} – {sp.name} (In Stock: {sp.quantity_in_stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Quantity Used *
            </label>
            <input
              type="number"
              min="1"
              required
              value={partQty}
              onChange={(e) => setPartQty(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Installation Notes / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Installed on Port engine combustor assembly"
              value={partUsageNotes}
              onChange={(e) => setPartUsageNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPartModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loggingPart}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition disabled:opacity-50"
            >
              {loggingPart ? 'Deducting Stock...' : 'Confirm Allocation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

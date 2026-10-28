import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  DollarSign,
  MapPin,
  Truck,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { sparePartApi } from '../api/sparePartApi';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export const SparePartsList = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    category: 'HARDWARE',
    quantity_in_stock: 10,
    minimum_stock: 5,
    unit_cost: 0.0,
    supplier: '',
    location: '',
  });

  // Adjust Stock Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustPart, setAdjustPart] = useState(null);
  const [deltaQty, setDeltaQty] = useState(0);
  const [adjustType, setAdjustType] = useState('IN');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const data = await sparePartApi.getAll();
      setParts(data);
    } catch (err) {
      console.error('Failed to load spare parts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      part_number: '',
      name: '',
      category: 'HARDWARE',
      quantity_in_stock: 10,
      minimum_stock: 5,
      unit_cost: 150.0,
      supplier: '',
      location: 'Hangar Central, Bin A-1',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      part_number: p.part_number,
      name: p.name,
      category: p.category,
      quantity_in_stock: p.quantity_in_stock,
      minimum_stock: p.minimum_stock,
      unit_cost: p.unit_cost,
      supplier: p.supplier,
      location: p.location,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await sparePartApi.update(editingId, formData);
      } else {
        await sparePartApi.create(formData);
      }
      setIsModalOpen(false);
      fetchParts();
    } catch (err) {
      alert('Failed to save spare part: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  const handleOpenAdjust = (p) => {
    setAdjustPart(p);
    setDeltaQty(5);
    setAdjustType('IN');
    setAdjustNotes('Restocked from supplier order');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustPart) return;
    try {
      const delta = adjustType === 'OUT' ? -Math.abs(deltaQty) : Math.abs(deltaQty);
      await sparePartApi.adjustStock(adjustPart.id, delta, adjustType, adjustNotes);
      setIsAdjustModalOpen(false);
      fetchParts();
    } catch (err) {
      alert('Failed to adjust stock: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await sparePartApi.delete(deleteId);
      setIsDeleteOpen(false);
      fetchParts();
    } catch (err) {
      alert('Failed to delete spare part: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filtered = parts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesLowStock = !showLowStockOnly || p.is_low_stock;
    return matchesSearch && matchesCat && matchesLowStock;
  });

  const lowStockCount = parts.filter((p) => p.is_low_stock).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-400" />
            <span>Spare Parts Inventory & Warehousing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aeronautical component inventory, minimum threshold tracking, and supplier logistics
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spare Part</span>
          </button>
        )}
      </div>

      {/* Low Stock Urgent Warning Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 shadow-lg shadow-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-300">
                Low Inventory Safety Stock Warning ({lowStockCount} Parts)
              </h4>
              <p className="text-xs text-rose-200/70 mt-0.5">
                Certain critical aeronautical parts have fallen at or below safety reorder levels.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showLowStockOnly
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {showLowStockOnly ? 'Show All Parts' : 'Filter Low Stock Only'}
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search part #, nomenclature, supplier..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-sky-400 font-medium focus:outline-none"
          >
            <option value="ALL">All Categories ({parts.length})</option>
            <option value="POWERPLANT">Powerplant & Engines</option>
            <option value="AVIONICS">Avionics & Sensors</option>
            <option value="LANDING_GEAR">Landing Gear & Brakes</option>
            <option value="AIRFRAME">Airframe & Aerostructures</option>
            <option value="CONSUMABLES">Fluids & Consumables</option>
            <option value="HARDWARE">Fasteners & Hardware</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Part Number</th>
                  <th className="py-3 px-4 font-semibold">Nomenclature</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Current Stock</th>
                  <th className="py-3 px-4 font-semibold">Unit Cost</th>
                  <th className="py-3 px-4 font-semibold">Warehouse Bin</th>
                  <th className="py-3 px-4 font-semibold">Supplier</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filtered.map((part) => (
                  <tr
                    key={part.id}
                    className={`hover:bg-slate-800/40 transition ${
                      part.is_low_stock ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {part.part_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                      {part.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {part.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm ${
                            part.is_low_stock ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {part.quantity_in_stock}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          / min {part.minimum_stock}
                        </span>
                        {part.is_low_stock && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                            LOW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200">
                      ${Number(part.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1 mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{part.location}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[140px] truncate">
                      {part.supplier}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(part)}
                          className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white text-[11px] font-medium transition"
                          title="Restock or Adjust Inventory"
                        >
                          Stock
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(part)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="Edit Part"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(part.id);
                                setIsDeleteOpen(true);
                              }}
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Delete Part"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No spare parts match filters.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modify Spare Part Inventory' : 'Register New Aeronautical Part'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Part Number *</label>
              <input
                type="text"
                required
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="POWERPLANT">Powerplant & Engines</option>
                <option value="AVIONICS">Avionics & Sensors</option>
                <option value="LANDING_GEAR">Landing Gear & Brakes</option>
                <option value="AIRFRAME">Airframe & Aerostructures</option>
                <option value="CONSUMABLES">Fluids & Consumables</option>
                <option value="HARDWARE">Fasteners & Hardware</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Part Name / Nomenclature *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Current Stock *</label>
              <input
                type="number"
                required
                value={formData.quantity_in_stock}
                onChange={(e) => setFormData({ ...formData, quantity_in_stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Threshold *</label>
              <input
                type="number"
                required
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Supplier *</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Warehouse Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
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
              {isEditing ? 'Save Changes' : 'Register Part'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock for ${adjustPart?.part_number || 'Part'}`}
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">Current Inventory: <strong className="text-white font-mono">{adjustPart?.quantity_in_stock}</strong></p>
            <p className="text-slate-400">Part: <strong className="text-slate-200">{adjustPart?.name}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Action Type</label>
              <select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="IN">Restock / Received (+)</option>
                <option value="OUT">Direct Consumption / Write-off (-)</option>
                <option value="ADJUSTMENT">Audit Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={deltaQty}
                onChange={(e) => setDeltaQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Reason / Notes</label>
            <input
              type="text"
              required
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-600/30 transition"
            >
              Confirm Stock Update
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Deregister Spare Part"
        message="Are you sure you want to remove this spare part from warehouse catalogue?"
      />
    </div>
  );
};

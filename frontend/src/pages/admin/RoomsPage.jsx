import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Bed, Plus, Trash2 } from 'lucide-react';

const RoomsPage = () => {
  const toast = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ roomNumber: '', totalBeds: 1 });

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data?.data || []);
    } catch (err) {
      toast.error('Unable to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/rooms', form);
      toast.success('Room created successfully');
      setForm({ roomNumber: '', totalBeds: 1 });
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await axios.delete(`/api/rooms/${id}`);
      toast.success('Room deleted');
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Rooms Management</h1>
          <p className="text-slate-500 mt-1">Create rooms, view occupancy, and manage room allocations.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Room List</h2>
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No rooms available yet.</div>
          ) : (
            <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Beds</th>
                  <th className="px-4 py-3">Occupied</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{room.roomNumber}</td>
                    <td className="px-4 py-3">{room.totalBeds}</td>
                    <td className="px-4 py-3">{room.occupiedBeds}</td>
                    <td className="px-4 py-3">{room.status}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(room._id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Add New Room</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Room Number</label>
              <input className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.roomNumber} onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Total Beds</label>
              <input type="number" min="1" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white" value={form.totalBeds} onChange={(e) => setForm((prev) => ({ ...prev, totalBeds: Number(e.target.value) }))} required />
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 text-white px-4 py-3 font-semibold hover:bg-sky-600 transition-colors">
              <Plus size={16} /> Add Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;

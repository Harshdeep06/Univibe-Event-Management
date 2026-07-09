'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { ShieldCheck, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminApprovals() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    fetchPending();
  }, [user]);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/events/pending');
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (eventId, action) => {
    try {
      const status = action === 'approve' ? 'published' : 'cancelled';
      const res = await API.put(`/events/${eventId}`, { status });
      if (res.data.success) {
        setEvents(events.filter(e => e._id !== eventId));
        alert(`Event status set to: ${status}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => router.push('/admin')} className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]">
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="text-[#3D56B2]" size={20} />
            Pending Event Approvals ({events.length})
          </h2>
          <p className="text-xs text-[#757575] mb-6">Verify and approve event proposals drafted by university clubs before publication.</p>

          {events.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
              {events.map((e) => (
                <div key={e._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] bg-[#EFEFEF] dark:bg-gray-700 text-[#757575] dark:text-gray-300 px-2 py-0.5 rounded font-bold">{e.category}</span>
                    <h4 className="font-bold text-[#1A1A1A] dark:text-white mt-1.5">{e.name}</h4>
                    <p className="text-[10px] text-[#757575] mt-0.5">Club: {e.organizerClub?.name} | Date: {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleResolve(e._id, 'approve')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center justify-center gap-1 font-semibold"
                    >
                      <CheckCircle size={13} /> Approve & Publish
                    </button>
                    <button
                      onClick={() => handleResolve(e._id, 'reject')}
                      className="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center justify-center gap-1 font-semibold"
                    >
                      <XCircle size={13} /> Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic py-2">No pending proposals awaiting verification.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

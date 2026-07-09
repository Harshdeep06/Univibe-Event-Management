'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClubRequests() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchRequests(profile._id);
    }
  }, [profile]);

  const fetchRequests = async (clubId) => {
    try {
      setLoading(true);
      const res = await API.get(`/clubs/${clubId}/requests`);
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching Requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (requestId, action) => {
    try {
      const res = await API.post(`/clubs/${profile._id}/requests/${requestId}`, { action });
      if (res.data.success) {
        setRequests(requests.filter(r => r._id !== requestId));
        alert(`Request ${action}d successfully!`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error resolving request');
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
        <button onClick={() => router.push('/club')} className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]">
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Users className="text-[#3D56B2]" size={20} />
            Membership requests ({requests.length})
          </h2>
          <p className="text-xs text-[#757575] mb-6">Review candidate registrations seeking to join your club registry.</p>

          {requests.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
              {requests.map((r) => (
                <div key={r._id} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] dark:text-white">{r.student?.user?.name}</h4>
                    <p className="text-[10px] text-[#757575] mt-0.5">Roll No: {r.student?.rollNumber} | Branch: {r.student?.department}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(r._id, 'approve')}
                      className="p-1.5 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 font-semibold text-[10px]"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleResolve(r._id, 'reject')}
                      className="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 font-semibold text-[10px]"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic py-2">No pending membership requests.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

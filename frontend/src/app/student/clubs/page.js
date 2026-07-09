'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import API from '../../../services/api';
import { Users2, Shield, ArrowRight, Loader } from 'lucide-react';

export default function StudentClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/clubs');
      if (res.data.success) {
        setClubs(res.data.clubs || []);
      }
    } catch (err) {
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      setJoiningId(clubId);
      const res = await API.post(`/clubs/${clubId}/join`);
      if (res.data.success) {
        alert(res.data.message || 'Membership request submitted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setJoiningId(null);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5">University Clubs Portal</h2>
          <p className="text-xs text-[#757575] mb-6">Browse university organizations, view active coordinator heads, and join to participate in closed activities.</p>

          {clubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {clubs.map((c) => (
                <div key={c._id} className="p-5 bg-gray-50 dark:bg-gray-700/20 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#E0E5F5] flex items-center justify-center font-bold text-lg text-[#3D56B2] overflow-hidden">
                        {c.logo ? <img src={c.logo} alt={c.name} className="object-cover w-full h-full" /> : c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">{c.name}</h3>
                        <p className="text-[10px] text-[#757575] mt-0.5">Faculty Coordinator: {c.facultyCoordinator}</p>
                      </div>
                    </div>
                    <p className="text-[#757575] dark:text-gray-300 mt-3 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#3D56B2] bg-[#E0E5F5] px-2 py-0.5 rounded">
                      {c.membersCount} Members
                    </span>
                    <button
                      onClick={() => handleJoinClub(c._id)}
                      disabled={joiningId === c._id}
                      className="px-4 py-1.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-[11px] font-bold rounded-xl shadow flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {joiningId === c._id ? <Loader className="animate-spin" size={11} /> : 'Join Club'}
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic">No clubs registered in directory.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

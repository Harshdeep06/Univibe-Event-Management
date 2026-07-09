'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { Users2, ShieldAlert, Trash2, Edit2, Loader, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminClubs() {
  const { user } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    fetchClubs();
  }, [user]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/clubs');
      if (res.data.success) {
        setClubs(res.data.clubs);
      }
    } catch (err) {
      console.error('Error fetching clubs directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!confirm('Are you sure you want to permanently delete this club? This will demote the head and purge associated events.')) return;
    try {
      const res = await API.delete(`/admin/clubs/${clubId}`);
      if (res.data.success) {
        setClubs(clubs.filter(c => c._id !== clubId));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete club');
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
        
        {}
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </button>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">University Clubs Registry</h2>
          
          {clubs.length > 0 ? (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-[#757575] font-semibold">
                    <th className="pb-3 pr-4">Club Logo</th>
                    <th className="pb-3 pr-4">Club Name</th>
                    <th className="pb-3 pr-4">Faculty Coordinator</th>
                    <th className="pb-3 pr-4">Club Head</th>
                    <th className="pb-3 pr-4 text-center">Members Count</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {clubs.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                      <td className="py-3">
                        <div className="w-10 h-10 rounded-full bg-[#E0E5F5] flex items-center justify-center font-bold text-[#3D56B2] overflow-hidden">
                          {c.logo ? <img src={c.logo} alt={c.name} className="object-cover w-full h-full" /> : c.name.charAt(0)}
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">{c.name}</td>
                      <td className="py-3 pr-4 text-[#757575] dark:text-gray-300">{c.facultyCoordinator}</td>
                      <td className="py-3 pr-4 font-medium text-[#3D56B2] dark:text-white">
                        {c.clubHead?.name || 'Not Assigned'}
                      </td>
                      <td className="py-3 pr-4 text-center font-semibold text-[#1A1A1A] dark:text-white">{c.membersCount}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteClub(c._id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic">No clubs registered.</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

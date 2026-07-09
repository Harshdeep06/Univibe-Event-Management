'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { Trash2, ShieldAlert, ShieldCheck, Loader, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminStudents() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (studentId, currentStatus) => {
    try {
      
      const res = await API.put(`/admin/students/${studentId}`, { isVerified: !currentStatus });
      if (res.data.success) {
        setStudents(students.map(s => {
          if (s._id === studentId) {
            return {
              ...s,
              user: {
                ...s.user,
                isVerified: !currentStatus
              }
            };
          }
          return s;
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update student verification');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to permanently delete this student account? This will purge all event tickets and club listings.')) return;
    try {
      const res = await API.delete(`/admin/students/${studentId}`);
      if (res.data.success) {
        setStudents(students.filter(s => s._id !== studentId));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete student');
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
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">Student Directory Registry</h2>
          
          {students.length > 0 ? (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-[#757575] font-semibold">
                    <th className="pb-3 pr-4">Student Name</th>
                    <th className="pb-3 pr-4">Roll Number</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Branch/Dept</th>
                    <th className="pb-3 pr-4 text-center">Year of Study</th>
                    <th className="pb-3 pr-4 text-center">Reward Points</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {students.map((s) => {
                    const isVerified = s.user?.isVerified;
                    return (
                      <tr key={s._id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/20 ${!isVerified ? 'opacity-60 bg-red-50/20' : ''}`}>
                        <td className="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">
                          {s.user?.name}
                          {!isVerified && <span className="ml-1 text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Suspended</span>}
                        </td>
                        <td className="py-3 pr-4 text-[#757575] dark:text-gray-300">{s.rollNumber}</td>
                        <td className="py-3 pr-4 text-[#757575] dark:text-gray-300">{s.user?.email}</td>
                        <td className="py-3 pr-4 font-medium">{s.department}</td>
                        <td className="py-3 pr-4 text-center">{s.yearOfStudy} yr</td>
                        <td className="py-3 pr-4 text-center font-bold text-[#3D56B2]">{s.rewardPoints} pts</td>
                        <td className="py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleToggleSuspend(s._id, isVerified)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isVerified
                                  ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'
                                  : 'bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2] hover:bg-[#E0E5F5]/70'
                              }`}
                              title={isVerified ? 'Suspend Student' : 'Activate Student'}
                            >
                              {isVerified ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s._id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100"
                              title="Delete Student"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic">No students registered in registry.</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

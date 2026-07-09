'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  ClipboardList,
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Loader
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClubDashboard() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState(null);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [submittingAnn, setSubmittingAnn] = useState(false);
  const [annStatus, setAnnStatus] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'club_admin') {
      router.push('/login');
      return;
    }
    if (profile) {
      setClub(profile);
      fetchClubData(profile._id);
    }
  }, [user, profile]);

  const fetchClubData = async (clubId) => {
    try {
      setLoading(true);
      
      const requestsRes = await API.get(`/clubs/${clubId}/requests`);
      if (requestsRes.data.success) {
        setRequests(requestsRes.data.requests);
      }

      
      const membersRes = await API.get(`/clubs/${clubId}/members`);
      if (membersRes.data.success) {
        setMembers(membersRes.data.members);
      }
    } catch (err) {
      console.error('Error fetching club dashboard context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRequest = async (requestId, action) => {
    try {
      const res = await API.post(`/clubs/${club._id}/requests/${requestId}`, { action });
      if (res.data.success) {
        
        setRequests(requests.filter(r => r._id !== requestId));
        if (action === 'approve') {
          
          fetchClubData(club._id);
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error resolving request');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    try {
      setSubmittingAnn(true);
      setAnnStatus(null);
      const res = await API.post(`/clubs/${club._id}/announcements`, {
        title: annTitle,
        content: annContent
      });

      if (res.data.success) {
        setAnnStatus({ success: true, message: 'Announcement posted and emailed to members!' });
        setAnnTitle('');
        setAnnContent('');
      }
    } catch (err) {
      setAnnStatus({ success: false, message: err.response?.data?.error || 'Failed to post announcement' });
    } finally {
      setSubmittingAnn(false);
    }
  };

  if (!club || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#757575] font-medium">Loading club environment...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="lg:col-span-2 space-y-6">
          
          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-5 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E0E5F5] flex items-center justify-center font-bold text-xl text-[#3D56B2] overflow-hidden">
                {club.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] bg-[#E0E5F5] text-[#3D56B2] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">Club Admin Active</span>
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mt-1">{club.name}</h2>
                <p className="text-xs text-[#757575] dark:text-gray-400 mt-0.5">Faculty Coordinator: {club.facultyCoordinator}</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/club/create-event')}
              className="px-4 py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Calendar size={13} />
              Host New Event
            </button>
          </div>

          {}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Club Members', value: members.length, icon: Users, color: 'text-blue-500 bg-blue-50' },
              { label: 'Pending Invites', value: requests.length, icon: Clock, color: 'text-yellow-500 bg-yellow-50' },
              { label: 'Coordinator', value: 'Faculty', icon: ClipboardList, color: 'text-green-500 bg-green-50' },
            ].map((card, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-cardMedium shadow-cardFloating border border-gray-100 dark:border-gray-700">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${card.color} dark:bg-gray-700`}>
                  <card.icon size={16} />
                </div>
                <h3 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white leading-none">{card.value}</h3>
                <p className="text-[10px] text-[#757575] dark:text-gray-400 font-semibold tracking-wider uppercase mt-2">{card.label}</p>
              </div>
            ))}
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <Users className="text-[#3D56B2]" size={16} />
              Pending Joining Requests ({requests.length})
            </h3>

            {requests.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {requests.map((reqItem) => (
                  <div key={reqItem._id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">{reqItem.student?.user?.name}</h4>
                      <p className="text-[10px] text-[#757575] dark:text-gray-400 mt-0.5">
                        Roll No: {reqItem.student?.user?.rollNumber || 'CS2023001'} | Branch: {reqItem.student?.department}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveRequest(reqItem._id, 'approve')}
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 text-[10px] font-semibold"
                      >
                        <CheckCircle size={13} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleResolveRequest(reqItem._id, 'reject')}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 text-[10px] font-semibold"
                      >
                        <XCircle size={13} />
                        Reject
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

        {}
        <div className="space-y-6">
          
          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <Megaphone className="text-[#3D56B2]" size={16} />
              Broadcast Notice
            </h3>
            
            {annStatus && (
              <div className={`p-3 rounded-xl text-xs mb-3 border ${
                annStatus.success
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {annStatus.message}
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Prep Meeting"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Message Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details regarding time, venue, or prep requirements..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingAnn}
                className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                {submittingAnn ? (
                  <Loader className="animate-spin" size={12} />
                ) : (
                  <>
                    <Send size={12} />
                    Send Announcement
                  </>
                )}
              </button>
            </form>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-3">Active Member Registry</h3>
            {members.length > 0 ? (
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-3">
                {members.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-[#3D56B2] uppercase">
                      {m.student?.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">{m.student?.user?.name}</h4>
                      <p className="text-[9px] text-[#757575] dark:text-gray-400 mt-0.5">{m.student?.rollNumber} • {m.student?.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No approved members yet.</p>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

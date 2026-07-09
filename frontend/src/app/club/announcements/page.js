'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { Megaphone, Send, Loader, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClubAnnouncements() {
  const { profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !profile) return;

    try {
      setLoading(true);
      setStatus(null);
      const res = await API.post(`/clubs/${profile._id}/announcements`, { title, content });
      if (res.data.success) {
        setStatus({ success: true, message: 'Broadcast published to members successfully!' });
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.error || 'Failed to post announcement' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 text-xs">
        <button onClick={() => router.push('/club')} className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]">
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Megaphone className="text-[#3D56B2]" size={20} />
            Publish Notice
          </h2>
          <p className="text-xs text-[#757575] mb-6">Send important updates, deadlines, or slot timing corrections directly to your members.</p>

          {status && (
            <div className={`p-3 rounded-xl text-xs mb-3 border ${
              status.success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Notice Header Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Workshop Rescheduled Time"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Detailed Message</label>
              <textarea
                required
                rows={4}
                placeholder="Explain instructions clearly..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow"
            >
              {loading ? <Loader className="animate-spin" size={12} /> : <><Send size={12} /> Send Notice</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

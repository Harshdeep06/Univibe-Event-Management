'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { Settings2, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [univName, setUnivName] = useState('UNIVIBE Central University');
  const [carouselLimit, setCarouselLimit] = useState('5');
  const [auditLogs, setAuditLogs] = useState(true);
  const [notifEmails, setNotifEmails] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert('System settings updated and saved locally!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 text-xs">
        <button onClick={() => router.push('/admin')} className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]">
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Settings2 className="text-[#3D56B2]" size={20} />
            System Configurations
          </h2>
          <p className="text-xs text-[#757575] mb-6">Manage portal details, email notification triggers, and calendar settings.</p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">University Name</label>
              <input
                type="text"
                value={univName}
                onChange={(e) => setUnivName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Featured Carousel Slide Limit</label>
              <input
                type="number"
                value={carouselLimit}
                onChange={(e) => setCarouselLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
              />
            </div>

            <div className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={auditLogs}
                  onChange={(e) => setAuditLogs(e.target.checked)}
                  className="rounded text-[#3D56B2] focus:ring-[#3D56B2]"
                />
                Activate administrative audit log tracking
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifEmails}
                  onChange={(e) => setNotifEmails(e.target.checked)}
                  className="rounded text-[#3D56B2] focus:ring-[#3D56B2]"
                />
                Broadcast ticket codes and announcements to email accounts
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow"
            >
              <Save size={12} /> Save Configurations
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

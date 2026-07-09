'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import API from '../../../services/api';
import { Bookmark, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookmarksList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data.success && res.data.profile) {
        setBookmarks(res.data.profile.bookmarks || []);
      }
    } catch (err) {
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5">Bookmarked Events</h2>
          <p className="text-xs text-[#757575] mb-6 font-medium">Quick references to live and upcoming hackathons you bookmarked.</p>

          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {bookmarks.map((event) => (
                <div
                  key={event._id}
                  onClick={() => router.push(`/events/${event._id}`)}
                  className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-100 transition-all cursor-pointer flex justify-between items-start"
                >
                  <div>
                    <span className="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">{event.category}</span>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white mt-2 leading-tight line-clamp-1">{event.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-[#757575] dark:text-gray-400 mt-2">
                      <span className="flex items-center gap-0.5"><Clock size={11} /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-0.5"><MapPin size={11} /> {event.venue?.building}</span>
                    </div>
                  </div>
                  <Bookmark size={15} className="text-[#3D56B2]" fill="currentColor" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Bookmark className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No bookmarked events saved.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

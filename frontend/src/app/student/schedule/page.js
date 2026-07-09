'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import API from '../../../services/api';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentSchedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students/calendar');
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Error fetching calendar schedule:', err);
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
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5">Registered Event Schedule</h2>
          <p className="text-xs text-[#757575] mb-6">A list of all upcoming workshops, hackathons, and contests you have booked tickets for.</p>

          {events.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-dashed border-gray-200 dark:border-gray-700 space-y-8">
              {events.map((event) => (
                <div key={event._id} className="relative group">
                  {}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-[#3D56B2] group-hover:bg-[#3D56B2] transition-all" />
                  
                  <div
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all border border-transparent hover:border-gray-200"
                  >
                    <span className="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">{event.category}</span>
                    <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mt-2 group-hover:text-[#3D56B2] transition-colors">{event.name}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-[#757575] dark:text-gray-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {event.venue?.building} - {event.venue?.room}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No registered events. Explore the events listing.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

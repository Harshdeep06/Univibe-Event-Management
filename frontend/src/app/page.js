'use client';

import React, { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '../components/ui/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Megaphone
} from 'lucide-react';

function SearchParamsLoader({ onParamsReady }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onParamsReady(searchParams);
  }, [searchParams]);
  return null;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [searchVal, setSearchVal] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [categoriesList, setCategoriesList] = useState(['Hackathon', 'Workshop', 'Quiz', 'Music', 'Sports', 'Seminar']);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleParamsReady = (searchParams) => {
    const searchValParam = searchParams.get('search');
    if (searchValParam) {
      setSearchVal(searchValParam);
      fetchFilteredEvents(searchValParam, category, difficulty);
    }
  };

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      
      const annRes = await API.get('/students/announcements');
      if (annRes.data.success) {
        setAnnouncements(annRes.data.announcements);
      }

      
      const eventsRes = await API.get('/events?status=published');
      if (eventsRes.data.success) {
        setEvents(eventsRes.data.events);
      }
    } catch (err) {
      console.error('Error fetching explorer feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredEvents = async (search, cat, diff) => {
    try {
      setLoading(true);
      let query = '?status=published';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (cat) query += `&category=${encodeURIComponent(cat)}`;
      if (diff) query += `&difficulty=${encodeURIComponent(diff)}`;

      const res = await API.get(`/events${query}`);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error filtering events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    fetchFilteredEvents(searchVal, category, difficulty);
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setCategory('');
    setDifficulty('');
    fetchFilteredEvents('', '', '');
  };

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <SearchParamsLoader onParamsReady={handleParamsReady} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="lg:col-span-2 space-y-6">
          
          {}
          <div className="bg-[#3D56B2] text-white p-6 rounded-cardBig shadow-cardFloating relative overflow-hidden flex items-center justify-between min-h-[140px]">
            <div className="absolute right-[-20px] bottom-[-20px] w-52 h-52 rounded-full bg-[#5C7AEA] opacity-[0.25] blur-2xl" />
            <div className="relative z-10 max-w-md">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                UNIVIBE Active Board
              </span>
              <h2 className="text-xl font-extrabold mt-3 leading-tight">
                {user ? `Hello ${user.name}! Ready to explore new activities?` : 'Unlock Active Campus Living & Hackathons!'}
              </h2>
              <p className="text-xs text-[#E5E7EB] mt-1.5 leading-relaxed">
                Check details, reserve digital tickets, log attendance with automated QR check-in, and download certificates.
              </p>
            </div>
            
            <div className="hidden sm:block text-5xl relative z-10 filter drop-shadow">
              🚀
            </div>
          </div>

          {}
          <form onSubmit={handleApplyFilters} className="bg-white dark:bg-gray-800 p-4 rounded-cardMedium shadow-cardFloating border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              
              {}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  fetchFilteredEvents(searchVal, e.target.value, difficulty);
                }}
                className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-medium focus:ring-1 focus:ring-[#3D56B2] text-[#757575] dark:text-gray-300"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              {}
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  fetchFilteredEvents(searchVal, category, e.target.value);
                }}
                className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] font-medium focus:ring-1 focus:ring-[#3D56B2] text-[#757575] dark:text-gray-300"
              >
                <option value="">Difficulty Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Filter search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#3D56B2] text-[#1A1A1A] dark:text-white"
              />
              
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#3D56B2] text-white text-[11px] font-bold rounded-full shadow hover:bg-[#2C3E8A] transition-all"
              >
                Apply
              </button>
              
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-[11px] font-bold rounded-full transition-all"
              >
                Reset
              </button>
            </div>
          </form>

          {}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length > 0 ? (
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  onClick={() => router.push(`/events/${event._id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 group hover:border-[#3D56B2] dark:hover:border-gray-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">
                        {event.category}
                      </span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-[#1A1A1A] dark:text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full">
                        {event.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#3D56B2] dark:group-hover:text-gray-350 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-xs text-[#757575] dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 sm:border-l border-gray-100 dark:border-gray-700 sm:pl-6 text-[10px] text-[#757575] dark:text-gray-400 min-w-[120px]">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock size={12} />
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.venue?.building}
                    </span>
                    <span className="text-[#3D56B2] dark:text-[#5C7AEA] font-bold flex items-center gap-0.5">
                      Open
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
              <Layers className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs text-[#757575] dark:text-gray-400 font-medium">No published events match your query.</p>
            </div>
          )}

        </div>

        {}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <Megaphone className="text-[#3D56B2]" size={16} />
              Announcements Board
            </h3>
            
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="p-3 bg-[#F4F6F9] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                        {ann.club ? ann.club.name : 'University Global'}
                      </span>
                      <span className="text-[8px] text-[#757575] dark:text-gray-400 font-semibold">
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white leading-tight">{ann.title}</h4>
                    <p className="text-[10px] text-[#757575] dark:text-gray-300 mt-1 leading-normal">{ann.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No broadcasts posted today.</p>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

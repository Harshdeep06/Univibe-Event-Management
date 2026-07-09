'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion } from 'framer-motion';
import {
  Calendar,
  Award,
  Bookmark,
  Trophy,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'student') {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setNextEvent(res.data.nextEvent);
      }

      const lbRes = await API.get('/students/leaderboard');
      if (lbRes.data.success) {
        setLeaderboard(lbRes.data.leaderboard);
      }

      
      const meRes = await API.get('/auth/me');
      if (meRes.data.success && meRes.data.profile) {
        setBookmarks(meRes.data.profile.bookmarks || []);
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#757575] font-medium">Fetching dashboard context...</span>
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
          {nextEvent ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#3D56B2] text-white p-6 rounded-cardBig shadow-cardFloating relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 rounded-full bg-[#5C7AEA] opacity-[0.25] blur-2xl" />
              <div className="relative z-10">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                  Upcoming event schedule
                </span>
                <h2 className="text-2xl font-bold mt-4 leading-tight">{nextEvent.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#E5E7EB]">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {new Date(nextEvent.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>|</span>
                  <span>Venue: {nextEvent.venue?.building} - {nextEvent.venue?.room}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between relative z-10">
                <button
                  onClick={() => router.push(`/events/${nextEvent._id}`)}
                  className="bg-white text-[#3D56B2] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center gap-1 transition-all"
                >
                  View Details & Ticket
                  <ArrowUpRight size={13} />
                </button>
                <span className="text-[10px] text-white/70 italic font-medium">Be on time! Late entry is logged.</span>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center py-10">
              <Calendar className="text-[#3D56B2] mb-3" size={32} />
              <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white">No registrations scheduled</h3>
              <p className="text-xs text-[#757575] mt-1 max-w-xs">You have no upcoming event registers this week. Browse activities now.</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-[#3D56B2] text-white text-xs font-semibold rounded-xl hover:bg-[#2C3E8A] transition-all"
              >
                Explore Events Portal
              </button>
            </div>
          )}

          {}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Participated', value: stats?.registeredEvents || 0, icon: Calendar, color: 'text-blue-500 bg-blue-50' },
              { label: 'Attended', value: stats?.attendedEvents || 0, icon: Trophy, color: 'text-green-500 bg-green-50' },
              { label: 'Reward Points', value: stats?.rewardPoints || 0, icon: TrendingUp, color: 'text-purple-500 bg-purple-50' },
              { label: 'Certificates', value: stats?.certificates || 0, icon: Award, color: 'text-yellow-500 bg-yellow-50' },
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
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] dark:text-white mb-3">Saved Bookmarks</h3>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarks.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-cardMedium shadow-cardFloating border border-gray-100 dark:border-gray-700 hover:border-[#3D56B2] dark:hover:border-gray-500 cursor-pointer transition-all flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[9px] bg-[#EFEFEF] dark:bg-gray-700 text-[#757575] dark:text-gray-300 px-2 py-0.5 rounded font-semibold">{event.category}</span>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white mt-2 line-clamp-1">{event.name}</h4>
                      <p className="text-[10px] text-[#757575] dark:text-gray-400 mt-1">Venue: {event.venue?.building}</p>
                    </div>
                    <Bookmark size={14} className="text-[#3D56B2]" fill="currentColor" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No bookmarked events yet.</p>
            )}
          </div>

        </div>

        {}
        <div className="space-y-6">
          
          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-3.5 flex items-center gap-1.5">
              <Award className="text-[#3D56B2]" size={16} />
              Earned Badges
            </h3>
            {stats?.badges && stats.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {stats.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="bg-[#E0E5F5] text-[#3D56B2] border border-[#CBD5E1] px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                  >
                    🏆 {badge}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="mx-auto text-gray-300 mb-1" size={24} />
                <p className="text-[11px] text-[#757575] dark:text-gray-400">No badges awarded yet. Attend events to earn reward points!</p>
              </div>
            )}
            
            {}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-[10px] text-[#757575]">
              <span className="font-semibold text-[#3D56B2]">How to unlock badges?</span>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Check-in to events to get <span className="font-semibold">+50 points</span></li>
                <li>Unlock <span className="font-bold">Event Explorer</span> at 100 points</li>
                <li>Unlock <span className="font-bold">Super Scholar</span> at 300 points</li>
                <li>Unlock <span className="font-bold">UNIVIBE Champion</span> at 500 points</li>
              </ul>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <Trophy className="text-[#3D56B2]" size={16} />
              Punjabi Students
            </h3>
            <div className="space-y-3.5">
              {leaderboard.map((item, idx) => {
                const isCurrentUser = item.user?._id === user?.id;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      isCurrentUser ? 'bg-[#EFEFEF] dark:bg-gray-700 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-xs text-center font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-[#757575]'}`}>
                        #{idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-600 flex items-center justify-center font-bold text-xs uppercase text-[#3D56B2] dark:text-white">
                        {item.user?.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs text-[#1A1A1A] dark:text-white truncate max-w-[120px]">{item.user?.name}</h4>
                        <span className="text-[9px] text-[#757575] dark:text-gray-400">{item.department}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#3D56B2] dark:text-white">{item.rewardPoints} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

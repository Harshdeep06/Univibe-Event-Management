'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import API from '../../../services/api';
import { Trophy, Award, Star } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LeaderboardPortal() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
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
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <Trophy className="text-yellow-500" size={20} />
            Punjabi Students
          </h2>
          <p className="text-xs text-[#757575] mb-6">Earn points by actively checking in to university hackathons, workshops, and music fests.</p>

          <div className="space-y-3.5">
            {leaderboard.map((item, idx) => {
              const isCurrentUser = item.user?._id === user?.id;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                    isCurrentUser ? 'bg-[#EFEFEF]/55 dark:bg-gray-700 font-semibold border-[#3D56B2]' : 'border-transparent bg-gray-50/50 dark:bg-gray-700/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-xs text-center font-extrabold ${idx === 0 ? 'text-yellow-500 text-sm' : idx === 1 ? 'text-gray-400 text-sm' : idx === 2 ? 'text-amber-600 text-sm' : 'text-[#757575]'}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#E0E5F5] dark:bg-gray-700 flex items-center justify-center font-bold text-xs uppercase text-[#3D56B2]">
                      {item.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs text-[#1A1A1A] dark:text-white font-bold">{item.user?.name}</h4>
                      <p className="text-[10px] text-[#757575] dark:text-gray-400 mt-0.5">{item.rollNumber} • {item.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#3D56B2] dark:text-white">{item.rewardPoints} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

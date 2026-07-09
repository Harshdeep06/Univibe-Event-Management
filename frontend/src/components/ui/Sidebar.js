'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Award,
  BookMarked,
  Trophy,
  Users2,
  FolderLock,
  PlusCircle,
  FileSpreadsheet,
  Megaphone,
  LogOut,
  Settings2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  
  const getNavLinks = () => {
    switch (user.role) {
      case 'super_admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'University Clubs', path: '/admin/clubs', icon: Users2 },
          { name: 'Student Directory', path: '/admin/students', icon: FolderLock },
          { name: 'Pending Events', path: '/admin/approvals', icon: ShieldCheck },
          { name: 'System Settings', path: '/admin/settings', icon: Settings2 },
        ];
      case 'club_admin':
        return [
          { name: 'Dashboard', path: '/club', icon: LayoutDashboard },
          { name: 'Create Event', path: '/club/create-event', icon: PlusCircle },
          { name: 'Membership requests', path: '/club/requests', icon: Users2 },
          { name: 'Announcements', path: '/club/announcements', icon: Megaphone },
          { name: 'Attendance checks', path: '/club/attendance', icon: FileSpreadsheet },
        ];
      case 'student':
      default:
        return [
          { name: 'Explore Events', path: '/', icon: Sparkles },
          { name: 'My Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Registered Schedule', path: '/student/schedule', icon: CalendarDays },
          { name: 'Clubs Portal', path: '/student/clubs', icon: Users2 },
          { name: 'Certificates Locker', path: '/student/certificates', icon: Award },
          { name: 'Bookmarks list', path: '/student/bookmarks', icon: BookMarked },
          { name: 'Engagement Rank', path: '/student/leaderboard', icon: Trophy },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-[#3D56B2] text-white flex flex-col justify-between py-8 px-4 h-screen sticky top-0 rounded-r-[24px] md:rounded-l-[24px] md:rounded-r-none shadow-lg z-20">
      <div>
        {}
        <div className="flex items-center gap-2 px-3 mb-10 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-white text-[#3D56B2] p-1.5 rounded-xl font-extrabold text-sm shadow">
            UV
          </div>
          <span className="font-extrabold text-lg tracking-wider">UNIVIBE</span>
        </div>

        {}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;

            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 transition-all relative ${
                  isActive
                    ? 'bg-white text-[#3D56B2] font-semibold shadow-md translate-x-1.5'
                    : 'text-[#E0E7FF] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {}
      <div className="border-t border-white/20 pt-6">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm text-white border border-white/10">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold truncate leading-tight">{user.name}</h4>
            <p className="text-[10px] text-[#C7D2FE] truncate uppercase font-semibold tracking-wider mt-0.5">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 text-red-200 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

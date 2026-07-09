'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Bell, Sun, Moon, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#F4F6F9] dark:bg-[#111827] text-brand-textMain dark:text-gray-100 transition-colors duration-200`}>
      
      {}
      <header className="md:hidden bg-[#3D56B2] text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="bg-white text-[#3D56B2] px-2 py-1 rounded-lg font-bold text-xs">
            UV
          </div>
          <span className="font-bold text-base tracking-wider">UNIVIBE</span>
        </div>
        <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="p-1">
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 h-full bg-[#3D56B2] text-white flex flex-col shadow-xl animate-slide-in">
            <Sidebar />
          </div>
        </div>
      )}

      {}
      <div className="hidden md:flex flex-col h-screen sticky top-0 py-4 pl-4 bg-transparent">
        <Sidebar />
      </div>

      {}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto min-h-screen">
        
        {}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          
          {}
          <div>
            <span className="text-[10px] text-[#757575] dark:text-gray-400 font-semibold tracking-wider uppercase">Portal Overview</span>
            <h1 className="text-xl font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              Welcome back, <span className="text-[#3D56B2] dark:text-[#5C7AEA]">{user?.name}</span>!
            </h1>
          </div>

          {}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            {}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Global Events Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D56B2] text-[#1A1A1A] dark:text-white"
              />
              <button type="submit" className="absolute right-3.5 top-3 text-[#757575] hover:text-[#3D56B2]">
                <Search size={15} />
              </button>
            </form>

            {}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {}
            <button
              onClick={() => router.push('/student')}
              className="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm relative transition-all"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

          </div>

        </div>

        {}
        <div className="flex-1">
          {children}
        </div>

      </main>

    </div>
  );
}

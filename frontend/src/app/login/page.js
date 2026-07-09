'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, User, ArrowRight, Loader } from 'lucide-react';

export default function LoginPage() {
  const { login, registerStudent, error, setError } = useAuth();
  const [role, setRole] = useState('student'); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError(null);
    setIsRegistering(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    setError(null);

    if (isRegistering && role === 'student') {
      const res = await registerStudent(name, email, password, rollNumber, department, yearOfStudy);
      if (!res.success) {
        setLoadingLocal(false);
      }
    } else {
      const res = await login(email, password, role);
      if (!res.success) {
        setLoadingLocal(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-hidden bg-[#F4F6F9] dark:bg-[#111827]">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#3D56B2] opacity-[0.06] blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#5C7AEA] opacity-[0.06] blur-[80px]" />

      {}
      <div className="flex flex-col items-center mb-8">
        <span className="bg-[#3D56B2] text-white px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          University Hub
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] dark:text-white">
          UNI<span className="text-[#3D56B2]">VIBE</span>
        </h1>
        <p className="text-sm text-[#757575] mt-1">Unified Campus Event System</p>
      </div>

      {}
      <div className="bg-[#E5E7EB] dark:bg-[#1F2937] p-1 rounded-full flex gap-1 mb-8 shadow-sm relative z-10 w-full max-w-sm">
        {['student', 'club_admin', 'super_admin'].map((r) => {
          const isActive = role === r;
          let label = 'Student';
          let Icon = User;
          if (r === 'club_admin') {
            label = 'Club Head';
            Icon = Users;
          } else if (r === 'super_admin') {
            label = 'Admin';
            Icon = Shield;
          }

          return (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className="flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeRoleBg"
                  className="absolute inset-0 bg-white dark:bg-[#374151] rounded-full shadow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-[#3D56B2] dark:text-white' : 'text-[#757575]'}`}>
                <Icon size={14} />
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-cardFloating border border-white/40 dark:border-gray-700 p-8 md:p-10 relative z-10 glass-card"
      >
        <h2 className="text-xl font-bold mb-1 text-[#1A1A1A] dark:text-white">
          {isRegistering ? 'Create Student Profile' : `${role === 'student' ? 'Student' : role === 'club_admin' ? 'Club Head' : 'Super Admin'} Authentication`}
        </h2>
        <p className="text-xs text-[#757575] mb-6">
          {isRegistering ? 'Join UNIVIBE and explore active university life.' : 'Please input credentials below.'}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs mb-4 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {isRegistering && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Gurpreet Singh"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="CS2023001"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Year of Study</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`${role}@univibe.edu`}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-gray-300">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => alert('Simulated reset request: Check server logs for OTP after submitting email.')}
                  className="text-[10px] text-[#3D56B2] font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full py-3 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 relative overflow-hidden"
          >
            {loadingLocal ? (
              <Loader className="animate-spin" size={14} />
            ) : (
              <>
                {isRegistering ? 'Complete Registration' : 'Authenticate'}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {role === 'student' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-[#3D56B2] font-semibold hover:underline"
            >
              {isRegistering ? 'Already have a profile? Login' : 'New student? Register profile'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

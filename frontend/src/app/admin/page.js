'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/ui/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  ShieldAlert,
  Users2,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  PlusCircle,
  Clock,
  Loader
} from 'lucide-react';
import { useRouter } from 'next/navigation';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [clubName, setClubName] = useState('');
  const [clubDesc, setClubDesc] = useState('');
  const [coordinator, setCoordinator] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [submittingClub, setSubmittingClub] = useState(false);
  const [clubStatus, setClubStatus] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        
        
        const backendChartData = res.data.chartData || [];
        setChartData({
          labels: backendChartData.map(d => d.month),
          datasets: [
            {
              label: 'Registrations',
              data: backendChartData.map(d => d.count),
              backgroundColor: '#3D56B2',
              borderRadius: 6,
              borderSkipped: false
            }
          ]
        });
      }

      
      const pendingRes = await API.get('/admin/events/pending');
      if (pendingRes.data.success) {
        setPendingEvents(pendingRes.data.events);
      }
    } catch (err) {
      console.error('Error loading admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEvent = async (eventId, action) => {
    try {
      const status = action === 'approve' ? 'published' : 'cancelled';
      const res = await API.put(`/events/${eventId}`, { status });
      if (res.data.success) {
        setPendingEvents(pendingEvents.filter(e => e._id !== eventId));
        
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error resolving event status');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!clubName.trim() || !clubDesc.trim() || !coordinator.trim()) return;

    try {
      setSubmittingClub(true);
      setClubStatus(null);
      const res = await API.post('/admin/clubs', {
        name: clubName,
        description: clubDesc,
        facultyCoordinator: coordinator,
        clubHeadEmail: headEmail
      });

      if (res.data.success) {
        setClubStatus({ success: true, message: `Club "${clubName}" successfully established!` });
        setClubName('');
        setClubDesc('');
        setCoordinator('');
        setHeadEmail('');
        fetchAdminData();
      }
    } catch (err) {
      setClubStatus({ success: false, message: err.response?.data?.error || 'Failed to create club' });
    } finally {
      setSubmittingClub(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { precision: 0 } }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#757575] font-medium">Loading university administrative portal...</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Students', value: stats?.totalStudents || 0, icon: Users2, color: 'text-blue-500 bg-blue-50' },
              { label: 'Clubs', value: stats?.totalClubs || 0, icon: Layers, color: 'text-purple-500 bg-purple-50' },
              { label: 'Live Events', value: stats?.totalEvents || 0, icon: Calendar, color: 'text-green-500 bg-green-50' },
              { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: CheckCircle, color: 'text-yellow-500 bg-yellow-50' },
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4">Registration Analytics (Yearly Growth)</h3>
            <div className="h-64 relative">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <ShieldAlert className="text-[#3D56B2]" size={16} />
              Review Pending Event Proposals ({pendingEvents.length})
            </h3>
            {pendingEvents.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {pendingEvents.map((event) => (
                  <div key={event._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[9px] bg-[#EFEFEF] dark:bg-gray-700 text-[#757575] dark:text-gray-300 px-2 py-0.5 rounded font-bold">{event.category}</span>
                      <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white mt-1.5">{event.name}</h4>
                      <p className="text-[10px] text-[#757575] dark:text-gray-400 mt-0.5">
                        Organizer: {event.organizerClub?.name} | Date: {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleResolveEvent(event._id, 'approve')}
                        className="flex-1 sm:flex-none py-1.5 px-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg border border-green-100 flex items-center justify-center gap-1 text-[10px] font-semibold"
                      >
                        <CheckCircle size={13} />
                        Publish
                      </button>
                      <button
                        onClick={() => handleResolveEvent(event._id, 'reject')}
                        className="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 flex items-center justify-center gap-1 text-[10px] font-semibold"
                      >
                        <XCircle size={13} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757575] dark:text-gray-400 italic py-2">All event creation proposals processed.</p>
            )}
          </div>

        </div>

        {}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-1.5">
              <PlusCircle className="text-[#3D56B2]" size={16} />
              Establish University Club
            </h3>

            {clubStatus && (
              <div className={`p-3 rounded-xl text-xs mb-3 border ${
                clubStatus.success
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {clubStatus.message}
              </div>
            )}

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & ML Club"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Focus areas, goals, target students..."
                  value={clubDesc}
                  onChange={(e) => setClubDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Faculty Coordinator</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rajesh Kumar"
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Club Head Email (Assignee)</label>
                <input
                  type="email"
                  placeholder="student@univibe.edu"
                  value={headEmail}
                  onChange={(e) => setHeadEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-2 focus:ring-[#3D56B2] focus:outline-none"
                />
                <span className="text-[9px] text-[#757575] mt-1 block">Account must be pre-registered in system directory. Role will upgrade to Club Admin.</span>
              </div>

              <button
                type="submit"
                disabled={submittingClub}
                className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow"
              >
                {submittingClub ? (
                  <Loader className="animate-spin" size={12} />
                ) : (
                  <>
                    <PlusCircle size={12} />
                    Register Club Profile
                  </>
                )}
              </button>
            </form>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig shadow-cardFloating border border-gray-100 dark:border-gray-700 text-xs space-y-3">
            <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-2">Portal Quick Stats</h3>
            <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
              <span className="text-[#757575]">Most Active Club:</span>
              <span className="font-bold text-[#3D56B2] dark:text-[#5C7AEA]">{stats?.activeClub || 'None'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#757575]">Leading Contributor:</span>
              <span className="font-bold text-[#3D56B2] dark:text-[#5C7AEA]">{stats?.activeStudent || 'None'}</span>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

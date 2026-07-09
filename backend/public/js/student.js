// ─── Student dashboard ────────────────────────────────────────────────────────
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth('student');
  if (!currentUser) return;
  await Promise.all([loadDashboardStats(), loadTimelineEvents(), loadAttendance(), loadBookmarks(), loadLeaderboard(), loadDashboardAnnouncements()]);
});

async function loadDashboardStats() {
  const loader  = document.getElementById('student-loader');
  const content = document.getElementById('dashboard-content');
  try {
    const res = await fetchAPI('/students/dashboard');
    if (res.success) {
      const { registeredEvents, attendedEvents, rewardPoints, certificates, badges } = res.stats;
      document.getElementById('stat-registered').innerText = registeredEvents;
      document.getElementById('stat-attended').innerText   = attendedEvents;
      document.getElementById('stat-points').innerText     = rewardPoints;
      document.getElementById('stat-certs').innerText      = certificates;

      const countEl = document.getElementById('sidebar-badges-count');
      if (countEl) {
        countEl.innerText = badges ? badges.length : 0;
      }

      document.getElementById('upcoming-banner-container').innerHTML = res.nextEvent
        ? `<div class="bg-[#3D56B2] text-white p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div class="absolute right-[-20px] bottom-[-20px] w-64 h-64 rounded-full bg-[#5C7AEA] opacity-[0.25] blur-2xl"></div>
            <div class="relative z-10">
              <span class="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">Upcoming event schedule</span>
              <h2 class="text-2xl font-bold mt-4 leading-tight">${res.nextEvent.name}</h2>
              <div class="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#E5E7EB]">
                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${new Date(res.nextEvent.date).toLocaleDateString()}</span>
                <span>| Venue: ${res.nextEvent.venue?.building} Block, Room ${res.nextEvent.venue?.room}</span>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-between relative z-10">
              <button onclick="window.location.href='/event?id=${res.nextEvent._id}'" class="bg-white text-[#3D56B2] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center gap-1">View Details <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></button>
              <span class="text-[10px] text-white/70 italic">Be on time! Late entry is logged.</span>
            </div>
          </div>`
        : `<div class="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center py-10">
            <i data-lucide="calendar" class="text-[#3D56B2] mb-3 w-8 h-8"></i>
            <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white">No upcoming registrations</h3>
            <p class="text-xs text-[#757575] mt-1 max-w-xs dark:text-gray-400">You have no upcoming events this week. Browse activities now.</p>
            <button onclick="window.location.href='/'" class="mt-4 px-4 py-2 bg-[#3D56B2] text-white text-xs font-semibold rounded-xl hover:bg-[#2C3E8A] transition-all">Explore Events Portal</button>
          </div>`;
    }
  } catch(err) { console.error('Stats error:', err); }
  finally { loader.classList.add('hidden'); content.classList.remove('hidden'); lucide?.createIcons(); }
}

async function loadTimelineEvents() {
  const tl    = document.getElementById('timeline-list');
  const empty = document.getElementById('timeline-empty');
  tl.innerHTML = ''; empty.classList.add('hidden');
  try {
    const res = await fetchAPI('/students/calendar');
    if (res.success && res.events.length) {
      tl.innerHTML = res.events.map(e=>`
        <div class="relative group">
          <div class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-[#3D56B2] group-hover:bg-[#3D56B2] transition-all"></div>
          <div onclick="window.location.href='/event?id=${e._id}'" class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 cursor-pointer transition-all border border-transparent hover:border-gray-200">
            <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">${e.category}</span>
            <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white mt-2 group-hover:text-[#3D56B2]">${e.name}</h3>
            <div class="flex items-center gap-4 text-[10px] text-[#757575] mt-2">
              <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${new Date(e.date).toLocaleDateString()}</span>
              <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${e.time}</span>
              <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${e.venue?.building}</span>
            </div>
          </div>
        </div>`).join('');
    } else { empty.classList.remove('hidden'); }
  } catch(err) { console.error('Timeline error:', err); }
  if (typeof lucide!=='undefined') lucide.createIcons();
}

async function loadAttendance() {
  const body = document.getElementById('attendance-list-body');
  const empty = document.getElementById('attendance-empty');
  body.innerHTML = ''; empty.classList.add('hidden');
  try {
    const res = await fetchAPI('/students/attendance');
    if (res.success && res.attendance && res.attendance.length) {
      body.innerHTML = res.attendance.map(a => `
        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
          <td class="py-3 font-bold text-[#1A1A1A] dark:text-white">${a.event?.name || 'N/A'}</td>
          <td class="py-3 text-[#757575] dark:text-gray-300">${a.event?.organizerClub?.name || 'Global'}</td>
          <td class="py-3 text-[#757575] dark:text-gray-300">${a.event ? new Date(a.event.date).toLocaleDateString() : 'N/A'} at ${a.event?.time || 'N/A'}</td>
          <td class="py-3"><span class="bg-[#E0E5F5] dark:bg-gray-700 text-[#3D56B2] dark:text-[#E0E7FF] px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">${a.badgeAwarded || 'Enthusiast'}</span></td>
          <td class="py-3 text-right font-bold text-[#3D56B2]">+50 pts</td>
        </tr>`).join('');
      lucide?.createIcons();
    } else { empty.classList.remove('hidden'); }
  } catch(err) { console.error('Attendance error:', err); }
}

async function loadBookmarks() {
  const grid  = document.getElementById('bookmarks-grid');
  const empty = document.getElementById('bookmarks-empty');
  grid.innerHTML = ''; empty.classList.add('hidden');
  try {
    const res = await fetchAPI('/auth/me');
    const bk  = res.success && res.profile?.bookmarks;
    if (bk && bk.length) {
      grid.innerHTML = bk.map(e=>`
        <div onclick="window.location.href='/event?id=${e._id}'" class="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-100 transition-all cursor-pointer flex justify-between items-start">
          <div>
            <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">${e.category}</span>
            <h3 class="font-bold text-[#1A1A1A] dark:text-white mt-2 truncate max-w-[150px]">${e.name}</h3>
            <div class="flex items-center gap-3 text-[10px] text-[#757575] mt-2">
              <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i> ${new Date(e.date).toLocaleDateString()}</span>
              <span class="flex items-center gap-0.5"><i data-lucide="map-pin" class="w-3 h-3"></i> ${e.venue?.building}</span>
            </div>
          </div>
          <i data-lucide="bookmark" class="text-[#3D56B2] w-4.5 h-4.5 fill-current"></i>
        </div>`).join('');
      lucide?.createIcons();
    } else { empty.classList.remove('hidden'); }
  } catch(err) { console.error('Bookmarks error:', err); }
}

async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';
  try {
    const res = await fetchAPI('/students/leaderboard');
    if (res.success && res.leaderboard.length) {
      const colors = ['text-yellow-500','text-gray-400','text-amber-600'];
      list.innerHTML = res.leaderboard.map((item,i)=>`
        <div class="flex items-center justify-between p-2 rounded-xl ${item.user?._id===currentUser?.id?'bg-[#EFEFEF] dark:bg-gray-700 font-semibold':''}">
          <div class="flex items-center gap-3">
            <span class="w-5 text-xs text-center font-bold ${colors[i]||'text-[#757575]'}">#${i+1}</span>
            <div class="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-600 flex items-center justify-center font-bold text-xs uppercase text-[#3D56B2]">${item.user?.name.charAt(0)}</div>
            <div>
              <h4 class="text-xs text-[#1A1A1A] dark:text-white truncate max-w-[120px]">${item.user?.name}</h4>
              <span class="text-[9px] text-[#757575]">${item.department}</span>
            </div>
          </div>
          <span class="text-xs font-extrabold text-[#3D56B2]">${item.rewardPoints} pts</span>
        </div>`).join('');
    }
  } catch(err) { console.error('Leaderboard error:', err); }
}

async function loadDashboardAnnouncements() {
  const listEl = document.getElementById('student-announcements-list');
  if (!listEl) return;
  try {
    const res = await fetchAPI('/students/announcements');
    if (res.success && res.announcements) {
      if (res.announcements.length > 0) {
        listEl.innerHTML = res.announcements.map(a => {
          const author = a.createdBy?.name || 'Admin';
          const roleLabel = a.createdBy?.role === 'super_admin' ? 'Super Admin' : 'Club Head';
          const clubName = a.club ? ` (${a.club.name})` : ' (Global)';
          return `
            <div class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1.5">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-[#1A1A1A] dark:text-white text-xs">${a.title}</h4>
                  <span class="text-[9px] text-[#757575] font-medium">${author} - ${roleLabel}${clubName}</span>
                </div>
                <span class="text-[8px] text-[#757575]">${new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p class="text-[10px] text-[#757575] dark:text-gray-300 leading-relaxed">${a.content}</p>
            </div>
          `;
        }).join('');
      } else {
        listEl.innerHTML = '<p class="text-[10px] text-[#757575] italic text-center py-4">No announcements posted.</p>';
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard announcements:', err);
    listEl.innerHTML = '<p class="text-red-500 text-[10px] italic text-center py-4">Failed to load announcements.</p>';
  }
}

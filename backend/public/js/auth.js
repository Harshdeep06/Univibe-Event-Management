// ─── Auth helpers ────────────────────────────────────────────────────────────
function checkAuth(role) {
  const token = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');
  if (!token || !userJson) { window.location.href = '/login'; return null; }
  const user = JSON.parse(userJson);
  if (role && user.role !== role) {
    const redirects = { super_admin: '/admin', club_admin: '/club', student: '/student' };
    window.location.href = redirects[user.role] || '/login';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('univibe_token');
  localStorage.removeItem('univibe_user');
  window.location.href = '/login';
}

function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('global-search-input')?.value?.trim();
  if (q) window.location.href = `/?search=${encodeURIComponent(q)}`;
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) { icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon'); lucide.createIcons(); }
}

// ─── Sidebar & Navbar renderer ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar-container');
  const navbar  = document.getElementById('navbar-container');
  const token   = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');
  const path    = window.location.pathname;
  const isDark  = localStorage.getItem('theme') === 'dark';
  if (isDark) document.documentElement.classList.add('dark');

  // ── Nav links per role ──
  const NAV = {
    super_admin: [
      { name:'Dashboard',        url:'/admin', icon:'layout-dashboard' },
      { name:'University Clubs', url:'/admin', hash:'#clubs-section',    icon:'layers' },
      { name:'Student Directory',url:'/admin', hash:'#students-section', icon:'folder-lock' },
      { name:'Pending Events',   url:'/admin', hash:'#approvals-section',icon:'shield-alert' }
    ],
    club_admin: [
      { name:'Dashboard',    url:'/club', icon:'layout-dashboard' },
      { name:'Create Event', url:'/club', hash:'#create-event-section', icon:'plus-circle' },
      { name:'Announcements',url:'/club', hash:'#notices-section',      icon:'megaphone' }
    ],
    student: [
      { name:'Explore Events',      url:'/',       icon:'sparkles' },
      { name:'My Dashboard',        url:'/student',icon:'layout-dashboard' },
      { name:'Registered Schedule', url:'/student',hash:'#schedule-section',icon:'calendar-days' },
      { name:'Attendance & Badges Locker', url:'/student',hash:'#attendance-section',   icon:'award' },
      { name:'Bookmarks',           url:'/student',hash:'#bookmarks-section',icon:'bookmark' }
    ]
  };

  // ── Build sidebar HTML ──
  const buildSidebar = (links, user) => {
    const linksHtml = (links || []).map(l => {
      const active = path === l.url && (!l.hash || window.location.hash === l.hash);
      return `<a href="${l.url}${l.hash||''}" class="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 transition-all ${active ? 'bg-white text-[#3D56B2] font-semibold shadow-md translate-x-1.5' : 'text-[#E0E7FF] hover:bg-white/10 hover:text-white'}">
        <i data-lucide="${l.icon}" class="w-4 h-4"></i><span>${l.name}</span></a>`;
    }).join('');

    const bottom = user
      ? `<div class="flex items-center gap-3 px-2 mb-4">
           <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm text-white border border-white/10">${user.name.charAt(0).toUpperCase()}</div>
           <div class="flex-1 overflow-hidden">
             <h4 class="text-xs font-semibold truncate">${user.name}</h4>
             <p class="text-[10px] text-[#C7D2FE] truncate uppercase font-semibold tracking-wider mt-0.5">${user.role.replace('_',' ')}</p>
           </div>
         </div>
         <button onclick="logout()" class="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 text-red-200 hover:bg-red-500/10 hover:text-red-300 transition-all">
           <i data-lucide="log-out" class="w-4 h-4"></i><span>Sign Out</span></button>`
      : `<button onclick="window.location.href='/login'" class="w-full py-3 px-4 rounded-[20px] text-xs font-semibold bg-white text-[#3D56B2] hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all shadow-md">
           <i data-lucide="log-in" class="w-4 h-4"></i><span>Sign In / Register</span></button>`;

    return `<aside class="w-64 bg-[#3D56B2] text-white flex flex-col justify-between py-8 px-4 h-screen sticky top-0 rounded-r-[24px] md:rounded-l-[24px] md:rounded-r-none shadow-lg z-20">
      <div>
        <div class="flex items-center gap-2 px-3 mb-10 cursor-pointer" onclick="window.location.href='/'">
          <div class="bg-white text-[#3D56B2] p-1.5 rounded-xl font-extrabold text-sm shadow">UV</div>
          <span class="font-extrabold text-lg tracking-wider">UNIVIBE</span>
        </div>
        <nav class="space-y-1.5">${linksHtml}</nav>
      </div>
      <div class="border-t border-white/20 pt-6">${bottom}</div>
    </aside>`;
  };

  // ── Build navbar HTML ──
  const buildNavbar = (user) => {
    const greeting = user ? `Welcome back, <span class="text-[#3D56B2] dark:text-[#5C7AEA]">${user.name}</span>!` : `Welcome to <span class="text-[#3D56B2] dark:text-[#5C7AEA]">UNIVIBE</span>`;
    const rightBtns = user
      ? `<button onclick="toggleDarkMode()" class="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all">
           <i id="theme-toggle-icon" data-lucide="${isDark?'sun':'moon'}" class="w-4 h-4"></i></button>
         <div class="relative inline-block">
           <button onclick="toggleNotificationsDropdown(event)" class="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm relative transition-all">
             <i data-lucide="bell" class="w-4 h-4"></i>
             <span id="bell-badge" class="hidden absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
           <div id="notifications-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-[20px] shadow-xl border border-gray-100 dark:border-gray-700 py-3 px-4 z-50 text-left animate-fade-in max-h-96 overflow-y-auto">
             <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
               <span class="font-bold text-[10px] uppercase tracking-wider text-[#757575] dark:text-gray-400">Notifications</span>
               <button onclick="markAllNotificationsRead(event)" class="text-[#3D56B2] hover:underline text-[9px] font-bold uppercase tracking-wide">Mark all read</button>
             </div>
             <div id="notifications-list" class="space-y-2 max-h-64 overflow-y-auto pr-0.5">
               <p class="text-[10px] text-[#757575] italic text-center py-4">No notifications.</p>
             </div>
           </div>
         </div>`
      : `<button onclick="window.location.href='/login'" class="px-5 py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center gap-1.5">
           <i data-lucide="log-in" class="w-3.5 h-3.5"></i><span>Login Portal</span></button>`;

    return `<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <span class="text-[10px] text-[#757575] dark:text-gray-400 font-semibold tracking-wider uppercase">Portal Overview</span>
        <h1 class="text-xl font-bold text-[#1A1A1A] dark:text-white mt-0.5">${greeting}</h1>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <form onsubmit="handleSearch(event)" class="relative w-full sm:w-64">
          <input type="text" id="global-search-input" placeholder="Global Events Search..." class="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D56B2] text-[#1A1A1A] dark:text-white">
          <button type="submit" class="absolute right-3.5 top-3 text-[#757575] hover:text-[#3D56B2]"><i data-lucide="search" class="w-4 h-4"></i></button>
        </form>
        ${rightBtns}
      </div>
    </div>`;
  };

  if (!token || !userJson) {
    if (sidebar) sidebar.innerHTML = buildSidebar(NAV.student.slice(0,1), null);
    if (navbar)  navbar.innerHTML  = buildNavbar(null);
  } else {
    const user = JSON.parse(userJson);
    if (sidebar) sidebar.innerHTML = buildSidebar(NAV[user.role] || [], user);
    if (navbar)  navbar.innerHTML  = buildNavbar(user);
    if (user.role === 'student') {
      setTimeout(checkUnreadNotificationsCount, 100);
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ─── Global Notifications Dropdown Functions ────────────────────────────────
async function toggleNotificationsDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('notifications-dropdown');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  
  if (isHidden) {
    dropdown.classList.remove('hidden');
    await loadNotificationsList();
  } else {
    dropdown.classList.add('hidden');
  }
}

async function loadNotificationsList() {
  const listEl = document.getElementById('notifications-list');
  const badgeEl = document.getElementById('bell-badge');
  if (!listEl) return;
  
  try {
    const res = await fetchAPI('/students/notifications');
    if (res.success && res.notifications) {
      const unreadCount = res.notifications.filter(n => !n.read).length;
      if (badgeEl) {
        if (unreadCount > 0) {
          badgeEl.classList.remove('hidden');
        } else {
          badgeEl.classList.add('hidden');
        }
      }
      
      if (res.notifications.length > 0) {
        listEl.innerHTML = res.notifications.map(n => `
          <div class="p-2.5 rounded-xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 text-[11px] ${!n.read ? 'border-l-2 border-l-[#3D56B2] font-semibold bg-[#3D56B2]/5' : ''}">
            <p class="text-[#1A1A1A] dark:text-white leading-relaxed text-[10px]">${n.message}</p>
            <span class="text-[8px] text-[#757575] mt-1 block">${new Date(n.createdAt).toLocaleDateString()} ${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        `).join('');
      } else {
        listEl.innerHTML = '<p class="text-[10px] text-[#757575] italic text-center py-4">No notifications yet.</p>';
      }
    }
  } catch (err) {
    console.error('Failed to load notifications:', err);
    listEl.innerHTML = '<p class="text-red-500 text-[10px] italic text-center py-4">Failed to load notifications.</p>';
  }
}

async function markAllNotificationsRead(e) {
  if (e) e.stopPropagation();
  try {
    const res = await fetchAPI('/students/notifications/read', { method: 'PUT' });
    if (res.success) {
      await loadNotificationsList();
    }
  } catch (err) {
    console.error('Failed to mark notifications read:', err);
  }
}

async function checkUnreadNotificationsCount() {
  const badgeEl = document.getElementById('bell-badge');
  if (!badgeEl) return;
  try {
    const res = await fetchAPI('/students/notifications');
    if (res.success && res.notifications) {
      const unreadCount = res.notifications.filter(n => !n.read).length;
      if (unreadCount > 0) {
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error('Error checking unread notifications:', err);
  }
}

document.addEventListener('click', () => {
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
});

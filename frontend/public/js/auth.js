
function checkAuth(requiredRole) {
  const token = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');

  if (!token || !userJson) {
    window.location.href = '/login';
    return null;
  }

  const user = JSON.parse(userJson);

  if (requiredRole && user.role !== requiredRole) {
    
    if (user.role === 'super_admin') {
      window.location.href = '/admin';
    } else if (user.role === 'club_admin') {
      window.location.href = '/club';
    } else {
      window.location.href = '/student';
    }
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
  const searchVal = document.getElementById('global-search-input')?.value;
  if (searchVal && searchVal.trim()) {
    window.location.href = `/?search=${encodeURIComponent(searchVal.trim())}`;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const sidebarContainer = document.getElementById('sidebar-container');
  const navbarContainer = document.getElementById('navbar-container');
  const token = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');
  const path = window.location.pathname;

  if (!token || !userJson) {
    if (sidebarContainer) {
      sidebarContainer.innerHTML = `
        <aside class="w-64 bg-[#3D56B2] text-white flex flex-col justify-between py-8 px-4 h-screen sticky top-0 rounded-r-[24px] md:rounded-l-[24px] md:rounded-r-none shadow-lg z-20">
          <div>
            <div class="flex items-center gap-2 px-3 mb-10 cursor-pointer" onclick="window.location.href='/'">
              <div class="bg-white text-[#3D56B2] p-1.5 rounded-xl font-extrabold text-sm shadow">
                UV
              </div>
              <span class="font-extrabold text-lg tracking-wider">UNIVIBE</span>
            </div>

            <nav class="space-y-1.5">
              <a href="/" class="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 transition-all bg-white text-[#3D56B2] font-semibold shadow-md translate-x-1.5">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>Explore Events</span>
              </a>
            </nav>
          </div>

          <div class="border-t border-white/20 pt-6">
            <button onclick="window.location.href='/login'" class="w-full py-3 px-4 rounded-[20px] text-xs font-semibold bg-white text-[#3D56B2] hover:bg-opacity-90 flex items-center justify-center gap-2 transition-all shadow-md">
              <i data-lucide="log-in" class="w-4 h-4"></i>
              <span>Sign In / Register</span>
            </button>
          </div>
        </aside>
      `;
    }

    if (navbarContainer) {
      navbarContainer.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span class="text-[10px] text-[#757575] dark:text-gray-400 font-semibold tracking-wider uppercase">Portal Overview</span>
            <h1 class="text-xl font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              Welcome to <span class="text-[#3D56B2] dark:text-[#5C7AEA]">UNIVIBE</span>
            </h1>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <form onsubmit="handleSearch(e || event)" class="relative w-full sm:w-64">
              <input
                type="text"
                id="global-search-input"
                placeholder="Global Events Search..."
                class="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D56B2] text-[#1A1A1A] dark:text-white"
              />
              <button type="submit" class="absolute right-3.5 top-3 text-[#757575] hover:text-[#3D56B2]">
                <i data-lucide="search" class="w-4 h-4"></i>
              </button>
            </form>

            <button onclick="window.location.href='/login'" class="px-5 py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center gap-1.5">
              <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
              <span>Login Portal</span>
            </button>
          </div>
        </div>
      `;
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    return;
  }
  const user = JSON.parse(userJson);

  
  if (sidebarContainer) {
    let links = [];
    if (user.role === 'super_admin') {
      links = [
        { name: 'Dashboard', url: '/admin', icon: 'layout-dashboard' },
        { name: 'University Clubs', url: '/admin', hash: '#clubs-section', icon: 'users' },
        { name: 'Student Directory', url: '/admin', hash: '#students-section', icon: 'folder-lock' },
        { name: 'Pending Events', url: '/admin', hash: '#approvals-section', icon: 'shield-alert' },
      ];
    } else if (user.role === 'club_admin') {
      links = [
        { name: 'Dashboard', url: '/club', icon: 'layout-dashboard' },
        { name: 'Create Event', url: '/club', hash: '#create-event-section', icon: 'plus-circle' },
        { name: 'Announcements', url: '/club', hash: '#notices-section', icon: 'megaphone' },
      ];
    } else {
      links = [
        { name: 'Explore Events', url: '/', icon: 'sparkles' },
        { name: 'My Dashboard', url: '/student', icon: 'layout-dashboard' },
        { name: 'Registered Schedule', url: '/student', hash: '#schedule-section', icon: 'calendar-days' },
        { name: 'Certificates Locker', url: '/student', hash: '#certs-section', icon: 'award' },
        { name: 'Bookmarks list', url: '/student', hash: '#bookmarks-section', icon: 'bookmark' },
      ];
    }

    let linksHtml = '';
    links.forEach(link => {
      const isUrlActive = path === link.url;
      const isHashActive = link.hash ? window.location.hash === link.hash : false;
      const isActive = isUrlActive && (!link.hash || isHashActive);
      
      linksHtml += `
        <a href="${link.url}${link.hash || ''}" class="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 transition-all ${
          isActive
            ? 'bg-white text-[#3D56B2] font-semibold shadow-md translate-x-1.5'
            : 'text-[#E0E7FF] hover:bg-white/10 hover:text-white'
        }">
          <i data-lucide="${link.icon}" class="w-4 h-4"></i>
          <span>${link.name}</span>
        </a>
      `;
    });

    sidebarContainer.innerHTML = `
      <aside class="w-64 bg-[#3D56B2] text-white flex flex-col justify-between py-8 px-4 h-screen sticky top-0 rounded-r-[24px] md:rounded-l-[24px] md:rounded-r-none shadow-lg z-20">
        <div>
          <!-- Brand Logo Header -->
          <div class="flex items-center gap-2 px-3 mb-10 cursor-pointer" onclick="window.location.href='/'">
            <div class="bg-white text-[#3D56B2] p-1.5 rounded-xl font-extrabold text-sm shadow">
              UV
            </div>
            <span class="font-extrabold text-lg tracking-wider">UNIVIBE</span>
          </div>

          <!-- Navigation list -->
          <nav class="space-y-1.5">
            ${linksHtml}
          </nav>
        </div>

        <!-- User profile capsule bottom -->
        <div class="border-t border-white/20 pt-6">
          <div class="flex items-center gap-3 px-2 mb-4">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm text-white border border-white/10">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 overflow-hidden">
              <h4 class="text-xs font-semibold truncate leading-tight">${user.name}</h4>
              <p class="text-[10px] text-[#C7D2FE] truncate uppercase font-semibold tracking-wider mt-0.5">${user.role.replace('_', ' ')}</p>
            </div>
          </div>
          
          <button onclick="logout()" class="w-full py-3 px-4 rounded-[20px] text-xs font-medium flex items-center gap-3 text-red-200 hover:bg-red-500/10 hover:text-red-300 transition-all">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    `;
  }

  
  if (navbarContainer) {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.documentElement.classList.add('dark');

    navbarContainer.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span class="text-[10px] text-[#757575] dark:text-gray-400 font-semibold tracking-wider uppercase">Portal Overview</span>
          <h1 class="text-xl font-bold text-[#1A1A1A] dark:text-white mt-0.5">
            Welcome back, <span class="text-[#3D56B2] dark:text-[#5C7AEA]">${user.name}</span>!
          </h1>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Search Pill Capsule -->
          <form onsubmit="handleSearch(e || event)" class="relative w-full sm:w-64">
            <input
              type="text"
              id="global-search-input"
              placeholder="Global Events Search..."
              class="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3D56B2] text-[#1A1A1A] dark:text-white"
            />
            <button type="submit" class="absolute right-3.5 top-3 text-[#757575] hover:text-[#3D56B2]">
              <i data-lucide="search" class="w-4 h-4"></i>
            </button>
          </form>

          <!-- Dark Mode Toggle -->
          <button onclick="toggleDarkMode()" class="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all">
            <i id="theme-toggle-icon" data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>
          </button>

          <!-- Bell notification -->
          <button onclick="window.location.href='/student'" class="p-2.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-[#757575] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm relative transition-all">
            <i data-lucide="bell" class="w-4 h-4"></i>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    `;
  }

  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});


function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  const icon = document.getElementById('theme-toggle-icon');
  if (icon && typeof lucide !== 'undefined') {
    icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    lucide.createIcons();
  }
}

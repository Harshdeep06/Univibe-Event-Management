document.addEventListener('DOMContentLoaded', () => {
  const q = new URLSearchParams(window.location.search).get('search');
  if (q) document.getElementById('search-filter').value = q;
  fetchFeeds();
});

async function fetchFeeds() {
  const grid   = document.getElementById('events-grid');
  const loader = document.getElementById('events-loader');
  const empty  = document.getElementById('events-empty');
  const notices = document.getElementById('notices-list');

  loader.classList.remove('hidden'); 
  grid.innerHTML = ''; 
  empty.classList.add('hidden');

  const cat  = document.getElementById('cat-filter').value;
  const diff = document.getElementById('diff-filter').value;
  const q    = document.getElementById('search-filter').value;
  let query  = '?status=published';
  if (cat)  query += `&category=${encodeURIComponent(cat)}`;
  if (diff) query += `&difficulty=${encodeURIComponent(diff)}`;
  if (q)    query += `&search=${encodeURIComponent(q)}`;

  try {
    const [evRes, annRes] = await Promise.all([
      fetchAPI(`/events${query}`),
      fetchAPI('/students/announcements')
    ]);

    if (evRes.success && evRes.events.length) {
      grid.className = "flex flex-col gap-4";
      grid.innerHTML = evRes.events.map(e => `
        <div onclick="window.location.href='/event?id=${e._id}'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 group hover:border-[#3D56B2] dark:hover:border-gray-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">${e.category}</span>
              <span class="bg-gray-100 dark:bg-gray-700 text-[#1A1A1A] dark:text-gray-300 font-bold text-[9px] px-2.5 py-0.5 rounded-full">${e.difficulty}</span>
            </div>
            <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#3D56B2] transition-colors">${e.name}</h3>
            <p class="text-xs text-[#757575] dark:text-gray-400 line-clamp-2 leading-relaxed">${e.description}</p>
          </div>
          <div class="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 sm:border-l border-gray-100 dark:border-gray-700 sm:pl-6 text-[10px] text-[#757575] dark:text-gray-400 min-w-[120px]">
            <span class="flex items-center gap-1 font-semibold"><i data-lucide="clock" class="w-3 h-3"></i>${new Date(e.date).toLocaleDateString()}</span>
            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i>${e.venue?.building||''}</span>
            <span class="text-[#3D56B2] dark:text-[#5C7AEA] font-bold flex items-center gap-0.5">Open<i data-lucide="arrow-right" class="w-3.5 h-3.5"></i></span>
          </div>
        </div>`).join('');
    } else { 
      empty.classList.remove('hidden'); 
    }

    if (annRes.success && annRes.announcements.length) {
      notices.innerHTML = annRes.announcements.map(a => `
        <div class="p-3 bg-[#F4F6F9] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">${a.club ? a.club.name : 'University Global'}</span>
            <span class="text-[8px] text-[#757575] dark:text-gray-400 font-semibold">${new Date(a.createdAt).toLocaleDateString()}</span>
          </div>
          <h4 class="text-xs font-bold text-[#1A1A1A] dark:text-white leading-tight">${a.title}</h4>
          <p class="text-[10px] text-[#757575] dark:text-gray-300 mt-1 leading-normal">${a.content}</p>
        </div>`).join('');
    } else {
      notices.innerHTML = `<p class="text-xs text-[#757575] dark:text-gray-400 italic">No announcements posted today.</p>`;
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error('Failed to load feed:', err);
  } finally {
    loader.classList.add('hidden');
  }
}

function applyFilters() { fetchFeeds(); }
function resetFilters() {
  ['cat-filter','diff-filter','search-filter'].forEach(id => document.getElementById(id).value = '');
  fetchFeeds();
}

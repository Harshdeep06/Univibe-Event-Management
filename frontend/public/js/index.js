document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const searchVal = params.get('search');
  if (searchVal) {
    document.getElementById('search-filter').value = searchVal;
  }
  fetchFeeds();
});

async function fetchFeeds() {
  const eventsLoader = document.getElementById('events-loader');
  const eventsGrid = document.getElementById('events-grid');
  const eventsEmpty = document.getElementById('events-empty');
  const noticesList = document.getElementById('notices-list');

  eventsLoader.classList.remove('hidden');
  eventsGrid.innerHTML = '';
  eventsEmpty.classList.add('hidden');

  try {
    const cat = document.getElementById('cat-filter').value;
    const diff = document.getElementById('diff-filter').value;
    const search = document.getElementById('search-filter').value;

    let query = '?status=published';
    if (cat) query += `&category=${encodeURIComponent(cat)}`;
    if (diff) query += `&difficulty=${encodeURIComponent(diff)}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;

    const eventsRes = await fetchAPI(`/events${query}`);
    
    if (eventsRes.success && eventsRes.events.length > 0) {
      eventsGrid.className = "flex flex-col gap-4";
      eventsRes.events.forEach(event => {
        eventsGrid.innerHTML += `
          <div onclick="window.location.href='/event?id=${event._id}'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 group hover:border-[#3D56B2] dark:hover:border-gray-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2.5 py-0.5 rounded font-bold uppercase tracking-wide">${event.category}</span>
                <span class="bg-gray-100 dark:bg-gray-700 text-[#1A1A1A] dark:text-gray-300 font-bold text-[9px] px-2.5 py-0.5 rounded-full">${event.difficulty}</span>
              </div>
              <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#3D56B2] transition-colors">${event.name}</h3>
              <p class="text-xs text-[#757575] dark:text-gray-400 line-clamp-2 leading-relaxed">${event.description}</p>
            </div>
            <div class="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 sm:border-l border-gray-100 dark:border-gray-700 sm:pl-6 text-[10px] text-[#757575] dark:text-gray-400 min-w-[120px]">
              <span class="flex items-center gap-1 font-semibold">
                <i data-lucide="clock" class="w-3 h-3"></i>
                ${new Date(event.date).toLocaleDateString()}
              </span>
              <span class="flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3 h-3"></i>
                ${event.venue?.building || ''}
              </span>
              <span class="text-[#3D56B2] dark:text-[#5C7AEA] font-bold flex items-center gap-0.5">
                Open
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </span>
            </div>
          </div>
        `;
      });
    } else {
      eventsEmpty.classList.remove('hidden');
    }

    const annRes = await fetchAPI('/students/announcements');
    if (annRes.success && annRes.announcements.length > 0) {
      noticesList.innerHTML = '';
      annRes.announcements.forEach(ann => {
        noticesList.innerHTML += `
          <div class="p-3 bg-[#F4F6F9] dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                ${ann.club ? ann.club.name : 'University Global'}
              </span>
              <span class="text-[8px] text-[#757575] dark:text-gray-400 font-semibold">
                ${new Date(ann.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4 class="text-xs font-bold text-[#1A1A1A] dark:text-white leading-tight">${ann.title}</h4>
            <p class="text-[10px] text-[#757575] dark:text-gray-300 mt-1 leading-normal">${ann.content}</p>
          </div>
        `;
      });
    } else {
      noticesList.innerHTML = `<p class="text-xs text-[#757575] dark:text-gray-400 italic">No announcements posted today.</p>`;
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Failed to load portal feed:', err);
  } finally {
    eventsLoader.classList.add('hidden');
  }
}

function applyFilters() {
  fetchFeeds();
}

function resetFilters() {
  document.getElementById('cat-filter').value = '';
  document.getElementById('diff-filter').value = '';
  document.getElementById('search-filter').value = '';
  fetchFeeds();
}

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = checkAuth('student');
  if (!currentUser) return;

  await loadDashboardStats();
  await loadTimelineEvents();
  await loadCertificates();
  await loadBookmarks();
  await loadLeaderboard();
});

async function loadDashboardStats() {
  const loader = document.getElementById('student-loader');
  const content = document.getElementById('dashboard-content');

  try {
    const res = await fetchAPI('/students/dashboard');
    if (res.success) {
      
      document.getElementById('stat-registered').innerText = res.stats.registeredEvents;
      document.getElementById('stat-attended').innerText = res.stats.attendedEvents;
      document.getElementById('stat-points').innerText = res.stats.rewardPoints;
      document.getElementById('stat-certs').innerText = res.stats.certificates;

      
      const badgesContainer = document.getElementById('badges-container');
      const badgesEmpty = document.getElementById('badges-empty');
      badgesContainer.innerHTML = '';
      if (res.stats.badges && res.stats.badges.length > 0) {
        badgesEmpty.classList.add('hidden');
        res.stats.badges.forEach(b => {
          badgesContainer.innerHTML += `
            <span class="bg-[#E0E5F5] text-[#3D56B2] border border-[#CBD5E1] px-3 py-1.5 rounded-full text-[10px] font-bold">
              🏆 ${b}
            </span>
          `;
        });
      } else {
        badgesEmpty.classList.remove('hidden');
      }

      
      const banner = document.getElementById('upcoming-banner-container');
      if (res.nextEvent) {
        banner.innerHTML = `
          <div class="bg-[#3D56B2] text-white p-6 rounded-[24px] shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div class="absolute right-[-20px] bottom-[-20px] w-64 h-64 rounded-full bg-[#5C7AEA] opacity-[0.25] blur-2xl"></div>
            <div class="relative z-10">
              <span class="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">Upcoming event schedule</span>
              <h2 class="text-2xl font-bold mt-4 leading-tight">${res.nextEvent.name}</h2>
              <div class="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#E5E7EB]">
                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${new Date(res.nextEvent.date).toLocaleDateString()}</span>
                <span>|</span>
                <span>Venue: ${res.nextEvent.venue?.building} Block, Room ${res.nextEvent.venue?.room}</span>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-between relative z-10">
              <button onclick="window.location.href='/event?id=${res.nextEvent._id}'" class="bg-white text-[#3D56B2] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center gap-1 transition-all">
                View Details & Ticket <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
              </button>
              <span class="text-[10px] text-white/70 italic font-medium">Be on time! Late entry is logged.</span>
            </div>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div class="bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center py-10">
            <i data-lucide="calendar" class="text-[#3D56B2] mb-3 w-8 h-8"></i>
            <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white">No registrations scheduled</h3>
            <p class="text-xs text-[#757575] mt-1 max-w-xs dark:text-gray-400">You have no upcoming event registers this week. Browse activities now.</p>
            <button onclick="window.location.href='/'" class="mt-4 px-4 py-2 bg-[#3D56B2] text-white text-xs font-semibold rounded-xl hover:bg-[#2C3E8A] transition-all">Explore Events Portal</button>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('Failed to load student stats:', err);
  } finally {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function loadTimelineEvents() {
  const timeline = document.getElementById('timeline-list');
  const empty = document.getElementById('timeline-empty');
  timeline.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const res = await fetchAPI('/students/calendar');
    if (res.success && res.events.length > 0) {
      res.events.forEach(event => {
        timeline.innerHTML += `
          <div class="relative group">
            <div class="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-[#3D56B2] group-hover:bg-[#3D56B2] transition-all"></div>
            <div onclick="window.location.href='/event?id=${event._id}'" class="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all border border-transparent hover:border-gray-200">
              <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">${event.category}</span>
              <h3 class="text-sm font-bold text-[#1A1A1A] dark:text-white mt-2 group-hover:text-[#3D56B2] transition-colors">${event.name}</h3>
              <div class="flex items-center gap-4 text-[10px] text-[#757575] dark:text-gray-400 mt-2">
                <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${new Date(event.date).toLocaleDateString()}</span>
                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${event.time}</span>
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${event.venue?.building}</span>
              </div>
            </div>
          </div>
        `;
      });
    } else {
      empty.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load timeline events:', err);
  }
}

async function loadCertificates() {
  const grid = document.getElementById('certs-grid');
  const empty = document.getElementById('certs-empty');
  grid.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const res = await fetchAPI('/students/certificates');
    if (res.success && res.certificates.length > 0) {
      res.certificates.forEach((c, idx) => {
        
        const certString = encodeURIComponent(JSON.stringify(c));
        grid.innerHTML += `
          <div class="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <i data-lucide="award" class="text-[#3D56B2] w-7 h-7"></i>
              <div>
                <h4 class="font-bold text-[#1A1A1A] dark:text-white truncate max-w-[150px]">${c.event?.name}</h4>
                <p class="text-[10px] text-[#757575] mt-0.5">ID: ${c.certificateId}</p>
              </div>
            </div>
            <button onclick="downloadCertificate('${certString}')" class="p-2 bg-[#E0E5F5] hover:bg-[#CBD5E1] text-[#3D56B2] rounded-lg transition-colors">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
      });
    } else {
      empty.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load certs:', err);
  }
}

function downloadCertificate(encodedCert) {
  const cert = JSON.parse(decodeURIComponent(encodedCert));
  const canvas = document.getElementById('cert-download-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 600;

  
  const grad = ctx.createLinearGradient(0, 0, 800, 600);
  grad.addColorStop(0, '#3D56B2');
  grad.addColorStop(1, '#5C7AEA');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 600);

  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(20, 20, 760, 560);

  
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF PARTICIPATION', 400, 110);

  
  ctx.font = 'normal 14px Arial, sans-serif';
  ctx.fillStyle = '#757575';
  ctx.fillText('This is to certify that student', 400, 180);

  
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillStyle = '#3D56B2';
  ctx.fillText(currentUser?.name || 'Gurpreet Singh', 400, 245);

  
  ctx.font = 'normal 14px Arial, sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(`successfully completed the event:`, 400, 305);

  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(`"${cert.event?.name}"`, 400, 345);

  ctx.font = 'normal 12px Arial, sans-serif';
  ctx.fillStyle = '#757575';
  ctx.fillText(`organized by ${cert.club?.name || 'UNIVIBE Club'} on ${new Date(cert.event?.date).toLocaleDateString()}`, 400, 385);

  
  ctx.fillText('Faculty Coordinator Signature', 400, 480);
  ctx.beginPath();
  ctx.moveTo(300, 490);
  ctx.lineTo(500, 490);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#757575';
  ctx.stroke();

  ctx.fillText(`Verification ID: ${cert.certificateId}`, 400, 530);

  
  const link = document.createElement('a');
  link.download = `UNIVIBE-Certificate-${cert.certificateId}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

async function loadBookmarks() {
  const grid = document.getElementById('bookmarks-grid');
  const empty = document.getElementById('bookmarks-empty');
  grid.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const res = await fetchAPI('/auth/me');
    if (res.success && res.profile && res.profile.bookmarks && res.profile.bookmarks.length > 0) {
      res.profile.bookmarks.forEach(event => {
        grid.innerHTML += `
          <div onclick="window.location.href='/event?id=${event._id}'" class="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-100 transition-all cursor-pointer flex justify-between items-start">
            <div>
              <span class="text-[9px] bg-[#E0E5F5] text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase tracking-wide">${event.category}</span>
              <h3 class="font-bold text-[#1A1A1A] dark:text-white mt-2 leading-tight line-clamp-1 truncate max-w-[150px]">${event.name}</h3>
              <div class="flex items-center gap-3 text-[10px] text-[#757575] dark:text-gray-400 mt-2">
                <span class="flex items-center gap-0.5"><i data-lucide="clock" class="w-3 h-3"></i> ${new Date(event.date).toLocaleDateString()}</span>
                <span class="flex items-center gap-0.5"><i data-lucide="map-pin" class="w-3 h-3"></i> ${event.venue?.building}</span>
              </div>
            </div>
            <i data-lucide="bookmark" class="text-[#3D56B2] w-4.5 h-4.5 fill-current"></i>
          </div>
        `;
      });
    } else {
      empty.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Failed to load bookmarks:', err);
  }
}

async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '';

  try {
    const res = await fetchAPI('/students/leaderboard');
    if (res.success && res.leaderboard.length > 0) {
      res.leaderboard.forEach((item, idx) => {
        const isCurrentUser = item.user?._id === currentUser?.id;
        list.innerHTML += `
          <div class="flex items-center justify-between p-2 rounded-xl transition-all ${
            isCurrentUser ? 'bg-[#EFEFEF] dark:bg-gray-700 font-semibold' : ''
          }">
            <div class="flex items-center gap-3">
              <span class="w-5 text-xs text-center font-bold ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-[#757575]' }">
                #${idx + 1}
              </span>
              <div class="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-600 flex items-center justify-center font-bold text-xs uppercase text-[#3D56B2] dark:text-white">
                ${item.user?.name.charAt(0)}
              </div>
              <div>
                <h4 class="text-xs text-[#1A1A1A] dark:text-white truncate max-w-[120px]">${item.user?.name}</h4>
                <span class="text-[9px] text-[#757575] dark:text-gray-400">${item.department}</span>
              </div>
            </div>
            <span class="text-xs font-extrabold text-[#3D56B2] dark:text-white">${item.rewardPoints} pts</span>
          </div>
        `;
      });
    }
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
}

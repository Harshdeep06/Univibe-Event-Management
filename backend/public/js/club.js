// ─── Club admin dashboard ─────────────────────────────────────────────────────
let currentClub = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth('club_admin')) return;
  await loadClubProfile();
});

async function loadClubProfile() {
  const loader  = document.getElementById('club-loader');
  const content = document.getElementById('club-content');
  try {
    const res = await fetchAPI('/auth/me');
    if (res.success && res.profile) {
      currentClub = res.profile;
      document.getElementById('club-initial').innerText          = currentClub.name.charAt(0);
      document.getElementById('club-title-banner').innerText     = currentClub.name;
      document.getElementById('club-head-banner').innerText = `Club Head: ${res.user.name} (${res.user.email})`;
      await loadRosters();
      await loadSentAnnouncements();
    }
  } catch(err) { console.error('Club load error:', err); }
  finally { loader.classList.add('hidden'); content.classList.remove('hidden'); lucide?.createIcons(); }
}

async function loadRosters() {
  const reqList  = document.getElementById('requests-list');
  const reqEmpty = document.getElementById('requests-empty');
  const memList  = document.getElementById('members-list');
  const memEmpty = document.getElementById('members-empty');
  reqList.innerHTML = memList.innerHTML = '';
  reqEmpty.classList.add('hidden'); memEmpty.classList.add('hidden');

  try {
    const [reqsRes, memRes, evReqsRes] = await Promise.all([
      fetchAPI(`/clubs/${currentClub._id}/requests`),
      fetchAPI(`/clubs/${currentClub._id}/members`),
      fetchAPI(`/clubs/${currentClub._id}/event-requests`)
    ]);

    if (reqsRes.success) {
      document.getElementById('stat-requests').innerText          = reqsRes.requests.length;
      document.getElementById('requests-badge-count').innerText   = reqsRes.requests.length;
      if (reqsRes.requests.length) {
        reqList.innerHTML = reqsRes.requests.map(r => `
          <div class="py-3 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-[#1A1A1A] dark:text-white">${r.student?.user?.name}</h4>
              <p class="text-[10px] text-[#757575] mt-0.5">Roll: ${r.student?.rollNumber} | ${r.student?.department}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="resolveRequest('${r._id}','approve')" class="p-1.5 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 font-semibold text-[10px]"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve</button>
              <button onclick="resolveRequest('${r._id}','reject')"  class="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 font-semibold text-[10px]"><i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject</button>
            </div>
          </div>`).join('<hr class="border-gray-100 dark:border-gray-700">');
      } else { reqEmpty.classList.remove('hidden'); }
    }

    if (memRes.success) {
      document.getElementById('stat-members').innerText = memRes.members.length;
      if (memRes.members.length) {
        memList.innerHTML = memRes.members.map(m => `
          <div class="flex items-center gap-3 py-1">
            <div class="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-[#3D56B2] uppercase">${m.student?.user?.name.charAt(0)}</div>
            <div>
              <h4 class="font-bold text-[#1A1A1A] dark:text-white">${m.student?.user?.name}</h4>
              <p class="text-[9px] text-[#757575] mt-0.5">${m.student?.rollNumber} • ${m.student?.department}</p>
            </div>
          </div>`).join('');
      } else { memEmpty.classList.remove('hidden'); }
    }

    const evReqList = document.getElementById('event-requests-list');
    const evReqEmpty = document.getElementById('event-requests-empty');
    evReqList.innerHTML = '';
    evReqEmpty.classList.add('hidden');

    if (evReqsRes.success) {
      document.getElementById('event-requests-badge-count').innerText = evReqsRes.requests.length;
      if (evReqsRes.requests.length) {
        evReqList.innerHTML = evReqsRes.requests.map(r => `
          <div class="py-3 flex items-center justify-between">
            <div>
              <span class="text-[9px] bg-blue-50 text-[#3D56B2] px-1.5 py-0.5 rounded font-bold uppercase">${r.event?.name}</span>
              <h4 class="font-bold text-[#1A1A1A] dark:text-white mt-1">${r.student?.user?.name}</h4>
              <p class="text-[9px] text-[#757575] mt-0.5">Roll: ${r.student?.rollNumber} | Branch: ${r.student?.department}</p>
            </div>
            <div class="flex gap-2">
              <button onclick="resolveEventReq('${r.event?._id}', '${r._id}', 'approve')" class="p-1.5 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 font-semibold text-[10px]"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve</button>
              <button onclick="resolveEventReq('${r.event?._id}', '${r._id}', 'reject')"  class="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 font-semibold text-[10px]"><i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject</button>
            </div>
          </div>`).join('<hr class="border-gray-100 dark:border-gray-700">');
      } else { evReqEmpty.classList.remove('hidden'); }
    }

    lucide?.createIcons();
  } catch(err) { console.error('Roster load error:', err); }
}

async function resolveEventReq(eventId, regId, action) {
  try {
    const res = await fetchAPI(`/events/${eventId}/registrations/${regId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    if (res.success) {
      alert(`Registration request ${action}d!`);
      await loadRosters();
    }
  } catch(err) { alert(err.message || 'Failed to resolve registration'); }
}

async function resolveRequest(id, action) {
  try {
    const res = await fetchAPI(`/clubs/${currentClub._id}/requests/${id}`, { method:'POST', body:JSON.stringify({action}) });
    if (res.success) { alert(`Request ${action}d!`); await loadRosters(); }
  } catch(err) { alert(err.message||'Failed'); }
}

async function handlePostNotice(e) {
  e.preventDefault();
  const btn = document.getElementById('notice-submit-btn');
  btn.disabled = true; btn.innerText = 'Publishing...';
  try {
    const res = await fetchAPI(`/clubs/${currentClub._id}/announcements`, {
      method:'POST',
      body: JSON.stringify({ title: document.getElementById('notice-title').value, content: document.getElementById('notice-content').value })
    });
    if (res.success) {
      alert('Announcement published!');
      document.getElementById('notice-title').value = '';
      document.getElementById('notice-content').value = '';
      await loadSentAnnouncements();
    }
  } catch(err) { alert(err.message||'Failed'); }
  finally { btn.disabled=false; btn.innerText='Send Notice'; }
}

async function handleProposeEvent(e) {
  e.preventDefault();
  const btn = document.getElementById('ev-submit-btn');
  btn.disabled=true; btn.innerText='Submitting...';
  const get = id => document.getElementById(id).value;
  try {
    const res = await fetchAPI('/events', {
      method:'POST',
      body: JSON.stringify({
        name: get('ev-name'), description: get('ev-desc'),
        category: get('ev-cat'), difficulty: get('ev-diff'),
        organizerClubId: currentClub._id,
        building: get('ev-building'), room: get('ev-room'),
        date: new Date(get('ev-date')), time: get('ev-time'),
        registrationDeadline: new Date(get('ev-date')),
        maxParticipants: Number(get('ev-capacity'))
      })
    });
    if (res.success) {
      alert('Event proposed! Awaiting Super Admin approval.');
      ['ev-name','ev-desc','ev-building','ev-room','ev-date','ev-time'].forEach(id=>document.getElementById(id).value='');
    }
  } catch(err) { alert(err.message||'Failed'); }
  finally { btn.disabled=false; btn.innerText='Propose Event'; }
}

async function loadSentAnnouncements() {
  const listEl = document.getElementById('club-announcements-list');
  if (!listEl || !currentClub) return;
  try {
    const res = await fetchAPI('/students/announcements');
    if (res.success && res.announcements) {
      const myAnnouncements = res.announcements.filter(a => a.club?._id === currentClub._id);
      if (myAnnouncements.length > 0) {
        listEl.innerHTML = myAnnouncements.map(a => `
          <div class="p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-[#1A1A1A] dark:text-white text-[10px]">${a.title}</span>
              <span class="text-[8px] text-[#757575]">${new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
            <p class="text-[9px] text-[#757575] dark:text-gray-300 leading-relaxed">${a.content}</p>
          </div>
        `).join('');
      } else {
        listEl.innerHTML = '<p class="text-[10px] text-[#757575] italic text-center py-2">No announcements sent.</p>';
      }
    }
  } catch (err) {
    console.error('Failed to load sent announcements:', err);
    listEl.innerHTML = '<p class="text-red-500 text-[10px] italic text-center py-2">Failed to load announcements.</p>';
  }
}

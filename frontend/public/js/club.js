let currentClub = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('club_admin');
  if (!user) return;

  
  await loadClubProfile();
});

async function loadClubProfile() {
  const loader = document.getElementById('club-loader');
  const content = document.getElementById('club-content');

  try {
    const res = await fetchAPI('/auth/me');
    if (res.success && res.profile) {
      currentClub = res.profile;

      
      document.getElementById('club-initial').innerText = currentClub.name.charAt(0);
      document.getElementById('club-title-banner').innerText = currentClub.name;
      document.getElementById('club-coordinator-banner').innerText = `Faculty Coordinator: ${currentClub.facultyCoordinator}`;

      
      await loadRequestsAndMembers();
    }
  } catch (err) {
    console.error('Failed to load club profile details:', err);
  } finally {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function loadRequestsAndMembers() {
  const requestsList = document.getElementById('requests-list');
  const requestsEmpty = document.getElementById('requests-empty');
  const membersList = document.getElementById('members-list');
  const membersEmpty = document.getElementById('members-empty');

  requestsList.innerHTML = '';
  requestsEmpty.classList.add('hidden');
  membersList.innerHTML = '';
  membersEmpty.classList.add('hidden');

  try {
    
    const reqsRes = await fetchAPI(`/clubs/${currentClub._id}/requests`);
    if (reqsRes.success) {
      document.getElementById('stat-requests').innerText = reqsRes.requests.length;
      document.getElementById('requests-badge-count').innerText = reqsRes.requests.length;
      
      if (reqsRes.requests.length > 0) {
        reqsRes.requests.forEach(r => {
          requestsList.innerHTML += `
            <div class="py-3 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-[#1A1A1A] dark:text-white">${r.student?.user?.name}</h4>
                <p class="text-[10px] text-[#757575] dark:text-gray-400 mt-0.5">Roll No: ${r.student?.rollNumber} | Branch: ${r.student?.department}</p>
              </div>
              <div class="flex gap-2">
                <button onclick="resolveRequest('${r._id}', 'approve')" class="p-1.5 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 font-semibold text-[10px]">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve
                </button>
                <button onclick="resolveRequest('${r._id}', 'reject')" class="p-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 font-semibold text-[10px]">
                  <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject
                </button>
              </div>
            </div>
          `;
        });
      } else {
        requestsEmpty.classList.remove('hidden');
      }
    }

    
    const membersRes = await fetchAPI(`/clubs/${currentClub._id}/members`);
    if (membersRes.success) {
      document.getElementById('stat-members').innerText = membersRes.members.length;
      
      if (membersRes.members.length > 0) {
        membersRes.members.forEach(m => {
          membersList.innerHTML += `
            <div class="flex items-center gap-3 py-1">
              <div class="w-8 h-8 rounded-full bg-[#EFEFEF] dark:bg-gray-700 flex items-center justify-center font-bold text-xs text-[#3D56B2] uppercase">
                ${m.student?.user?.name.charAt(0)}
              </div>
              <div>
                <h4 class="font-bold text-[#1A1A1A] dark:text-white">${m.student?.user?.name}</h4>
                <p class="text-[9px] text-[#757575] dark:text-gray-400 mt-0.5">${m.student?.rollNumber} • ${m.student?.department}</p>
              </div>
            </div>
          `;
        });
      } else {
        membersEmpty.classList.remove('hidden');
      }
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error('Failed to load rosters list:', err);
  }
}

async function resolveRequest(requestId, action) {
  try {
    const res = await fetchAPI(`/clubs/${currentClub._id}/requests/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    
    if (res.success) {
      alert(`Request successfully ${action}d!`);
      await loadRequestsAndMembers();
    }
  } catch (err) {
    alert(err.message || 'Failed to update request');
  }
}

async function handlePostNotice(e) {
  e.preventDefault();
  const title = document.getElementById('notice-title').value;
  const content = document.getElementById('notice-content').value;

  const btn = document.getElementById('notice-submit-btn');
  btn.disabled = true;
  btn.innerText = 'Publishing...';

  try {
    const res = await fetchAPI(`/clubs/${currentClub._id}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ title, content })
    });

    if (res.success) {
      alert('Announcement published and emailed successfully!');
      document.getElementById('notice-title').value = '';
      document.getElementById('notice-content').value = '';
    }
  } catch (err) {
    alert(err.message || 'Failed to post Notice');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Send Notice';
  }
}

async function handleProposeEvent(e) {
  e.preventDefault();
  const name = document.getElementById('ev-name').value;
  const description = document.getElementById('ev-desc').value;
  const category = document.getElementById('ev-cat').value;
  const difficulty = document.getElementById('ev-diff').value;
  const building = document.getElementById('ev-building').value;
  const room = document.getElementById('ev-room').value;
  const date = document.getElementById('ev-date').value;
  const time = document.getElementById('ev-time').value;
  const maxParticipants = document.getElementById('ev-capacity').value;

  const btn = document.getElementById('ev-submit-btn');
  btn.disabled = true;
  btn.innerText = 'Submitting Proposal...';

  try {
    const res = await fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        category,
        difficulty,
        organizerClubId: currentClub._id,
        building,
        room,
        date: new Date(date),
        time,
        registrationDeadline: new Date(date), 
        maxParticipants: Number(maxParticipants)
      })
    });

    if (res.success) {
      alert('Event Proposal submitted! Super Admin must approve it before publication.');
      document.getElementById('ev-name').value = '';
      document.getElementById('ev-desc').value = '';
      document.getElementById('ev-building').value = '';
      document.getElementById('ev-room').value = '';
      document.getElementById('ev-date').value = '';
      document.getElementById('ev-time').value = '';
    }
  } catch (err) {
    alert(err.message || 'Failed to propose event');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Propose Event';
  }
}

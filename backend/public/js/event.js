// ─── Event detail page ────────────────────────────────────────────────────────
let eventId = null, currentEvent = null, currentRegistration = null, currentStudentId = null, currentRating = 5;

document.addEventListener('DOMContentLoaded', async () => {
  eventId = new URLSearchParams(window.location.search).get('id');
  if (!eventId) { window.location.href = '/'; return; }
  await loadEventDetails();
});

async function loadEventDetails() {
  const loader  = document.getElementById('event-loader');
  const content = document.getElementById('event-content');
  try {
    const res = await fetchAPI(`/events/${eventId}`);
    if (!res.success) return;
    currentEvent = res.event;

    // Populate basic fields
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('event-title',       currentEvent.name);
    set('event-category-tag',currentEvent.category);
    set('event-club',        `Host Club: ${currentEvent.organizerClub?.name}`);
    set('event-desc',        currentEvent.description);
    set('detail-date',       `${new Date(currentEvent.date).toLocaleDateString()} at ${currentEvent.time}`);
    set('detail-venue',      `${currentEvent.venue?.building} • ${currentEvent.venue?.room}`);
    set('detail-certs',      `${currentEvent.category} Badge`);
    set('venue-maps-coords', `📍 Venue Map: ${currentEvent.venue?.building} Block, Room ${currentEvent.venue?.room}`);

    if (currentEvent.posterUrl) {
      document.getElementById('event-poster').src = currentEvent.posterUrl;
      document.getElementById('event-poster-container').classList.remove('hidden');
    }

    // Rules & Prizes
    const populateList = (boxId, listId, items) => {
      if (items?.length) {
        document.getElementById(boxId).classList.remove('hidden');
        document.getElementById(listId).innerHTML = items.map(i=>`<li>${i}</li>`).join('');
      }
    };
    populateList('rules-box','rules-list', currentEvent.rules);
    populateList('prizes-box','prizes-list', currentEvent.prizes);

    // Feedback
    const feedbackCountEl = document.getElementById('feedback-count');
    if (feedbackCountEl) {
      feedbackCountEl.innerText = res.feedback?.length || 0;
      const fl = document.getElementById('feedback-list');
      const fe = document.getElementById('feedback-empty');
      if (res.feedback?.length) {
        fe.classList.add('hidden');
        fl.innerHTML = res.feedback.map(rev=>{
          const stars = [1,2,3,4,5].map(i=>`<i data-lucide="star" class="${i<=rev.rating?'fill-current':''} w-3 h-3 text-yellow-500"></i>`).join('');
          return `<div class="py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-center mb-1">
              <span class="font-bold text-[#1A1A1A] dark:text-white">${rev.student?.user?.name||'Anonymous'}</span>
              <div class="flex gap-0.5">${stars}</div>
            </div>
            <p class="text-[#757575] dark:text-gray-300">${rev.comment}</p>
          </div>`;
        }).join('');
      } else { fe.classList.remove('hidden'); }
    }

    await setupUserActions();
  } catch(err) { console.error('Event load error:', err); }
  finally { loader.classList.add('hidden'); content.classList.remove('hidden'); lucide?.createIcons(); }
}

async function setupUserActions() {
  const token   = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');
  ['student-actions-block','organizer-actions-block','unauth-actions-block'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  if (!token || !userJson) { document.getElementById('unauth-actions-block').classList.remove('hidden'); return; }
  const user = JSON.parse(userJson);
  const isOrg = user.role==='super_admin' || (user.role==='club_admin' && currentEvent.organizerClub?.clubHead===user.id);
  if (isOrg) {
    document.getElementById('organizer-actions-block').classList.remove('hidden');
  } else if (user.role==='student') {
    document.getElementById('student-actions-block').classList.remove('hidden');
    try {
      const meRes  = await fetchAPI('/auth/me');
      if (meRes.success && meRes.profile) {
        currentStudentId = meRes.profile._id;
        const isBookmarked = meRes.profile.bookmarks?.some(b => (b._id || b) === eventId);
        updateBookmarkUI(isBookmarked);

        const regsRes = await fetchAPI(`/events/${eventId}/registrations`);
        if (regsRes.success) updateRegistrationUI(regsRes.registrations.find(r=>r.student?._id===currentStudentId));
      }
    } catch(err) { console.error('Registration check error:', err); }
  }
}

function updateRegistrationUI(reg) {
  currentRegistration = reg;
  ['status-unregistered','status-pending','status-registered','status-attended','feedback-form'].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (!reg || reg.status==='cancelled') {
    const el = document.getElementById('status-unregistered');
    if (el) el.classList.remove('hidden');
  } else if (reg.status==='pending') {
    const el = document.getElementById('status-pending');
    if (el) el.classList.remove('hidden');
  } else if (reg.status==='registered') {
    const el = document.getElementById('status-registered');
    if (el) el.classList.remove('hidden');
    const label = document.getElementById('ticket-code-label');
    if (label) label.innerText = reg.ticketCode;
    const resolverLabel = document.getElementById('ticket-resolved-by');
    if (resolverLabel) {
      resolverLabel.innerText = reg.resolvedByName ? `Accepted by ${reg.resolvedByName}` : 'Accepted by Admin';
    }
  } else if (reg.status==='attended') {
    const el = document.getElementById('status-attended');
    if (el) el.classList.remove('hidden');
    const form = document.getElementById('feedback-form');
    if (form) form.classList.remove('hidden');
    setStarRating(5);
  }
}

async function handleRegister() {
  const btn = document.getElementById('btn-register');
  btn.disabled=true; btn.innerText='Reserving...';
  try { const r=await fetchAPI(`/events/${eventId}/register`,{method:'POST'}); if(r.success){alert('Ticket reserved!');await loadEventDetails();} }
  catch(e){alert(e.message||'Failed');}
  finally{btn.disabled=false;btn.innerText='Register & Get Ticket';}
}

async function handleCancel() {
  if (!confirm('Cancel your ticket?')) return;
  try { const r=await fetchAPI(`/events/${eventId}/cancel`,{method:'POST'}); if(r.success){alert('Cancelled.');await loadEventDetails();} }
  catch(e){alert(e.message||'Failed');}
}

async function handleCheckin(e) {
  e.preventDefault();
  const code    = document.getElementById('scan-ticket-input').value.trim();
  const statusBox = document.getElementById('checkin-status-box');
  const btn     = document.getElementById('scan-submit-btn');
  statusBox.classList.add('hidden'); btn.disabled=true; btn.innerText='Logging...';
  try {
    const res = await fetchAPI(`/events/${eventId}/mark-attendance`,{method:'POST',body:JSON.stringify({ticketCode:code})});
    statusBox.innerHTML = `Check-in Success! ${res.studentName} — +${res.rewardPoints} pts granted.`;
    statusBox.className = 'p-3 rounded-xl border bg-green-50 text-green-700 border-green-100';
    document.getElementById('scan-ticket-input').value='';
  } catch(err) {
    statusBox.innerText = err.message||'Check-in failed';
    statusBox.className = 'p-3 rounded-xl border bg-red-50 text-red-600 border-red-100';
  } finally { statusBox.classList.remove('hidden'); btn.disabled=false; btn.innerText='Mark Present'; }
}

function setStarRating(rating) {
  currentRating = rating;
  document.querySelectorAll('#star-rating button i').forEach((star,i)=>star.classList.toggle('fill-current',i<rating));
}

async function handlePostFeedback(e) {
  e.preventDefault();
  const btn = document.getElementById('feedback-submit-btn');
  btn.disabled=true; btn.innerText='Posting...';
  try {
    const res = await fetchAPI(`/events/${eventId}/feedback`,{method:'POST',body:JSON.stringify({rating:currentRating,comment:document.getElementById('feedback-comment').value})});
    if(res.success){alert('Review posted!');document.getElementById('feedback-comment').value='';await loadEventDetails();}
  } catch(err){alert(err.message||'Failed');}
  finally{btn.disabled=false;btn.innerText='Post Review';}
}



let currentBookmarkedState = false;

function updateBookmarkUI(isBookmarked) {
  currentBookmarkedState = isBookmarked;
  const textEl = document.getElementById('bookmark-text');
  const iconEl = document.getElementById('bookmark-icon');
  const btnEl = document.getElementById('btn-bookmark');
  if (!textEl || !iconEl || !btnEl) return;

  if (isBookmarked) {
    textEl.innerText = 'Bookmarked';
    btnEl.classList.remove('bg-gray-50', 'text-[#3D56B2]');
    btnEl.classList.add('bg-[#3D56B2]', 'text-white', 'hover:bg-[#2C3E8A]');
    iconEl.classList.add('fill-current');
  } else {
    textEl.innerText = 'Bookmark Event';
    btnEl.classList.remove('bg-[#3D56B2]', 'text-white', 'hover:bg-[#2C3E8A]');
    btnEl.classList.add('bg-gray-50', 'text-[#3D56B2]');
    iconEl.classList.remove('fill-current');
  }
  lucide?.createIcons();
}

async function handleToggleBookmark() {
  const btn = document.getElementById('btn-bookmark');
  btn.disabled = true;
  try {
    const res = await fetchAPI(`/students/bookmarks/${eventId}`, { method: 'POST' });
    if (res.success) {
      updateBookmarkUI(res.bookmarked);
    }
  } catch (err) {
    alert(err.message || 'Failed to toggle bookmark');
  } finally {
    btn.disabled = false;
  }
}

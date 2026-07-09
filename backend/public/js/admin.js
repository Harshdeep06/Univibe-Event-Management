// ─── Admin dashboard ─────────────────────────────────────────────────────────
let statsChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth('super_admin')) return;
  await loadAdminDashboard();
});

async function loadAdminDashboard() {
  const loader  = document.getElementById('admin-loader');
  const content = document.getElementById('admin-content');
  try {
    const res = await fetchAPI('/admin/stats');
    if (res.success) {
      ['students','clubs','events','regs'].forEach((k,i) => {
        document.getElementById(`stat-${k}-count`).innerText =
          [res.stats.totalStudents, res.stats.totalClubs, res.stats.totalEvents, res.stats.totalRegistrations][i];
      });
      document.getElementById('quick-active-club').innerText    = res.stats.activeClub;
      document.getElementById('quick-active-student').innerText = res.stats.activeStudent;
      renderChart(res.chartData);
    }
    await Promise.all([loadPendingEvents(), loadPendingClubHeads(), loadClubsList(), loadStudentsList(), loadAdminEventsSelect(), loadVerifiedHeadsOptions(), loadSentAnnouncements(), loadEventsManager()]);
  } catch (err) { console.error('Admin load error:', err); }
  finally { loader.classList.add('hidden'); content.classList.remove('hidden'); lucide?.createIcons(); }
}

function renderChart(data) {
  const ctx = document.getElementById('admin-chart-canvas').getContext('2d');
  if (statsChart) statsChart.destroy();
  statsChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: data.map(d=>d.month), datasets:[{ label:'Registrations', data: data.map(d=>d.count), backgroundColor:'#3D56B2', borderRadius:6, borderSkipped:false }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ display:false } }, y:{ ticks:{ precision:0 } } } }
  });
}

async function loadPendingEvents() {
  const list  = document.getElementById('pending-events-list');
  const empty = document.getElementById('pending-events-empty');
  list.innerHTML = ''; empty.classList.add('hidden');
  const res = await fetchAPI('/admin/events/pending');
  if (res.success) {
    document.getElementById('approvals-badge-count').innerText = res.events.length;
    if (res.events.length) {
      list.innerHTML = res.events.map(e => `
        <div class="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span class="text-[9px] bg-[#EFEFEF] dark:bg-gray-700 text-[#757575] px-2 py-0.5 rounded font-bold">${e.category}</span>
            <h4 class="font-bold text-[#1A1A1A] dark:text-white mt-1.5">${e.name}</h4>
            <p class="text-[10px] text-[#757575] mt-0.5">Club: ${e.organizerClub?.name} | ${new Date(e.date).toLocaleDateString()}</p>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button onclick="resolveEvent('${e._id}','approve')" class="flex-1 sm:flex-none py-1.5 px-3 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center justify-center gap-1 font-semibold">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Publish</button>
            <button onclick="resolveEvent('${e._id}','reject')" class="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center justify-center gap-1 font-semibold">
              <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject</button>
          </div>
        </div>`).join('<hr class="border-gray-100 dark:border-gray-700">');
    } else { empty.classList.remove('hidden'); }
  }
}

async function resolveEvent(id, action) {
  try {
    const res = await fetchAPI(`/events/${id}`, { method:'PUT', body: JSON.stringify({ status: action==='approve'?'published':'cancelled' }) });
    if (res.success) { alert(`Event ${action}d.`); await loadAdminDashboard(); }
  } catch (err) { alert(err.message||'Failed'); }
}

async function loadClubsList() {
  const body = document.getElementById('clubs-list-body');
  body.innerHTML = '';
  const res = await fetchAPI('/clubs');
  if (res.success) {
    allClubs = res.clubs;
    body.innerHTML = res.clubs.map(c => `
      <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
        <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">${c.name}</td>
        <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${c.clubHead?.name || 'No Assignee'}</td>
        <td class="py-3 pr-4 text-[#757575] dark:text-gray-300 font-semibold">${c.clubHead?.email || '—'}</td>
        <td class="py-3 pr-4 text-center font-semibold">${c.membersCount}</td>
        <td class="py-3 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="openEditClub('${c._id}')" class="p-1.5 bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2] rounded-lg border hover:bg-[#E0E5F5]/80"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
            <button onclick="deleteClub('${c._id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </td>
      </tr>`).join('');

    const clubSelect = document.getElementById('event-club-select');
    if (clubSelect) {
      const activeVal = clubSelect.value;
      clubSelect.innerHTML = '<option value="">-- Choose Host Club --</option>';
      clubSelect.innerHTML += res.clubs.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
      if (activeVal) clubSelect.value = activeVal;
    }

    const clubFilter = document.getElementById('student-club-filter');
    if (clubFilter) {
      const activeVal = clubFilter.value;
      clubFilter.innerHTML = '<option value="">All Students (No Club Filter)</option>';
      clubFilter.innerHTML += res.clubs.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
      if (activeVal) clubFilter.value = activeVal;
    }
  }
}

async function deleteClub(id) {
  if (!confirm('Delete this club? Events and memberships will be purged.')) return;
  try { const res = await fetchAPI(`/admin/clubs/${id}`,{method:'DELETE'}); if(res.success){alert('Club removed.');await loadAdminDashboard();} }
  catch(err){alert(err.message||'Failed');}
}

async function loadStudentsList() {
  const body = document.getElementById('students-list-body');
  body.innerHTML = '';
  const filterClubId = document.getElementById('student-club-filter')?.value || '';
  const url = filterClubId ? `/admin/students?clubId=${filterClubId}` : '/admin/students';
  const res = await fetchAPI(url);
  if (res.success) {
    allStudents = res.students;
    body.innerHTML = res.students.map(s => {
      const v = s.user?.isVerified;
      return `<tr onclick="openEditStudent('${s._id}')" class="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/20 ${!v?'opacity-60 bg-red-50/10':''}">
        <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">${s.user?.name}${!v?`<span class="ml-1 text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Suspended</span>`:''}</td>
        <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${s.rollNumber}</td>
        <td class="py-3 pr-4 font-medium">${s.department}</td>
        <td class="py-3 pr-4 text-center">${s.yearOfStudy} yr</td>
        <td class="py-3 pr-4 text-center font-semibold text-[#757575] dark:text-gray-300">${s.presenceCount || 0}</td>
        <td class="py-3 pr-4 text-center font-semibold text-[#757575] dark:text-gray-300">${s.totalLecturesCount || 0}</td>
        <td class="py-3 pr-4 text-center font-bold text-[#3D56B2]">${s.rewardPoints} pts</td>
        <td class="py-3 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="event.stopPropagation(); openEditStudent('${s._id}')" class="p-1.5 bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2] rounded-lg border hover:bg-[#E0E5F5]/80"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
            <button onclick="event.stopPropagation(); toggleSuspend('${s._id}',${v})" class="p-1.5 rounded-lg border transition-all ${v?'bg-amber-50 border-amber-100 text-amber-600':'bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2]'}"><i data-lucide="${v?'shield-alert':'shield-check'}" class="w-3.5 h-3.5"></i></button>
            <button onclick="event.stopPropagation(); deleteStudent('${s._id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function toggleSuspend(id, cur) {
  try { const r=await fetchAPI(`/admin/students/${id}`,{method:'PUT',body:JSON.stringify({isVerified:!cur})}); if(r.success) await loadAdminDashboard(); }
  catch(e){alert(e.message||'Failed');}
}
async function deleteStudent(id) {
  if(!confirm('Delete this student account?'))return;
  try{const r=await fetchAPI(`/admin/students/${id}`,{method:'DELETE'});if(r.success){alert('Deleted.');await loadAdminDashboard();}}
  catch(e){alert(e.message||'Failed');}
}

async function handleCreateClub(e) {
  e.preventDefault();
  const btn = document.getElementById('club-submit-btn');
  btn.disabled = true; btn.innerText = 'Registering...';
  try {
    const res = await fetchAPI('/admin/clubs', {
      method:'POST',
      body: JSON.stringify({
        name:        document.getElementById('club-name').value,
        description: document.getElementById('club-desc').value,
        clubHeadId:  document.getElementById('club-head-select').value
      })
    });
    if (res.success) {
      alert(`Club "${res.club?.name||'New Club'}" created!`);
      ['club-name','club-desc','club-head-select'].forEach(id=>document.getElementById(id).value='');
      await loadAdminDashboard();
    }
  } catch(err){alert(err.message||'Failed');}
  finally { btn.disabled=false; btn.innerText='Register Club'; }
}

async function loadAdminEventsSelect() {
  const select = document.getElementById('event-select');
  const activeVal = select.value;
  select.innerHTML = '<option value="">-- Select Event to Manage --</option>';
  try {
    const res = await fetchAPI('/admin/events');
    if (res.success && res.events) {
      allEvents = res.events;
      select.innerHTML += res.events.map(e => `<option value="${e._id}">${e.name} (${e.organizerClub?.name || 'Global'})</option>`).join('');
      if (activeVal) select.value = activeVal;
    }
  } catch (err) { console.error('Failed to load events select:', err); }
}

async function loadEventRegistrations() {
  const eventSelect = document.getElementById('event-select');
  const eventId = eventSelect.value;
  const tbody = document.getElementById('registrations-list-body');
  if (!eventId) {
    tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-[#757575] italic">Select an event above to load registrations.</td></tr>';
    return;
  }
  tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center"><div class="w-5 h-5 border-2 border-[#3D56B2] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>';
  try {
    const eventName = eventSelect.options[eventSelect.selectedIndex].text.split(' (')[0];
    const defaultBadge = `${eventName} Attendee`;

    const res = await fetchAPI(`/admin/events/${eventId}/registrations`);
    if (res.success && res.registrations) {
      if (res.registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-[#757575] italic">No students registered for this event yet.</td></tr>';
      } else {
        tbody.innerHTML = res.registrations.map(r => {
          const isAttended = r.status === 'attended';
          const badge = isAttended
            ? '<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded font-semibold border border-green-100 uppercase text-[9px]">Present &amp; Badge Awarded ✅</span>'
            : '<span class="px-2 py-0.5 bg-blue-50 text-[#3D56B2] rounded font-semibold border border-blue-100 uppercase text-[9px]">Registered</span>';
          
          const badgeInput = isAttended
            ? `<span class="text-[10px] text-gray-500 font-semibold italic">Present</span>`
            : `<input type="text" onclick="event.stopPropagation();" id="badge-input-${r._id}" value="${defaultBadge}" placeholder="Award badge" class="px-2 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded text-[10px] w-32 focus:outline-none dark:text-white inline-block mr-1">`;

          const pointsInput = isAttended
            ? `<span class="text-[10px] text-gray-500 font-semibold italic">+50 pts</span>`
            : `<input type="number" onclick="event.stopPropagation();" id="points-input-${r._id}" value="50" min="0" max="1000" class="px-2 py-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded text-[10px] w-14 focus:outline-none dark:text-white inline-block mr-1">`;

          const actionBtn = isAttended
            ? `<button disabled onclick="event.stopPropagation();" class="px-2 py-1 bg-gray-100 text-gray-400 border border-gray-200 rounded text-[10px] font-semibold cursor-not-allowed">Mark Present</button>`
            : `<button onclick="event.stopPropagation(); markStudentAttended('${r._id}')" class="px-2 py-1 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white rounded text-[10px] font-semibold shadow">Mark Present</button>`;

          const checkinTime = r.scanTime
            ? new Date(r.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + new Date(r.scanTime).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })
            : '—';

          return `<tr onclick="openEditStudent('${r.student?._id}')" class="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
            <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">${r.student?.user?.name || 'Unknown'}</td>
            <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${r.student?.rollNumber || 'N/A'}</td>
            <td class="py-3 pr-4 font-medium">${r.ticketCode}</td>
            <td class="py-3 pr-4 text-[#757575] dark:text-gray-300 font-medium">${checkinTime}</td>
            <td class="py-3 pr-4 text-center font-semibold text-[#757575] dark:text-gray-300">${r.presenceCount || 0}</td>
            <td class="py-3 pr-4 text-center font-semibold text-[#757575] dark:text-gray-300">${r.totalLecturesCount || 0}</td>
            <td class="py-3 pr-4">${badge}</td>
            <td class="py-3 text-right flex items-center justify-end gap-1">${badgeInput} ${pointsInput} ${actionBtn}</td>
          </tr>`;
        }).join('');
      }
    }
  } catch (err) { tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-red-500 font-semibold">${err.message || 'Error loading registrations'}</td></tr>`; }
}

async function markStudentAttended(regId) {
  const badgeInput = document.getElementById(`badge-input-${regId}`);
  const pointsInput = document.getElementById(`points-input-${regId}`);
  const badgeName = badgeInput ? badgeInput.value.trim() : '';
  const points = pointsInput ? Number(pointsInput.value) : 50;
  if (!confirm(`Mark student as present, award "${badgeName || 'default'}" badge and +${points} points?`)) return;
  try {
    const res = await fetchAPI(`/admin/registrations/${regId}/attend`, {
      method: 'POST',
      body: JSON.stringify({ badgeName, points })
    });
    if (res.success) {
      alert(`Attendance logged! Student awarded the "${res.badgeAwarded}" badge and +${points} points.`);
      await loadEventRegistrations();
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to mark attendance'); }
}

async function handleSendBroadcast(e) {
  e.preventDefault();
  const btn = document.getElementById('notice-submit-btn');
  btn.disabled = true; btn.innerText = 'Broadcasting...';
  try {
    const res = await fetchAPI('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: document.getElementById('notice-title').value,
        content: document.getElementById('notice-content').value
      })
    });
    if (res.success) {
      alert('Global notification broadcast successfully!');
      document.getElementById('notice-title').value = '';
      document.getElementById('notice-content').value = '';
      await loadSentAnnouncements();
    }
  } catch (err) { alert(err.message || 'Failed to broadcast'); }
  finally { btn.disabled = false; btn.innerText = 'Broadcast Notification'; }
}

// Global Arrays
let allClubs = [], allStudents = [], allEvents = [];

// Edit Student Modal Functions
async function openEditStudent(id) {
  const student = allStudents.find(s => s._id === id);
  if (!student) return;
  document.getElementById('edit-student-id').value = student._id;
  document.getElementById('edit-student-name').value = student.user?.name || '';
  document.getElementById('edit-student-roll').value = student.rollNumber;
  document.getElementById('edit-student-dept').value = student.department;
  document.getElementById('edit-student-year').value = student.yearOfStudy;
  document.getElementById('edit-student-points').value = student.rewardPoints;
  document.getElementById('edit-student-badges').value = student.badges ? student.badges.join(', ') : '';

  const logDiv = document.getElementById('edit-student-attendance-log');
  logDiv.innerHTML = '<p class="text-[#757575] italic text-[10px] text-center">Loading history...</p>';

  const summaryEl = document.getElementById('edit-student-attendance-summary');
  if (summaryEl) {
    summaryEl.innerText = `Presence: 0 | Total Lectures: ${allEvents.length}`;
  }

  document.getElementById('student-modal').classList.remove('hidden');
  lucide?.createIcons();

  try {
    const res = await fetchAPI(`/admin/students/${student._id}/attendance`);
    if (res.success && res.attendance) {
      if (summaryEl) {
        summaryEl.innerText = `Presence: ${res.attendance.length} | Total Lectures: ${allEvents.length}`;
      }
      if (res.attendance.length) {
        logDiv.innerHTML = res.attendance.map(a => `
          <div class="p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-[10px] flex justify-between items-center mb-1.5 border border-gray-100 dark:border-gray-800">
            <div>
              <span class="font-bold text-[#1A1A1A] dark:text-white">${a.event?.name || 'Unknown Event'}</span>
              <span class="text-[9px] text-[#757575] ml-1">(${a.event ? new Date(a.event.date).toLocaleDateString() : 'N/A'})</span>
            </div>
            <span class="bg-[#E0E5F5] dark:bg-gray-700 text-[#3D56B2] px-2 py-0.5 rounded font-bold uppercase text-[8px]">${a.badgeAwarded || 'Attended'}</span>
          </div>
        `).join('');
      } else {
        logDiv.innerHTML = '<p class="text-[#757575] italic text-[10px] text-center py-2">No attendance checked in.</p>';
      }
    }
  } catch(err) {
    logDiv.innerHTML = `<p class="text-red-500 italic text-[10px] text-center py-2">Failed to load history: ${err.message}</p>`;
  }
}

function closeStudentModal() {
  document.getElementById('student-modal').classList.add('hidden');
}

async function submitEditStudent(e) {
  e.preventDefault();
  const id = document.getElementById('edit-student-id').value;
  const btn = document.getElementById('edit-student-submit-btn');
  btn.disabled = true; btn.innerText = 'Saving...';
  try {
    const res = await fetchAPI(`/admin/students/${id}/details`, {
      method: 'PUT',
      body: JSON.stringify({
        name: document.getElementById('edit-student-name').value,
        rollNumber: document.getElementById('edit-student-roll').value,
        department: document.getElementById('edit-student-dept').value,
        yearOfStudy: Number(document.getElementById('edit-student-year').value),
        rewardPoints: Number(document.getElementById('edit-student-points').value),
        badges: document.getElementById('edit-student-badges').value
      })
    });
    if (res.success) {
      alert('Student details updated successfully!');
      closeStudentModal();
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to update student'); }
  finally { btn.disabled = false; btn.innerText = 'Save Changes'; }
}

// Edit Club Modal Functions
function openEditClub(id) {
  const club = allClubs.find(c => c._id === id);
  if (!club) return;
  document.getElementById('edit-club-id').value = club._id;
  document.getElementById('edit-club-name').value = club.name;
  document.getElementById('edit-club-desc').value = club.description;
  document.getElementById('edit-club-head-select').value = club.clubHead?._id || '';
  document.getElementById('club-modal').classList.remove('hidden');
  lucide?.createIcons();
}

function closeClubModal() {
  document.getElementById('club-modal').classList.add('hidden');
}

async function submitEditClub(e) {
  e.preventDefault();
  const id = document.getElementById('edit-club-id').value;
  const btn = document.getElementById('edit-club-submit-btn');
  btn.disabled = true; btn.innerText = 'Saving...';
  try {
    const res = await fetchAPI(`/admin/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name:        document.getElementById('edit-club-name').value,
        description: document.getElementById('edit-club-desc').value,
        clubHeadId:  document.getElementById('edit-club-head-select').value
      })
    });
    if (res.success) {
      alert('Club details updated successfully!');
      closeClubModal();
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to update club'); }
  finally { btn.disabled = false; btn.innerText = 'Save Changes'; }
}

async function handleCreateEvent(e) {
  e.preventDefault();
  const btn = document.getElementById('ev-submit-btn');
  btn.disabled = true; btn.innerText = 'Submitting...';
  try {
    const res = await fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('ev-name').value,
        description: document.getElementById('ev-desc').value,
        category: document.getElementById('ev-cat').value,
        difficulty: document.getElementById('ev-diff').value,
        venue: {
          building: document.getElementById('ev-building').value,
          room: document.getElementById('ev-room').value
        },
        date: document.getElementById('ev-date').value,
        time: document.getElementById('ev-time').value,
        registrationDeadline: document.getElementById('ev-date').value,
        maxParticipants: Number(document.getElementById('ev-capacity').value),
        organizerClub: document.getElementById('event-club-select').value
      })
    });
    if (res.success) {
      alert(`Event "${res.event?.name || 'New Event'}" proposed successfully!`);
      ['ev-name','ev-desc','ev-building','ev-room','ev-date','ev-time','event-club-select'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to propose event'); }
  finally { btn.disabled = false; btn.innerText = 'Propose Event'; }
}

async function loadPendingClubHeads() {
  const list  = document.getElementById('pending-club-heads-list');
  const empty = document.getElementById('pending-club-heads-empty');
  list.innerHTML = ''; empty.classList.add('hidden');
  try {
    const res = await fetchAPI('/admin/pending-club-heads');
    if (res.success && res.pendingHeads) {
      document.getElementById('club-heads-badge-count').innerText = res.pendingHeads.length;
      if (res.pendingHeads.length) {
        list.innerHTML = res.pendingHeads.map(u => `
          <div class="py-3.5 flex items-center justify-between">
            <div>
              <h4 class="font-bold text-[#1A1A1A] dark:text-white">${u.name}</h4>
              <p class="text-[10px] text-[#757575] mt-0.5">Email: ${u.email} | Requested Role: Club Head</p>
            </div>
            <div class="flex gap-2">
              <button onclick="resolveClubHead('${u._id}','approve')" class="py-1.5 px-3 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center gap-1 font-semibold">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve</button>
              <button onclick="resolveClubHead('${u._id}','reject')" class="py-1.5 px-3 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-1 font-semibold">
                <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject</button>
            </div>
          </div>`).join('<hr class="border-gray-100 dark:border-gray-700">');
      } else { empty.classList.remove('hidden'); }
    }
  } catch(err) { console.error('Failed to load pending club heads:', err); }
}

async function resolveClubHead(id, action) {
  try {
    const res = await fetchAPI(`/admin/pending-club-heads/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    if (res.success) {
      alert(`Club Head request successfully ${action}d!`);
      await loadAdminDashboard();
    }
  } catch(err) { alert(err.message || 'Failed to resolve Club Head request'); }
}

async function loadVerifiedHeadsOptions() {
  try {
    const res = await fetchAPI('/admin/verified-club-heads');
    if (res.success && res.heads) {
      const createSelect = document.getElementById('club-head-select');
      const editSelect = document.getElementById('edit-club-head-select');
      if (createSelect && editSelect) {
        const options = res.heads.map(h => `<option value="${h._id}">${h.name} (${h.email})</option>`).join('');
        createSelect.innerHTML = '<option value="">-- Select Verified Head --</option>' + options;
        editSelect.innerHTML = '<option value="">-- Select Verified Head --</option>' + options;
      }
    }
  } catch (err) { console.error('Failed to load verified club heads:', err); }
}

async function loadSentAnnouncements() {
  const listEl = document.getElementById('admin-announcements-list');
  if (!listEl) return;
  try {
    const res = await fetchAPI('/students/announcements');
    if (res.success && res.announcements) {
      const myAnnouncements = res.announcements.filter(a => a.createdBy?.role === 'super_admin' || !a.club);
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

async function loadEventsManager() {
  const body = document.getElementById('events-manager-list-body');
  if (!body) return;
  body.innerHTML = '';
  try {
    const res = await fetchAPI('/admin/events');
    if (res.success && res.events) {
      body.innerHTML = res.events.map(e => {
        const dateStr = new Date(e.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + e.time;
        const venueStr = `${e.venue?.building || 'Main'} - Room ${e.venue?.room || 'Hall'}`;
        const statusLabel = e.status === 'published'
          ? `<span class="px-2 py-0.5 bg-green-50 text-green-700 rounded font-semibold border border-green-100 uppercase text-[8px]">Published</span>`
          : `<span class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-semibold border border-amber-100 uppercase text-[8px]">Pending</span>`;
        
        return `<tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
          <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">${e.name}</td>
          <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${e.organizerClub?.name || 'Global'}</td>
          <td class="py-3 pr-4 font-semibold text-blue-600 dark:text-blue-400 capitalize">${e.category}</td>
          <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${venueStr}</td>
          <td class="py-3 pr-4 text-center font-semibold">${e.maxParticipants}</td>
          <td class="py-3 pr-4">${statusLabel}</td>
          <td class="py-3 text-right">
            <div class="flex gap-2 justify-end">
              <button onclick="openEditEvent('${e._id}')" class="p-1.5 bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2] rounded-lg border hover:bg-[#E0E5F5]/80"><i data-lucide="edit" class="w-3.5 h-3.5"></i></button>
              <button onclick="deleteEvent('${e._id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  } catch (err) {
    console.error('Failed to load events manager:', err);
  }
}

function openEditEvent(id) {
  const event = allEvents.find(e => e._id === id);
  if (!event) return;
  document.getElementById('edit-event-id').value = event._id;
  document.getElementById('edit-event-name').value = event.name;
  document.getElementById('edit-event-desc').value = event.description;
  document.getElementById('edit-event-building').value = event.venue?.building || '';
  document.getElementById('edit-event-room').value = event.venue?.room || '';
  document.getElementById('edit-event-date').value = event.date ? event.date.substring(0, 10) : '';
  document.getElementById('edit-event-time').value = event.time || '';
  document.getElementById('edit-event-capacity').value = event.maxParticipants || '';
  document.getElementById('edit-event-cat').value = event.category || '';
  document.getElementById('event-modal').classList.remove('hidden');
  lucide?.createIcons();
}

function closeEventModal() {
  document.getElementById('event-modal').classList.add('hidden');
}

async function submitEditEvent(e) {
  e.preventDefault();
  const id = document.getElementById('edit-event-id').value;
  const btn = document.getElementById('edit-event-submit-btn');
  btn.disabled = true; btn.innerText = 'Saving...';
  try {
    const res = await fetchAPI(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: document.getElementById('edit-event-name').value,
        description: document.getElementById('edit-event-desc').value,
        venue: {
          building: document.getElementById('edit-event-building').value,
          room: document.getElementById('edit-event-room').value
        },
        date: new Date(document.getElementById('edit-event-date').value),
        time: document.getElementById('edit-event-time').value,
        maxParticipants: Number(document.getElementById('edit-event-capacity').value),
        category: document.getElementById('edit-event-cat').value
      })
    });
    if (res.success) {
      alert('Event details updated successfully!');
      closeEventModal();
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to update event'); }
  finally { btn.disabled = false; btn.innerText = 'Save Changes'; }
}

async function deleteEvent(id) {
  if (!confirm('Delete this event? All associated registrations and attendance logs will be permanently deleted.')) return;
  try {
    const res = await fetchAPI(`/events/${id}`, { method: 'DELETE' });
    if (res.success) {
      alert('Event removed successfully.');
      await loadAdminDashboard();
    }
  } catch (err) { alert(err.message || 'Failed to delete event'); }
}

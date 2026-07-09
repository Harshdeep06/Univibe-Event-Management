let statsChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('super_admin');
  if (!user) return;

  await loadAdminDashboard();
});

async function loadAdminDashboard() {
  const loader = document.getElementById('admin-loader');
  const content = document.getElementById('admin-content');

  try {
    
    const res = await fetchAPI('/admin/stats');
    if (res.success) {
      document.getElementById('stat-students-count').innerText = res.stats.totalStudents;
      document.getElementById('stat-clubs-count').innerText = res.stats.totalClubs;
      document.getElementById('stat-events-count').innerText = res.stats.totalEvents;
      document.getElementById('stat-regs-count').innerText = res.stats.totalRegistrations;

      document.getElementById('quick-active-club').innerText = res.stats.activeClub;
      document.getElementById('quick-active-student').innerText = res.stats.activeStudent;

      
      renderAnalyticsChart(res.chartData);
    }

    
    await loadPendingEvents();

    
    await loadClubsList();

    
    await loadStudentsList();

  } catch (err) {
    console.error('Failed to load administrative portals:', err);
  } finally {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function renderAnalyticsChart(chartDataArr) {
  const ctx = document.getElementById('admin-chart-canvas').getContext('2d');
  if (statsChart) statsChart.destroy();

  const labels = chartDataArr.map(d => d.month);
  const counts = chartDataArr.map(d => d.count);

  statsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Registrations',
        data: counts,
        backgroundColor: '#3D56B2',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { precision: 0 } }
      }
    }
  });
}

async function loadPendingEvents() {
  const list = document.getElementById('pending-events-list');
  const empty = document.getElementById('pending-events-empty');
  list.innerHTML = '';
  empty.classList.add('hidden');

  try {
    const res = await fetchAPI('/admin/events/pending');
    if (res.success) {
      document.getElementById('approvals-badge-count').innerText = res.events.length;
      if (res.events.length > 0) {
        res.events.forEach(event => {
          list.innerHTML += `
            <div class="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span class="text-[9px] bg-[#EFEFEF] dark:bg-gray-700 text-[#757575] dark:text-gray-300 px-2 py-0.5 rounded font-bold">${event.category}</span>
                <h4 class="font-bold text-[#1A1A1A] dark:text-white mt-1.5">${event.name}</h4>
                <p class="text-[10px] text-[#757575] dark:text-gray-400 mt-0.5">Club: ${event.organizerClub?.name} | Date: ${new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button onclick="resolveEvent('${event._id}', 'approve')" class="flex-1 sm:flex-none py-1.5 px-3 bg-green-50 text-green-600 rounded-lg border border-green-100 flex items-center justify-center gap-1 font-semibold">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Publish
                </button>
                <button onclick="resolveEvent('${event._id}', 'reject')" class="flex-1 sm:flex-none py-1.5 px-3 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center justify-center gap-1 font-semibold">
                  <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Reject
                </button>
              </div>
            </div>
          `;
        });
      } else {
        empty.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Failed to load pending proposals:', err);
  }
}

async function resolveEvent(eventId, action) {
  try {
    const status = action === 'approve' ? 'published' : 'cancelled';
    const res = await fetchAPI(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (res.success) {
      alert(`Event status updated: ${status}`);
      await loadAdminDashboard();
    }
  } catch (err) {
    alert(err.message || 'Failed to resolve event');
  }
}

async function loadClubsList() {
  const body = document.getElementById('clubs-list-body');
  body.innerHTML = '';

  try {
    const res = await fetchAPI('/clubs');
    if (res.success) {
      res.clubs.forEach(c => {
        body.innerHTML += `
          <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
            <td class="py-3">
              <div class="w-8 h-8 rounded-full bg-[#E0E5F5] flex items-center justify-center font-bold text-[#3D56B2] overflow-hidden text-xs uppercase">
                ${c.logo ? `<img src="${c.logo}" alt="${c.name}" class="object-cover w-full h-full" />` : c.name.charAt(0)}
              </div>
            </td>
            <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">${c.name}</td>
            <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${c.facultyCoordinator}</td>
            <td class="py-3 pr-4 text-center font-semibold text-[#1A1A1A] dark:text-white">${c.membersCount}</td>
            <td class="py-3 text-right">
              <button onclick="deleteClub('${c._id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 transition-colors">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error('Failed to load clubs list:', err);
  }
}

async function deleteClub(clubId) {
  if (!confirm('Are you sure you want to permanently delete this club? Events and memberships will be purged.')) return;
  try {
    const res = await fetchAPI(`/admin/clubs/${clubId}`, { method: 'DELETE' });
    if (res.success) {
      alert('Club removed.');
      await loadAdminDashboard();
    }
  } catch (err) {
    alert(err.message || 'Failed to remove club');
  }
}

async function loadStudentsList() {
  const body = document.getElementById('students-list-body');
  body.innerHTML = '';

  try {
    const res = await fetchAPI('/admin/students');
    if (res.success) {
      res.students.forEach(s => {
        const isVerified = s.user?.isVerified;
        body.innerHTML += `
          <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 ${!isVerified ? 'opacity-60 bg-red-50/10' : ''}">
            <td class="py-3 pr-4 font-bold text-[#1A1A1A] dark:text-white">
              ${s.user?.name}
              ${!isVerified ? `<span class="ml-1 text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Suspended</span>` : ''}
            </td>
            <td class="py-3 pr-4 text-[#757575] dark:text-gray-300">${s.rollNumber}</td>
            <td class="py-3 pr-4 font-medium">${s.department}</td>
            <td class="py-3 pr-4 text-center">${s.yearOfStudy} yr</td>
            <td class="py-3 pr-4 text-center font-bold text-[#3D56B2]">${s.rewardPoints} pts</td>
            <td class="py-3 text-right">
              <div class="flex gap-2 justify-end">
                <button onclick="toggleSuspendStudent('${s._id}', ${isVerified})" class="p-1.5 rounded-lg border transition-all ${
                  isVerified ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-[#E0E5F5] border-[#CBD5E1] text-[#3D56B2] hover:bg-[#E0E5F5]/70'
                }">
                  <i data-lucide="${isVerified ? 'shield-alert' : 'shield-check'}" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="deleteStudent('${s._id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error('Failed to load students list:', err);
  }
}

async function toggleSuspendStudent(studentId, currentStatus) {
  try {
    const res = await fetchAPI(`/admin/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified: !currentStatus })
    });
    if (res.success) {
      await loadAdminDashboard();
    }
  } catch (err) {
    alert(err.message || 'Failed to update student state');
  }
}

async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to permanently delete this student account?')) return;
  try {
    const res = await fetchAPI(`/admin/students/${studentId}`, { method: 'DELETE' });
    if (res.success) {
      alert('Student deleted.');
      await loadAdminDashboard();
    }
  } catch (err) {
    alert(err.message || 'Failed to remove student');
  }
}

async function handleCreateClub(e) {
  e.preventDefault();
  const name = document.getElementById('club-name').value;
  const description = document.getElementById('club-desc').value;
  const facultyCoordinator = document.getElementById('club-coordinator').value;
  const clubHeadEmail = document.getElementById('club-head-email').value;

  const btn = document.getElementById('club-submit-btn');
  btn.disabled = true;
  btn.innerText = 'Registering Club...';

  try {
    const res = await fetchAPI('/admin/clubs', {
      method: 'POST',
      body: JSON.stringify({ name, description, facultyCoordinator, clubHeadEmail })
    });

    if (res.success) {
      alert(`Club "${name}" established successfully!`);
      document.getElementById('club-name').value = '';
      document.getElementById('club-desc').value = '';
      document.getElementById('club-coordinator').value = '';
      document.getElementById('club-head-email').value = '';
      await loadAdminDashboard();
    }
  } catch (err) {
    alert(err.message || 'Failed to create club');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Register Club';
  }
}

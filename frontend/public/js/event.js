let eventId = null;
let currentEvent = null;
let currentRegistration = null;
let currentStudentId = null;
let currentRating = 5;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  eventId = params.get('id');

  if (!eventId) {
    window.location.href = '/';
    return;
  }

  await loadEventDetails();
});

async function loadEventDetails() {
  const loader = document.getElementById('event-loader');
  const content = document.getElementById('event-content');

  try {
    
    const res = await fetchAPI(`/events/${eventId}`);
    if (res.success) {
      currentEvent = res.event;

      
      document.getElementById('event-title').innerText = currentEvent.name;
      document.getElementById('event-category-tag').innerText = currentEvent.category;
      document.getElementById('event-club').innerText = `Host Club: ${currentEvent.organizerClub?.name}`;
      document.getElementById('event-desc').innerText = currentEvent.description;

      document.getElementById('detail-date').innerText = `${new Date(currentEvent.date).toLocaleDateString()} at ${currentEvent.time}`;
      document.getElementById('detail-venue').innerText = `${currentEvent.venue?.building} • ${currentEvent.venue?.room}`;
      document.getElementById('detail-certs').innerText = currentEvent.certificateEnabled ? 'Automated Issue' : 'No Certificates';

      document.getElementById('venue-maps-coords').innerText = `📍 Venue Map: ${currentEvent.venue?.building} Block, Room ${currentEvent.venue?.room}`;

      if (currentEvent.posterUrl) {
        document.getElementById('event-poster').src = currentEvent.posterUrl;
        document.getElementById('event-poster-container').classList.remove('hidden');
      }

      
      const rulesBox = document.getElementById('rules-box');
      const rulesList = document.getElementById('rules-list');
      rulesList.innerHTML = '';
      if (currentEvent.rules && currentEvent.rules.length > 0) {
        rulesBox.classList.remove('hidden');
        currentEvent.rules.forEach(r => { rulesList.innerHTML += `<li>${r}</li>`; });
      }

      
      const prizesBox = document.getElementById('prizes-box');
      const prizesList = document.getElementById('prizes-list');
      prizesList.innerHTML = '';
      if (currentEvent.prizes && currentEvent.prizes.length > 0) {
        prizesBox.classList.remove('hidden');
        currentEvent.prizes.forEach(p => { prizesList.innerHTML += `<li>${p}</li>`; });
      }

      
      const feedbackList = document.getElementById('feedback-list');
      const feedbackEmpty = document.getElementById('feedback-empty');
      document.getElementById('feedback-count').innerText = res.feedback?.length || 0;
      feedbackList.innerHTML = '';
      if (res.feedback && res.feedback.length > 0) {
        feedbackEmpty.classList.add('hidden');
        res.feedback.forEach(rev => {
          let starsHtml = '';
          for (let i = 1; i <= 5; i++) {
            starsHtml += `<i data-lucide="star" class="${i <= rev.rating ? 'fill-current' : ''} w-3 h-3 text-yellow-500"></i>`;
          }
          feedbackList.innerHTML += `
            <div class="py-3 border-b border-gray-100 dark:border-gray-700">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-[#1A1A1A] dark:text-white">${rev.student?.user?.name || 'Grace Hopper'}</span>
                <div class="flex gap-0.5">${starsHtml}</div>
              </div>
              <p class="text-[#757575] dark:text-gray-300">${rev.comment}</p>
            </div>
          `;
        });
      } else {
        feedbackEmpty.classList.remove('hidden');
      }

      
      await setupUserActions();
    }
  } catch (err) {
    console.error('Failed to load event detailed card:', err);
  } finally {
    loader.classList.add('hidden');
    content.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function setupUserActions() {
  const token = localStorage.getItem('univibe_token');
  const userJson = localStorage.getItem('univibe_user');

  document.getElementById('student-actions-block').classList.add('hidden');
  document.getElementById('organizer-actions-block').classList.add('hidden');
  document.getElementById('unauth-actions-block').classList.add('hidden');

  if (!token || !userJson) {
    document.getElementById('unauth-actions-block').classList.remove('hidden');
    return;
  }

  const user = JSON.parse(userJson);

  
  const isOrganizer = user.role === 'super_admin' || 
                      (user.role === 'club_admin' && currentEvent.organizerClub?.clubHead === user.id);

  if (isOrganizer) {
    document.getElementById('organizer-actions-block').classList.remove('hidden');
  } else if (user.role === 'student') {
    document.getElementById('student-actions-block').classList.remove('hidden');

    
    try {
      const meRes = await fetchAPI('/auth/me');
      if (meRes.success && meRes.profile) {
        currentStudentId = meRes.profile._id;
        const regsRes = await fetchAPI(`/events/${eventId}/registrations`);
        if (regsRes.success) {
          const myReg = regsRes.registrations.find(r => r.student?._id === currentStudentId);
          updateStudentRegistrationUI(myReg);
        }
      }
    } catch (err) {
      console.error('Failed checking registration logs:', err);
    }
  }
}

function updateStudentRegistrationUI(reg) {
  currentRegistration = reg;
  document.getElementById('status-unregistered').classList.add('hidden');
  document.getElementById('status-registered').classList.add('hidden');
  document.getElementById('status-attended').classList.add('hidden');
  document.getElementById('feedback-form').classList.add('hidden');

  if (!reg || reg.status === 'cancelled') {
    document.getElementById('status-unregistered').classList.remove('hidden');
  } else if (reg.status === 'registered') {
    document.getElementById('status-registered').classList.remove('hidden');
    document.getElementById('ticket-code-label').innerText = reg.ticketCode;
  } else if (reg.status === 'attended') {
    document.getElementById('status-attended').classList.remove('hidden');
    document.getElementById('feedback-form').classList.remove('hidden');
    setStarRating(5); 
  }
}

async function handleRegister() {
  const btn = document.getElementById('btn-register');
  btn.disabled = true;
  btn.innerText = 'Reserving...';

  try {
    const res = await fetchAPI(`/events/${eventId}/register`, { method: 'POST' });
    if (res.success) {
      alert('Ticket reserved successfully!');
      await loadEventDetails();
    }
  } catch (err) {
    alert(err.message || 'Failed to book ticket');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Register & Get Ticket';
  }
}

async function handleCancel() {
  if (!confirm('Are you sure you want to cancel your digital ticket?')) return;
  try {
    const res = await fetchAPI(`/events/${eventId}/cancel`, { method: 'POST' });
    if (res.success) {
      alert('Ticket cancelled.');
      await loadEventDetails();
    }
  } catch (err) {
    alert(err.message || 'Failed to cancel registration');
  }
}

async function handleCheckin(e) {
  e.preventDefault();
  const ticketCode = document.getElementById('scan-ticket-input').value.trim();
  const statusBox = document.getElementById('checkin-status-box');

  statusBox.classList.add('hidden');
  const btn = document.getElementById('scan-submit-btn');
  btn.disabled = true;
  btn.innerText = 'Logging check-in...';

  try {
    const res = await fetchAPI(`/events/${eventId}/mark-attendance`, {
      method: 'POST',
      body: JSON.stringify({ ticketCode })
    });

    if (res.success) {
      statusBox.innerHTML = `Check-in Success! Present: ${res.studentName}. points: ${res.rewardPoints} pts (+50 granted).`;
      statusBox.className = 'p-3 rounded-xl border bg-green-50 text-green-700 border-green-100';
      statusBox.classList.remove('hidden');
      document.getElementById('scan-ticket-input').value = '';
    }
  } catch (err) {
    statusBox.innerText = err.message || 'Failed to check in';
    statusBox.className = 'p-3 rounded-xl border bg-red-50 text-red-600 border-red-100';
    statusBox.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Mark Present';
  }
}


function setStarRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('#star-rating button i');
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.add('fill-current');
    } else {
      star.classList.remove('fill-current');
    }
  });
}

async function handlePostFeedback(e) {
  e.preventDefault();
  const comment = document.getElementById('feedback-comment').value;

  const btn = document.getElementById('feedback-submit-btn');
  btn.disabled = true;
  btn.innerText = 'Posting review...';

  try {
    const res = await fetchAPI(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating: currentRating, comment })
    });

    if (res.success) {
      alert('Review posted successfully!');
      document.getElementById('feedback-comment').value = '';
      await loadEventDetails();
    }
  } catch (err) {
    alert(err.message || 'Failed to submit review');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Post Review';
  }
}


function downloadEventCert() {
  const canvas = document.getElementById('cert-canvas');
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

  
  const user = JSON.parse(localStorage.getItem('univibe_user'));
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillStyle = '#3D56B2';
  ctx.fillText(user?.name || 'Grace Hopper', 400, 245);

  
  ctx.font = 'normal 14px Arial, sans-serif';
  ctx.fillStyle = '#1A1A1A';
  ctx.fillText(`successfully completed the event:`, 400, 305);

  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillText(`"${currentEvent.name}"`, 400, 345);

  ctx.font = 'normal 12px Arial, sans-serif';
  ctx.fillStyle = '#757575';
  ctx.fillText(`organized by ${currentEvent.organizerClub?.name || 'UNIVIBE Club'} on ${new Date(currentEvent.date).toLocaleDateString()}`, 400, 385);

  
  ctx.fillText('Faculty Coordinator Signature', 400, 480);
  ctx.beginPath();
  ctx.moveTo(300, 490);
  ctx.lineTo(500, 490);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#757575';
  ctx.stroke();

  ctx.fillText(`Verification ID: ${currentRegistration?.ticketCode || 'CERT-UV890'}`, 400, 530);

  
  const link = document.createElement('a');
  link.download = `UNIVIBE-Certificate-${currentRegistration?.ticketCode || 'CERT'}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

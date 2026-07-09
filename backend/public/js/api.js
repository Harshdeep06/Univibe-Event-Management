const API_BASE = window.location.origin + '/api';

async function fetchAPI(endpoint, opts = {}) {
  const token = localStorage.getItem('univibe_token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

const API_BASE = '/api';

export async function fetchCentres() {
  const res = await fetch(`${API_BASE}/centres`);
  if (!res.ok) throw new Error('Failed to fetch centres');
  return res.json();
}

export async function fetchVehicles() {
  const res = await fetch(`${API_BASE}/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch vehicles');
  return res.json();
}

export async function loadDemoData() {
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to load demo data');
  return res.json();
}

export async function uploadCSVFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}

export async function fetchPredictions(modelType = 'rf') {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_type: modelType }),
  });
  if (!res.ok) throw new Error('Failed to fetch predictions');
  return res.json();
}

export async function fetchOptimizedRoutes() {
  const res = await fetch(`${API_BASE}/routes`);
  if (!res.ok) throw new Error('Failed to fetch optimized routes');
  return res.json();
}

export async function fetchFixedRoutes() {
  const res = await fetch(`${API_BASE}/routes/fixed`);
  if (!res.ok) throw new Error('Failed to fetch fixed routes');
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function completeStop(stopId, actualLitres, notes = '') {
  const res = await fetch(`${API_BASE}/stops/${stopId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actual_litres: actualLitres !== undefined ? Number(actualLitres) : 238.0,
      driver_notes: notes,
    }),
  });

  // Both "completed" and "overflow_reassigned" return HTTP 200 — pass through
  if (res.ok) {
    return res.json();
  }

  // Genuine errors (network failure, server crash, etc.)
  const err = await res.json().catch(() => ({ detail: 'Failed to complete stop' }));
  throw new Error(err.detail || 'Failed to complete stop');
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset data');
  return res.json();
}

export async function startNewDay() {
  const res = await fetch(`${API_BASE}/day/start`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start a new day');
  return res.json();
}

export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchReassignments() {
  const res = await fetch(`${API_BASE}/reassignments`);
  if (!res.ok) throw new Error('Failed to fetch reassignments');
  return res.json();
}

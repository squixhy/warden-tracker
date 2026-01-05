const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function checkWarden(staffId) {
  const res = await fetch(`${API_BASE}/warden/${encodeURIComponent(staffId)}`);
  if (!res.ok) throw new Error('Failed to check warden status');
  return res.json();
}

export async function fetchWardens() {
  const res = await fetch(`${API_BASE}/wardens`);
  if (!res.ok) throw new Error('Failed to fetch wardens');
  return res.json();
}

export async function registerWarden(payload) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to register');
  }
  return res.json();
}

export async function updateWardenLocation(staffNumber, location) {
  const res = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffNumber, location })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to update location');
  }
  return res.json();
}

export async function amendWardenDetails(staffNumber, updates) {
  const res = await fetch(`${API_BASE}/amend`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffNumber, ...updates })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to amend details');
  }
  return res.json();
}

export async function checkoutWarden(staffId) {
  const res = await fetch(`${API_BASE}/checkout/${encodeURIComponent(staffId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to clock off');
  }
  return res.json();
}

export const LOCATIONS = [
  'Alwyn Hall',
  'Beech Glade',
  'Bowers Building',
  'Burma Road Student Village',
  'Centre for Sport',
  'Chapel',
  'The Cottage',
  'Fred Wheeler Building',
  'Herbert Jarman Building',
  'Holm Lodge',
  'Kenneth Kettle Building',
  'King Alfred Centre',
  'Martial Rose Library',
  'Masters Lodge',
  'Medecroft',
  'Medecroft Annexe',
  'Paul Chamberlain Building',
  'Queen’s Road Student Village',
  'St Alphege',
  'St Edburga',
  'St Elizabeth’s Hall',
  'St Grimbald’s Court',
  'St James’ Hall',
  'St Swithun’s Lodge',
  'The Stripe',
  'Business School',
  'Tom Atkinson Building',
  'West Downs Centre',
  'West Downs Student Village',
  'Winton Building',
  'Students’ Union'
];

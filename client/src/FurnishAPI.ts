const API_URL = 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('token');
}

export async function saveProject(data) {
  const token = getToken();
  const res = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save project');
  return res.json();
}

export async function loadProject(id) {
  const res = await fetch(`${API_URL}/projects/${id}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function getMyProjects() {
  const token = getToken();
  const res = await fetch(`${API_URL}/projects/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function deleteProject(id) {
  const token = getToken();
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
} 
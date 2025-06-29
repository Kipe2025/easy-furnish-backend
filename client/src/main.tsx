import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import App from './App';
import ReadOnlyProject from './ReadOnlyProject';
import AuthPage from './AuthPage';
import PricingPage from './PricingPage';
import { getMyProjects, deleteProject } from './FurnishAPI';

function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');
        const res = await fetch('http://localhost:4000/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Session expired');
        const user = await res.json();
        setSubStatus(user.subscriptionStatus || 'none');
        const data = await getMyProjects();
        setProjects(data);
      } catch (e: any) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/auth');
      }
      setLoading(false);
    }
    fetchProjects();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    await deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-2xl bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <button className="bg-gray-300 px-3 py-1 rounded" onClick={handleLogout}>Logout</button>
        </div>
        {subStatus !== 'active' && (
          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-center">
            <span className="font-semibold text-yellow-700">Your subscription is inactive.</span>{' '}
            <button className="text-blue-600 underline" onClick={() => navigate('/pricing')}>Upgrade to unlock editing</button>
          </div>
        )}
        <button
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => navigate('/editor')}
          disabled={subStatus !== 'active'}
        >
          + New Project
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : projects.length === 0 ? (
          <div>No projects found.</div>
        ) : (
          <ul className="divide-y">
            {projects.map(p => (
              <li key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{p.name || 'Untitled Project'}</div>
                  <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => navigate(`/project/${p.id}`)}>Open</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(p.id)} disabled={subStatus !== 'active'}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<App />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/project/:id" element={<ReadOnlyProject />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadProject } from './FurnishAPI';
import Canvas2D from './Canvas2D';
import Render3D from './Render3D';

const ReadOnlyProject: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'2d' | '3d'>('3d');

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await loadProject(id);
        setProject(data);
      } catch {
        setProject(null);
      }
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!project) return <div className="p-8 text-center text-red-600">Project not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded shadow p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{project.name || 'Untitled Project'}</h1>
            {project.creator && <div className="text-gray-500 text-sm">by {project.creator}</div>}
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => navigate('/')}
          >
            Back to Editor
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          <button
            className={`px-4 py-2 rounded-l ${view === '2d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('2d')}
          >
            2D View
          </button>
          <button
            className={`px-4 py-2 rounded-r ${view === '3d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('3d')}
          >
            3D View
          </button>
        </div>
        <div className="w-full">
          {view === '2d' ? (
            <Canvas2D readOnly initialState={project} />
          ) : (
            <Render3D readOnly initialState={project} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyProject; 
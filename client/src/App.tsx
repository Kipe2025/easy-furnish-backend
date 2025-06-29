import React, { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Canvas2D from './Canvas2D'
import Render3D from './Render3D'
import useCanvasStore from './store/canvasStore'
import { saveProject } from './FurnishAPI'

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function App() {
  const [view, setView] = useState<'2d' | '3d'>('2d')
  const [projectName, setProjectName] = useState('')
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const store = useCanvasStore()
  const canvas2DRef = useRef<any>(null)
  const render3DRef = useRef<any>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { id } = await saveProject({ ...store, name: projectName })
      setSavedId(id)
    } catch (e) {
      alert('Failed to save project')
    }
    setSaving(false)
  }

  const handleExport = async () => {
    if (view === '2d' && canvas2DRef.current) {
      const dataUrl = canvas2DRef.current.exportAsImage()
      downloadDataUrl(dataUrl, 'easyfurnish-design-2d.png')
      setToast('2D image exported!')
    } else if (view === '3d' && render3DRef.current) {
      const dataUrl = render3DRef.current.exportAsImage()
      downloadDataUrl(dataUrl, 'easyfurnish-design-3d.png')
      setToast('3D image exported!')
    }
    setTimeout(() => setToast(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Easy Furnish – Room Designer</h1>
      <div className="mb-4 flex gap-2 items-center">
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
        <input
          className="ml-4 border rounded p-1"
          placeholder="Project name"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />
        <button
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Project'}
        </button>
        <button
          className="ml-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={handleExport}
        >
          Export as Image
        </button>
      </div>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
      {savedId && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 rounded">
          Project saved! Shareable link: <a className="underline text-blue-600" href={`/project/${savedId}`}>{window.location.origin}/project/{savedId}</a>
        </div>
      )}
      {view === '2d' ? <Canvas2D ref={canvas2DRef} /> : <Render3D ref={render3DRef} />}
    </div>
  )
}

export default App

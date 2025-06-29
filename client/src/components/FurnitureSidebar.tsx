import React, { useState } from 'react';
import useCanvasStore from '../store/canvasStore';

const TOOL_OPTIONS = [
  { value: 'select', label: 'Select/Move' },
  { value: 'add-wall', label: 'Add Wall' },
  { value: 'add-door', label: 'Add Door' },
  { value: 'add-window', label: 'Add Window' },
  { value: 'add-furniture', label: 'Add Furniture' },
];

const FurnitureSidebar: React.FC = () => {
  const addFurniture = useCanvasStore((s) => s.setFurniture);
  const furniture = useCanvasStore((s) => s.furniture);
  const draggable = useCanvasStore((s) => s.furnitureDraggable);
  const setDraggable = useCanvasStore((s) => s.setFurnitureDraggable);
  const showRoomDimensions = useCanvasStore((s) => s.showRoomDimensions);
  const setShowRoomDimensions = useCanvasStore((s) => s.setShowRoomDimensions);
  const toolMode = useCanvasStore((s) => s.toolMode);
  const setToolMode = useCanvasStore((s) => s.setToolMode);

  const [name, setName] = useState('');
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [width, setWidth] = useState(100);
  const [depth, setDepth] = useState(60);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addFurniture([
      ...furniture,
      {
        id: Date.now().toString(),
        x,
        y,
        width,
        height: depth,
        label: name,
      },
    ]);
    setName('');
  };

  return (
    <aside className="w-64 bg-white rounded shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Tools</h2>
      <div className="flex flex-col gap-2 mb-4">
        {TOOL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`rounded p-1 text-left ${toolMode === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
            onClick={() => setToolMode(opt.value as any)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {toolMode === 'add-furniture' && (
        <>
          <h2 className="text-lg font-semibold mb-2">Add Furniture</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-2">
            <input className="border p-1 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <div className="flex gap-2">
              <input className="border p-1 rounded w-1/2" type="number" placeholder="X (cm)" value={x} onChange={e => setX(Number(e.target.value))} required />
              <input className="border p-1 rounded w-1/2" type="number" placeholder="Y (cm)" value={y} onChange={e => setY(Number(e.target.value))} required />
            </div>
            <div className="flex gap-2">
              <input className="border p-1 rounded w-1/2" type="number" placeholder="Width (cm)" value={width} onChange={e => setWidth(Number(e.target.value))} required />
              <input className="border p-1 rounded w-1/2" type="number" placeholder="Depth (cm)" value={depth} onChange={e => setDepth(Number(e.target.value))} required />
            </div>
            <button className="bg-green-500 text-white rounded p-1 mt-2 hover:bg-green-600" type="submit">Add Furniture</button>
          </form>
        </>
      )}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            id="draggable-toggle"
            type="checkbox"
            checked={draggable}
            onChange={e => setDraggable(e.target.checked)}
          />
          <label htmlFor="draggable-toggle" className="text-sm">Enable drag/resize</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="room-dim-toggle"
            type="checkbox"
            checked={showRoomDimensions}
            onChange={e => setShowRoomDimensions(e.target.checked)}
          />
          <label htmlFor="room-dim-toggle" className="text-sm">Show room dimensions</label>
        </div>
      </div>
    </aside>
  );
};

export default FurnitureSidebar;

 
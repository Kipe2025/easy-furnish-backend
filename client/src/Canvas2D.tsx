import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import useCanvasStore from './store/canvasStore';
import RoomShape from './components/RoomShape';
import WallSegment from './components/WallSegment';
import FurnitureItem from './components/FurnitureItem';
import DimensionLabel from './components/DimensionLabel';
import FurnitureSidebar from './components/FurnitureSidebar';
import DoorWindow from './components/DoorWindow';
import type { Point } from './store/canvasStore';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const HANDLE_RADIUS = 8;
const GRID_SIZE = 20;
const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

interface Canvas2DProps {
  readOnly?: boolean;
  initialState?: any;
}

const Canvas2D = forwardRef<any, Canvas2DProps>(({ readOnly = false, initialState }, ref) => {
  const store = useCanvasStore();
  // If readOnly, use initialState for rendering
  const room = readOnly && initialState ? initialState.room : store.room;
  const walls = readOnly && initialState ? initialState.walls : store.walls;
  const furniture = readOnly && initialState ? initialState.furniture : store.furniture;
  const dimensions = readOnly && initialState ? initialState.dimensions : store.dimensions;
  const doors = readOnly && initialState ? initialState.doors : store.doors;
  const windows = readOnly && initialState ? initialState.windows : store.windows;
  const toolMode = readOnly ? 'select' : store.toolMode;
  const [drawing, setDrawing] = useState(room.points.length === 0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [wallStart, setWallStart] = useState<Point | null>(null);
  const [wallPreview, setWallPreview] = useState<Point | null>(null);
  const stageRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    exportAsImage: () => {
      if (stageRef.current) {
        return stageRef.current.toDataURL({ pixelRatio: 2 });
      }
      return '';
    },
  }));

  // Add point on click if drawing room
  const handleStageClick = (e: any) => {
    if (!drawing) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    store.setRoom({ points: [...room.points, { x: pointer.x, y: pointer.y }] });
  };

  // Finish drawing on double click
  const handleStageDblClick = () => {
    if (room.points.length >= 3) setDrawing(false);
  };

  // Drag vertex to resize
  const handleDragMove = (idx: number, pos: { x: number; y: number }) => {
    const newPoints = room.points.map((p, i) => (i === idx ? pos : p));
    store.setRoom({ points: newPoints });
  };

  // Wall drawing handlers
  const handleWallMouseDown = (e: any) => {
    if (toolMode !== 'add-wall') return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    setWallStart({ x: snap(pointer.x), y: snap(pointer.y) });
    setWallPreview(null);
  };

  const handleWallMouseMove = (e: any) => {
    if (toolMode !== 'add-wall' || !wallStart) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    setWallPreview({ x: snap(pointer.x), y: snap(pointer.y) });
  };

  const handleWallMouseUp = (e: any) => {
    if (toolMode !== 'add-wall' || !wallStart) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const end = { x: snap(pointer.x), y: snap(pointer.y) };
    if (wallStart.x === end.x && wallStart.y === end.y) {
      setWallStart(null);
      setWallPreview(null);
      return;
    }
    store.setWalls([
      ...walls,
      {
        id: Date.now().toString(),
        x1: wallStart.x,
        y1: wallStart.y,
        x2: end.x,
        y2: end.y,
      },
    ]);
    setWallStart(null);
    setWallPreview(null);
  };

  // Wall click handler for placing doors/windows
  const handleWallClick = (wallId: string, e: any) => {
    if (toolMode !== 'add-door' && toolMode !== 'add-window') return;
    const wall = walls.find(w => w.id === wallId);
    if (!wall) return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    // Project click onto wall
    const { dx, dy, length } = { dx: wall.x2 - wall.x1, dy: wall.y2 - wall.y1, length: Math.sqrt((wall.x2 - wall.x1) ** 2 + (wall.y2 - wall.y1) ** 2) };
    const px = pointer.x - wall.x1;
    const py = pointer.y - wall.y1;
    let t = (px * dx + py * dy) / (length * length);
    t = Math.max(0, Math.min(1, t));
    const defaultWidth = 80;
    const item = {
      id: Date.now().toString(),
      wallId,
      position: t,
      width: defaultWidth,
      type: toolMode === 'add-door' ? 'door' : 'window',
    };
    if (toolMode === 'add-door') store.setDoors([...doors, item]);
    if (toolMode === 'add-window') store.setWindows([...windows, item]);
  };

  return (
    <div className="flex gap-6">
      <FurnitureSidebar />
      <div className="bg-white rounded shadow p-4">
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-300 bg-gray-50"
          onClick={drawing ? handleStageClick : undefined}
          onDblClick={drawing ? handleStageDblClick : undefined}
          onMouseDown={handleWallMouseDown}
          onMouseMove={handleWallMouseMove}
          onMouseUp={handleWallMouseUp}
          ref={stageRef}
        >
          <Layer>
            <RoomShape shape={room} />
            {/* Draw handles for each vertex if not drawing */}
            {!drawing &&
              room.points.map((pt, idx) => (
                <Circle
                  key={idx}
                  x={pt.x}
                  y={pt.y}
                  radius={HANDLE_RADIUS}
                  fill={hoverIdx === idx ? '#f59e42' : '#60a5fa'}
                  draggable
                  onDragMove={e => handleDragMove(idx, e.target.position())}
                  onMouseEnter={() => setHoverIdx(idx)}
                  onMouseLeave={() => setHoverIdx(null)}
                  stroke="#374151"
                  strokeWidth={2}
                  shadowBlur={hoverIdx === idx ? 8 : 0}
                  cursor="pointer"
                />
              ))}
            {/* Render walls */}
            {walls.map((wall) => (
              <React.Fragment key={wall.id}>
                <WallSegment wall={wall} onClick={e => handleWallClick(wall.id, e)} clickable={toolMode === 'add-door' || toolMode === 'add-window'} />
                {/* Render doors/windows for this wall */}
                {doors.filter(d => d.wallId === wall.id).map(door => (
                  <DoorWindow
                    key={door.id}
                    wall={wall}
                    item={door}
                    type="door"
                    onUpdate={updated => store.setDoors(doors.map(d => d.id === door.id ? updated : d))}
                  />
                ))}
                {windows.filter(w => w.wallId === wall.id).map(window => (
                  <DoorWindow
                    key={window.id}
                    wall={wall}
                    item={window}
                    type="window"
                    onUpdate={updated => store.setWindows(windows.map(wi => wi.id === window.id ? updated : wi))}
                  />
                ))}
              </React.Fragment>
            ))}
            {/* Wall preview while drawing */}
            {toolMode === 'add-wall' && wallStart && wallPreview && (
              <WallSegment wall={{ id: 'preview', x1: wallStart.x, y1: wallStart.y, x2: wallPreview.x, y2: wallPreview.y }} preview />
            )}
            {furniture.map((item, i) => (
              <FurnitureItem key={i} {...item} />
            ))}
            {dimensions.map((dim, i) => (
              <DimensionLabel key={i} {...dim} />
            ))}
            {/* Show preview line while drawing room */}
            {drawing && room.points.length > 0 && (
              <RoomShape shape={{ points: room.points }} />
            )}
          </Layer>
        </Stage>
        <div className="mt-2 text-sm text-gray-500">
          {drawing
            ? 'Click to add points. Double-click to finish room.'
            : toolMode === 'add-wall'
            ? 'Click and drag to draw a wall.'
            : 'Drag handles to resize room.'}
        </div>
      </div>
    </div>
  );
});

export default Canvas2D; 
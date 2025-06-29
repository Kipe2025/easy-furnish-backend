import React, { useRef } from 'react';
import { Rect, Group, Text } from 'react-konva';
import type { Wall, DoorOrWindow } from '../store/canvasStore';
import useCanvasStore from '../store/canvasStore';

const SNAP_CM = 10;
const MIN_WIDTH = 40;
const HEIGHT = 18;

function getWallVector(wall: Wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, length };
}

function getPositionOnWall(wall: Wall, position: number) {
  const { dx, dy } = getWallVector(wall);
  return {
    x: wall.x1 + dx * position,
    y: wall.y1 + dy * position,
  };
}

function getPositionFromCoords(wall: Wall, x: number, y: number) {
  const { dx, dy, length } = getWallVector(wall);
  const px = x - wall.x1;
  const py = y - wall.y1;
  // Project point onto wall vector
  const t = (px * dx + py * dy) / (length * length);
  return Math.max(0, Math.min(1, t));
}

const DoorWindow: React.FC<{
  wall: Wall;
  item: DoorOrWindow;
  type: 'door' | 'window';
  onUpdate: (item: DoorOrWindow) => void;
}> = ({ wall, item, type, onUpdate }) => {
  const color = type === 'door' ? '#F59E42' : '#60A5FA';
  const { length } = getWallVector(wall);
  const width = Math.max(MIN_WIDTH, Math.min(item.width, length));
  const pos = getPositionOnWall(wall, item.position);
  // Center the rectangle on the wall
  const offset = width / 2;
  const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);

  // Drag logic
  const handleDragMove = (e: any) => {
    const mouse = e.target.getStage().getPointerPosition();
    if (!mouse) return;
    // Project mouse onto wall
    let t = getPositionFromCoords(wall, mouse.x, mouse.y);
    // Snap to increments
    t = Math.round(t * length / SNAP_CM) * SNAP_CM / length;
    t = Math.max(0, Math.min(1, t));
    onUpdate({ ...item, position: t });
  };

  // Resize logic (drag right edge)
  const handleResize = (e: any) => {
    const mouse = e.target.getStage().getPointerPosition();
    if (!mouse) return;
    // Project mouse onto wall
    const t = getPositionFromCoords(wall, mouse.x, mouse.y);
    const centerT = item.position;
    let newWidth = Math.abs((t - centerT) * length * 2);
    newWidth = Math.round(newWidth / SNAP_CM) * SNAP_CM;
    onUpdate({ ...item, width: Math.max(MIN_WIDTH, Math.min(newWidth, length)) });
  };

  return (
    <Group
      x={pos.x}
      y={pos.y}
      rotation={(angle * 180) / Math.PI}
      draggable
      dragBoundFunc={pos => {
        // Only allow movement along wall
        const t = getPositionFromCoords(wall, pos.x, pos.y);
        const snappedT = Math.round(t * length / SNAP_CM) * SNAP_CM / length;
        const newPos = getPositionOnWall(wall, snappedT);
        return newPos;
      }}
      onDragMove={handleDragMove}
    >
      <Rect
        x={-offset}
        y={-HEIGHT / 2}
        width={width}
        height={HEIGHT}
        fill={color}
        stroke="#374151"
        strokeWidth={2}
        cornerRadius={4}
        shadowBlur={type === 'door' ? 6 : 0}
      />
      {/* Resize handle (right edge) */}
      <Rect
        x={width / 2 - 6}
        y={-HEIGHT / 2}
        width={12}
        height={HEIGHT}
        fill="#fff"
        stroke={color}
        strokeWidth={1}
        cornerRadius={2}
        draggable
        dragBoundFunc={pos => {
          // Only allow resizing along wall
          const t = getPositionFromCoords(wall, pos.x, pos.y);
          const centerT = item.position;
          let newWidth = Math.abs((t - centerT) * length * 2);
          newWidth = Math.round(newWidth / SNAP_CM) * SNAP_CM;
          if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
          if (newWidth > length) newWidth = length;
          // Place handle at correct position
          const sign = t > centerT ? 1 : -1;
          const handleT = centerT + (sign * newWidth) / 2 / length;
          return getPositionOnWall(wall, handleT);
        }}
        onDragMove={handleResize}
        onDragEnd={e => e.target.position({ x: 0, y: 0 })}
        opacity={0.7}
        cursor="ew-resize"
      />
      {/* Dimension label */}
      <Text
        x={-offset}
        y={-HEIGHT / 2 - 18}
        width={width}
        align="center"
        text={`${width} cm`}
        fontSize={14}
        fill={color}
        fontStyle="bold"
      />
    </Group>
  );
};

export default DoorWindow; 
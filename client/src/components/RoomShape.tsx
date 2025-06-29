import React from 'react';
import { Line } from 'react-konva';
import type { RoomShape as RoomShapeType } from '../store/canvasStore';
import useCanvasStore from '../store/canvasStore';
import DimensionLabel from './DimensionLabel';

const RoomShape: React.FC<{ shape: RoomShapeType }> = ({ shape }) => {
  const showRoomDimensions = useCanvasStore(s => s.showRoomDimensions);
  const dimensions = useCanvasStore(s => s.dimensions);
  if (!shape.points.length) return null;
  const points = shape.points.flatMap(p => [p.x, p.y]);
  return (
    <>
      <Line
        points={points}
        closed
        stroke="#4B5563"
        strokeWidth={3}
        fill="#E5E7EB22"
        lineJoin="round"
      />
      {showRoomDimensions && dimensions.map(dim => (
        <DimensionLabel key={dim.id} {...dim} />
      ))}
    </>
  );
};

export default RoomShape; 
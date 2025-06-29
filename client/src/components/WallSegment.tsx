import React from 'react';
import { Line } from 'react-konva';
import type { Wall } from '../store/canvasStore';
import DimensionLabel from './DimensionLabel';

const getWallLength = (wall: Wall) => {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

const getWallMidpoint = (wall: Wall) => ({
  x: (wall.x1 + wall.x2) / 2,
  y: (wall.y1 + wall.y2) / 2,
});

const WallSegment: React.FC<{ wall: Wall; preview?: boolean; clickable?: boolean; onClick?: (e: any) => void }> = ({ wall, preview, clickable, onClick }) => {
  const length = getWallLength(wall);
  const mid = getWallMidpoint(wall);
  return (
    <>
      <Line
        points={[wall.x1, wall.y1, wall.x2, wall.y2]}
        stroke={preview ? '#60A5FA88' : '#374151'}
        strokeWidth={12}
        lineCap="round"
        dash={preview ? [8, 8] : undefined}
        opacity={preview ? 0.7 : 1}
        onClick={clickable ? onClick : undefined}
        listening={!!clickable}
        cursor={clickable ? 'pointer' : undefined}
      />
      {!preview && (
        <DimensionLabel
          id={`wall-dim-${wall.id}`}
          x={mid.x}
          y={mid.y - 18}
          text={`${length} cm`}
        />
      )}
    </>
  );
};

export default WallSegment; 
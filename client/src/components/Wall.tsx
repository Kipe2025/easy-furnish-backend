import React from 'react';
import { Line } from 'react-konva';
import type { Wall as WallType } from '../store/canvasStore';

const Wall: React.FC<WallType> = ({ points, type }) => {
  const color = type === 'wall' ? '#374151' : type === 'window' ? '#60A5FA' : '#F59E42';
  return (
    <Line
      points={points.flatMap(p => [p.x, p.y])}
      stroke={color}
      strokeWidth={type === 'wall' ? 8 : 6}
      lineCap="round"
    />
  );
};

export default Wall; 
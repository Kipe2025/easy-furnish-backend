import React from 'react';
import { Text } from 'react-konva';
import type { DimensionLabel as DimensionLabelType } from '../store/canvasStore';

const DimensionLabel: React.FC<DimensionLabelType> = ({ x, y, text }) => (
  <Text x={x} y={y} text={text} fontSize={16} fill="#374151" fontStyle="bold" />
);

export default DimensionLabel; 
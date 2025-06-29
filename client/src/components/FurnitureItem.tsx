import React, { useRef } from 'react';
import { Rect, Text, Transformer } from 'react-konva';
import type { FurnitureItem as FurnitureItemType } from '../store/canvasStore';
import useCanvasStore from '../store/canvasStore';

const GRID_SIZE = 20;

const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const FurnitureItem: React.FC<FurnitureItemType> = ({ id, x, y, width, height, label }) => {
  const furniture = useCanvasStore(s => s.furniture);
  const setFurniture = useCanvasStore(s => s.setFurniture);
  const draggable = useCanvasStore(s => s.furnitureDraggable);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // Update position on drag end
  const handleDragEnd = (e: any) => {
    const newX = snap(e.target.x());
    const newY = snap(e.target.y());
    setFurniture(
      furniture.map(item =>
        item.id === id ? { ...item, x: newX, y: newY } : item
      )
    );
  };

  // Update size on transform end
  const handleTransformEnd = (e: any) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = Math.max(20, Math.round(node.width() * scaleX));
    const newHeight = Math.max(20, Math.round(node.height() * scaleY));
    node.scaleX(1);
    node.scaleY(1);
    setFurniture(
      furniture.map(item =>
        item.id === id ? { ...item, width: newWidth, height: newHeight } : item
      )
    );
  };

  return (
    <>
      <Rect
        ref={shapeRef}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#A7F3D0"
        stroke="#059669"
        strokeWidth={2}
        cornerRadius={6}
        draggable={draggable}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onTransform={handleTransformEnd}
      />
      {/* Show transformer if draggable */}
      {draggable && (
        <Transformer
          ref={trRef}
          anchorSize={8}
          borderDash={[4, 4]}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // Snap resizing to grid
            return {
              ...newBox,
              width: snap(newBox.width),
              height: snap(newBox.height),
            };
          }}
        />
      )}
      {/* Dimension label */}
      <Text
        x={x}
        y={y + height + 4}
        text={`${width} x ${height} cm`}
        fontSize={14}
        fill="#059669"
        fontStyle="bold"
      />
      {/* Name label */}
      {label && (
        <Text
          x={x}
          y={y - 18}
          text={label}
          fontSize={14}
          fill="#059669"
        />
      )}
    </>
  );
};

export default FurnitureItem; 
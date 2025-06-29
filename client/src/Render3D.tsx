import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import useCanvasStore from './store/canvasStore';

const WALL_HEIGHT = 260;
const WALL_THICKNESS = 12;
const FURNITURE_HEIGHT = 60;

function getWallGeometry(wall) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const midX = (wall.x1 + wall.x2) / 2;
  const midY = (wall.y1 + wall.y2) / 2;
  return { length, angle, midX, midY };
}

const ExportHelper = forwardRef<any, { children: React.ReactNode }>((props, ref) => {
  const { gl } = useThree();
  useImperativeHandle(ref, () => ({
    exportAsImage: () => gl.domElement.toDataURL('image/png'),
  }), [gl]);
  return <>{props.children}</>;
});

const Render3D = forwardRef<any, { readOnly?: boolean; initialState?: any }>(( { readOnly = false, initialState }, ref) => {
  const store = useCanvasStore();
  const room = readOnly && initialState ? initialState.room : store.room;
  const walls = readOnly && initialState ? initialState.walls : store.walls;
  const furniture = readOnly && initialState ? initialState.furniture : store.furniture;
  const doors = readOnly && initialState ? initialState.doors : store.doors;
  const windows = readOnly && initialState ? initialState.windows : store.windows;

  return (
    <div className="w-full h-[600px] bg-gray-200 rounded shadow">
      <Canvas shadows camera={{ position: [0, -800, 600], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ExportHelper ref={ref}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[300, -300, 600]} intensity={0.7} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          {/* Camera Controls */}
          <PerspectiveCamera makeDefault position={[0, -800, 600]} />
          <OrbitControls target={[0, 0, 0]} enablePan enableZoom enableRotate />
          {/* Room Floor */}
          {room.points.length > 2 && (
            <mesh receiveShadow position={[0, 0, 0]}>
              <shapeGeometry args={[
                (() => {
                  const shape = new window.THREE.Shape();
                  room.points.forEach((pt, i) => {
                    if (i === 0) shape.moveTo(pt.x, pt.y);
                    else shape.lineTo(pt.x, pt.y);
                  });
                  shape.closePath();
                  return shape;
                })(),
              ]} />
              <meshStandardMaterial color="#e5e7eb" side={2} />
            </mesh>
          )}
          {/* Walls */}
          {walls.map(wall => {
            const { length, angle, midX, midY } = getWallGeometry(wall);
            return (
              <mesh
                key={wall.id}
                position={[midX, midY, WALL_HEIGHT / 2]}
                rotation={[0, 0, angle]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[length, WALL_THICKNESS, WALL_HEIGHT]} />
                <meshStandardMaterial color="#374151" />
              </mesh>
            );
          })}
          {/* Furniture */}
          {furniture.map(item => (
            <mesh
              key={item.id}
              position={[item.x + item.width / 2, item.y + item.height / 2, FURNITURE_HEIGHT / 2]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[item.width, item.height, FURNITURE_HEIGHT]} />
              <meshStandardMaterial color="#a7f3d0" />
            </mesh>
          ))}
          {/* Doors */}
          {doors.map(door => {
            const wall = walls.find(w => w.id === door.wallId);
            if (!wall) return null;
            const { length, angle } = getWallGeometry(wall);
            const center = door.position * length - door.width / 2;
            return (
              <mesh
                key={door.id}
                position={[
                  wall.x1 + Math.cos(angle) * (door.position * length),
                  wall.y1 + Math.sin(angle) * (door.position * length),
                  100,
                ]}
                rotation={[0, 0, angle]}
                castShadow
              >
                <boxGeometry args={[door.width, WALL_THICKNESS + 2, 200]} />
                <meshStandardMaterial color="#f59e42" transparent opacity={0.7} />
              </mesh>
            );
          })}
          {/* Windows */}
          {windows.map(window => {
            const wall = walls.find(w => w.id === window.wallId);
            if (!wall) return null;
            const { length, angle } = getWallGeometry(wall);
            return (
              <mesh
                key={window.id}
                position={[
                  wall.x1 + Math.cos(angle) * (window.position * length),
                  wall.y1 + Math.sin(angle) * (window.position * length),
                  180,
                ]}
                rotation={[0, 0, angle]}
                castShadow
              >
                <boxGeometry args={[window.width, WALL_THICKNESS + 2, 60]} />
                <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
              </mesh>
            );
          })}
        </ExportHelper>
      </Canvas>
    </div>
  );
});

export default Render3D; 
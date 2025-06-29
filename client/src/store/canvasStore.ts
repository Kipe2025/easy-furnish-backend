import { create } from 'zustand';

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DoorOrWindow {
  id: string;
  wallId: string;
  position: number; // 0-1 along wall
  width: number;
  type: 'door' | 'window';
}

export interface FurnitureItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  label?: string;
}

export interface DimensionLabel {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface RoomShape {
  points: Point[];
}

export type ToolMode = 'select' | 'add-wall' | 'add-door' | 'add-window' | 'add-furniture';

interface CanvasState {
  room: RoomShape;
  walls: Wall[];
  doors: DoorOrWindow[];
  windows: DoorOrWindow[];
  furniture: FurnitureItem[];
  dimensions: DimensionLabel[];
  setRoom: (room: RoomShape) => void;
  setWalls: (walls: Wall[]) => void;
  setDoors: (doors: DoorOrWindow[]) => void;
  setWindows: (windows: DoorOrWindow[]) => void;
  setFurniture: (furniture: FurnitureItem[]) => void;
  setDimensions: (dimensions: DimensionLabel[]) => void;
  furnitureDraggable: boolean;
  setFurnitureDraggable: (draggable: boolean) => void;
  showRoomDimensions: boolean;
  setShowRoomDimensions: (show: boolean) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
}

const useCanvasStore = create<CanvasState>((set, get) => ({
  room: { points: [] },
  walls: [],
  doors: [],
  windows: [],
  furniture: [],
  dimensions: [],
  setRoom: (room) => {
    set({ room });
    // Update wall dimension labels when room changes
    const points = room.points;
    if (points.length > 1) {
      const dims = points.map((pt, i) => {
        const next = points[(i + 1) % points.length];
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const length = Math.round(Math.sqrt(dx * dx + dy * dy));
        const midX = (pt.x + next.x) / 2;
        const midY = (pt.y + next.y) / 2;
        return {
          id: `wall-dim-${i}`,
          x: midX,
          y: midY - 18,
          text: `${length} cm`,
        };
      });
      set({ dimensions: dims });
    } else {
      set({ dimensions: [] });
    }
  },
  setWalls: (walls) => set({ walls }),
  setDoors: (doors) => set({ doors }),
  setWindows: (windows) => set({ windows }),
  setFurniture: (furniture) => set({ furniture }),
  setDimensions: (dimensions) => set({ dimensions }),
  furnitureDraggable: true,
  setFurnitureDraggable: (draggable) => set({ furnitureDraggable: draggable }),
  showRoomDimensions: true,
  setShowRoomDimensions: (show) => set({ showRoomDimensions: show }),
  toolMode: 'select',
  setToolMode: (mode) => set({ toolMode: mode }),
}));

export default useCanvasStore; 
import { create, StoreApi } from 'zustand';
import { UseBoundStoreWithEqualityFn } from 'zustand/traditional';

export type GameDevState = {
  isGameDevMode: boolean;
  setGameDevMode: (isActive: boolean) => void;
  savedPrompt: string | null;
  setSavedPrompt: (prompt: string | null) => void;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  topology: 'triangles' | 'quads';
  setTopology: (topology: 'triangles' | 'quads') => void;
  polyCount: number;
  setPolyCount: (count: number) => void;
  isPolyCountAuto: boolean;
  setIsPolyCountAuto: (isAuto: boolean) => void;
  lod: number;
  setLod: (lod: number) => void;
  previewNum: number;
  setPreviewNum: (num: number) => void;
  pbrMode: 'albedo' | 'metall' | 'plastic' | 'pbr';
  setPbrMode: (mode: 'albedo' | 'metall' | 'plastic' | 'pbr') => void;
};

export const useGameDevStore: UseBoundStoreWithEqualityFn<StoreApi<GameDevState>> = create<GameDevState>((set) => ({
  isGameDevMode: false,
  setGameDevMode: (isActive: boolean) => set({ isGameDevMode: isActive }),
  savedPrompt: null,
  setSavedPrompt: (prompt: string | null) => set({ savedPrompt: prompt }),
  selectedMode: 'standard',
  setSelectedMode: (mode: string) => {
    set({ selectedMode: mode });
    set({ isGameDevMode: mode === 'gamedev' });
  },
  topology: 'triangles',
  setTopology: (topology) => set({ topology }),
  polyCount: 40000,
  setPolyCount: (count) => set({ polyCount: count }),
  isPolyCountAuto: true,
  setIsPolyCountAuto: (isAuto) => set({ isPolyCountAuto: isAuto }),
  lod: 0,
  setLod: (lod) => set({ lod }),
  previewNum: 1,
  setPreviewNum: (num) => set({ previewNum: num }),
  pbrMode: 'pbr',
  setPbrMode: (mode) => set({ pbrMode: mode }),
}));

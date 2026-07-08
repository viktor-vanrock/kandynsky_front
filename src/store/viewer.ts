import { create, StoreApi } from 'zustand';
import { UseBoundStoreWithEqualityFn } from 'zustand/traditional';
import { MeshFormatEntity } from '../graphql/graphQlApiHooks.ts';

const hangar_interior = '/hdrMaps/hangar_interior_1k.hdr';
const modern_buildings_2 = '/hdrMaps/modern_buildings_2_1k.hdr';
const overcast_soil_puresky = '/hdrMaps/overcast_soil_puresky_1k.hdr';
const studio_small_09 = '/hdrMaps/studio_small_09_1k.hdr';
const thatch_chapel = '/hdrMaps/thatch_chapel_1k.hdr';

export const hdriMaps: HdrMap[] = [
  // { value: '', label: 'none', name: 'Выкл' },
  { value: thatch_chapel, label: 'thatch_chapel', name: 'Карта 1' },
  { value: overcast_soil_puresky, label: 'overcast_soil_puresky', name: 'Карта 2' },
  { value: modern_buildings_2, label: 'modern_buildings_2', name: 'Карта 3' },
  { value: hangar_interior, label: 'hangar_interior', name: 'Карта 4' },
  { value: studio_small_09, label: 'studio_small_09', name: 'Карта 5' },
];

export type HdrMap = {
  value: string;
  label: string;
  name: string;
};

export type EditorLinkData = {
  model: MeshFormatEntity | undefined;
  glbUrl: string;
  prompt: string;
  previewId: string | undefined;
  order: number;
} | null;

export type ViewerState = {
  hdrMap: HdrMap;
  setHdrMap: (index: number) => void;
  floorPositionY: number;
  setFloorPositionY: (value: number) => void;
  isShowTexture: boolean;
  setShowTexture: (value: boolean) => void;
  showMesh: boolean;
  setShowMesh: (value: boolean) => void;
  editorLinkData: EditorLinkData;
  setEditorLinkData: (data: EditorLinkData) => void;
  clearEditorLinkData: () => void;
  isModelReady: boolean;
  setIsModelReady: (isReady: boolean) => void;
};

export const useViewerStore: UseBoundStoreWithEqualityFn<StoreApi<ViewerState>> = create<ViewerState>((set) => ({
  hdrMap: hdriMaps[0],
  setHdrMap: (index: number) => set({ hdrMap: hdriMaps[index] }),
  floorPositionY: 0,
  setFloorPositionY: (floorPositionY: number) => set({ floorPositionY }),
  isShowTexture: true,
  setShowTexture: (isShowTexture: boolean) => set({ isShowTexture }),
  showMesh: false,
  setShowMesh: (showMesh: boolean) => set({ showMesh }),
  editorLinkData: null,
  setEditorLinkData: (data: EditorLinkData) => set({ editorLinkData: data }),
  clearEditorLinkData: () => set({ editorLinkData: null }),
  isModelReady: false,
  setIsModelReady: (isReady: boolean) => set({ isModelReady: isReady }),
}));

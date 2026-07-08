interface MediaTrackConstraintSet {
  resizeMode?: ConstrainDOMString;
  zoom?: ConstrainDouble;
}

interface MediaTrackCapabilities {
  resizeMode?: string[];
  zoom?: { min: number; max: number; step?: number } | number;
}

interface MediaTrackSettings {
  resizeMode?: string;
  zoom?: number;
}

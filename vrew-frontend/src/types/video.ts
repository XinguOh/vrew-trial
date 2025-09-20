export interface VideoClip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
}

export interface VideoPlayerState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  currentClipIndex: number;
  volume: number;
  isMuted: boolean;
}

export interface HoverPreview {
  isHovered: boolean;
  position: { x: number; y: number };
  time: number;
}

export interface DragDropState {
  draggedIndex: number | null;
  dragOverIndex: number | null;
}

export interface ExportProgress {
  isExporting: boolean;
  progress: number;
}

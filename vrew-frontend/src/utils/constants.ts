export const FFMPEG_CONFIG = {
  baseURL: 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  preset: 'medium',
  crf: '23',
  audioBitrate: '128k'
} as const;

export const FILE_TYPES = {
  video: 'video/*'
} as const;

export const UI_CONFIG = {
  clipListWidth: 'w-80',
  progressBarHeight: 'h-1',
  tooltipOffset: { x: 30, y: 60 }
} as const;

import type { VideoClip } from "../types";

export class VideoService {
  static createClipFromFile(file: File): VideoClip {
    const url = URL.createObjectURL(file);
    return {
      id: Date.now().toString(),
      file,
      url,
      name: file.name || "새로 만든 비디오",
      duration: 0
    };
  }

  static cleanupClips(clips: VideoClip[]): void {
    clips.forEach(clip => {
      URL.revokeObjectURL(clip.url);
    });
  }

  static formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static calculateTimeFromPosition(x: number, containerWidth: number, duration: number): number {
    const timePercent = x / containerWidth;
    return Math.max(0, Math.min(duration, timePercent * duration));
  }
}

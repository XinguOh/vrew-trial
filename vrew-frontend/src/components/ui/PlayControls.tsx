import type { VideoPlayerState, VideoClip } from '../../types';
import { VideoService } from '../../services';
import { VolumeControl } from './VolumeControl';

interface PlayControlsProps {
  playerState: VideoPlayerState;
  currentClip: VideoClip | undefined;
  isDarkMode: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function PlayControls({
  playerState,
  currentClip,
  isDarkMode,
  onPlayPause,
  onVolumeChange,
  onToggleMute
}: PlayControlsProps) {
  const { currentTime, duration, isPlaying, volume, isMuted } = playerState;

  return (
    <div className={`p-4 border-b ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onPlayPause}
            disabled={!currentClip}
            className={`p-2 rounded ${
              !currentClip 
                ? 'bg-gray-300 cursor-not-allowed' 
                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')
            }`}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <span className="text-sm">
            {VideoService.formatTime(currentTime)} / {VideoService.formatTime(duration)}
          </span>
          
          {currentClip && (
            <span className="text-sm text-gray-500">
              현재: {currentClip.name}
            </span>
          )}
        </div>

        {/* 볼륨 컨트롤 */}
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          isDarkMode={isDarkMode}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>
    </div>
  );
}

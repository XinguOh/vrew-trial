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
        <div className="flex items-center space-x-6 flex-1">
          <button
            onClick={onPlayPause}
            disabled={!currentClip}
            className={`p-2 rounded flex-shrink-0 ${
              !currentClip 
                ? 'bg-gray-300 cursor-not-allowed' 
                : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')
            }`}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <span className={`text-base font-medium whitespace-nowrap ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {VideoService.formatTime(currentTime)} / {VideoService.formatTime(duration)}
            </span>
            
            {currentClip && (
              <span className="text-sm text-gray-500 truncate">
                현재: {currentClip.name}
              </span>
            )}
          </div>
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

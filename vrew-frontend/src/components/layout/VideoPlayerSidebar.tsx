import { VideoPlayer } from '../video';
import { PlayControls } from '../ui';
import { SubtitleDisplay } from '../subtitle';
import type { VideoClip, VideoPlayerState, HoverPreview } from '../../types';

interface VideoPlayerSidebarProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentClip: VideoClip | undefined;
  playerState: VideoPlayerState;
  hoverPreview: HoverPreview;
  isDarkMode: boolean;
  onTimeUpdate: () => void;
  onLoadedMetadata: () => void;
  onVideoEnded: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  onTimeSeek: (time: number) => void;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  currentSubtitle: any;
}

export function VideoPlayerSidebar({
  videoRef,
  currentClip,
  playerState,
  hoverPreview,
  isDarkMode,
  onTimeUpdate,
  onLoadedMetadata,
  onVideoEnded,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onTimeSeek,
  onPlayPause,
  onVolumeChange,
  onToggleMute,
  currentSubtitle
}: VideoPlayerSidebarProps) {
  return (
    <div className={`w-full h-full flex flex-col ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
    }`}>
      {/* 비디오 플레이어 영역 */}
      <div className="relative flex-1 bg-black">
        <VideoPlayer
          videoRef={videoRef}
          currentClip={currentClip}
          playerState={playerState}
          hoverPreview={hoverPreview}
          isDarkMode={isDarkMode}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onVideoEnded={onVideoEnded}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          onTimeSeek={onTimeSeek}
        />
        
        {/* 자막 표시 */}
        <SubtitleDisplay
          subtitle={currentSubtitle}
          isDarkMode={isDarkMode}
        />
        
        {/* VREW 로고 */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 text-black px-2 py-1 rounded text-xs font-bold">
            VREW
          </div>
        </div>
      </div>

      {/* 재생 컨트롤 */}
      <div className="p-4 border-t border-gray-200">
        <PlayControls
          playerState={playerState}
          currentClip={currentClip}
          isDarkMode={isDarkMode}
          onPlayPause={onPlayPause}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
        
        {/* 추가 컨트롤 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button className={`px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
              1x
            </button>
            <button className={`p-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}>
              📷
            </button>
            <button className={`p-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}>
              ⊞
            </button>
            <button className={`p-1 rounded transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}>
              ⛶
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

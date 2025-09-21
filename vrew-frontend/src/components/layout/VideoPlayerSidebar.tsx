import { VideoPlayer, PlayControls } from '../video';
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
    <div className={`w-80 border-r h-full flex flex-col ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
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

      {/* 클립 정보 */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="text-sm font-medium mb-2">클립1</div>
        <div className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          현재 재생 중인 클립
        </div>
      </div>

      {/* 업데이트 알림 */}
      <div className={`p-3 border-t ${
        isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-blue-50'
      }`}>
        <div className={`text-xs ${
          isDarkMode ? 'text-gray-300' : 'text-blue-800'
        }`}>
          브루 3.2.0 업데이트 사항을 안내드립니다.
        </div>
        <button className={`text-xs mt-1 ${
          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
        }`}>
          Vrew의 최신 소식을 확인해 보세요!
        </button>
      </div>
    </div>
  );
}

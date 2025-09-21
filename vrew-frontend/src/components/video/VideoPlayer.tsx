import type { RefObject } from 'react';
import type { VideoClip, VideoPlayerState, HoverPreview } from '../../types';
import { VideoService } from '../../services';

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
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
}

export function VideoPlayer({
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
  onTimeSeek
}: VideoPlayerProps) {
  const { currentTime, duration } = playerState;
  const { isHovered, position, time } = hoverPreview;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekTime = VideoService.calculateTimeFromPosition(x, rect.width, duration);
    onTimeSeek(seekTime);
  };

  return (
    <div 
      className="h-full w-full bg-black flex items-center justify-center relative cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={handleClick}
    >
      {currentClip && (
        <video
          ref={videoRef}
          src={currentClip.url}
          className="w-full h-full object-contain pointer-events-none"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onVideoEnded}
          controls={false}
          key={currentClip.id}
        />
      )}
      
      {!currentClip && (
        <div className="text-white text-center">
          <p className="mb-4">비디오를 업로드해주세요</p>
        </div>
      )}

      {/* 시간 프리뷰 툴팁 */}
      {isHovered && currentClip && duration > 0 && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x - 30,
            top: position.y - 60,
          }}
        >
          <div className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium ${
            isDarkMode ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-900 border border-gray-300'
          }`}>
            {VideoService.formatTime(time)}
          </div>
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
              isDarkMode ? 'bg-gray-800 border-r border-b border-gray-600' : 'bg-white border-r border-b border-gray-300'
            }`}
            style={{ top: '100%', marginTop: '-1px' }}
          />
        </div>
      )}

      {/* 진행률 바 */}
      {currentClip && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
          <div 
            className="h-full bg-red-500 transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {isHovered && (
            <div 
              className="absolute top-0 w-0.5 h-full bg-white opacity-75"
              style={{ left: `${(time / duration) * 100}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}

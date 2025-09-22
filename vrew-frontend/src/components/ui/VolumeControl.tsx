import { useState } from 'react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  isDarkMode: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  isDarkMode,
  onVolumeChange,
  onToggleMute
}: VolumeControlProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      );
    } else if (volume < 0.3) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
        </svg>
      );
    } else if (volume < 0.7) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      );
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    onVolumeChange(newVolume);
  };

  const displayVolume = isMuted ? 0 : volume;

  return (
    <div 
      className="flex items-center space-x-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 음소거 버튼 */}
      <button
        onClick={onToggleMute}
        className={`p-1 rounded transition-colors ${
          isDarkMode 
            ? 'hover:bg-gray-600 text-gray-300' 
            : 'hover:bg-gray-200 text-gray-600'
        }`}
        title={isMuted ? '음소거 해제' : '음소거'}
      >
        {getVolumeIcon()}
      </button>

      {/* 볼륨 슬라이더 - 호버 시에만 표시 */}
      <div className={`transition-all duration-200 overflow-hidden ${
        isHovered ? 'w-20 opacity-100' : 'w-0 opacity-0'
      }`}>
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={displayVolume}
            onChange={handleSliderChange}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${displayVolume * 100}%, ${
                isDarkMode ? '#4b5563' : '#d1d5db'
              } ${displayVolume * 100}%, ${
                isDarkMode ? '#4b5563' : '#d1d5db'
              } 100%)`
            }}
          />
        </div>
      </div>

      {/* 볼륨 퍼센트 표시 - 호버 시에만 */}
      {isHovered && (
        <span className="text-xs text-gray-500 w-8 text-right">
          {Math.round(displayVolume * 100)}%
        </span>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

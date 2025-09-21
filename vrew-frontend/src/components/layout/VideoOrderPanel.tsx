import { useState, useRef } from 'react';
import type { VideoClip } from '../../types';

interface VideoOrderPanelProps {
  clips: VideoClip[];
  currentClipIndex: number;
  isDarkMode: boolean;
  onClipSelect: (index: number) => void;
  onAddClip: (file: File) => void;
  onReorderClips: (newClips: VideoClip[]) => void;
}

export function VideoOrderPanel({
  clips,
  currentClipIndex,
  isDarkMode,
  onClipSelect,
  onAddClip,
  onReorderClips
}: VideoOrderPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClip = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onAddClip(file);
    } else {
      alert('비디오 파일을 선택해주세요.');
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newClips = [...clips];
      const draggedClip = newClips[draggedIndex];
      newClips.splice(draggedIndex, 1);
      newClips.splice(dropIndex, 0, draggedClip);
      onReorderClips(newClips);
    }
    setDraggedIndex(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* 헤더 */}
      <div className={`px-6 py-5 border-b ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          영상 순서
        </h3>
        <p className={`text-sm mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          드래그하여 순서 변경
        </p>
      </div>

      {/* 영상 추가 버튼 */}
      <div className="px-6 py-4">
        <button 
          onClick={handleAddClip}
          className={`w-full py-3 px-4 rounded-lg border-2 border-dashed transition-colors ${
            isDarkMode 
              ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-900/20' 
              : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          + 영상 추가
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 영상 리스트 */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
          {clips.map((clip, index) => (
            <div
              key={clip.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`p-4 rounded-lg border cursor-move transition-all ${
                currentClipIndex === index
                  ? isDarkMode
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : isDarkMode
                  ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
              } ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
              onClick={() => onClipSelect(index)}
            >
              <div className="flex items-start space-x-4">
                {/* 드래그 핸들 */}
                <div className={`w-5 h-5 rounded flex items-center justify-center mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ⋮⋮
                </div>
                
                {/* 썸네일 */}
                <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center text-sm text-gray-600 flex-shrink-0">
                  📹
                </div>
                
                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium mb-1 break-words ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {clip.name || `클립 ${index + 1}`}
                  </div>
                  <div className={`text-xs mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {clip.duration ? formatTime(clip.duration) : '00:00'} 
                    {clip.file && (
                      <span className="ml-2">
                        • {(clip.file.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {clip.file?.type || 'video/mp4'}
                  </div>
                </div>
                
                {/* 순서 번호 */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
          
          {clips.length === 0 && (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-5xl mb-4">📹</div>
              <div className="text-sm">영상을 추가해주세요</div>
              <div className="text-xs mt-1 opacity-75">드래그하여 순서를 변경할 수 있습니다</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

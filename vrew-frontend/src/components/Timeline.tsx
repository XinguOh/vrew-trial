import { useRef, useEffect, useState } from "react";

interface VideoClip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
}

interface TimelineProps {
  clips: VideoClip[];
  onClipsReorder: (newClips: VideoClip[]) => void;
  currentTime: number;
  onTimeSeek: (time: number) => void;
  isDarkMode: boolean;
  currentClipIndex: number;
  onClipSelect: (index: number) => void;
}

export function Timeline({ 
  clips, 
  onClipsReorder, 
  currentTime, 
  onTimeSeek, 
  isDarkMode,
  currentClipIndex,
  onClipSelect 
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 전체 지속시간 계산
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  // 시간을 픽셀로 변환
  const timeToPixel = (time: number) => {
    if (totalDuration === 0) return 0;
    const timelineWidth = 800; // 고정 너비
    return (time / totalDuration) * timelineWidth;
  };

  // 픽셀을 시간으로 변환
  const pixelToTime = (pixel: number) => {
    const timelineWidth = 800;
    return (pixel / timelineWidth) * totalDuration;
  };

  // 시간 표시 포맷
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 타임라인 클릭으로 시간 이동
  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = pixelToTime(clickX);
    
    // 클릭한 시간에 해당하는 클립 찾기
    let accumulatedTime = 0;
    let targetClipIndex = 0;
    let timeWithinClip = newTime;
    
    for (let i = 0; i < clips.length; i++) {
      if (newTime <= accumulatedTime + clips[i].duration) {
        targetClipIndex = i;
        timeWithinClip = newTime - accumulatedTime;
        break;
      }
      accumulatedTime += clips[i].duration;
    }
    
    onClipSelect(targetClipIndex);
    onTimeSeek(timeWithinClip);
  };

  // 드래그 시작
  const handleDragStart = (event: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDraggedClipIndex(index);
    event.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setDragOverIndex(index);
  };

  // 드래그 종료
  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    
    if (draggedClipIndex === null) return;
    
    const newClips = [...clips];
    const draggedClip = newClips[draggedClipIndex];
    
    // 드래그된 클립 제거
    newClips.splice(draggedClipIndex, 1);
    
    // 새 위치에 삽입
    const insertIndex = draggedClipIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newClips.splice(insertIndex, 0, draggedClip);
    
    onClipsReorder(newClips);
    
    setIsDragging(false);
    setDraggedClipIndex(null);
    setDragOverIndex(null);
  };

  // 현재 재생 위치의 전체 타임라인에서의 시간 계산
  const getCurrentGlobalTime = () => {
    let accumulatedTime = 0;
    for (let i = 0; i < currentClipIndex; i++) {
      accumulatedTime += clips[i]?.duration || 0;
    }
    return accumulatedTime + currentTime;
  };

  return (
    <div className={`p-4 border-t ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
    }`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">타임라인</h3>
        <div className="text-sm text-gray-500">
          전체 길이: {formatTime(totalDuration)} | 현재: {formatTime(getCurrentGlobalTime())}
        </div>
      </div>

      {/* 시간 눈금 */}
      <div className="relative mb-2">
        <div className="flex justify-between text-xs text-gray-500">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="text-center">
              {formatTime((totalDuration / 10) * i)}
            </div>
          ))}
        </div>
      </div>

      {/* 타임라인 */}
      <div 
        ref={timelineRef}
        className={`relative h-20 border rounded cursor-pointer overflow-hidden ${
          isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'
        }`}
        onClick={handleTimelineClick}
        style={{ width: '800px' }}
      >
        {/* 클립들 */}
        {clips.map((clip, index) => {
          const accumulatedDuration = clips.slice(0, index).reduce((sum, c) => sum + c.duration, 0);
          const clipWidth = timeToPixel(clip.duration);
          const clipLeft = timeToPixel(accumulatedDuration);
          
          return (
            <div
              key={clip.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`absolute top-1 h-16 border rounded cursor-move transition-all ${
                index === currentClipIndex
                  ? 'border-blue-500 bg-blue-200 dark:bg-blue-900'
                  : isDarkMode
                  ? 'border-gray-500 bg-gray-600 hover:bg-gray-500'
                  : 'border-gray-400 bg-white hover:bg-gray-50'
              } ${dragOverIndex === index ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                left: `${clipLeft}px`,
                width: `${clipWidth}px`,
                minWidth: '60px'
              }}
            >
              <div className="p-2 h-full flex flex-col justify-between">
                <div className="text-xs font-medium truncate">{clip.name}</div>
                <div className="text-xs text-gray-500">{formatTime(clip.duration)}</div>
              </div>
              
              {/* 클립 번호 */}
              <div className={`absolute top-0 left-0 w-6 h-6 rounded-br text-xs flex items-center justify-center text-white ${
                index === currentClipIndex ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {index + 1}
              </div>
            </div>
          );
        })}

        {/* 재생 헤드 (현재 시간 표시) */}
        {totalDuration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{
              left: `${timeToPixel(getCurrentGlobalTime())}px`
            }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-500"></div>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={() => onTimeSeek(0)}
          className={`px-3 py-1 rounded text-sm ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          처음으로
        </button>
        
        <button
          onClick={() => {
            const prevClipIndex = Math.max(0, currentClipIndex - 1);
            onClipSelect(prevClipIndex);
            onTimeSeek(0);
          }}
          disabled={currentClipIndex === 0}
          className={`px-3 py-1 rounded text-sm ${
            currentClipIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          이전 클립
        </button>
        
        <button
          onClick={() => {
            const nextClipIndex = Math.min(clips.length - 1, currentClipIndex + 1);
            onClipSelect(nextClipIndex);
            onTimeSeek(0);
          }}
          disabled={currentClipIndex === clips.length - 1}
          className={`px-3 py-1 rounded text-sm ${
            currentClipIndex === clips.length - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          다음 클립
        </button>
      </div>
    </div>
  );
}


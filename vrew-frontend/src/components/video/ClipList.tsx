import type { VideoClip, DragDropState } from '../../types';
import { VideoService } from '../../services';

interface ClipListProps {
  clips: VideoClip[];
  currentClipIndex: number;
  dragDropState: DragDropState;
  isDarkMode: boolean;
  onClipSelect: (index: number) => void;
  onDeleteClip: (index: number) => void;
  onAddClip: (file: File) => void;
  onDragStart: (event: React.DragEvent, index: number) => void;
  onDragOver: (event: React.DragEvent, index: number) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, index: number) => void;
}

export function ClipList({
  clips,
  currentClipIndex,
  dragDropState,
  isDarkMode,
  onClipSelect,
  onDeleteClip,
  onAddClip,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: ClipListProps) {
  const { dragOverIndex } = dragDropState;

  return (
    <div className={`w-80 border-r h-full overflow-y-auto ${
      isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">클립 목록 ({clips.length})</h2>
          <button 
            onClick={() => clips.length > 1 && onDeleteClip(currentClipIndex)}
            className={`text-red-500 text-sm ${
              clips.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'
            }`}
            disabled={clips.length <= 1}
          >
            삭제
          </button>
        </div>
        
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {clips.map((clip, index) => (
            <div 
              key={clip.id}
              draggable
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={(e) => onDrop(e, index)}
              onDragLeave={onDragLeave}
              onClick={() => onClipSelect(index)}
              className={`border rounded-lg p-3 cursor-pointer transition-all relative ${
                index === currentClipIndex
                  ? (isDarkMode ? 'border-blue-500 bg-gray-700' : 'border-blue-500 bg-blue-50')
                  : (isDarkMode ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50')
              } ${dragOverIndex === index ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
            >
              {/* 드래그 핸들 */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>

              {/* 순서 번호 */}
              <div className={`absolute top-1 right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                index === currentClipIndex ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                {index + 1}
              </div>

              <div className="flex items-center space-x-3 pl-6">
                <div className="w-16 h-12 bg-gray-400 rounded flex items-center justify-center">
                  🎬
                </div>
                <div className="flex-1 pr-8">
                  <div className="text-sm font-medium truncate">{clip.name}</div>
                  <div className="text-xs text-gray-500">
                    {clip.duration > 0 ? VideoService.formatTime(clip.duration) : '로딩 중...'}
                  </div>
                  {index === currentClipIndex && (
                    <div className="text-xs text-blue-500 mt-1">● 재생 중</div>
                  )}
                </div>
              </div>

              {/* 드래그 중 시각적 효과 */}
              {dragOverIndex === index && (
                <div className="absolute inset-0 bg-blue-400 bg-opacity-10 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

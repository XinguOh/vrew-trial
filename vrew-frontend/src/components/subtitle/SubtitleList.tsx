import { SubtitleEditor } from './SubtitleEditor';
import type { Subtitle } from '../../types';

interface SubtitleListProps {
  subtitles: Subtitle[];
  selectedSubtitleId: string | null;
  isDarkMode: boolean;
  currentTime: number;
  onUpdate: (id: string, updates: Partial<Subtitle>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
  onAddSubtitle: (startTime: number, endTime: number) => void;
}

export function SubtitleList({
  subtitles,
  selectedSubtitleId,
  isDarkMode,
  currentTime,
  onUpdate,
  onDelete,
  onDuplicate,
  onSelect,
  onAddSubtitle
}: SubtitleListProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddAtCurrentTime = () => {
    const startTime = currentTime;
    const endTime = currentTime + 3; // 기본 3초 길이
    onAddSubtitle(startTime, endTime);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            자막 편집
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            총 {subtitles.length}개의 자막
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleAddAtCurrentTime}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            + 현재 시간에 추가
          </button>
        </div>
      </div>

      {/* 현재 시간 표시 */}
      <div className={`p-3 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            현재 재생 시간
          </span>
          <span className={`font-mono text-lg font-bold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* 자막 목록 */}
      <div className="space-y-3">
        {subtitles.length === 0 ? (
          <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
            isDarkMode 
              ? 'border-gray-600 text-gray-400' 
              : 'border-gray-300 text-gray-500'
          }`}>
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">아직 자막이 없습니다</p>
            <p className="text-xs mt-1">위의 버튼을 클릭하여 자막을 추가해보세요</p>
          </div>
        ) : (
          subtitles.map((subtitle) => (
            <SubtitleEditor
              key={subtitle.id}
              subtitle={subtitle}
              isDarkMode={isDarkMode}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onSelect={onSelect}
              isSelected={selectedSubtitleId === subtitle.id}
            />
          ))
        )}
      </div>

      {/* 현재 재생 중인 자막 하이라이트 */}
      {subtitles.some(subtitle => 
        currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
      ) && (
        <div className={`p-2 rounded border-l-4 ${
          isDarkMode 
            ? 'bg-blue-900/20 border-blue-500' 
            : 'bg-blue-50 border-blue-500'
        }`}>
          <div className="text-xs text-blue-600 font-medium">
            🎬 현재 재생 중인 자막
          </div>
        </div>
      )}
    </div>
  );
}

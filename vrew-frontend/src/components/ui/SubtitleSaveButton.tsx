import { useState, useRef } from 'react';
import { SubtitleService } from '../../services';
import type { Subtitle } from '../../types';

interface SubtitleSaveButtonProps {
  subtitles: Subtitle[];
  isDarkMode: boolean;
  disabled?: boolean;
}

export function SubtitleSaveButton({ 
  subtitles, 
  isDarkMode, 
  disabled = false 
}: SubtitleSaveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSubtitles = subtitles.length > 0;

  const handleSaveSRT = () => {
    if (!hasSubtitles) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `subtitles_${timestamp}.srt`;
    SubtitleService.saveAsSRT(subtitles, filename);
    setIsOpen(false);
  };

  const handleSaveVTT = () => {
    if (!hasSubtitles) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `subtitles_${timestamp}.vtt`;
    SubtitleService.saveAsVTT(subtitles, filename);
    setIsOpen(false);
  };

  const handleSaveJSON = () => {
    if (!hasSubtitles) return;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `subtitles_${timestamp}.json`;
    SubtitleService.saveAsJSON(subtitles, filename);
    setIsOpen(false);
  };

  const handleLoadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const loadedSubtitles = await SubtitleService.loadFromJSON(file);
      // 부모 컴포넌트에서 처리할 수 있도록 이벤트 발생
      const customEvent = new CustomEvent('subtitlesLoaded', { 
        detail: { subtitles: loadedSubtitles } 
      });
      window.dispatchEvent(customEvent);
      
      alert(`✅ 자막 파일이 성공적으로 로드되었습니다!\n\n로드된 자막 수: ${loadedSubtitles.length}개`);
    } catch (error) {
      console.error('자막 파일 로드 오류:', error);
      alert(`❌ 자막 파일 로드 중 오류가 발생했습니다:\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }

    // 파일 입력 초기화
    event.target.value = '';
  };

  return (
    <div className="relative">
      {/* 메인 저장 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          disabled
            ? isDarkMode
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : hasSubtitles
            ? isDarkMode
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
            : isDarkMode
            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
        title={hasSubtitles ? '자막 저장' : '저장할 자막이 없습니다'}
      >
        <span>💾</span>
        <span>자막 저장</span>
        {hasSubtitles && (
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            isDarkMode ? 'bg-green-500 text-white' : 'bg-green-400 text-green-900'
          }`}>
            {subtitles.length}
          </span>
        )}
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg border z-50 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-2">
            <div className={`text-xs font-medium mb-2 px-2 py-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              저장 형식 선택
            </div>
            
            <div className="space-y-1">
              <button
                onClick={handleSaveSRT}
                disabled={!hasSubtitles}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  hasSubtitles
                    ? isDarkMode
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                    : isDarkMode
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>📄</span>
                  <div>
                    <div className="font-medium">SRT 형식</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      일반적인 자막 파일
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSaveVTT}
                disabled={!hasSubtitles}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  hasSubtitles
                    ? isDarkMode
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                    : isDarkMode
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>🌐</span>
                  <div>
                    <div className="font-medium">VTT 형식</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      웹 자막 파일
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSaveJSON}
                disabled={!hasSubtitles}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  hasSubtitles
                    ? isDarkMode
                      ? 'text-white hover:bg-gray-700'
                      : 'text-gray-900 hover:bg-gray-100'
                    : isDarkMode
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>💾</span>
                  <div>
                    <div className="font-medium">JSON 형식</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      프로젝트 백업용
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className={`border-t my-2 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}></div>

            <button
              onClick={handleLoadFile}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>📂</span>
                <div>
                  <div className="font-medium">자막 파일 불러오기</div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    JSON 형식만 지원
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 외부 클릭 시 메뉴 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

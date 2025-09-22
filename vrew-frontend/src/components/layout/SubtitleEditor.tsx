import { useState } from 'react';
import type { VideoClip } from '../../types';

interface SubtitleEditorProps {
  clips: VideoClip[];
  currentClipIndex: number;
  isDarkMode: boolean;
  subtitleManager: any; // 실제 타입에 맞게 수정 필요
  currentTime?: number; // 현재 재생 시간
  onSubtitleChange?: (subtitles: Subtitle[]) => void; // 자막 변경 콜백
}

interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  isEditing?: boolean;
  style?: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    position: 'top' | 'center' | 'bottom';
    alignment: 'left' | 'center' | 'right';
  };
}

export function SubtitleEditor({
  clips,
  currentClipIndex,
  isDarkMode,
  subtitleManager,
  currentTime = 0,
  onSubtitleChange,
}: SubtitleEditorProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([  ]);

  // 자막 변경 시 상위 컴포넌트에 알림
  const updateSubtitles = (newSubtitles: Subtitle[]) => {
    setSubtitles(newSubtitles);
    onSubtitleChange?.(newSubtitles);
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingStyle, setEditingStyle] = useState({
    fontSize: 24,
    fontFamily: 'Pretendard',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'bottom' as 'top' | 'center' | 'bottom',
    alignment: 'center' as 'left' | 'center' | 'right'
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddSubtitle = () => {
    const newSubtitle: Subtitle = {
      id: Date.now().toString(),
      text: '새 자막',
      startTime: subtitles.length * 3,
      endTime: (subtitles.length + 1) * 3,
      style: { ...editingStyle }
    };
    updateSubtitles([...subtitles, newSubtitle]);
  };

  const handleEditStart = (subtitle: Subtitle) => {
    setEditingId(subtitle.id);
    setEditingText(subtitle.text);
    setEditingStyle(subtitle.style || { ...editingStyle });
  };

  const handleEditSave = () => {
    if (editingId) {
      updateSubtitles(subtitles.map(sub => 
        sub.id === editingId ? { 
          ...sub, 
          text: editingText,
          style: { ...editingStyle }
        } : sub
      ));
      setEditingId(null);
      setEditingText('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDeleteSubtitle = (id: string) => {
    updateSubtitles(subtitles.filter(sub => sub.id !== id));
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: number) => {
    updateSubtitles(subtitles.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ));
  };

  // 현재 재생 중인 자막 찾기 (실제로는 videoPlayer의 currentTime을 사용해야 함)
  const getCurrentSubtitle = (currentTime: number = 0) => {
    return subtitles.find(sub => 
      currentTime >= sub.startTime && currentTime <= sub.endTime
    ) || null;
  };

  return (
    <div className={`h-full flex flex-col ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* 헤더 */}
      <div className={`p-6 border-b ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              자막 편집
            </h3>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              자막을 추가하고 편집하세요
            </p>
          </div>
          <button
            onClick={handleAddSubtitle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            + 자막 추가
          </button>
        </div>
      </div>

      {/* 자막 리스트 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {subtitles.map((subtitle, index) => (
            <div
              key={subtitle.id}
              className={`p-4 rounded-lg border ${
                isDarkMode
                  ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* 순서 번호 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>

                {/* 시간 설정 */}
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <label className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      시작
                    </label>
                    <input
                      type="number"
                      value={subtitle.startTime}
                      onChange={(e) => handleTimeChange(subtitle.id, 'startTime', Number(e.target.value))}
                      className={`w-16 px-2 py-1 text-sm rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    -
                  </span>
                  <div className="flex flex-col space-y-1">
                    <label className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      끝
                    </label>
                    <input
                      type="number"
                      value={subtitle.endTime}
                      onChange={(e) => handleTimeChange(subtitle.id, 'endTime', Number(e.target.value))}
                      className={`w-16 px-2 py-1 text-sm rounded border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* 자막 텍스트 */}
                <div className="flex-1">
                  {editingId === subtitle.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className={`w-full p-3 rounded border resize-none ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        rows={2}
                        placeholder="자막 텍스트를 입력하세요"
                      />
                      
                      {/* 스타일 컨트롤 */}
                      <div className="mt-4 space-y-4">
                        <h4 className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          스타일 설정
                        </h4>
                        
                        {/* 폰트 설정 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              폰트 크기
                            </label>
                            <input
                              type="number"
                              min="12"
                              max="72"
                              value={editingStyle.fontSize}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                fontSize: parseInt(e.target.value) || 24
                              })}
                              className={`w-full p-2 rounded border text-sm ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              폰트 패밀리
                            </label>
                            <select
                              value={editingStyle.fontFamily}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                fontFamily: e.target.value
                              })}
                              className={`w-full p-2 rounded border text-sm ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="Pretendard">Pretendard</option>
                              <option value="Arial">Arial</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Times New Roman">Times New Roman</option>
                              <option value="Georgia">Georgia</option>
                              <option value="Verdana">Verdana</option>
                            </select>
                          </div>
                        </div>

                        {/* 위치 설정 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              위치
                            </label>
                            <select
                              value={editingStyle.position}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                position: e.target.value as 'top' | 'center' | 'bottom'
                              })}
                              className={`w-full p-2 rounded border text-sm ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="top">상단</option>
                              <option value="center">중앙</option>
                              <option value="bottom">하단</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              정렬
                            </label>
                            <select
                              value={editingStyle.alignment}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                alignment: e.target.value as 'left' | 'center' | 'right'
                              })}
                              className={`w-full p-2 rounded border text-sm ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="left">왼쪽</option>
                              <option value="center">중앙</option>
                              <option value="right">오른쪽</option>
                            </select>
                          </div>
                        </div>

                        {/* 색상 설정 */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              텍스트 색상
                            </label>
                            <input
                              type="color"
                              value={editingStyle.color}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                color: e.target.value
                              })}
                              className="w-full h-10 rounded border border-gray-300"
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              배경 색상
                            </label>
                            <input
                              type="color"
                              value={editingStyle.backgroundColor}
                              onChange={(e) => setEditingStyle({
                                ...editingStyle,
                                backgroundColor: e.target.value
                              })}
                              className="w-full h-10 rounded border border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleEditSave}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            isDarkMode 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          저장
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-600 text-white hover:bg-gray-500' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {subtitle.text}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 액션 버튼들 */}
                {editingId !== subtitle.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditStart(subtitle)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      편집
                    </button>
                    <button
                      onClick={() => handleDeleteSubtitle(subtitle.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {subtitles.length === 0 && (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-6xl mb-4">📝</div>
              <div className="text-lg mb-2">자막이 없습니다</div>
              <div className="text-sm">+ 자막 추가 버튼을 클릭하여 자막을 추가하세요</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

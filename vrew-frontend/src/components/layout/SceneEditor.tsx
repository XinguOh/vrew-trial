import { useState, useRef } from 'react';
import type { VideoClip } from '../../types';

interface SceneEditorProps {
  clips: VideoClip[];
  currentClipIndex: number;
  isDarkMode: boolean;
  onAddClip: (file: File) => void;
}

export function SceneEditor({
  clips,
  currentClipIndex,
  isDarkMode,
  onAddClip
}: SceneEditorProps) {
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'video' | 'order' | 'subtitle'>('video');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleSceneSelect = (index: number) => {
  //   setSelectedScenes(prev => 
  //     prev.includes(index) 
  //       ? prev.filter(i => i !== index)
  //       : [...prev, index]
  //   );
  // };

  const handleSelectAll = () => {
    if (selectedScenes.length === clips.length) {
      setSelectedScenes([]);
    } else {
      setSelectedScenes(clips.map((_, index) => index));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddScene = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onAddClip(file);
    } else {
      alert('비디오 파일을 선택해주세요.');
    }
    // 파일 입력 초기화
    if (event.target) {
      event.target.value = '';
    }
  };

  // 탭별 렌더링 함수들
  const renderVideoTab = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {/* 씬 추가 버튼 */}
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <button 
            onClick={handleAddScene}
            className={`w-full py-3 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' 
                : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            + 씬 추가
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 현재 씬 정보 */}
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
              썸네일
            </div>
            <div className="flex-1">
              <div className="font-medium">#1 제목 없는 씬</div>
              <div className="text-sm text-gray-500">00:00 + 6분 49초</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderTab = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className={`p-3 rounded-lg border transition-colors ${
              currentClipIndex === index
                ? isDarkMode
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : isDarkMode
                ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{index + 1}</span>
                <div className="flex flex-col space-y-1">
                  <button className="text-xs text-blue-500 hover:text-blue-700">↑</button>
                  <button className="text-xs text-blue-500 hover:text-blue-700">↓</button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">영상편집</div>
                <div className="text-xs text-gray-500">
                  {formatTime(index * 5)} + 5.00초
                </div>
              </div>
              
              <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
                썸네일
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubtitleTab = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {/* 자막 추가 버튼 */}
        <button className={`w-full py-2 px-4 rounded border-2 border-dashed transition-colors ${
          isDarkMode 
            ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' 
            : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600'
        }`}>
          + 자막 추가
        </button>

        {/* 자막 리스트 */}
        <div className="space-y-2">
          <div className={`p-8 text-center rounded-lg border-2 border-dashed ${
            isDarkMode 
              ? 'border-gray-600 text-gray-400' 
              : 'border-gray-300 text-gray-500'
          }`}>
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">아직 자막이 없습니다</p>
            <p className="text-xs mt-1">위의 버튼을 클릭하여 자막을 추가해보세요</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* 헤더 */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'video'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                1. 영상
              </button>
              <button
                onClick={() => setActiveTab('order')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'order'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2. 영상 순서
              </button>
              <button
                onClick={() => setActiveTab('subtitle')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'subtitle'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3. 자막
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">씬 (1)</span>
            <button className={`px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode 
                ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                : 'text-red-600 hover:text-red-700 hover:bg-gray-100'
            }`}>
              삭제
            </button>
            <button className={`px-2 py-1 text-xs rounded transition-colors ${
              isDarkMode 
                ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                : 'text-blue-600 hover:text-blue-700 hover:bg-gray-100'
            }`}>
              합치기
            </button>
            <label className="flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={selectedScenes.length === clips.length && clips.length > 0}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span>전체 선택</span>
            </label>
          </div>
        </div>

        {/* 현재 씬 카드 */}
        <div className={`p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
              썸네일
            </div>
            <div className="flex-1">
              <div className="font-medium">#1 제목 없는 씬</div>
              <div className="text-sm text-gray-500">00:00 + 6분 49초</div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 내용 */}
      {activeTab === 'video' && renderVideoTab()}
      {activeTab === 'order' && renderOrderTab()}
      {activeTab === 'subtitle' && renderSubtitleTab()}

      {/* 하단 컨트롤 */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        {activeTab === 'video' && (
          <button className={`w-full py-2 text-sm rounded transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            재생 위치 따라가기
          </button>
        )}
        {activeTab === 'order' && (
          <div className="flex space-x-2">
            <button className={`flex-1 py-2 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}>
              순서 저장
            </button>
            <button className={`flex-1 py-2 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              초기화
            </button>
          </div>
        )}
        {activeTab === 'subtitle' && (
          <div className="flex space-x-2">
            <button className={`flex-1 py-2 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}>
              자막 저장
            </button>
            <button className={`flex-1 py-2 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              미리보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

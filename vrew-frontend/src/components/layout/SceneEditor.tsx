import { useState } from 'react';
import type { VideoClip } from '../../types';

interface SceneEditorProps {
  clips: VideoClip[];
  currentClipIndex: number;
  isDarkMode: boolean;
  onClipSelect: (index: number) => void;
  onAddClip: (file: File) => void;
}

export function SceneEditor({
  clips,
  currentClipIndex,
  isDarkMode,
  onClipSelect,
  onAddClip
}: SceneEditorProps) {
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const handleSceneSelect = (index: number) => {
    setSelectedScenes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'overview'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeTab === 'details'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                상세
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

      {/* 씬 추가 버튼 */}
      <div className="p-4">
        <button className={`w-full py-2 text-sm rounded border-2 border-dashed transition-colors ${
          isDarkMode 
            ? 'border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400' 
            : 'border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600'
        }`}>
          씬 추가
        </button>
      </div>

      {/* 세그먼트 리스트 */}
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
                  <input
                    type="checkbox"
                    checked={selectedScenes.includes(index)}
                    onChange={() => handleSceneSelect(index)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-medium">영상편집</div>
                  <div className="flex items-center space-x-1 mt-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-4 h-4 border rounded text-xs flex items-center justify-center ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-400' 
                          : 'border-gray-300 text-gray-500'
                      }`}>
                        ?
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-xs">
                    📄
                  </div>
                  <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
                    썸네일
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm">
                    {formatTime(index * 5)} + 5.00초
                  </div>
                  <button className="text-xs text-blue-500 hover:text-blue-700">
                    🔗
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className={`p-4 border-t ${
        isDarkMode ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <button className={`w-full py-2 text-sm rounded transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}>
          재생 위치 따라가기
        </button>
      </div>
    </div>
  );
}

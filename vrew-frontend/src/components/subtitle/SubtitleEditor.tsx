import { useState } from 'react';
import type { Subtitle, SubtitleStyle } from '../../types';

interface SubtitleEditorProps {
  subtitle: Subtitle;
  isDarkMode: boolean;
  onUpdate: (id: string, updates: Partial<Subtitle>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function SubtitleEditor({
  subtitle,
  isDarkMode,
  onUpdate,
  onDelete,
  onDuplicate,
  onSelect,
  isSelected
}: SubtitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subtitle.text);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleTextSave = () => {
    onUpdate(subtitle.id, { text: editText });
    setIsEditing(false);
  };

  const handleTextCancel = () => {
    setEditText(subtitle.text);
    setIsEditing(false);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const timeInSeconds = parseFloat(value) || 0;
    onUpdate(subtitle.id, { [field]: timeInSeconds });
  };

  const handleStyleChange = (style: Partial<SubtitleStyle>) => {
    onUpdate(subtitle.id, { style: { ...subtitle.style, ...style } });
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? isDarkMode
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-blue-500 bg-blue-50'
          : isDarkMode
          ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
      onClick={() => onSelect(subtitle.id)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">자막</span>
          <span className="text-xs text-gray-400">#{subtitle.id.slice(-6)}</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(subtitle.id);
            }}
            className={`p-1 rounded text-xs transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="복사"
          >
            📋
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subtitle.id);
            }}
            className={`p-1 rounded text-xs transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600'
                : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
            }`}
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* 시간 설정 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">시작 시간</label>
          <input
            type="number"
            step="0.1"
            value={subtitle.startTime}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            className={`w-full px-2 py-1 text-sm rounded border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div className="text-xs text-gray-400 mt-1">{formatTime(subtitle.startTime)}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">종료 시간</label>
          <input
            type="number"
            step="0.1"
            value={subtitle.endTime}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            className={`w-full px-2 py-1 text-sm rounded border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div className="text-xs text-gray-400 mt-1">{formatTime(subtitle.endTime)}</div>
        </div>
      </div>

      {/* 자막 텍스트 */}
      <div className="mb-3">
        <label className="block text-xs text-gray-500 mb-1">자막 텍스트</label>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={`w-full px-2 py-1 text-sm rounded border resize-none ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              rows={2}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextSave();
                }}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextCancel();
                }}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`p-2 rounded border cursor-text ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {subtitle.text || '자막 텍스트를 입력하세요...'}
          </div>
        )}
      </div>

      {/* 스타일 설정 */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500">스타일 설정</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">폰트 크기</label>
            <input
              type="number"
              min="12"
              max="48"
              value={subtitle.style?.fontSize || 24}
              onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
              className={`w-full px-2 py-1 text-sm rounded border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">위치</label>
            <select
              value={subtitle.style?.position || 'bottom'}
              onChange={(e) => handleStyleChange({ position: e.target.value as 'top' | 'center' | 'bottom' })}
              className={`w-full px-2 py-1 text-sm rounded border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <option value="top">상단</option>
              <option value="center">중앙</option>
              <option value="bottom">하단</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">텍스트 색상</label>
            <input
              type="color"
              value={subtitle.style?.color || '#FFFFFF'}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
              className="w-full h-8 rounded border border-gray-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">배경 색상</label>
            <input
              type="color"
              value={subtitle.style?.backgroundColor?.replace('rgba(0, 0, 0, 0.7)', '#000000') || '#000000'}
              onChange={(e) => {
                const color = e.target.value;
                const rgba = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.7)`;
                handleStyleChange({ backgroundColor: rgba });
              }}
              className="w-full h-8 rounded border border-gray-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

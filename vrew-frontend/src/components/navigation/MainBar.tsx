import { useState } from "react";

interface MainBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSubBarVisible: boolean;
  onToggleSubBar: () => void;
}

export function MainBar({ isDarkMode, onToggleDarkMode, isSubBarVisible, onToggleSubBar }: MainBarProps) {
  const menus = [
    "파일",
    "홈",
    "편집",
    "자막",
    "서식",
    "삽입",
    "AI 목소리",
    "템플릿",
    "효과",
    "도움말",
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b transition-colors ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-700'
    }`}>
      <div className="flex items-center">
        <div className="mr-8 font-bold">Junyoung Oh</div>
        <div className="flex space-x-4">
          {menus.map((menu) => (
            <button
              key={menu}
              className={`hover:text-blue-500 transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {menu}
            </button>
          ))}
        </div>
      </div>
      
      {/* 컨트롤 버튼들 */}
      <div className="flex items-center space-x-4">
        {/* SubBar 토글 버튼 */}
        <button
          onClick={onToggleSubBar}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={isSubBarVisible ? '도구바 숨기기' : '도구바 보이기'}
        >
          {isSubBarVisible ? (
            // 숨기기 아이콘 (눈에 슬래시)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            // 보이기 아이콘 (눈)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>

        {/* 다크모드 토글 스위치 */}
        <div className="flex items-center space-x-3">
          {/* 라이트모드 아이콘 */}
          <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          
          {/* 토글 스위치 */}
          <button
            onClick={onToggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            title={isDarkMode ? '라이트모드로 전환' : '다크모드로 전환'}
          >
            {/* 슬라이더 */}
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${
              isDarkMode ? 'translate-x-7' : 'translate-x-1'
            }`}></div>
          </button>
          
          {/* 다크모드 아이콘 */}
          <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </div>
    </nav>
  );
}

import { useState } from "react";

interface MainBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function MainBar({ isDarkMode, onToggleDarkMode }: MainBarProps) {
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
    </nav>
  );
}

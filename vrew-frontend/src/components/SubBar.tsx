interface SubBarProps {
  isDarkMode: boolean;
}

export function SubBar({ isDarkMode }: SubBarProps) {
  return (
    <div className={`fixed top-16 left-0 right-0 z-40 border-b px-6 py-2 transition-colors ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center space-x-1">
        {/* 새로 만들기 */}
        <div className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 cursor-pointer">
          <div className="w-4 h-4 bg-current rounded-sm flex items-center justify-center">
            <span className="text-xs">+</span>
          </div>
          <span>새로 만들기</span>
        </div>

        {/* 프로젝트 열기 */}
        <div className={`flex items-center space-x-1 border px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}>
          <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
          <span>프로젝트 열기</span>
        </div>

        {/* 구분선 */}
        <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

        {/* 재생 (비활성화) */}
        <div className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm cursor-not-allowed ${
          isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'
        }`}>
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>재생</span>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* 되돌리기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>되돌리기</span>
        </div>

        {/* 다시실행 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>다시실행</span>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* 잘라내기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>잘라내기</span>
        </div>

        {/* 복사하기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>복사하기</span>
        </div>

        {/* 붙여넣기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>붙여넣기</span>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* 클립 합치기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>클립 합치기</span>
        </div>

        {/* 클립 나누기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span>클립 나누기</span>
        </div>

        {/* 구분선 */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* 무음 구간 줄이기 (비활성화) */}
        <div className="flex items-center space-x-1 bg-gray-100 text-gray-400 px-3 py-1.5 rounded text-sm cursor-not-allowed">
          <div className="w-4 h-4 bg-current rounded-sm"></div>
          <span className="whitespace-nowrap">무음 구간 줄이기</span>
        </div>
      </div>
    </div>
  );
}

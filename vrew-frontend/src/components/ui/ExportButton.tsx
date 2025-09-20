import type { ExportProgress } from '../../types';

interface ExportButtonProps {
  isFFmpegLoaded: boolean;
  ffmpegError: string | null;
  exportState: ExportProgress;
  hasClips: boolean;
  isDarkMode: boolean;
  onExport: () => void;
  onRetryFFmpeg?: () => void; // FFmpeg 재시도 함수 (옵셔널)
}

export function ExportButton({
  isFFmpegLoaded,
  ffmpegError,
  exportState,
  hasClips,
  isDarkMode,
  onExport,
  onRetryFFmpeg
}: ExportButtonProps) {
  const { isExporting, progress } = exportState;
  const isDisabled = !hasClips || isExporting;

  return (
    <div className="relative">
      <button
        onClick={onExport}
        disabled={isDisabled}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          ffmpegError
            ? 'bg-red-500 text-white cursor-not-allowed'
            : isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : (isDarkMode 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
              )
        }`}
        title={ffmpegError || undefined}
      >
        <div className="flex items-center space-x-2">
          {ffmpegError ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>로드 실패</span>
            </>
          ) : isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>추출 중... {progress}%</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>
                {!isFFmpegLoaded ? '영상 추출 (기본 모드)' : '영상 추출'}
              </span>
            </>
          )}
        </div>
      </button>
      
      {/* 에러 상세 정보 툴팁 */}
      {ffmpegError && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-100 border border-red-300 rounded-lg shadow-lg z-50 max-w-xs">
          <div className="text-sm text-red-800">
            <div className="font-semibold mb-1">FFmpeg 로드 실패</div>
            <div className="text-xs mb-2">{ffmpegError}</div>
            <div className="text-xs mb-2 text-blue-700">
              💡 FFmpeg 없이도 영상 추출이 가능합니다! "영상 추출" 버튼을 클릭하면 브라우저 기본 기능으로 병합됩니다.
            </div>
            <div className="flex space-x-2">
              {onRetryFFmpeg && (
                <button 
                  onClick={onRetryFFmpeg} 
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  FFmpeg 재시도
                </button>
              )}
              <button 
                onClick={() => window.location.reload()} 
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

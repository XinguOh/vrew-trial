import { useLocation } from "react-router-dom";
import { VideoPlayer, ClipList, Timeline } from "../../components/video";
import { ExportButton, PlayControls } from "../../components/ui";
import { useFFmpeg, useVideoPlayer, useClipManager, useHoverPreview } from "../../hooks";
import type { EditorPageProps } from "../../types";
import { VideoService } from "../../services";

export function EditorPage({ isDarkMode, onToggleDarkMode }: EditorPageProps) {
  const location = useLocation();
  const initialVideoFile = location.state?.videoFile;

  // 커스텀 훅들
  const clipManager = useClipManager(initialVideoFile);
  const { isFFmpegLoaded, ffmpegError, exportState, exportVideo, exportVideoFallback, retryFFmpegInitialization } = useFFmpeg();
  const hoverPreview = useHoverPreview();
  
  const videoPlayer = useVideoPlayer({
    clips: clipManager.videoClips,
    currentClipIndex: clipManager.currentClipIndex,
    onClipIndexChange: clipManager.setCurrentClipIndex
  });

  // 이벤트 핸들러들
  const handleAddClip = (file: File) => {
    const success = clipManager.addClip(file);
    if (success) {
      clipManager.selectClip(clipManager.videoClips.length);
    }
  };

  const handleClipSelect = (index: number) => {
    clipManager.selectClip(index);
  };

  const handleVideoMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    hoverPreview.handleMouseMove(event, videoPlayer.playerState.duration);
  };

  const handleLoadedMetadata = () => {
    videoPlayer.handleLoadedMetadata();
    // 클립 duration 업데이트
    if (videoPlayer.videoRef.current) {
      clipManager.updateClipDuration(
        clipManager.currentClipIndex, 
        videoPlayer.videoRef.current.duration
      );
    }
  };

  const handleExportVideo = async () => {
    try {
      let result;
      
      // FFmpeg가 로드된 경우 FFmpeg 사용, 아니면 fallback 사용
      if (isFFmpegLoaded) {
        console.log('FFmpeg를 사용하여 내보내기');
        result = await exportVideo(clipManager.videoClips);
      } else {
        console.log('FFmpeg가 로드되지 않음. Fallback 방식 사용');
        result = await exportVideoFallback(clipManager.videoClips);
        
        if (clipManager.videoClips.length > 1) {
          alert('FFmpeg 대신 브라우저 기본 기능으로 클립 병합을 시도했습니다. WebM 형식으로 저장되며, 품질이 FFmpeg보다 낮을 수 있습니다. 최고 품질을 원하시면 페이지를 새로고침하고 FFmpeg 로딩을 기다려주세요.');
        }
      }
      
      VideoService.downloadBlob(result.blob, result.filename);
      alert('영상 추출이 완료되었습니다!');
    } catch (error) {
      console.error('영상 추출 중 오류:', error);
      
      // 추가적인 에러 처리 및 사용자 안내
      if (error instanceof Error && error.message.includes('FFmpeg가 아직 로드되지 않았습니다')) {
        alert('FFmpeg가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요. 또는 페이지를 새로고침하여 다시 시도할 수 있습니다.');
      } else {
        alert('영상 추출 중 오류가 발생했습니다: ' + error);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* 메인바 (편집 모드) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-700'
      }`}>
        <div className="flex items-center">
          <div className="mr-8 font-bold">Vrew 편집기</div>
          <div className="flex space-x-4">
            <button className={`hover:text-blue-500 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>파일</button>
            <button className={`hover:text-blue-500 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>편집</button>
            <button className={`hover:text-blue-500 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>자막</button>
          </div>
        </div>
        
        {/* 영상 추출 버튼과 다크모드 토글 */}
        <div className="flex items-center space-x-4">
          <ExportButton
            isFFmpegLoaded={isFFmpegLoaded}
            ffmpegError={ffmpegError}
            exportState={exportState}
            hasClips={clipManager.videoClips.length > 0}
            isDarkMode={isDarkMode}
            onExport={handleExportVideo}
            onRetryFFmpeg={retryFFmpegInitialization}
          />
          
          {/* 다크모드 토글 */}
          <div className="flex items-center space-x-3">
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
            <button
              onClick={onToggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${
                isDarkMode ? 'translate-x-7' : 'translate-x-1'
              }`}></div>
            </button>
            <svg className={`w-5 h-5 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>
      </nav>

      {/* 메인 편집 영역 */}
      <div className="pt-16 h-screen flex">
        {/* 왼쪽 사이드바 - 클립 리스트 */}
        <ClipList
          clips={clipManager.videoClips}
          currentClipIndex={clipManager.currentClipIndex}
          dragDropState={clipManager.dragDropState}
          isDarkMode={isDarkMode}
          onClipSelect={handleClipSelect}
          onDeleteClip={clipManager.deleteClip}
          onAddClip={handleAddClip}
          onDragStart={clipManager.dragHandlers.handleDragStart}
          onDragOver={clipManager.dragHandlers.handleDragOver}
          onDragLeave={clipManager.dragHandlers.handleDragLeave}
          onDrop={clipManager.dragHandlers.handleDrop}
        />

        {/* 중앙 - 비디오 플레이어와 자막 */}
        <div className="flex-1 flex flex-col">
          {/* 비디오 플레이어 */}
          <VideoPlayer
            videoRef={videoPlayer.videoRef}
            currentClip={videoPlayer.currentClip}
            playerState={videoPlayer.playerState}
            hoverPreview={hoverPreview.hoverPreview}
            isDarkMode={isDarkMode}
            onTimeUpdate={videoPlayer.handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onVideoEnded={videoPlayer.handleVideoEnded}
            onMouseEnter={hoverPreview.handleMouseEnter}
            onMouseLeave={hoverPreview.handleMouseLeave}
            onMouseMove={handleVideoMouseMove}
            onTimeSeek={videoPlayer.handleTimeSeek}
          />

          {/* 재생 컨트롤 */}
          <PlayControls
            playerState={videoPlayer.playerState}
            currentClip={videoPlayer.currentClip}
            isDarkMode={isDarkMode}
            onPlayPause={videoPlayer.handlePlayPause}
            onVolumeChange={videoPlayer.handleVolumeChange}
            onToggleMute={videoPlayer.handleToggleMute}
          />

          {/* 자막 편집 영역 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-5 gap-4 mb-6">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className={`p-4 border rounded-lg ${
                  index === 4 
                    ? (isDarkMode ? 'border-blue-500 bg-gray-700' : 'border-blue-500 bg-blue-50')
                    : (isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white')
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">{index}</span>
                    <span className="text-xs text-gray-500">영상편집</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className="text-xs text-gray-400 border rounded px-1">
                        ?
                      </div>
                    ))}
                  </div>
                  <div className="w-8 h-8 bg-gray-400 rounded ml-auto">
                    🎬
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    00:{index < 10 ? '0' : ''}{index * 5} - {Math.floor(videoPlayer.playerState.duration / 5)}초
                  </div>
                </div>
              ))}
            </div>

            {/* 타임라인 */}
            {clipManager.videoClips.length > 0 && (
              <Timeline
                clips={clipManager.videoClips}
                onClipsReorder={clipManager.reorderClips}
                currentTime={videoPlayer.playerState.currentTime}
                onTimeSeek={videoPlayer.handleTimeSeek}
                isDarkMode={isDarkMode}
                currentClipIndex={clipManager.currentClipIndex}
                onClipSelect={handleClipSelect}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

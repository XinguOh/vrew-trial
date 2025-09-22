import { useLocation } from "react-router-dom";
import React from "react";
import { VideoPlayerSidebar, VideoOrderPanel } from "../../components/layout";
import { SubtitleList } from "../../components/subtitle";
import { ExportButton } from "../../components/ui";
import { useFFmpeg, useVideoPlayer, useClipManager, useSubtitleManager } from "../../hooks";
import type { EditorPageProps } from "../../types";
import { VideoService } from "../../services";

export function EditorPage({ isDarkMode }: EditorPageProps) {
  const location = useLocation();
  const initialVideoFile = location.state?.videoFile;


  // 커스텀 훅들
  const clipManager = useClipManager(initialVideoFile);
  const { isFFmpegLoaded, ffmpegError, exportState, exportVideo, retryFFmpegInitialization } = useFFmpeg();
  const subtitleManager = useSubtitleManager();
  
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
      // FFmpeg가 로드되지 않았으면 에러 표시
      if (!isFFmpegLoaded || ffmpegError) {
        // 사용자에게 선택권 제공
        const useFallback = confirm(`❌ FFmpeg가 로드되지 않았습니다.\n\n상태: ${ffmpegError || '로딩 중'}\n\n💡 해결 방법:\n1. "FFmpeg 재시도" 버튼 클릭\n2. 페이지 새로고침\n3. 다른 브라우저 시도\n\n또는 브라우저 기본 기능으로 영상을 추출할 수 있습니다.\n\n브라우저 기본 기능을 사용하시겠습니까?`);
        
        if (useFallback) {
          // Fallback 사용
          const { FallbackExportService } = await import('../../services');
          const result = await FallbackExportService.exportWithBrowserAPI(clipManager.videoClips);
          VideoService.downloadBlob(result.blob, result.filename);
          alert('✅ 브라우저 기본 기능으로 영상 추출이 완료되었습니다!\n\n📝 참고: FFmpeg보다 품질이 낮을 수 있습니다.');
          return;
        } else {
          throw new Error(`FFmpeg가 로드되지 않았습니다.\n\n상태: ${ffmpegError || '로딩 중'}\n\n💡 해결 방법:\n1. "FFmpeg 재시도" 버튼 클릭\n2. 페이지 새로고침\n3. 다른 브라우저 시도\n4. 인터넷 연결 확인`);
        }
      }
      
      console.log('✅ FFmpeg를 사용하여 내보내기');
      const result = await exportVideo(clipManager.videoClips);
      
      VideoService.downloadBlob(result.blob, result.filename);
      alert('🎉 고품질 영상 추출이 완료되었습니다! (FFmpeg 사용)');
    } catch (error) {
      console.error('❌ 영상 추출 중 오류:', error);
      
      // FFmpeg 관련 에러 처리
      if (error instanceof Error) {
        if (error.message.includes('FFmpeg가 로드되지 않았습니다')) {
          alert(`❌ ${error.message}`);
        } else if (error.message.includes('FFmpeg가 아직 로드되지 않았습니다')) {
          alert('⏳ FFmpeg가 아직 로딩 중입니다.\n\n💡 해결 방법:\n1. 잠시 후 다시 시도\n2. "FFmpeg 재시도" 버튼 클릭\n3. 페이지 새로고침\n4. 다른 브라우저 시도');
        } else {
          alert(`❌ FFmpeg 영상 추출 중 오류가 발생했습니다:\n\n${error.message}\n\n💡 해결 방법:\n1. 다른 브라우저로 시도\n2. 인터넷 연결 확인\n3. 페이지 새로고침\n4. "FFmpeg 재시도" 버튼 클릭`);
        }
      } else {
        alert(`❌ 알 수 없는 오류가 발생했습니다:\n\n${error}\n\n💡 해결 방법:\n1. 페이지 새로고침\n2. 다른 브라우저 시도\n3. "FFmpeg 재시도" 버튼 클릭`);
      }
    }
  };


  return (
    <div className={`min-h-screen transition-colors ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* VREW 스타일 상단 네비게이션 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-700'
      }`}>
        {/* 상단 메뉴바 */}
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center space-x-6">
            {/* 사용자 프로필 */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JO
              </div>
              <span className="text-sm font-medium">Junyoung Oh</span>
            </div>
            
            {/* 메인 메뉴 */}
            <div className="flex space-x-6">
              <button className="text-sm hover:text-blue-500 transition-colors">파일</button>
              <button className="text-sm hover:text-blue-500 transition-colors">홈</button>
              <button className="text-sm hover:text-blue-500 transition-colors">편집</button>
              <button className="text-sm hover:text-blue-500 transition-colors">자막</button>
              <button className="text-sm hover:text-blue-500 transition-colors">서식</button>
              <button className="text-sm hover:text-blue-500 transition-colors">삽입</button>
              <button className="text-sm hover:text-blue-500 transition-colors">AI 목소리</button>
              <button className="text-sm hover:text-blue-500 transition-colors">템플릿</button>
              <button className="text-sm hover:text-blue-500 transition-colors">효과</button>
              <button className="text-sm hover:text-blue-500 transition-colors">도움말</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-sm hover:text-blue-500 transition-colors">의견 보내기</button>
            <button className="text-sm hover:text-blue-500 transition-colors">업그레이드</button>
            <ExportButton
              isFFmpegLoaded={isFFmpegLoaded}
              ffmpegError={ffmpegError}
              exportState={exportState}
              hasClips={clipManager.videoClips.length > 0}
              isDarkMode={isDarkMode}
              onExport={handleExportVideo}
              onRetryFFmpeg={retryFFmpegInitialization}
            />
          </div>
        </div>
        
        {/* 편집 도구바 */}
        <div className={`flex items-center justify-between px-6 py-2 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-4">
            <button className={`px-3 py-1.5 text-sm rounded transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}>
              새로 만들기
            </button>
            <button className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              프로젝트 열기
            </button>
            
            <div className={`w-px h-6 mx-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            
          </div>
          
          <div className="flex items-center space-x-4">
            <select className={`px-2 py-1 text-sm rounded border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>Pretendard</option>
            </select>
            <select className={`px-2 py-1 text-sm rounded border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}>
              <option>100</option>
            </select>
            <button className={`w-8 h-8 rounded border ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}></button>
            <button className={`px-3 py-1.5 text-sm rounded border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              [서식] 메뉴로 이동
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 편집 영역 - 1:1:3 비율 */}
      <div className="pt-24 h-screen flex">
        {/* 왼쪽 섹션 (1) - 영상 플레이어 */}
        <div className="w-1/5 border-r">
          <VideoPlayerSidebar
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
            onPlayPause={videoPlayer.handlePlayPause}
            onVolumeChange={videoPlayer.handleVolumeChange}
            onToggleMute={videoPlayer.handleToggleMute}
            currentSubtitle={getCurrentSubtitle()}
          />
        </div>

        {/* 가운데 섹션 (1) - 영상 순서 */}
        <div className="w-1/5 border-r">
          <VideoOrderPanel
            clips={clipManager.videoClips}
            currentClipIndex={clipManager.currentClipIndex}
            isDarkMode={isDarkMode}
            onClipSelect={handleClipSelect}
            onAddClip={handleAddClip}
            onReorderClips={clipManager.reorderClips}
          />
        </div>

        {/* 오른쪽 섹션 (3) - 자막 편집 */}
        <div className="w-3/5">
          <SubtitleList
            subtitles={subtitleManager.subtitles}
            selectedSubtitleId={subtitleManager.selectedSubtitleId}
            isDarkMode={isDarkMode}
            currentTime={videoPlayer.playerState.currentTime}
            onUpdate={subtitleManager.updateSubtitle}
            onDelete={subtitleManager.deleteSubtitle}
            onDuplicate={subtitleManager.duplicateSubtitle}
            onSelect={subtitleManager.selectSubtitle}
            onAddSubtitle={subtitleManager.addSubtitle}
          />
        </div>
      </div>
    </div>
  );
}

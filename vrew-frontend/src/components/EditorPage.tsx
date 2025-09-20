import { useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Timeline } from "./Timeline";

interface VideoClip {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
}

interface EditorPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function EditorPage({ isDarkMode, onToggleDarkMode }: EditorPageProps) {
  const location = useLocation();
  const initialVideoFile = location.state?.videoFile;
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 사이드바 드래그 앤 드롭 상태
  const [sidebarDraggedIndex, setSidebarDraggedIndex] = useState<number | null>(null);
  const [sidebarDragOverIndex, setSidebarDragOverIndex] = useState<number | null>(null);

  // 초기 비디오 로딩
  useEffect(() => {
    if (initialVideoFile) {
      const url = URL.createObjectURL(initialVideoFile);
      const newClip: VideoClip = {
        id: Date.now().toString(),
        file: initialVideoFile,
        url: url,
        name: initialVideoFile.name || "새로 만든 비디오",
        duration: 0
      };
      setVideoClips([newClip]);
    }
  }, [initialVideoFile]);

  // 비디오 클립들이 변경될 때 URL 정리
  useEffect(() => {
    return () => {
      videoClips.forEach(clip => {
        URL.revokeObjectURL(clip.url);
      });
    };
  }, []);

  // 현재 선택된 클립
  const currentClip = videoClips[currentClipIndex];

  // 클립 변경 시 자동 재생 관리
  useEffect(() => {
    if (videoRef.current && currentClip) {
      videoRef.current.currentTime = 0;
      // 클립이 변경되면 항상 재생 상태로 설정하고 자동 재생
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("재생 중 오류:", error);
          });
        }
      }
    }
  }, [currentClipIndex, currentClip, isPlaying]);

  // 씬 추가 기능
  const handleAddScene = () => {
    fileInputRef.current?.click();
  };

  const handleNewVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const newClip: VideoClip = {
        id: Date.now().toString(),
        file: file,
        url: url,
        name: file.name,
        duration: 0
      };
      setVideoClips(prev => [...prev, newClip]);
      // 새로 추가된 클립으로 전환
      setCurrentClipIndex(videoClips.length);
    } else {
      alert('비디오 파일을 선택해주세요.');
    }
    // 파일 입력 초기화
    if (event.target) {
      event.target.value = '';
    }
  };

  // 클립 선택 (자동 재생)
  const handleClipSelect = (index: number) => {
    setCurrentClipIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // 클립 삭제
  const handleDeleteClip = (index: number) => {
    if (videoClips.length <= 1) {
      alert('최소 하나의 클립은 있어야 합니다.');
      return;
    }
    
    const clipToDelete = videoClips[index];
    URL.revokeObjectURL(clipToDelete.url);
    
    const newClips = videoClips.filter((_, i) => i !== index);
    setVideoClips(newClips);
    
    // 현재 선택된 클립이 삭제된 경우 조정
    if (currentClipIndex >= newClips.length) {
      setCurrentClipIndex(newClips.length - 1);
    } else if (currentClipIndex > index) {
      setCurrentClipIndex(currentClipIndex - 1);
    }
  };

  // 클립 순서 변경
  const handleClipsReorder = (newClips: VideoClip[]) => {
    setVideoClips(newClips);
    // 현재 클립 인덱스 조정
    const currentClipId = currentClip?.id;
    if (currentClipId) {
      const newIndex = newClips.findIndex(clip => clip.id === currentClipId);
      if (newIndex !== -1) {
        setCurrentClipIndex(newIndex);
      }
    }
  };

  // 시간 이동
  const handleTimeSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 사이드바 드래그 앤 드롭 핸들러들
  const handleSidebarDragStart = (event: React.DragEvent, index: number) => {
    setSidebarDraggedIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', index.toString());
  };

  const handleSidebarDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setSidebarDragOverIndex(index);
  };

  const handleSidebarDragLeave = (event: React.DragEvent) => {
    // 실제로 요소를 벗어날 때만 초기화
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setSidebarDragOverIndex(null);
    }
  };

  const handleSidebarDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (sidebarDraggedIndex === null || sidebarDraggedIndex === dropIndex) {
      setSidebarDraggedIndex(null);
      setSidebarDragOverIndex(null);
      return;
    }

    const newClips = [...videoClips];
    const draggedClip = newClips[sidebarDraggedIndex];
    
    // 드래그된 클립 제거
    newClips.splice(sidebarDraggedIndex, 1);
    
    // 새 위치에 삽입
    const insertIndex = sidebarDraggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newClips.splice(insertIndex, 0, draggedClip);
    
    // 상태 업데이트
    setVideoClips(newClips);
    
    // 현재 클립 인덱스 조정
    let newCurrentIndex = currentClipIndex;
    if (currentClipIndex === sidebarDraggedIndex) {
      // 드래그된 클립이 현재 클립인 경우
      newCurrentIndex = insertIndex;
    } else if (currentClipIndex > sidebarDraggedIndex && currentClipIndex <= insertIndex) {
      // 현재 클립이 드래그된 클립보다 뒤에 있고, 삽입 위치보다 앞에 있는 경우
      newCurrentIndex = currentClipIndex - 1;
    } else if (currentClipIndex < sidebarDraggedIndex && currentClipIndex >= insertIndex) {
      // 현재 클립이 드래그된 클립보다 앞에 있고, 삽입 위치보다 뒤에 있는 경우
      newCurrentIndex = currentClipIndex + 1;
    }
    
    setCurrentClipIndex(newCurrentIndex);
    
    // 상태 초기화
    setSidebarDraggedIndex(null);
    setSidebarDragOverIndex(null);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // 클립 정보 업데이트
      if (currentClip) {
        setVideoClips(prev => prev.map((clip, index) => 
          index === currentClipIndex 
            ? { ...clip, duration: videoRef.current?.duration || 0 }
            : clip
        ));
      }
    }
  };

  // 비디오 종료 시 다음 클립으로 이동 (무조건 연속 재생)
  const handleVideoEnded = () => {
    const nextClipIndex = currentClipIndex + 1;
    
    if (nextClipIndex < videoClips.length) {
      // 다음 클립으로 이동하고 자동 재생
      setCurrentClipIndex(nextClipIndex);
      setCurrentTime(0);
      setIsPlaying(true);
      // 짧은 지연 후 재생 시작
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      }, 50);
    } else {
      // 마지막 클립이면 처음으로 돌아가서 자동 재생
      setCurrentClipIndex(0);
      setCurrentTime(0);
      setIsPlaying(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      }, 50);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
      </nav>

      {/* 메인 편집 영역 */}
      <div className="pt-16 h-screen flex">
        {/* 왼쪽 사이드바 - 클립 리스트 */}
        <div className={`w-80 border-r h-full overflow-y-auto ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">클립 목록 ({videoClips.length})</h2>
              <button 
                onClick={() => videoClips.length > 1 && handleDeleteClip(currentClipIndex)}
                className={`text-red-500 text-sm ${videoClips.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'}`}
                disabled={videoClips.length <= 1}
              >
                삭제
              </button>
            </div>
            
            {/* 클립 아이템들 */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {videoClips.map((clip, index) => (
                <div 
                  key={clip.id}
                  draggable
                  onDragStart={(e) => handleSidebarDragStart(e, index)}
                  onDragOver={(e) => handleSidebarDragOver(e, index)}
                  onDrop={(e) => handleSidebarDrop(e, index)}
                  onDragLeave={(e) => handleSidebarDragLeave(e)}
                  onClick={() => handleClipSelect(index)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all relative ${
                    index === currentClipIndex
                      ? (isDarkMode ? 'border-blue-500 bg-gray-700' : 'border-blue-500 bg-blue-50')
                      : (isDarkMode ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50')
                  } ${sidebarDragOverIndex === index ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                >
                  {/* 드래그 핸들 */}
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 cursor-move text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>

                  {/* 순서 번호 */}
                  <div className={`absolute top-1 right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                    index === currentClipIndex ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex items-center space-x-3 pl-6">
                    <div className="w-16 h-12 bg-gray-400 rounded flex items-center justify-center">
                      🎬
                    </div>
                    <div className="flex-1 pr-8">
                      <div className="text-sm font-medium truncate">{clip.name}</div>
                      <div className="text-xs text-gray-500">
                        {clip.duration > 0 ? formatTime(clip.duration) : '로딩 중...'}
                      </div>
                      {index === currentClipIndex && (
                        <div className="text-xs text-blue-500 mt-1">● 재생 중</div>
                      )}
                    </div>
                  </div>

                  {/* 드래그 중 시각적 효과 */}
                  {sidebarDragOverIndex === index && (
                    <div className="absolute inset-0 bg-blue-400 bg-opacity-10 border-2 border-blue-400 border-dashed rounded-lg pointer-events-none"></div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddScene}
              className={`w-full py-2 px-4 rounded text-white transition-colors ${
                isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              씬 추가
            </button>

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleNewVideoSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* 중앙 - 비디오 플레이어와 자막 */}
        <div className="flex-1 flex flex-col">
          {/* 비디오 플레이어 */}
          <div className="h-1/2 bg-black flex items-center justify-center">
            {currentClip && (
              <video
                ref={videoRef}
                src={currentClip.url}
                className="max-w-full max-h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                controls={false}
                key={currentClip.id} // 클립 변경 시 비디오 재로드
              />
            )}
            {!currentClip && (
              <div className="text-white text-center">
                <p className="mb-4">비디오를 업로드해주세요</p>
                <button 
                  onClick={handleAddScene}
                  className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                >
                  비디오 추가
                </button>
              </div>
            )}
          </div>

          {/* 재생 컨트롤 */}
          <div className={`p-4 border-b ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                disabled={!currentClip}
                className={`p-2 rounded ${
                  !currentClip 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200')
                }`}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              {currentClip && (
                <span className="text-sm text-gray-500">
                  현재: {currentClip.name}
                </span>
              )}
              
              {/* 연속 재생 상태 표시 */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
                <span>연속재생</span>
              </div>
            </div>
          </div>

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
                    00:{index < 10 ? '0' : ''}{index * 5} - {Math.floor(duration / 5)}초
                  </div>
                </div>
              ))}
            </div>

            {/* 타임라인 */}
            {videoClips.length > 0 && (
              <Timeline
                clips={videoClips}
                onClipsReorder={handleClipsReorder}
                currentTime={currentTime}
                onTimeSeek={handleTimeSeek}
                isDarkMode={isDarkMode}
                currentClipIndex={currentClipIndex}
                onClipSelect={handleClipSelect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

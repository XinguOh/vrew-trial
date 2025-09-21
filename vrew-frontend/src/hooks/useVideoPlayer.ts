import { useState, useRef, useEffect, useCallback } from 'react';
import type { VideoPlayerState, VideoClip } from '../types';

interface UseVideoPlayerProps {
  clips: VideoClip[];
  currentClipIndex: number;
  onClipIndexChange: (index: number) => void;
}

export function useVideoPlayer({ clips, currentClipIndex, onClipIndexChange }: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    currentClipIndex: 0,
    volume: 1,
    isMuted: false
  });

  const currentClip = clips[currentClipIndex];

  // 클립 변경 시 자동 재생 관리
  useEffect(() => {
    if (videoRef.current && currentClip) {
      videoRef.current.currentTime = 0;
      setPlayerState(prev => ({ 
        ...prev, 
        currentTime: 0,
        currentClipIndex 
      }));
      
      if (playerState.isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("재생 중 오류:", error);
          });
        }
      }
    }
  }, [currentClipIndex, currentClip]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  }, [playerState.isPlaying]);

  // 볼륨 상태 동기화
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = playerState.volume;
      videoRef.current.muted = playerState.isMuted;
    }
  }, [playerState.volume, playerState.isMuted]);

  // 키보드 이벤트 (스페이스바) - 입력 필드에 포커스가 없을 때만 작동
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        // 입력 필드, textarea, contenteditable 요소에 포커스가 있는지 확인
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true' ||
          activeElement.getAttribute('contenteditable') === 'true'
        );

        // 입력 필드에 포커스가 없을 때만 영상 재생/정지
        if (!isInputFocused && currentClip && videoRef.current) {
          event.preventDefault();
          handlePlayPause();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentClip, handlePlayPause]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTime: videoRef.current!.currentTime 
      }));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setPlayerState(prev => ({ ...prev, duration }));
    }
  };

  const handleVideoEnded = () => {
    const nextClipIndex = currentClipIndex + 1;
    
    if (nextClipIndex < clips.length) {
      onClipIndexChange(nextClipIndex);
      setPlayerState(prev => ({ ...prev, currentTime: 0, isPlaying: true }));
    } else {
      onClipIndexChange(0);
      setPlayerState(prev => ({ ...prev, currentTime: 0, isPlaying: true }));
    }
  };

  const handleTimeSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const handleVolumeChange = (volume: number) => {
    setPlayerState(prev => ({ 
      ...prev, 
      volume,
      isMuted: volume === 0 ? prev.isMuted : false
    }));
  };

  const handleToggleMute = () => {
    setPlayerState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  return {
    videoRef,
    playerState,
    currentClip,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    handleTimeSeek,
    handleVolumeChange,
    handleToggleMute
  };
}

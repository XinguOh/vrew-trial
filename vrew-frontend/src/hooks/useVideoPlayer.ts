import { useState, useRef, useEffect } from 'react';
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

  // 볼륨 상태 동기화
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = playerState.volume;
      videoRef.current.muted = playerState.isMuted;
    }
  }, [playerState.volume, playerState.isMuted]);

  // 키보드 이벤트 (스페이스바)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (currentClip && videoRef.current) {
          handlePlayPause();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentClip, playerState.isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

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

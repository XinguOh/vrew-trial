import { useState, useEffect } from 'react';
import type { VideoClip, DragDropState } from '../types';
import { VideoService } from '../services';

export function useClipManager(initialVideoFile?: File) {
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    draggedIndex: null,
    dragOverIndex: null
  });

  // 초기 비디오 로딩
  useEffect(() => {
    if (initialVideoFile) {
      const newClip = VideoService.createClipFromFile(initialVideoFile);
      setVideoClips([newClip]);
    }
  }, [initialVideoFile]);

  // 컴포넌트 언마운트 시 URL 정리
  useEffect(() => {
    return () => {
      VideoService.cleanupClips(videoClips);
    };
  }, []);

  const addClip = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      const newClip = VideoService.createClipFromFile(file);
      setVideoClips(prev => [...prev, newClip]);
      setCurrentClipIndex(videoClips.length);
      return true;
    }
    return false;
  };

  const deleteClip = (index: number) => {
    if (videoClips.length <= 1) {
      return false;
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
    
    return true;
  };

  const selectClip = (index: number) => {
    setCurrentClipIndex(index);
  };

  const reorderClips = (newClips: VideoClip[]) => {
    setVideoClips(newClips);
    // 현재 클립 인덱스 조정
    const currentClipId = videoClips[currentClipIndex]?.id;
    if (currentClipId) {
      const newIndex = newClips.findIndex(clip => clip.id === currentClipId);
      if (newIndex !== -1) {
        setCurrentClipIndex(newIndex);
      }
    }
  };

  const updateClipDuration = (index: number, duration: number) => {
    setVideoClips(prev => prev.map((clip, i) => 
      i === index ? { ...clip, duration } : clip
    ));
  };

  // 드래그 앤 드롭 핸들러들
  const handleDragStart = (event: React.DragEvent, index: number) => {
    setDragDropState(prev => ({ ...prev, draggedIndex: index }));
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragDropState(prev => ({ ...prev, dragOverIndex: index }));
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragDropState(prev => ({ ...prev, dragOverIndex: null }));
    }
  };

  const handleDrop = (event: React.DragEvent, dropIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    const { draggedIndex } = dragDropState;
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragDropState({ draggedIndex: null, dragOverIndex: null });
      return;
    }

    const newClips = [...videoClips];
    const draggedClip = newClips[draggedIndex];
    
    // 드래그된 클립 제거
    newClips.splice(draggedIndex, 1);
    
    // 새 위치에 삽입
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newClips.splice(insertIndex, 0, draggedClip);
    
    // 상태 업데이트
    setVideoClips(newClips);
    
    // 현재 클립 인덱스 조정
    let newCurrentIndex = currentClipIndex;
    if (currentClipIndex === draggedIndex) {
      newCurrentIndex = insertIndex;
    } else if (currentClipIndex > draggedIndex && currentClipIndex <= insertIndex) {
      newCurrentIndex = currentClipIndex - 1;
    } else if (currentClipIndex < draggedIndex && currentClipIndex >= insertIndex) {
      newCurrentIndex = currentClipIndex + 1;
    }
    
    setCurrentClipIndex(newCurrentIndex);
    setDragDropState({ draggedIndex: null, dragOverIndex: null });
  };

  return {
    videoClips,
    currentClipIndex,
    dragDropState,
    addClip,
    deleteClip,
    selectClip,
    reorderClips,
    updateClipDuration,
    setCurrentClipIndex,
    dragHandlers: {
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop
    }
  };
}

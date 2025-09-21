import { useState, useCallback } from 'react';
import type { Subtitle, SubtitleStyle } from '../types';

export function useSubtitleManager() {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);

  // 자막 추가
  const addSubtitle = useCallback((startTime: number, endTime: number, text: string = '') => {
    const newSubtitle: Subtitle = {
      id: `subtitle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime,
      endTime,
      text,
      style: {
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'bottom',
        alignment: 'center'
      }
    };

    setSubtitles(prev => {
      const newSubtitles = [...prev, newSubtitle].sort((a, b) => a.startTime - b.startTime);
      return newSubtitles;
    });

    setSelectedSubtitleId(newSubtitle.id);
    return newSubtitle.id;
  }, []);

  // 자막 업데이트
  const updateSubtitle = useCallback((id: string, updates: Partial<Subtitle>) => {
    setSubtitles(prev => 
      prev.map(subtitle => 
        subtitle.id === id 
          ? { ...subtitle, ...updates }
          : subtitle
      ).sort((a, b) => a.startTime - b.startTime)
    );
  }, []);

  // 자막 삭제
  const deleteSubtitle = useCallback((id: string) => {
    setSubtitles(prev => prev.filter(subtitle => subtitle.id !== id));
    if (selectedSubtitleId === id) {
      setSelectedSubtitleId(null);
    }
  }, [selectedSubtitleId]);

  // 자막 스타일 업데이트
  const updateSubtitleStyle = useCallback((id: string, style: Partial<SubtitleStyle>) => {
    setSubtitles(prev => 
      prev.map(subtitle => 
        subtitle.id === id 
          ? { ...subtitle, style: { ...subtitle.style, ...style } }
          : subtitle
      )
    );
  }, []);

  // 현재 시간에 해당하는 자막 찾기
  const getCurrentSubtitle = useCallback((currentTime: number) => {
    return subtitles.find(subtitle => 
      currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    );
  }, [subtitles]);

  // 자막 선택
  const selectSubtitle = useCallback((id: string | null) => {
    setSelectedSubtitleId(id);
  }, []);

  // 자막 시간 범위 조정
  const adjustSubtitleTime = useCallback((id: string, startTime?: number, endTime?: number) => {
    setSubtitles(prev => 
      prev.map(subtitle => 
        subtitle.id === id 
          ? { 
              ...subtitle, 
              startTime: startTime ?? subtitle.startTime,
              endTime: endTime ?? subtitle.endTime
            }
          : subtitle
      ).sort((a, b) => a.startTime - b.startTime)
    );
  }, []);

  // 자막 텍스트 업데이트
  const updateSubtitleText = useCallback((id: string, text: string) => {
    updateSubtitle(id, { text });
  }, [updateSubtitle]);

  // 모든 자막 삭제
  const clearAllSubtitles = useCallback(() => {
    setSubtitles([]);
    setSelectedSubtitleId(null);
  }, []);

  // 자막 복사
  const duplicateSubtitle = useCallback((id: string) => {
    const subtitle = subtitles.find(s => s.id === id);
    if (subtitle) {
      const newSubtitle: Subtitle = {
        ...subtitle,
        id: `subtitle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        startTime: subtitle.endTime,
        endTime: subtitle.endTime + (subtitle.endTime - subtitle.startTime),
        text: subtitle.text
      };
      
      setSubtitles(prev => {
        const newSubtitles = [...prev, newSubtitle].sort((a, b) => a.startTime - b.startTime);
        return newSubtitles;
      });
      
      setSelectedSubtitleId(newSubtitle.id);
      return newSubtitle.id;
    }
    return null;
  }, [subtitles]);

  return {
    subtitles,
    selectedSubtitleId,
    addSubtitle,
    updateSubtitle,
    deleteSubtitle,
    updateSubtitleStyle,
    getCurrentSubtitle,
    selectSubtitle,
    adjustSubtitleTime,
    updateSubtitleText,
    clearAllSubtitles,
    duplicateSubtitle
  };
}

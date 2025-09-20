import { useState } from 'react';
import type { HoverPreview } from '../types';
import { VideoService } from '../services';

export function useHoverPreview() {
  const [hoverPreview, setHoverPreview] = useState<HoverPreview>({
    isHovered: false,
    position: { x: 0, y: 0 },
    time: 0
  });

  const handleMouseEnter = () => {
    setHoverPreview(prev => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setHoverPreview(prev => ({ ...prev, isHovered: false }));
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, duration: number) => {
    if (duration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const calculatedTime = VideoService.calculateTimeFromPosition(x, rect.width, duration);
    
    setHoverPreview(prev => ({
      ...prev,
      position: { x: event.clientX, y: event.clientY },
      time: calculatedTime
    }));
  };

  return {
    hoverPreview,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove
  };
}

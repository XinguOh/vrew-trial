import type { Subtitle } from '../../types';

interface SubtitleDisplayProps {
  subtitle: Subtitle | null;
  isDarkMode: boolean;
}

export function SubtitleDisplay({ subtitle, isDarkMode }: SubtitleDisplayProps) {
  if (!subtitle || !subtitle.text) {
    return null;
  }

  const getPositionClass = (position: string = 'bottom') => {
    switch (position) {
      case 'top':
        return 'top-4';
      case 'center':
        return 'top-1/2 transform -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-20';
    }
  };

  const getAlignmentClass = (alignment: string = 'center') => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };

  return (
    <div
      className={`absolute left-0 right-0 px-4 ${getPositionClass(subtitle.style?.position)} ${getAlignmentClass(subtitle.style?.alignment)}`}
      style={{
        fontSize: `${subtitle.style?.fontSize || 24}px`,
        fontFamily: subtitle.style?.fontFamily || 'Arial, sans-serif',
        color: subtitle.style?.color || '#FFFFFF',
        backgroundColor: subtitle.style?.backgroundColor || 'rgba(0, 0, 0, 0.7)',
        padding: '8px 16px',
        borderRadius: '8px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        lineHeight: '1.4',
        maxWidth: '80%',
        margin: '0 auto',
        wordWrap: 'break-word'
      }}
    >
      {subtitle.text}
    </div>
  );
}

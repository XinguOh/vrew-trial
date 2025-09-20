import { useRef } from 'react';

interface AddClipButtonProps {
  isDarkMode: boolean;
  onFileSelect: (file: File) => void;
}

export function AddClipButton({ isDarkMode, onFileSelect }: AddClipButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    } else {
      alert('비디오 파일을 선택해주세요.');
    }
    // 파일 입력 초기화
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={`w-full py-2 px-4 rounded text-white transition-colors ${
          isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'
        }`}
      >
        씬 추가
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}

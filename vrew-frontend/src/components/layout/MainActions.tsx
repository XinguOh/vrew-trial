import { useRef } from "react";
import { useNavigate } from "react-router-dom";

interface MainActionsProps {
  isDarkMode: boolean;
}

export function MainActions({ isDarkMode }: MainActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleNewProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 비디오 파일인지 확인
      if (file.type.startsWith('video/')) {
        // 편집 페이지로 이동하면서 파일 정보 전달
        navigate('/editor', { state: { videoFile: file } });
      } else {
        alert('비디오 파일을 선택해주세요.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen gap-8">
      <button 
        onClick={handleNewProject}
        className="w-48 h-48 bg-cyan-500 text-white text-xl rounded-2xl border-none cursor-pointer hover:bg-cyan-600 transition-colors"
      >
        + 새로 만들기
      </button>

      <button className={`w-48 h-48 text-xl rounded-2xl border-none cursor-pointer transition-colors ${
        isDarkMode 
          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      }`}>
        🎬 프로젝트 열기
      </button>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

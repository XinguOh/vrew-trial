import { useState } from "react";
import { MainBar, SubBar } from "../../components/navigation";
import { MainActions } from "../../components/layout";

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function HomePage({ isDarkMode, onToggleDarkMode }: HomePageProps) {
  const [isSubBarVisible, setIsSubBarVisible] = useState(true);

  const toggleSubBar = () => {
    setIsSubBarVisible(!isSubBarVisible);
  };

  return (
    <>
      <MainBar 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={onToggleDarkMode}
        isSubBarVisible={isSubBarVisible}
        onToggleSubBar={toggleSubBar}
      />
      {isSubBarVisible && <SubBar isDarkMode={isDarkMode} />}
      <div className={`transition-all duration-300 ${isSubBarVisible ? 'pt-32' : 'pt-16'}`}>
        <MainActions isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

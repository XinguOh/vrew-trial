import { MainBar, SubBar } from "../../components/navigation";
import { MainActions } from "../../components/layout";

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function HomePage({ isDarkMode, onToggleDarkMode }: HomePageProps) {
  return (
    <>
      <MainBar isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <SubBar isDarkMode={isDarkMode} />
      <div className="pt-32">
        <MainActions isDarkMode={isDarkMode} />
      </div>
    </>
  );
}

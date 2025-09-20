import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainBar } from "./components/MainBar";
import { SubBar } from "./components/SubBar";
import { MainActions } from "./components/MainActions";
import { EditorPage } from "./components/EditorPage";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <Routes>
          {/* 메인 페이지 */}
          <Route path="/" element={
            <>
              <MainBar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
              <SubBar isDarkMode={isDarkMode} />
              <div className="pt-32">
                <MainActions isDarkMode={isDarkMode} />
              </div>
            </>
          } />
          
          {/* 편집 페이지 */}
          <Route path="/editor" element={
            <EditorPage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

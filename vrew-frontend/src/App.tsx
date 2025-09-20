import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { EditorPage, HomePage } from "./pages";

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
            <HomePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
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

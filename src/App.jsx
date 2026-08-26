import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import SlideDeck from './components/SlideDeck'
import Cursor from './components/ui/Cursor';
import Preloader from './Preloader';
import SlideIntro from './components/slides/SlideIntro';

function App() {
  return (
    <Preloader>
      <div className="bg-bg min-h-screen text-text">
        <Cursor />
        <HashRouter>
          <Routes>
            <Route path="/" element={<SlideIntro />} />
            <Route path="/slide/:id" element={<SlideDeck />} />
          </Routes>
        </HashRouter>
      </div>
    </Preloader>
  );
}

export default App

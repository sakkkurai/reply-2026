import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import SlideDeck from './components/SlideDeck'
import Cursor from './components/ui/Cursor';

function App() {
  return (
    <div className="bg-bg min-h-screen text-text">
      <Cursor />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/slide/1" replace />} />
          <Route path="/slide/:id" element={<SlideDeck />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App

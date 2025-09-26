import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LiveTranscription from './pages/LiveTranscription';
import PreRecorded from './pages/PreRecorded';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveTranscription />} />
          <Route path="/prerecorded" element={<PreRecorded />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppLayout from './components/AppLayout';
import Home from './pages/Home';
import LiveTranscription from './pages/LiveTranscription';
import PreRecorded from './pages/PreRecorded';

function App() {
  return (
    <Router>
      <AppLayout>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveTranscription />} />
          <Route path="/prerecorded" element={<PreRecorded />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
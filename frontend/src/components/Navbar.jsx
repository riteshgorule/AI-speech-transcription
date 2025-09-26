import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic2, FileAudio, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/live', label: 'Live Transcription', icon: Mic2 },
    { path: '/prerecorded', label: 'Pre-Recorded', icon: FileAudio },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl">
      <div className="backdrop-blur-xl bg-black/40 border border-gray-800 rounded-full shadow-lg px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center rounded-full">
            <Mic2 className="w-5 h-5 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">SPEECHIFY</span>
        </div>

        {/* Nav Links */}
        <div className="flex space-x-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${
                  location.pathname === path
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

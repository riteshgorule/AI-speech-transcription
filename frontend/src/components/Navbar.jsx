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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SPEECHIFY</span>
          </div>

          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-none text-sm font-medium transition-all duration-200 hover:bg-gray-100 ${
                  location.pathname === path
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
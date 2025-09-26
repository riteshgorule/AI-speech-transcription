import React from 'react';
import { Link } from 'react-router-dom';
import { Mic2, FileAudio, Zap, Shield, Globe, Clock } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant speech recognition with live waveform visualization',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All processing happens locally in your browser',
    },
    {
      icon: Globe,
      title: 'Multi-language',
      description: 'Support for 50+ languages and dialects',
    },
    {
      icon: Clock,
      title: 'Fast & Accurate',
      description: 'Industry-leading accuracy with minimal latency',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
          SPEECH TO
          <br />
          <span className="text-[#00FF41]">TEXT</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform your voice into text with cutting-edge AI technology. 
          Choose live transcription or upload pre-recorded audio files.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/live"
            className="group bg-black text-white px-8 py-4 text-lg font-bold hover:bg-gray-900 transition-all duration-200 hover:shadow-2xl hover:shadow-[#00FF41]/20"
          >
            <div className="flex items-center justify-center space-x-3">
              <Mic2 className="w-6 h-6 group-hover:text-[#00FF41] transition-colors" />
              <span>START LIVE TRANSCRIPTION</span>
            </div>
          </Link>
          
          <Link
            to="/prerecorded"
            className="group border-2 border-black text-black px-8 py-4 text-lg font-bold hover:bg-black hover:text-white transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <FileAudio className="w-6 h-6" />
              <span>UPLOAD AUDIO FILE</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {features.map(({ icon: Icon, title, description }, index) => (
          <div
            key={index}
            className="group p-8 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
          >
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-[#00FF41] transition-colors duration-300">
              <Icon className="w-6 h-6 text-gray-700 group-hover:text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="text-center py-16 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-black mb-2">99.5%</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2">50+</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Languages</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2">0.1s</div>
            <div className="text-gray-600 uppercase text-sm tracking-wide">Latency</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
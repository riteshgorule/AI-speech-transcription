import React from 'react';
import { Link } from 'react-router-dom';
import { Mic2, FileAudio, Zap, Shield, Globe, Clock } from 'lucide-react';

const Home = () => {
  const accent = "#22c55e"; // emerald-500

  const features = [
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Instant speech recognition with live waveform visualization',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays safe with client-side processing',
    },
    {
      icon: Globe,
      title: 'Multi-language',
      description: 'Support for 50+ languages and dialects worldwide',
    },
    {
      icon: Clock,
      title: 'Fast & Accurate',
      description: 'Industry-leading accuracy with minimal latency',
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
            SPEECH TO <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              TEXT
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Transform your voice into text with cutting-edge AI technology.
            Choose live transcription or upload pre-recorded audio files.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/live"
              className="group bg-emerald-500 text-black px-8 py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <Mic2 className="w-6 h-6 group-hover:animate-pulse" />
                <span>Start Live Transcription</span>
              </div>
            </Link>

            <Link
              to="/prerecorded"
              className="group border-2 border-emerald-500 text-emerald-500 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-emerald-500 hover:text-black transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-3">
                <FileAudio className="w-6 h-6" />
                <span>Upload Audio File</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={index}
              className="group p-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <div className="w-14 h-14 bg-gray-800 flex items-center justify-center rounded-lg mb-6 group-hover:bg-emerald-500 transition-colors duration-300">
                <Icon className="w-6 h-6 text-emerald-400 group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="text-center py-16 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="text-4xl font-black text-emerald-500 mb-2">99.5%</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-500 mb-2">50+</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Languages</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-500 mb-2">0.1s</div>
              <div className="text-gray-400 uppercase text-sm tracking-wide">Latency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

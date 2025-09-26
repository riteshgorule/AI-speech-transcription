import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play } from 'lucide-react';
import Waveform from '../components/Waveform';

const LiveTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [structuredText, setStructuredText] = useState('');
  const [expressiveText, setExpressiveText] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [recognition, setRecognition] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Available languages for translation
  const languages = [
    { code: 'English', name: 'English (Original)' },
    { code: 'Spanish', name: 'Spanish (Español)' },
    { code: 'French', name: 'French (Français)' },
    { code: 'German', name: 'German (Deutsch)' },
    { code: 'Italian', name: 'Italian (Italiano)' },
    { code: 'Portuguese', name: 'Portuguese (Português)' },
    { code: 'Dutch', name: 'Dutch (Nederlands)' },
    { code: 'Russian', name: 'Russian (Русский)' },
    { code: 'Chinese', name: 'Chinese (中文)' },
    { code: 'Japanese', name: 'Japanese (日本語)' },
    { code: 'Korean', name: 'Korean (한국어)' },
    { code: 'Arabic', name: 'Arabic (العربية)' },
    { code: 'Hindi', name: 'Hindi (हिन्दी)' }
  ];

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }

        setInterimTranscript(interimText);
        if (finalText) {
          setTranscript(prev => prev + finalText + ' ');
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);
          
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      setTranscript('');
      setInterimTranscript('');
      recognition.start();
      startAudioAnalysis();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false);
      recognition.stop();
      stopAudioAnalysis();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setTranslatedText('');
    setStructuredText('');
    setExpressiveText('');
    setSummary('');
    setActiveTab('original');
  };

  const translateText = async () => {
    if (!transcript.trim() || targetLanguage === 'English') return;

    setIsTranslating(true);

    try {
      const response = await fetch('http://localhost:5000/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: transcript,
          target_language: targetLanguage 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTranslatedText(data.translated_text || '');
        setActiveTab('translated');
      } else {
        console.error('Translation failed:', data.error);
        alert('Translation failed due to API limits. Please try again later.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please check your connection and try again.');
    }

    setIsTranslating(false);
  };

  const processWithGemini = async () => {
    // Use translated text if available, otherwise use original transcript
    const textToEnhance = translatedText || transcript;
    if (!textToEnhance.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('http://localhost:5000/process-live-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: textToEnhance,
          target_language: targetLanguage 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStructuredText(data.structured_text || '');
        setExpressiveText(data.expressive_text || '');
        setSummary(data.summary || '');
      } else {
        console.error('Error processing with Gemini:', data.error);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          LIVE <span className="text-[#00FF41]">TRANSCRIPTION</span>
        </h1>
        <p className="text-lg text-gray-600">
          Click START to begin real-time speech-to-text conversion
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-black p-8 mb-8 border-4 border-black">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Recording Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 flex items-center justify-center border-4 transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 animate-pulse'
                  : 'bg-[#00FF41] border-[#00FF41] text-black hover:bg-green-400 hover:border-green-400'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            
            <div className="text-white">
              <div className="text-2xl font-bold">
                {isRecording ? 'RECORDING' : 'READY'}
              </div>
              <div className="text-sm opacity-75">
                {isRecording ? 'Click to stop' : 'Click to start'}
              </div>
            </div>
          </div>

          {/* Language Selection and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Language Dropdown */}
            <div className="flex flex-col gap-2">
              <label htmlFor="live-language-select" className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                Target Language:
              </label>
              <select
                id="live-language-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="px-3 py-2 bg-white text-black border-2 border-white text-sm font-medium min-w-[140px]"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {transcript && targetLanguage !== 'English' && !translatedText && (
                <button
                  onClick={translateText}
                  disabled={isTranslating || !transcript.trim()}
                  className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors duration-200 border-2 border-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTranslating ? 'TRANSLATING...' : `TRANSLATE`}
                </button>
              )}
              
              <button
                onClick={processWithGemini}
                disabled={!transcript.trim() || isProcessing}
                className="px-4 py-2 bg-[#00FF41] text-black font-bold hover:bg-green-400 transition-colors duration-200 border-2 border-[#00FF41] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'PROCESSING...' : 'ENHANCE'}
              </button>
              
              <button
                onClick={clearTranscript}
                className="px-4 py-2 bg-white text-black font-bold hover:bg-gray-100 transition-colors duration-200 border-2 border-white text-sm"
              >
                CLEAR
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-6 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full mr-3 ${isRecording ? 'bg-[#00FF41] animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-white text-sm font-medium">
            {isRecording ? 'LIVE • Processing audio...' : 'STANDBY • Ready to record'}
          </span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-8">
        <Waveform isActive={isRecording} audioLevel={audioLevel} />
      </div>

      {/* Transcript Panel */}
      <div className="bg-white border-4 border-black min-h-96 p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold tracking-tight">TRANSCRIPT</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-[#00FF41]' : 'bg-gray-400'}`}></div>
            <span>{isRecording ? 'LIVE' : 'STOPPED'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        {transcript && (
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('original')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'original'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Original
              </button>
              {translatedText && (
                <button
                  onClick={() => setActiveTab('translated')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'translated'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {targetLanguage}
                </button>
              )}
              {structuredText && (
                <button
                  onClick={() => setActiveTab('structured')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'structured'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Structured
                </button>
              )}
              {expressiveText && (
                <button
                  onClick={() => setActiveTab('expressive')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'expressive'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Expressive
                </button>
              )}
              {summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'summary'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Summary
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {transcript ? (
            <div>
              {activeTab === 'original' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Live Transcript:</p>
                  <div className="text-lg leading-relaxed text-gray-900 font-mono">
                    {transcript}
                  </div>
                  {interimTranscript && (
                    <div className="text-lg leading-relaxed text-[#00FF41] font-mono italic mt-2">
                      {interimTranscript}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'translated' && translatedText && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Translated to {targetLanguage}:</p>
                  <div className="text-lg leading-relaxed text-gray-900 font-mono">
                    {translatedText}
                  </div>
                </div>
              )}
              {activeTab === 'structured' && structuredText && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Structured Text (Enhanced with proper punctuation and formatting):</p>
                  <div className="text-lg leading-relaxed text-gray-900 whitespace-pre-line">
                    {structuredText}
                  </div>
                </div>
              )}
              {activeTab === 'expressive' && expressiveText && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Expressive Text (Enhanced with emotions and semantics):</p>
                  <div className="text-lg leading-relaxed text-gray-900 whitespace-pre-line">
                    {expressiveText}
                  </div>
                </div>
              )}
              {activeTab === 'summary' && summary && (
                <div>
                  <p className="text-sm text-gray-600 mb-4 font-medium">Summary:</p>
                  <div className="bg-green-50 border-2 border-[#00FF41] p-4">
                    <div className="text-lg leading-relaxed text-gray-900 whitespace-pre-line">
                      {summary}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-20 text-lg">
              {isRecording ? 'Listening... Start speaking' : 'Click START to begin transcription'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscription;

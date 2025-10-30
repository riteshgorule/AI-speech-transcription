import React, { useState, useRef } from 'react';
import { Upload, File, X, Download } from 'lucide-react';

const PreRecorded = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [structuredText, setStructuredText] = useState('');
  const [expressiveText, setExpressiveText] = useState('');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const fileInputRef = useRef(null);

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
    { code: 'Hindi', name: 'Hindi (हिन्दी)' },
    { code: 'Polish', name: 'Polish (Polski)' },
    { code: 'Swedish', name: 'Swedish (Svenska)' },
    { code: 'Norwegian', name: 'Norwegian (Norsk)' },
    { code: 'Danish', name: 'Danish (Dansk)' },
    { code: 'Finnish', name: 'Finnish (Suomi)' }
  ];

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      setTranscript('');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_language', targetLanguage);
      formData.append('enhance', 'false'); // Don't enhance automatically

      const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setTranscript(data.transcript);
        setTranslatedText(data.translated_text || '');
        setStructuredText(data.structured_text || '');
        setExpressiveText(data.expressive_text || '');
        setSummary(data.summary || '');
        
        // Show warnings if fallbacks were used
        if (data.structure_fallback || data.expressions_fallback || data.summary_fallback || data.translation_fallback) {
          console.warn('Some enhancements used fallback due to API limits');
        }
        
        // Set active tab to translated if translation was performed
        if (data.translated_text && targetLanguage !== 'English') {
          setActiveTab('translated');
        }
      } else {
        setTranscript(`Error: ${data.error}`);
        setTranslatedText('');
        setStructuredText('');
        setExpressiveText('');
        setSummary('');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setTranscript(`Error: Failed to process file. Please make sure the Flask server is running on http://localhost:5000`);
    }

    setIsProcessing(false);
  };

  const enhanceWithAI = async () => {
    // Use translated text if available, otherwise use original transcript
    const textToEnhance = translatedText || transcript;
    if (!textToEnhance.trim()) return;

    setIsEnhancing(true);

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
        
        // Show user if fallbacks were used
        if (data.structure_error || data.expressions_error || data.summary_error) {
          console.warn('Some AI enhancements failed, using basic fallbacks');
        }
      } else {
        console.error('Enhancement failed:', data.error);
        alert('Enhancement failed due to API limits. Please try again later.');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Enhancement failed. Please check your connection and try again.');
    }

    setIsEnhancing(false);
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
        
        if (data.fallback_used) {
          console.warn('Translation used fallback due to API limits');
        }
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

  const removeFile = () => {
    setSelectedFile(null);
    setTranscript('');
    setTranslatedText('');
    setStructuredText('');
    setExpressiveText('');
    setSummary('');
    setActiveTab('original');
    setTargetLanguage('English');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTranscript = () => {
    let content = '';
    const fileName = selectedFile?.name.split('.')[0] || 'audio';
    
    if (activeTab === 'original') {
      content = transcript;
    } else if (activeTab === 'translated') {
      content = translatedText || transcript;
    } else if (activeTab === 'structured') {
      content = structuredText || translatedText || transcript;
    } else if (activeTab === 'expressive') {
      content = expressiveText || translatedText || transcript;
    } else if (activeTab === 'summary') {
      content = summary || translatedText || transcript;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_transcript_${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
  <div className="text-white min-h-screen pt-28">
      <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          PRE-RECORDED <span className="text-[#00FF41]">AUDIO</span>
        </h1>
        <p className="text-lg text-gray-400">
          Upload your audio or video files for accurate transcription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">Upload File</h2>

            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-[#00FF41] bg-emerald-500/10'
                    : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isDragOver ? 'text-[#00FF41]' : 'text-gray-500'
                  }`}
                />
                <p className="text-lg font-medium mb-2 text-white">
                  Drop your audio file here, or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports MP3, WAV, M4A, MP4, and other audio/video formats
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                      <File className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Language Selection */}
            {selectedFile && !transcript && (
              <div className="mt-6">
                <label htmlFor="language-select" className="block text-sm font-medium text-gray-300 mb-2">
                  Select Target Language:
                </label>
                <select
                  id="language-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF41] focus:border-[#00FF41]"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedFile && !isProcessing && !transcript && (
              <button
                onClick={processFile}
                className="w-full mt-6 bg-[#00FF41] text-black py-4 text-lg font-bold rounded-lg hover:bg-green-400 transition-colors duration-200 hover:shadow-lg"
              >
                PROCESS FILE
              </button>
            )}

            {isProcessing && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-3 text-lg font-medium text-white">
                  <div className="animate-spin w-6 h-6 border-2 border-[#00FF41] border-t-transparent rounded-full"></div>
                  <span>Processing audio...</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
              </div>
            )}
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-white">File Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-medium text-white">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="font-medium text-white">{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="font-medium text-white">{selectedFile.type}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transcript Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Transcript</h2>
                <div className="flex items-center space-x-3">
                  {/* Translation button - show only if transcript exists and language is not English */}
                  {transcript && targetLanguage !== 'English' && !translatedText && (
                    <button
                      onClick={translateText}
                      disabled={isTranslating}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTranslating ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Translating...</span>
                        </>
                      ) : (
                        <span>Translate to {targetLanguage}</span>
                      )}
                    </button>
                  )}
                  
                  {/* Enhancement button */}
                  {(transcript || translatedText) && !structuredText && !expressiveText && !summary && (
                    <button
                      onClick={enhanceWithAI}
                      disabled={isEnhancing}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#00FF41] text-black font-medium hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEnhancing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
                          <span>Enhancing...</span>
                        </>
                      ) : (
                        <span>Enhance with AI</span>
                      )}
                    </button>
                  )}
                  
                  {/* Download button */}
                  {transcript && (
                    <button
                      onClick={downloadTranscript}
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white font-medium hover:bg-gray-900 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tab Navigation */}
              {transcript && (
                <div className="mt-6">
                  <div className="mb-2 flex gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('original')}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        activeTab === 'original'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Original
                    </button>
                    {translatedText && (
                      <button
                        onClick={() => setActiveTab('translated')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                          activeTab === 'translated'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {targetLanguage}
                      </button>
                    )}
                    {structuredText && (
                      <button
                        onClick={() => setActiveTab('structured')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                          activeTab === 'structured'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Structured
                      </button>
                    )}
                    {expressiveText && (
                      <button
                        onClick={() => setActiveTab('expressive')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                          activeTab === 'expressive'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Expressive
                      </button>
                    )}
                    {summary && (
                      <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                          activeTab === 'summary'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Summary
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 min-h-96">
              {transcript ? (
                <div className="prose prose-lg max-w-none">
                  {activeTab === 'original' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Original Transcript:</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                        {transcript}
                      </p>
                    </div>
                  )}
                  {activeTab === 'translated' && translatedText && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Translated to {targetLanguage}:</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                        {translatedText}
                      </p>
                    </div>
                  )}
                  {activeTab === 'structured' && structuredText && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Structured Text (Enhanced with proper punctuation and formatting):</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                        {structuredText}
                      </p>
                    </div>
                  )}
                  {activeTab === 'expressive' && expressiveText && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Expressive Text (Enhanced with emotions and semantics):</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                        {expressiveText}
                      </p>
                    </div>
                  )}
                  {activeTab === 'summary' && summary && (
                    <div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">Summary:</p>
                      <div className="bg-green-50 border border-[#00FF41] rounded-lg p-4">
                        <p className="text-gray-900 leading-relaxed whitespace-pre-line">
                          {summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      {selectedFile
                        ? 'Process your file to see the transcript'
                        : 'Upload a file to get started'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PreRecorded;
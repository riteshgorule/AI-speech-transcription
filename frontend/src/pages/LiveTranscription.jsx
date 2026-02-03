import React, { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import Waveform from "../components/Waveform";

const LiveTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [structuredText, setStructuredText] = useState("");
  const [expressiveText, setExpressiveText] = useState("");
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState("original");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [recognition, setRecognition] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // --- Languages ---
  const languages = [
    { code: "English", name: "English (Original)" },
    { code: "Spanish", name: "Spanish (Español)" },
    { code: "French", name: "French (Français)" },
    { code: "German", name: "German (Deutsch)" },
    { code: "Italian", name: "Italian (Italiano)" },
    { code: "Portuguese", name: "Portuguese (Português)" },
    { code: "Dutch", name: "Dutch (Nederlands)" },
    { code: "Russian", name: "Russian (Русский)" },
    { code: "Chinese", name: "Chinese (中文)" },
    { code: "Japanese", name: "Japanese (日本語)" },
    { code: "Korean", name: "Korean (한국어)" },
    { code: "Arabic", name: "Arabic (العربية)" },
    { code: "Hindi", name: "Hindi (हिन्दी)" },
  ];

  // --- Speech Recognition Setup ---
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        let interimText = "";
        let finalText = "";

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
          setTranscript((prev) => prev + finalText + " ");
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // --- Audio Visualization ---
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
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);

          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);

          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAudioAnalysis = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  // --- Recording Controls ---
  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      setTranscript("");
      setInterimTranscript("");
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
    setTranscript("");
    setInterimTranscript("");
    setTranslatedText("");
    setStructuredText("");
    setExpressiveText("");
    setSummary("");
    setActiveTab("original");
  };

  // --- Translation + Processing ---
  const translateText = async () => {
    if (!transcript.trim() || targetLanguage === "English") return;

    setIsTranslating(true);

    try {
      const response = await fetch("https://ai-speech-transcription.onrender.com/translate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: transcript,
          target_language: targetLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTranslatedText(data.translated_text || "");
        setActiveTab("translated");
      } else {
        console.error("Translation failed:", data.error);
        alert("Translation failed due to API limits. Please try again later.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please check your connection and try again.");
    }

    setIsTranslating(false);
  };

  const processWithGemini = async () => {
    const textToEnhance = translatedText || transcript;
    if (!textToEnhance.trim()) return;

    setIsProcessing(true);

    try {
      const response = await fetch("https://ai-speech-transcription.onrender.com/process-live-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textToEnhance,
          target_language: targetLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStructuredText(data.structured_text || "");
        setExpressiveText(data.expressive_text || "");
        setSummary(data.summary || "");
      } else {
        console.error("Error processing with Gemini:", data.error);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pt-28">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          LIVE <span className="text-[#00FF41]">TRANSCRIPTION</span>
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          Start real-time speech-to-text with translation & AI enhancements
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-gradient-to-r from-black to-gray-900 shadow-xl rounded-2xl p-8 mb-10 border border-gray-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Mic Button */}
          <div className="flex items-center gap-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-28 h-28 flex items-center justify-center rounded-full border-4 shadow-lg transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 border-red-500 text-white hover:bg-red-600 animate-pulse ring-4 ring-red-400/50"
                  : "bg-[#00FF41] border-[#00FF41] text-black hover:bg-green-400 ring-4 ring-green-400/50"
              }`}
            >
              {isRecording ? (
                <Square className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            <div>
              <div className="text-2xl font-bold text-white">
                {isRecording ? "Recording..." : "Standby"}
              </div>
              <div className="text-sm text-gray-400">
                {isRecording ? "Click to stop" : "Click to start"}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row items-center gap-4">
            {/* Language */}
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#00FF41]"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Buttons */}
            <div className="flex gap-3">
              {transcript && targetLanguage !== "English" && !translatedText && (
                <button
                  onClick={translateText}
                  disabled={isTranslating || !transcript.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </button>
              )}
              <button
                onClick={processWithGemini}
                disabled={!transcript.trim() || isProcessing}
                className="px-4 py-2 rounded-lg bg-[#00FF41] text-black font-semibold hover:bg-green-400 transition disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Enhance"}
              </button>
              <button
                onClick={clearTranscript}
                className="px-4 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-6 flex items-center justify-center text-sm text-gray-300">
          <div
            className={`w-3 h-3 rounded-full mr-3 ${
              isRecording ? "bg-[#00FF41] animate-pulse" : "bg-gray-500"
            }`}
          ></div>
          {isRecording ? "LIVE • Processing audio..." : "Standby • Ready to record"}
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-10">
        <Waveform isActive={isRecording} audioLevel={audioLevel} />
      </div>

      {/* Transcript Section */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Transcript</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className={`w-2 h-2 rounded-full ${
                isRecording ? "bg-[#00FF41]" : "bg-gray-400"
              }`}
            ></span>
            {isRecording ? "Live" : "Stopped"}
          </div>
        </div>

        {/* Tabs */}
        {transcript && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              { key: "original", label: "Original" },
              translatedText && { key: "translated", label: targetLanguage },
              structuredText && { key: "structured", label: "Structured" },
              expressiveText && { key: "expressive", label: "Expressive" },
              summary && { key: "summary", label: "Summary" },
            ]
              .filter(Boolean)
              .map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="max-h-[350px] overflow-y-auto space-y-4">
          {transcript ? (
            <>
              {activeTab === "original" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Live Transcript:</p>
                  <div className="text-lg leading-relaxed font-mono text-gray-900 whitespace-pre-line">
                    {transcript}
                  </div>
                  {interimTranscript && (
                    <div className="mt-2 text-lg text-[#00FF41] font-mono italic">
                      {interimTranscript}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "translated" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Translated to {targetLanguage}:
                  </p>
                  <div className="text-lg text-gray-900 whitespace-pre-line">
                    {translatedText}
                  </div>
                </div>
              )}
              {activeTab === "structured" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Structured (punctuation, formatting):
                  </p>
                  <div className="text-lg text-gray-900 whitespace-pre-line">
                    {structuredText}
                  </div>
                </div>
              )}
              {activeTab === "expressive" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Expressive (emotions, semantics):
                  </p>
                  <div className="text-lg text-gray-900 whitespace-pre-line">
                    {expressiveText}
                  </div>
                </div>
              )}
              {activeTab === "summary" && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Summary:</p>
                  <div className="bg-green-50 border border-[#00FF41] rounded-lg p-4 text-lg text-gray-900 whitespace-pre-line">
                    {summary}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 text-center py-20 text-lg">
              {isRecording
                ? "Listening... Start speaking"
                : "Click START to begin transcription"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranscription;

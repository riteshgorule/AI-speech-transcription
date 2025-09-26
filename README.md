# 🎤 Speech-to-Text Transcription Platform

A modern, AI-powered speech-to-text transcription platform with multilingual translation and intelligent text enhancement capabilities.

![Platform Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Languages](https://img.shields.io/badge/Languages-18+-blue)
![AI Powered](https://img.shields.io/badge/AI-Gemini%20Powered-purple)

## ✨ Features

### 🎯 **Core Functionality**
- **File Upload Transcription**: Upload audio/video files for accurate transcription
- **Live Transcription**: Real-time speech-to-text conversion using Web Speech API
- **Multilingual Translation**: Translate transcripts to 18+ languages
- **AI Text Enhancement**: Improve structure, punctuation, and add emotional context
- **Smart Summarization**: Generate concise summaries of transcribed content

### 🌍 **Supported Languages**
- **European**: Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Norwegian, Danish, Finnish
- **Asian**: Chinese, Japanese, Korean, Hindi
- **Middle Eastern**: Arabic
- **Slavic**: Russian

### 🎨 **User Interface**
- **Modern Dark Theme**: Professional dark interface with green accent colors
- **Matrix Grid Pattern**: Tech-aesthetic background overlay
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Tabbed Navigation**: Easy switching between original, translated, and enhanced text
- **Real-time Visualization**: Audio waveform display during live recording

### 🔧 **File Support**
- **Audio Formats**: MP3, WAV, M4A, OGG, FLAC
- **Video Formats**: MP4, AVI, MOV, WEBM
- **File Size**: Up to 100MB per upload
- **Drag & Drop**: Intuitive file upload interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- AssemblyAI API Key
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Final_stt
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys:
# API_KEY=your_assemblyai_api_key
# GEMINI_API_KEY=your_google_gemini_api_key

# Start Flask server
python app.py
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📁 Project Structure

```
Final_stt/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables (create this)
│   ├── .gitignore         # Backend git ignore
│   └── README.md          # Backend documentation
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Navbar.jsx
│   │   │   └── Waveform.jsx
│   │   ├── pages/         # Main pages
│   │   │   ├── Home.jsx
│   │   │   ├── LiveTranscription.jsx
│   │   │   └── PreRecorded.jsx
│   │   ├── App.jsx        # Main app component
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css      # Global styles
│   │   └── App.css        # Component styles
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── .gitignore         # Frontend git ignore
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## 🔧 Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **AI Services**: Google Gemini AI, AssemblyAI
- **HTTP Client**: Requests
- **Environment**: Python-dotenv
- **CORS**: Flask-CORS

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio**: Web Audio API
- **Speech**: Web Speech API

## 🎮 Usage Guide

### Pre-recorded Audio Transcription

1. **Navigate to "Pre-Recorded Audio" page**
2. **Select target language** from the dropdown (18+ options)
3. **Upload your audio/video file** via drag-and-drop or file picker
4. **Click "PROCESS FILE"** to transcribe and translate (if non-English selected)
5. **View results in tabs**:
   - **Original**: Raw transcript
   - **[Language]**: Translated version
   - **Structured**: AI-enhanced with proper punctuation
   - **Expressive**: Enhanced with emotional context
   - **Summary**: Concise summary
6. **Download any version** as a text file

### Live Transcription

1. **Navigate to "Live Transcription" page**
2. **Select target language** from control panel
3. **Click START button** to begin recording
4. **Speak into your microphone** (see real-time waveform)
5. **Click STOP** when finished
6. **Click "TRANSLATE"** (if non-English language selected)
7. **Click "ENHANCE"** for AI-powered text improvements
8. **View results in different tabs** as above

## 🔑 API Configuration

### Required Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# AssemblyAI Configuration
API_KEY=your_assemblyai_api_key_here
ASSEMBLYAI_BASE=https://api.assemblyai.com

# Google Gemini AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Getting API Keys

1. **AssemblyAI**: Sign up at [assemblyai.com](https://www.assemblyai.com/) for transcription services
2. **Google Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey) for AI features

## 🚦 API Endpoints

### Core Endpoints
- `POST /transcribe` - Upload and process audio files
- `POST /translate-text` - Translate text to target language
- `POST /enhance-text` - Enhance text structure or expressions
- `POST /summarize-text` - Generate text summary
- `POST /process-live-text` - Complete processing pipeline

### Utility Endpoints
- `GET /health` - Health check
- `GET /api-status` - Check API configuration
- `GET /test-gemini` - Test available AI models

## 🎨 UI Features

### Design Elements
- **Dark Theme**: Professional black/silver gradient backgrounds
- **Accent Color**: Calm green (#3AE374) for interactive elements
- **Matrix Grid**: Subtle tech-aesthetic background pattern
- **Typography**: Clean, modern fonts with proper hierarchy
- **Animations**: Smooth transitions and loading states

### User Experience
- **Drag & Drop**: Intuitive file upload
- **Real-time Feedback**: Processing indicators and progress states
- **Error Handling**: User-friendly error messages
- **Responsive**: Mobile-friendly interface
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
python app.py        # Start Flask server
```

### Development Workflow

1. **Start backend server**: `cd backend && python app.py`
2. **Start frontend dev server**: `cd frontend && npm run dev`
3. **Make changes** to either backend or frontend code
4. **Hot reload** automatically updates the application
5. **Test features** using the web interface
6. **Check API status** at `http://localhost:5000/api-status`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Flask-CORS is installed and backend is running
2. **API Key Errors**: Verify `.env` file contains valid API keys
3. **File Upload Fails**: Check file format and size (max 100MB)
4. **Translation Fails**: Monitor Gemini API quota usage
5. **Build Errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug mode for detailed error information:

```bash
# Backend debugging
export FLASK_DEBUG=1
python app.py

# Frontend debugging
npm run dev  # Already includes source maps
```

### API Status Check

Visit `http://localhost:5000/api-status` to verify:
- API key configuration
- Available Gemini models
- Rate limiting settings
- Service health status

## 🚀 Deployment

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build

# Serve with a production server
npm install -g serve
serve -s dist
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the troubleshooting section above
2. Review the API status endpoint
3. Check server logs for detailed error information
4. Open an issue on GitHub

## 🎯 Roadmap

- [ ] **Batch Processing**: Handle multiple files simultaneously
- [ ] **Custom Models**: Support for specialized transcription models
- [ ] **Voice Cloning**: AI-powered voice synthesis
- [ ] **Advanced Analytics**: Detailed transcription statistics
- [ ] **Cloud Storage**: Integration with AWS S3, Google Cloud Storage
- [ ] **API Authentication**: JWT-based API security
- [ ] **Webhook Support**: Real-time notifications
- [ ] **Mobile Apps**: Native iOS and Android applications

---

**Built with ❤️ for accurate speech-to-text transcription with AI enhancement**
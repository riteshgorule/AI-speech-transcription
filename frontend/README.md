# Speech-to-Text Transcription Platform - Frontend

A modern React-based frontend for the speech-to-text transcription platform with multilingual translation and AI-powered text enhancement.

## Features

- **Modern Dark UI**: Professional dark theme with matrix grid pattern and green accents
- **Pre-recorded Audio Processing**: Drag-and-drop file upload with support for audio/video formats
- **Live Transcription**: Real-time speech-to-text using Web Speech API
- **Multilingual Translation**: Support for 18+ languages with intuitive dropdown selection
- **AI Text Enhancement**: Structure improvement, emotional context, and summarization
- **Tabbed Interface**: Easy navigation between original, translated, and enhanced text
- **Audio Visualization**: Real-time waveform display during live recording
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Technology Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.436.0
- **HTTP Client**: Fetch API
- **Audio Processing**: Web Audio API
- **Speech Recognition**: Web Speech API

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Navbar.jsx      # Navigation bar with dark theme
│   └── Waveform.jsx    # Audio visualization component
├── pages/              # Main application pages
│   ├── Home.jsx        # Landing page with hero section
│   ├── LiveTranscription.jsx    # Real-time transcription interface
│   └── PreRecorded.jsx # File upload and processing
├── assets/             # Static assets
│   └── react.svg       # React logo
├── App.jsx             # Main application component
├── App.css             # Component-specific styles
├── main.jsx            # Application entry point
└── index.css           # Global styles and dark theme
```

## Installation

1. **Prerequisites**
   - Node.js 18+ 
   - npm or yarn

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on http://localhost:5173 |
| `npm run build` | Build the app for production to `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Configuration

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

### Tailwind Configuration

The project uses Tailwind CSS for styling with custom configurations for:
- Dark theme color palette
- Custom green accent colors (#3AE374, #00FF41)
- Matrix grid background patterns
- Gradient effects and animations

## Components

### Navbar Component
- **Location**: `src/components/Navbar.jsx`
- **Features**: Dark navigation bar with gradient buttons and active states
- **Routing**: Links to Home, Live Transcription, and Pre-recorded pages

### Waveform Component
- **Location**: `src/components/Waveform.jsx`
- **Features**: Real-time audio visualization during live recording
- **Props**: `isActive`, `audioLevel`
- **Technology**: Canvas-based animation with Web Audio API integration

### Home Page
- **Location**: `src/pages/Home.jsx`
- **Features**: 
  - Hero section with gradient text effects
  - Feature cards with hover animations
  - Call-to-action buttons with routing
  - Matrix grid background overlay

### Live Transcription Page
- **Location**: `src/pages/LiveTranscription.jsx`
- **Features**:
  - Real-time speech recognition
  - Language selection dropdown
  - Recording controls with pulse animations
  - Audio level monitoring and visualization
  - Translation and AI enhancement buttons
  - Tabbed transcript display

### Pre-recorded Audio Page
- **Location**: `src/pages/PreRecorded.jsx`
- **Features**:
  - Drag-and-drop file upload
  - Language selection before processing
  - File information display
  - Processing status indicators
  - Translation and enhancement workflows
  - Download functionality for all text versions

## API Integration

### Backend Communication

The frontend communicates with the Flask backend at `http://localhost:5000`:

```javascript
// File transcription
const response = await fetch('http://localhost:5000/transcribe', {
  method: 'POST',
  body: formData  // Contains file and language selection
});

// Text translation
const response = await fetch('http://localhost:5000/translate-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: transcript,
    target_language: selectedLanguage
  })
});
```

### Error Handling

Comprehensive error handling for:
- Network connectivity issues
- API timeout errors
- File upload failures
- Invalid file formats
- Server-side processing errors

## Language Support

18+ supported languages with native names:
```javascript
const languages = [
  { code: 'English', name: 'English (Original)' },
  { code: 'Spanish', name: 'Spanish (Español)' },
  { code: 'French', name: 'French (Français)' },
  { code: 'German', name: 'German (Deutsch)' },
  // ... more languages
];
```

## Browser Compatibility

### Required Browser Features
- **Web Speech API**: For live transcription (Chrome, Edge, Safari)
- **Web Audio API**: For audio visualization
- **File API**: For drag-and-drop functionality
- **Fetch API**: For HTTP requests
- **ES6+ Support**: Modern JavaScript features

### Graceful Degradation
- Fallback messages when Web Speech API is unavailable
- Progressive enhancement for advanced features
- Mobile-specific optimizations

## Deployment

### Production Build

```bash
# Create production build
npm run build

# The build files will be in the 'dist' directory
# Serve with any static file server
```

### Environment Variables

For production deployment, update API endpoints:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com'
  : 'http://localhost:5000';
```

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Check browser permissions
   - Ensure HTTPS in production (required for microphone access)

2. **CORS Errors**
   - Verify backend CORS configuration
   - Check API endpoint URLs

3. **File Upload Failures**
   - Verify file format support
   - Check file size limits (100MB max)

4. **Speech Recognition Not Working**
   - Verify browser support (Chrome recommended)
   - Check microphone permissions

### Debug Mode

```bash
# Run with detailed logging
npm run dev

# Check browser console for errors
# Use React Developer Tools for component inspection
```

## Contributing

1. **Code Style**: Follow existing patterns and ESLint configuration
2. **Components**: Create reusable, well-documented components
3. **Testing**: Test new features across different browsers and devices
4. **Documentation**: Update README for any new features or changes

---

**Modern React frontend for professional speech-to-text transcription with AI enhancement capabilities.**

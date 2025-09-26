# Speech-to-Text Transcription Platform - Backend

A Flask-based backend API for speech-to-text transcription with AI-powered text enhancement and multilingual translation.

## Features

- **Audio Transcription**: Convert audio/video files to text using AssemblyAI
- **Multilingual Translation**: Translate transcripts to 18+ languages using Google Gemini AI
- **AI Text Enhancement**: Improve text structure, punctuation, and add emotional context
- **Text Summarization**: Generate concise summaries of transcribed content
- **Real-time Processing**: Support for both file upload and live transcription
- **Rate Limiting**: Built-in API quota management and fallback mechanisms

## Supported Languages

- **European**: Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Norwegian, Danish, Finnish
- **Asian**: Chinese, Japanese, Korean, Hindi
- **Middle Eastern**: Arabic
- **Slavic**: Russian

## API Endpoints

### Core Endpoints

- `GET /health` - Health check
- `GET /api-status` - Check API configuration and status
- `POST /transcribe` - Upload and transcribe audio/video files
- `POST /translate-text` - Translate text to target language
- `POST /enhance-text` - Enhance text with AI (structure or expressions)
- `POST /summarize-text` - Generate text summary
- `POST /process-live-text` - Complete processing pipeline (translate + enhance + summarize)

### Testing Endpoints

- `GET /test-gemini` - Test available Gemini AI models

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   API_KEY=your_assemblyai_api_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ASSEMBLYAI_BASE=https://api.assemblyai.com
   ```

4. **Run the server**
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_KEY` | AssemblyAI API key for transcription | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `ASSEMBLYAI_BASE` | AssemblyAI API base URL | No (has default) |

## API Usage Examples

### Transcribe Audio File

```bash
curl -X POST http://localhost:5000/transcribe \
  -F "file=@audio.mp3" \
  -F "target_language=Spanish" \
  -F "enhance=true"
```

### Translate Text

```bash
curl -X POST http://localhost:5000/translate-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "target_language": "Spanish"
  }'
```

### Enhance Text

```bash
curl -X POST http://localhost:5000/enhance-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "hello this is a test without punctuation",
    "type": "structure"
  }'
```

## Supported File Formats

- **Audio**: MP3, WAV, M4A, OGG, FLAC
- **Video**: MP4, AVI, MOV, WEBM
- **Size Limit**: 100MB per file

## AI Features

### Translation
- Powered by Google Gemini AI
- Supports 18+ target languages
- Maintains original meaning and tone
- Graceful fallbacks when API limits are reached

### Text Enhancement
- **Structure**: Adds proper punctuation, capitalization, and grammar
- **Expressive**: Enhances text with emotional context and tone indicators
- **Summary**: Generates concise 2-3 sentence summaries

### Rate Limiting
- Built-in 2-second minimum interval between Gemini API calls
- Exponential backoff retry logic for quota exceeded errors
- Fallback to basic text processing when AI services are unavailable

## Error Handling

The API includes comprehensive error handling for:
- Invalid file formats
- File size limits (413 error)
- API quota limits (429 error)
- Model availability (404 error)
- Network timeouts
- Invalid requests (400 error)

## Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "success": true,
  "transcript": "Original transcribed text",
  "translated_text": "Translated text (if requested)",
  "structured_text": "Enhanced text with proper structure",
  "expressive_text": "Text enhanced with emotional context",
  "summary": "Concise summary of the content",
  "target_language": "Spanish",
  "filename": "audio.mp3"
}
```

## Development

### Project Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (create this)
├── .gitignore         # Git ignore patterns
└── README.md          # This file
```

### Dependencies

- **Flask 2.3.3**: Web framework
- **flask-cors**: Cross-origin resource sharing
- **requests**: HTTP client for API calls
- **google-generativeai**: Google Gemini AI integration
- **python-dotenv**: Environment variable management

## Deployment

### Production Considerations

1. **Security**: Use environment variables for API keys
2. **Rate Limiting**: Monitor API usage and implement additional rate limiting if needed
3. **File Storage**: Consider cloud storage for uploaded files in production
4. **Logging**: Configure appropriate logging levels
5. **HTTPS**: Use SSL/TLS in production
6. **Process Management**: Use WSGI server like Gunicorn

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## Troubleshooting

### Common Issues

1. **ImportError**: Install missing dependencies with `pip install -r requirements.txt`
2. **API Key Errors**: Verify your `.env` file contains valid API keys
3. **File Upload Errors**: Check file size (max 100MB) and format support
4. **Gemini API Errors**: Monitor quota usage and implement appropriate delays
5. **CORS Errors**: Ensure Flask-CORS is installed and configured

### Debugging

Enable debug mode by setting `debug=True` in `app.run()` or use:
```bash
export FLASK_DEBUG=1
python app.py
```

## License

This project is part of a speech-to-text transcription platform with AI enhancement capabilities.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API status with `/api-status` endpoint
3. Check server logs for detailed error information
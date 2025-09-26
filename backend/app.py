from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os
from dotenv import load_dotenv
import tempfile
import uuid
from werkzeug.utils import secure_filename
import logging
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'm4a', 'mp4', 'avi', 'mov', 'webm', 'ogg', 'flac'}

# AssemblyAI configuration
ASSEMBLYAI_API_KEY = os.getenv('API_KEY')
ASSEMBLYAI_BASE_URL = os.getenv('ASSEMBLYAI_BASE', 'https://api.assemblyai.com')

headers = {
    "authorization": ASSEMBLYAI_API_KEY
}

# Gemini AI configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment variables")

# Available models in order of preference (updated for newer API)
GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-pro'
]

def get_available_model():
    """Get the first available Gemini model"""
    for model_name in GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            return model, model_name
        except Exception as e:
            logger.debug(f"Model {model_name} not available: {str(e)}")
            continue
    
    # Fallback to basic model
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        return model, 'gemini-2.5-flash'
    except Exception as e:
        logger.error(f"No Gemini models available: {str(e)}")
        raise e

# Rate limiting for Gemini API
from datetime import datetime, timedelta
last_gemini_call = None
GEMINI_CALL_INTERVAL = 2  # Minimum 2 seconds between calls

def rate_limit_gemini():
    """Implement rate limiting for Gemini API calls"""
    global last_gemini_call
    if last_gemini_call:
        time_since_last = datetime.now() - last_gemini_call
        if time_since_last.total_seconds() < GEMINI_CALL_INTERVAL:
            sleep_time = GEMINI_CALL_INTERVAL - time_since_last.total_seconds()
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
    last_gemini_call = datetime.now()

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file_to_assemblyai(file_path):
    """Upload a local file to AssemblyAI and return the upload URL"""
    try:
        with open(file_path, "rb") as f:
            response = requests.post(
                f"{ASSEMBLYAI_BASE_URL}/v2/upload",
                headers=headers,
                data=f
            )
        
        if response.status_code == 200:
            return response.json()["upload_url"]
        else:
            raise Exception(f"Failed to upload file: {response.status_code} - {response.text}")
    except Exception as e:
        raise Exception(f"Error uploading file: {str(e)}")

def transcribe_audio(audio_url):
    """Transcribe audio using AssemblyAI"""
    try:
        # Submit transcription request
        data = {
            "audio_url": audio_url,
            "speech_model": "universal"
        }
        
        response = requests.post(
            f"{ASSEMBLYAI_BASE_URL}/v2/transcript", 
            json=data, 
            headers=headers
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to submit transcription: {response.status_code} - {response.text}")
        
        transcript_id = response.json()['id']
        polling_endpoint = f"{ASSEMBLYAI_BASE_URL}/v2/transcript/{transcript_id}"
        
        # Poll for results
        while True:
            transcription_result = requests.get(polling_endpoint, headers=headers).json()
            
            if transcription_result['status'] == 'completed':
                return {
                    'success': True,
                    'transcript': transcription_result['text'],
                    'confidence': transcription_result.get('confidence', None),
                    'words': transcription_result.get('words', [])
                }
            
            elif transcription_result['status'] == 'error':
                raise Exception(f"Transcription failed: {transcription_result['error']}")
            
            else:
                time.sleep(3)
                
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def enhance_text_with_gemini(text, enhancement_type="structure", retry_count=0):
    """Enhance text using Gemini AI for proper structure, punctuation, and semantics"""
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not available, returning original text")
        return {
            'success': False,
            'error': 'Gemini API key not configured',
            'original_text': text
        }
    
    # Limit text length to avoid quota issues
    if len(text) > 2000:
        text = text[:2000] + "..."
        logger.info("Text truncated to 2000 characters to manage quota")
    
    try:
        # Apply rate limiting
        rate_limit_gemini()
        
        # Get available model
        model, model_name = get_available_model()
        logger.info(f"Using model: {model_name}")
        
        # Shorter, more efficient prompts
        if enhancement_type == "structure":
            prompt = f"Fix punctuation, capitalization, and grammar in this text. Keep it concise:\n\n{text}"
        
        elif enhancement_type == "expressions":
            prompt = f"Add appropriate emotions and tone to this text. Keep it natural:\n\n{text}"
        
        else:  # Default to structure
            prompt = f"Improve punctuation and readability:\n\n{text}"
        
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'enhanced_text': response.text.strip(),
            'original_text': text
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error enhancing text with Gemini: {error_msg}")
        
        # Handle model not found errors
        if "404" in error_msg and "model" in error_msg.lower():
            logger.error(f"Model not found error: {error_msg}")
            return {
                'success': True,
                'enhanced_text': basic_text_enhancement(text, enhancement_type),
                'original_text': text,
                'fallback_used': True,
                'error': 'AI model not available, using basic enhancement'
            }
        
        # Handle quota exceeded errors with retry logic
        elif "429" in error_msg or "quota" in error_msg.lower():
            if retry_count < 2:  # Max 2 retries
                wait_time = 2 ** retry_count  # Exponential backoff: 1s, 2s, 4s
                logger.info(f"Quota exceeded, retrying in {wait_time} seconds... (attempt {retry_count + 1}/3)")
                time.sleep(wait_time)
                return enhance_text_with_gemini(text, enhancement_type, retry_count + 1)
            else:
                # Provide graceful fallback
                return {
                    'success': True,
                    'enhanced_text': basic_text_enhancement(text, enhancement_type),
                    'original_text': text,
                    'fallback_used': True
                }
        
        return {
            'success': False,
            'error': error_msg,
            'original_text': text
        }

def translate_text_with_gemini(text, target_language, retry_count=0):
    """Translate text to target language using Gemini AI"""
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not available, cannot translate")
        return {
            'success': False,
            'error': 'Gemini API key not configured',
            'original_text': text
        }
    
    # Skip translation if target language is English or Auto
    if target_language.lower() in ['english', 'en', 'auto', 'original']:
        return {
            'success': True,
            'translated_text': text,
            'original_text': text,
            'target_language': target_language,
            'skipped': True
        }
    
    # Limit text length for translation
    if len(text) > 1800:
        text = text[:1800] + "..."
        logger.info("Text truncated to 1800 characters for translation")
    
    try:
        # Apply rate limiting
        rate_limit_gemini()
        
        # Get available model
        model, model_name = get_available_model()
        logger.info(f"Using model for translation: {model_name}")
        
        # Translation prompt
        prompt = f"Translate the following text to {target_language}. Maintain the original meaning and tone. Only return the translation, no additional commentary:\n\n{text}"
        
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'translated_text': response.text.strip(),
            'original_text': text,
            'target_language': target_language
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error translating text with Gemini: {error_msg}")
        
        # Handle model not found errors
        if "404" in error_msg and "model" in error_msg.lower():
            logger.error(f"Model not found for translation: {error_msg}")
            return {
                'success': True,
                'translated_text': text + f" [Translation to {target_language} not available]",
                'original_text': text,
                'target_language': target_language,
                'fallback_used': True,
                'error': 'AI model not available for translation'
            }
        
        # Handle quota exceeded errors with retry logic
        elif "429" in error_msg or "quota" in error_msg.lower():
            if retry_count < 2:  # Max 2 retries
                wait_time = 2 ** retry_count  # Exponential backoff
                logger.info(f"Quota exceeded for translation, retrying in {wait_time} seconds... (attempt {retry_count + 1}/3)")
                time.sleep(wait_time)
                return translate_text_with_gemini(text, target_language, retry_count + 1)
            else:
                # Provide fallback
                return {
                    'success': True,
                    'translated_text': text + f" [Translation to {target_language} failed due to API limits]",
                    'original_text': text,
                    'target_language': target_language,
                    'fallback_used': True
                }
        
        return {
            'success': False,
            'error': error_msg,
            'original_text': text,
            'target_language': target_language
        }

def basic_text_enhancement(text, enhancement_type):
    """Basic text enhancement fallback when Gemini API is unavailable"""
    import re
    
    if enhancement_type == "structure":
        # Basic punctuation and capitalization fixes
        text = text.strip()
        # Add periods at the end of sentences
        text = re.sub(r'([a-zA-Z])\s+([A-Z])', r'\1. \2', text)
        # Capitalize first letter
        text = text[0].upper() + text[1:] if text else text
        # Add period at the end if missing
        if text and not text.endswith(('.', '!', '?')):
            text += '.'
        return text
    
    elif enhancement_type == "expressions":
        # Add basic expression indicators
        text = text.strip()
        # Simple emotion detection and enhancement
        if any(word in text.lower() for word in ['good', 'great', 'excellent', 'amazing']):
            text = text + " (positive tone)"
        elif any(word in text.lower() for word in ['bad', 'terrible', 'awful', 'problem']):
            text = text + " (concerned tone)"
        return text
    
    else:
        # Default: basic cleanup
        return text.strip().capitalize()

def summarize_text_with_gemini(text, retry_count=0):
    """Generate a concise summary of the transcribed text using Gemini AI"""
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not available, cannot generate summary")
        return {
            'success': False,
            'error': 'Gemini API key not configured'
        }
    
    # Limit text length for summary
    if len(text) > 1500:
        text = text[:1500] + "..."
        logger.info("Text truncated to 1500 characters for summary")
    
    try:
        # Apply rate limiting
        rate_limit_gemini()
        
        # Get available model
        model, model_name = get_available_model()
        logger.info(f"Using model for summary: {model_name}")
        
        # Shorter prompt
        prompt = f"Summarize this text in 2-3 sentences, highlighting key points:\n\n{text}"
        
        response = model.generate_content(prompt)
        
        return {
            'success': True,
            'summary': response.text.strip()
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error generating summary with Gemini: {error_msg}")
        
        # Handle model not found errors
        if "404" in error_msg and "model" in error_msg.lower():
            logger.error(f"Model not found for summary: {error_msg}")
            words = text.split()
            if len(words) > 50:
                summary = ' '.join(words[:50]) + "... [AI summary not available, showing excerpt]"
            else:
                summary = text + " [AI summary not available]"
            
            return {
                'success': True,
                'summary': summary,
                'fallback_used': True,
                'error': 'AI model not available for summary'
            }
        
        # Handle quota exceeded errors with retry logic
        elif "429" in error_msg or "quota" in error_msg.lower():
            if retry_count < 2:  # Max 2 retries
                wait_time = 2 ** retry_count  # Exponential backoff
                logger.info(f"Quota exceeded for summary, retrying in {wait_time} seconds... (attempt {retry_count + 1}/3)")
                time.sleep(wait_time)
                return summarize_text_with_gemini(text, retry_count + 1)
            else:
                # Provide basic fallback summary
                words = text.split()
                if len(words) > 50:
                    summary = ' '.join(words[:50]) + "... [Summary generation failed due to API limits]"
                else:
                    summary = text + " [Summary generation failed due to API limits]"
                
                return {
                    'success': True,
                    'summary': summary,
                    'fallback_used': True
                }
        
        return {
            'success': False,
            'error': error_msg
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Flask transcription server is running'})

@app.route('/api-status', methods=['GET'])
def api_status():
    """Check API status and provide information about quota limits"""
    gemini_model = 'unknown'
    gemini_status = 'not configured'
    
    if GEMINI_API_KEY:
        try:
            _, gemini_model = get_available_model()
            gemini_status = 'ready'
        except Exception as e:
            gemini_status = f'error: {str(e)}'
    
    status = {
        'assemblyai': {
            'configured': bool(ASSEMBLYAI_API_KEY),
            'status': 'ready' if ASSEMBLYAI_API_KEY else 'not configured'
        },
        'gemini': {
            'configured': bool(GEMINI_API_KEY),
            'status': gemini_status,
            'model': gemini_model,
            'available_models': GEMINI_MODELS,
            'rate_limit': f'{GEMINI_CALL_INTERVAL}s between calls',
            'note': 'Free tier has limited quota - use "Enhance with AI" button sparingly'
        }
    }
    return jsonify(status)

@app.route('/transcribe', methods=['POST'])
def transcribe_file():
    """Handle file upload and transcription"""
    logger.info("Received transcription request")
    
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            logger.warning("No file provided in request")
            return jsonify({
                'success': False, 
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            logger.warning("No file selected")
            return jsonify({
                'success': False, 
                'error': 'No file selected'
            }), 400
        
        logger.info(f"Processing file: {file.filename}")
        
        # Check if file type is allowed
        if not allowed_file(file.filename):
            logger.warning(f"Invalid file type: {file.filename}")
            return jsonify({
                'success': False, 
                'error': f'File type not allowed. Supported formats: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Create a temporary file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{secure_filename(file.filename)}") as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        logger.info(f"File saved to temporary location: {temp_file_path}")
        
        try:
            # Upload file to AssemblyAI
            logger.info("Uploading file to AssemblyAI...")
            upload_url = upload_file_to_assemblyai(temp_file_path)
            logger.info(f"File uploaded successfully: {upload_url}")
            
            # Transcribe the audio
            logger.info("Starting transcription...")
            result = transcribe_audio(upload_url)
            
            # Clean up temporary file
            os.unlink(temp_file_path)
            logger.info("Temporary file cleaned up")
            
            if result['success']:
                logger.info("Transcription completed successfully")
                
                response_data = {
                    'success': True,
                    'transcript': result['transcript'],
                    'confidence': result.get('confidence'),
                    'filename': file.filename
                }
                
                # Check for translation request
                target_language = request.form.get('target_language', 'English')
                text_to_process = result['transcript']
                
                if target_language and target_language.lower() not in ['english', 'en', 'auto', 'original']:
                    logger.info(f"Translation requested to: {target_language}")
                    translation_result = translate_text_with_gemini(result['transcript'], target_language)
                    
                    if translation_result['success']:
                        text_to_process = translation_result['translated_text']
                        response_data['translated_text'] = translation_result['translated_text']
                        response_data['target_language'] = target_language
                        if translation_result.get('fallback_used'):
                            response_data['translation_fallback'] = True
                        if translation_result.get('skipped'):
                            response_data['translation_skipped'] = True
                    else:
                        response_data['translation_error'] = translation_result['error']
                        logger.error(f"Translation failed: {translation_result['error']}")
                
                # Check if enhancement is requested (optional parameter)
                enhance_request = request.form.get('enhance', 'false').lower() == 'true'
                
                if enhance_request:
                    logger.info("Enhancement requested, processing with Gemini...")
                    try:
                        # Use translated text for enhancement if available
                        source_text = text_to_process
                        
                        # Only do one enhancement at a time to manage quota
                        structured_result = enhance_text_with_gemini(source_text, "structure")
                        
                        if structured_result['success']:
                            response_data['structured_text'] = structured_result['enhanced_text']
                            if structured_result.get('fallback_used'):
                                response_data['structure_fallback'] = True
                        
                        # Wait before next call
                        time.sleep(1)
                        
                        expressions_result = enhance_text_with_gemini(source_text, "expressions")
                        if expressions_result['success']:
                            response_data['expressive_text'] = expressions_result['enhanced_text']
                            if expressions_result.get('fallback_used'):
                                response_data['expressions_fallback'] = True
                        
                        # Wait before summary
                        time.sleep(1)
                        
                        summary_result = summarize_text_with_gemini(source_text)
                        if summary_result['success']:
                            response_data['summary'] = summary_result['summary']
                            if summary_result.get('fallback_used'):
                                response_data['summary_fallback'] = True
                                
                    except Exception as gemini_error:
                        logger.error(f"Gemini enhancement failed: {str(gemini_error)}")
                        response_data['enhancement_error'] = str(gemini_error)
                
                return jsonify(response_data)
            else:
                logger.error(f"Transcription failed: {result['error']}")
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 500
                
        except Exception as e:
            # Clean up temporary file in case of error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.info("Temporary file cleaned up after error")
            raise e
            
    except Exception as e:
        logger.error(f"Unexpected error in transcribe_file: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.errorhandler(413)
def file_too_large(error):
    """Handle file too large errors"""
    logger.warning("File too large uploaded")
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 100MB.'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.route('/enhance-text', methods=['POST'])
def enhance_text():
    """Enhance text from live transcription or any other source"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        enhancement_type = data.get('type', 'structure')  # Default to structure
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'Empty text provided'
            }), 400
        
        logger.info(f"Enhancing text with type: {enhancement_type}")
        
        result = enhance_text_with_gemini(text, enhancement_type)
        
        if result['success']:
            return jsonify({
                'success': True,
                'original_text': text,
                'enhanced_text': result['enhanced_text']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'original_text': text
            }), 500
            
    except Exception as e:
        logger.error(f"Error in enhance_text endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/summarize-text', methods=['POST'])
def summarize_text():
    """Generate summary of transcribed text"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'Empty text provided'
            }), 400
        
        logger.info("Generating summary for text")
        
        result = summarize_text_with_gemini(text)
        
        if result['success']:
            return jsonify({
                'success': True,
                'summary': result['summary']
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"Error in summarize_text endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/translate-text', methods=['POST'])
def translate_text_endpoint():
    """Translate text to target language"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        target_language = data.get('target_language', 'English')
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'Empty text provided'
            }), 400
        
        logger.info(f"Translating text to: {target_language}")
        
        result = translate_text_with_gemini(text, target_language)
        
        if result['success']:
            return jsonify({
                'success': True,
                'original_text': text,
                'translated_text': result['translated_text'],
                'target_language': target_language,
                'translation_skipped': result.get('skipped', False),
                'fallback_used': result.get('fallback_used', False)
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'original_text': text,
                'target_language': target_language
            }), 500
            
    except Exception as e:
        logger.error(f"Error in translate_text endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/process-live-text', methods=['POST'])
def process_live_text():
    """Process live transcription text with all enhancements"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        target_language = data.get('target_language', 'English')
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'Empty text provided'
            }), 400
        
        logger.info("Processing live text with translation and enhancements")
        
        text_to_process = text
        response_data = {
            'success': True,
            'original_text': text
        }
        
        # Translate first if requested
        if target_language and target_language.lower() not in ['english', 'en', 'auto', 'original']:
            translation_result = translate_text_with_gemini(text, target_language)
            if translation_result['success']:
                text_to_process = translation_result['translated_text']
                response_data['translated_text'] = translation_result['translated_text']
                response_data['target_language'] = target_language
                if translation_result.get('fallback_used'):
                    response_data['translation_fallback'] = True
            else:
                response_data['translation_error'] = translation_result['error']
        
        # Get all enhancements using translated text
        structured_result = enhance_text_with_gemini(text_to_process, "structure")
        expressions_result = enhance_text_with_gemini(text_to_process, "expressions")
        summary_result = summarize_text_with_gemini(text_to_process)
        
        # Add enhancements if successful
        if structured_result['success']:
            response_data['structured_text'] = structured_result['enhanced_text']
        else:
            response_data['structure_error'] = structured_result['error']
        
        if expressions_result['success']:
            response_data['expressive_text'] = expressions_result['enhanced_text']
        else:
            response_data['expressions_error'] = expressions_result['error']
        
        if summary_result['success']:
            response_data['summary'] = summary_result['summary']
        else:
            response_data['summary_error'] = summary_result['error']
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in process_live_text endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini models to see which ones work"""
    if not GEMINI_API_KEY:
        return jsonify({'error': 'No Gemini API key configured'}), 400
    
    results = {}
    test_models = [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.0-pro'
    ]
    
    for model_name in test_models:
        try:
            model = genai.GenerativeModel(model_name)
            # Try a simple generation
            response = model.generate_content("Say hello")
            results[model_name] = {
                'status': 'working',
                'response': response.text[:50] if response.text else 'empty response'
            }
        except Exception as e:
            results[model_name] = {
                'status': 'failed',
                'error': str(e)[:200]  # Truncate long error messages
            }
    
    return jsonify({
        'results': results,
        'recommended': next((name for name, result in results.items() if result['status'] == 'working'), 'none')
    })

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
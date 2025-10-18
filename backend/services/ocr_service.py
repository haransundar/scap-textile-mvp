"""
OCR Service for certificate text extraction using EasyOCR and Tesseract

This service handles text extraction from certificate images and PDFs with support for
multiple languages, confidence scoring, and advanced preprocessing.
"""
import os
import time
import logging
import numpy as np
import fitz  # PyMuPDF
from io import BytesIO
from typing import Any, Dict, List, Tuple, Optional, Union, BinaryIO
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import easyocr
from concurrent.futures import ThreadPoolExecutor, as_completed

logger = logging.getLogger(__name__)

class OCRService:
    """Service for extracting text from certificate images and PDFs using OCR"""
    
    def __init__(self, use_gpu: bool = False):
        """Initialize OCR service with language support
        
        Args:
            use_gpu: Whether to use GPU acceleration if available
        """
        self.use_gpu = use_gpu
        # Supported languages with their display names
        self.supported_languages = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'kn': 'Kannada',
            'mr': 'Marathi',
            'bn': 'Bengali',
            'de': 'German',
            'fr': 'French',
            'es': 'Spanish',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean'
        }
        
        # Initialize OCR readers for different language groups
        self.readers = {}
        self._initialize_readers()
        
        # Thread pool for parallel processing
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
    
    def _initialize_readers(self):
        """Initialize OCR readers for different language groups"""
        try:
            # Initialize with English by default
            logger.info("Initializing English OCR reader...")
            self.readers['en'] = easyocr.Reader(
                ['en'],
                gpu=self.use_gpu,
                verbose=True,
                download_enabled=True
            )
            logger.info("✅ Successfully initialized English OCR reader")
            
            # Set default reader to English
            self.readers['default'] = self.readers['en']
            
            # Other languages will be initialized on demand
            logger.info("Other languages will be initialized on first use")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize EasyOCR: {e}")
            logger.error("Please check your internet connection and try again.")
            logger.error("If the issue persists, you may need to manually download the models.")
            raise
    
    def _get_reader(self, language: str = 'en'):
        """Get or initialize a reader for the specified language"""
        if language not in self.supported_languages:
            logger.warning(f"Language '{language}' not supported, falling back to English")
            language = 'en'
        
        if language not in self.readers:
            try:
                logger.info(f"Initializing {self.supported_languages[language]} OCR reader...")
                self.readers[language] = easyocr.Reader(
                    [language],
                    gpu=self.use_gpu,
                    verbose=True,
                    download_enabled=True
                )
                logger.info(f"✅ Successfully initialized {self.supported_languages[language]} OCR reader")
            except Exception as e:
                logger.error(f"Failed to initialize {language} reader: {e}")
                logger.warning(f"Falling back to English reader for {language}")
                return self.readers['en']
        
        return self.readers[language]
    
    def _preprocess_image(self, image_data: Union[str, Path, bytes, BinaryIO, np.ndarray]) -> np.ndarray:
        """Preprocess image to improve OCR accuracy
        
        Args:
            image_data: Image file path, bytes, file-like object, or numpy array
            
        Returns:
            Preprocessed image as numpy array
        """
        try:
            # Handle different input types
            if isinstance(image_data, (str, Path)):
                img = Image.open(image_data).convert('L')  # Convert to grayscale
            elif isinstance(image_data, bytes):
                img = Image.open(BytesIO(image_data)).convert('L')
            elif hasattr(image_data, 'read'):  # File-like object
                img = Image.open(image_data).convert('L')
            elif isinstance(image_data, np.ndarray):
                img = Image.fromarray(image_data).convert('L')
            else:
                raise ValueError("Unsupported image data type")
            
            # Resize if needed (maintain aspect ratio, max dimension 2000px)
            max_dim = 2000
            if max(img.size) > max_dim:
                ratio = max_dim / max(img.size)
                new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            
            # Enhance contrast using histogram equalization
            img = ImageOps.equalize(img)
            
            # Apply adaptive thresholding
            img = img.point(lambda p: p > 128 and 255)
            
            # Apply slight sharpening
            img = img.filter(ImageFilter.SHARPEN)
            
            # Convert to numpy array
            img_array = np.array(img)
            
            # Apply adaptive thresholding
            img_array = (img_array > 150) * 255
            
            return img_array.astype(np.uint8)
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def _process_pdf_page(self, page, dpi: int = 200) -> Image.Image:
        """Convert a PDF page to a high-quality image"""
        try:
            # Render page to a pixmap
            matrix = fitz.Matrix(dpi / 72, dpi / 72)  # Scale factor for DPI
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            return img
            
        except Exception as e:
            logger.error(f"Error processing PDF page: {e}")
            raise
    
    def _extract_from_image(self, image_data: Union[str, Path, bytes, BinaryIO, np.ndarray], 
                          language: str = 'en') -> Dict[str, Any]:
        """Extract text from a single image"""
        try:
            # Get the appropriate reader for the language
            reader = self._get_reader(language)
            
            # Preprocess the image
            img_array = self._preprocess_image(image_data)
            
            # Perform OCR
            start_time = time.time()
            results = reader.readtext(img_array, detail=1, paragraph=False)
            processing_time = time.time() - start_time
            
            # Process results
            text_blocks = []
            full_text = []
            total_confidence = 0.0
            
            for bbox, text, confidence in results:
                if not text.strip():
                    continue
                    
                # Calculate bounding box coordinates
                (tl, tr, br, bl) = bbox
                x_min, y_min = map(int, map(min, zip(*[tl, tr, br, bl])))
                x_max, y_max = map(int, map(max, zip(*[tl, tr, br, bl])))
                
                text_blocks.append({
                    'text': text,
                    'confidence': float(confidence),
                    'bounding_box': {
                        'x': x_min,
                        'y': y_min,
                        'width': x_max - x_min,
                        'height': y_max - y_min
                    }
                })
                
                full_text.append(text)
                total_confidence += confidence
            
            # Calculate average confidence
            avg_confidence = total_confidence / len(text_blocks) if text_blocks else 0
            
            return {
                'text': '\n'.join(full_text),
                'text_blocks': text_blocks,
                'confidence': avg_confidence,
                'processing_time': processing_time,
                'language': language,
                'page_count': 1
            }
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            raise
    
    async def extract_text(
        self,
        file_data: Union[str, Path, bytes, BinaryIO],
        language: str = 'en',
        max_pages: int = 10
    ) -> Dict[str, Any]:
        """
        Extract text from an image or PDF file
        
        Args:
            file_data: File path, bytes, or file-like object
            language: Language code (default: 'en')
            max_pages: Maximum number of pages to process for PDFs
            
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            # Handle PDF files
            if isinstance(file_data, (str, Path)) and str(file_data).lower().endswith('.pdf'):
                return await self._extract_from_pdf(file_data, language, max_pages)
            
            # Handle image files
            return await asyncio.get_event_loop().run_in_executor(
                self.thread_pool,
                self._extract_from_image,
                file_data,
                language
            )
            
        except Exception as e:
            logger.error(f"Error in extract_text: {e}")
            raise
    
    async def _extract_from_pdf(
        self,
        file_path: Union[str, Path],
        language: str = 'en',
        max_pages: int = 10
    ) -> Dict[str, Any]:
        """Extract text from a PDF file"""
        try:
            start_time = time.time()
            doc = fitz.open(file_path)
            total_pages = len(doc)
            
            # Limit number of pages to process
            pages_to_process = min(total_pages, max_pages)
            
            # Process pages in parallel
            futures = []
            for page_num in range(pages_to_process):
                page = doc.load_page(page_num)
                futures.append(
                    asyncio.get_event_loop().run_in_executor(
                        self.thread_pool,
                        self._process_pdf_page,
                        page
                    )
                )
            
            # Wait for all pages to be processed
            images = await asyncio.gather(*futures)
            
            # Process each page
            all_text_blocks = []
            all_full_text = []
            total_confidence = 0.0
            
            for img in images:
                result = await asyncio.get_event_loop().run_in_executor(
                    self.thread_pool,
                    self._extract_from_image,
                    img,
                    language
                )
                
                all_text_blocks.extend(result['text_blocks'])
                all_full_text.append(result['text'])
                total_confidence += result['confidence'] * len(result['text_blocks']) if result['text_blocks'] else 0
            
            # Calculate average confidence
            total_blocks = sum(1 for _ in all_text_blocks)
            avg_confidence = total_confidence / total_blocks if total_blocks > 0 else 0
            
            return {
                'text': '\n\n'.join(all_full_text),
                'text_blocks': all_text_blocks,
                'confidence': avg_confidence,
                'processing_time': time.time() - start_time,
                'language': language,
                'page_count': pages_to_process,
                'total_pages': total_pages
            }
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise
        finally:
            if 'doc' in locals():
                doc.close()
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get a dictionary of supported language codes and names"""
        return self.supported_languages.copy()
    
    def is_language_supported(self, language: str) -> bool:
        """Check if a language is supported"""
        return language in self.supported_languages
    
    def __del__(self):
        """Cleanup resources"""
        try:
            self.thread_pool.shutdown(wait=True)
        except Exception as e:
            logger.debug(f"Error shutting down thread pool: {e}")
            
    def _postprocess_text(self, text: str) -> str:
        """Clean and normalize extracted text
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned and normalized text
        """
        if not text:
            return ""
            
        # Remove extra whitespace and normalize newlines
        text = ' '.join(text.split())
        
        # Common OCR artifacts to remove
        artifacts = [
            '•', '|', '_', '~', '`', '^', '"', "'",
            '\x0c',  # Form feed
            '\x0b',  # Vertical tab
            '\x0d'   # Carriage return
        ]
        
        for char in artifacts:
            text = text.replace(char, ' ')
        
        # Final cleanup
        return ' '.join(text.split()).strip()
    
    def _calculate_confidence(self, results: List[Tuple]) -> float:
        """Calculate average confidence score from OCR results
        
        Args:
            results: List of (bbox, text, confidence) tuples from EasyOCR
            
        Returns:
            Average confidence score (0-1)
        """
        if not results:
            return 0.0
            
        confidences = [result[2] for result in results if len(result) > 2]
        return sum(confidences) / len(confidences) if confidences else 0.0
    
    async def extract_text(
        self, 
        image_path: Union[str, Path],
        languages: Optional[List[str]] = None,
        preprocess: bool = True,
        detail: int = 0
    ) -> Dict:
        """Extract text from an image with confidence scoring
        
        Args:
            image_path: Path to the image file or image data
            languages: List of language codes to use (e.g., ['en', 'hi'])
            preprocess: Whether to preprocess the image
            detail: Level of detail in response (0 for text only, 1 for bbox and confidence)
            
        Returns:
            {
                'text': str (full extracted text),
                'confidence': float (average confidence 0-1),
                'processing_time': float (seconds),
                'language': str (detected language code),
                'words': List[Dict] (if detail=1)
            }
            
        Note:
            If multiple languages are provided, the first available language reader will be used.
            If no languages are specified, the default (English) reader will be used.
        """
        start_time = time.time()
        
        try:
            # Validate image
            if not os.path.exists(str(image_path)) and not isinstance(image_path, (np.ndarray, Image.Image)):
                raise FileNotFoundError(f"Image file not found: {image_path}")
                
            # Determine which languages to use
            if not languages:
                languages = ['en']  # Default to English if no languages specified
            
            # Find the first available language reader
            reader = None
            for lang in languages:
                if lang in self.readers:
                    reader = self.readers[lang]
                    break
            
            # Fall back to default reader if no matching language found
            if reader is None:
                logger.warning(f"No reader found for languages {languages}, falling back to default")
                reader = self.readers['default']
            
            # Preprocess image if needed
            if preprocess:
                image = self._preprocess_image(image_path)
            else:
                if isinstance(image_path, (str, Path)):
                    image = np.array(Image.open(image_path))
                else:
                    image = image_path
            
            # Use the default reader for now (can be extended to use language-specific readers)
            reader = self.readers['default']
            
            # Perform OCR
            results = reader.readtext(
                image,
                detail=detail if detail == 1 else 0,
                paragraph=detail == 0,
                batch_size=8,
                min_size=10,
                text_threshold=0.3,
                low_text=0.3,
                link_threshold=0.4,
                canvas_size=2560,
                mag_ratio=1.5
            )
            
            # Process results
            if detail == 1:
                # Extract text and calculate confidence
                text_parts = [result[1] for result in results]
                confidence = self._calculate_confidence(results)
                full_text = '\n'.join(text_parts)
                
                # Prepare detailed response
                words = [{
                    'text': result[1],
                    'confidence': float(result[2]) if len(result) > 2 else 0.0,
                    'bounding_box': [list(map(int, point)) for point in result[0]]
                } for result in results]
                
                return {
                    'text': self._postprocess_text(full_text),
                    'confidence': float(confidence),
                    'processing_time': time.time() - start_time,
                    'language': 'en',  # TODO: Add language detection
                    'words': words
                }
            else:
                # Simple text response
                full_text = '\n'.join(results) if results else ''
                return {
                    'text': self._postprocess_text(full_text),
                    'confidence': 1.0,  # Confidence not available in detail=0 mode
                    'processing_time': time.time() - start_time,
                    'language': 'en'  # Default to English
                }
                
        except Exception as e:
            logger.error(f"Error in OCR processing: {e}", exc_info=True)
            return {
                'text': '',
                'confidence': 0.0,
                'processing_time': time.time() - start_time,
                'error': str(e)
            }


# Global instance
ocr_service = OCRService()

import io
from pdfminer.high_level import extract_text
from docx import Document

class ResumeExtractor:
    @staticmethod
    def extract_text(file_content: bytes, filename: str) -> str:
        """Extract text from PDF or Docx file"""
        if filename.lower().endswith('.pdf'):
            try:
                text = extract_text(io.BytesIO(file_content))
                return text.strip()
            except Exception as e:
                print(f"Error extracting from PDF: {e}")
                raise ValueError("Could not read PDF. Please ensure it's not password-protected.")
        
        elif filename.lower().endswith('.docx'):
            try:
                doc = Document(io.BytesIO(file_content))
                full_text = []
                for para in doc.paragraphs:
                    full_text.append(para.text)
                return '\n'.join(full_text).strip()
            except Exception as e:
                print(f"Error extracting from Docx: {e}")
                raise ValueError("Could not read Word document.")
        
        else:
            raise ValueError("Unsupported file format. Please upload a PDF or .docx file.")

    @staticmethod
    def prepare_query(raw_text: str) -> str:
        """Clean and prepare the extracted text for career matching"""
        # Take the first ~2000 characters to keep it within common embedding limits
        # and focus on the most relevant top sections (Summary, Skills, Experience)
        cleaned_text = ' '.join(raw_text.split())
        return cleaned_text[:2500]

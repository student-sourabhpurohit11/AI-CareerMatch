import re
import fitz  # PyMuPDF
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from PDF documents using PyMuPDF (fitz) with page-by-page consolidation.
    """
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """
    Extracts text from DOCX documents using python-docx paragraph and table iteration.
    """
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    
    # Also extract text from any embedded tables
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    paragraphs.append(cell.text.strip())
                    
    return "\n".join(paragraphs).strip()


def clean_text(raw_text: str) -> str:
    """
    Cleans raw resume text by normalizing unicode characters, removing unreadable glyphs,
    and standardizing line breaks and spacing.
    """
    if not raw_text:
        return ""
    
    # Replace non-breaking spaces and tabs
    text = raw_text.replace("\xa0", " ").replace("\t", " ")
    
    # Standardize bullet points
    text = re.sub(r"[\u2022\u2023\u25E6\u2043\u2219•▪►]", "\n- ", text)
    
    # Collapse multiple consecutive newlines and horizontal spaces
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    return text.strip()


SECTION_PATTERNS = {
    "education": r"(?i)\b(education|academic background|qualifications|academic credentials)\b",
    "experience": r"(?i)\b(experience|work experience|employment history|work history|professional experience|internships)\b",
    "skills": r"(?i)\b(skills|technical skills|technologies|core competencies|competencies|skill set|tools & technologies)\b",
    "projects": r"(?i)\b(projects|academic projects|key projects|personal projects|technical projects)\b",
    "certifications": r"(?i)\b(certifications|certificates|licenses & certifications|accreditations)\b",
}


def detect_sections(cleaned_text: str) -> dict:
    """
    Partitions resume text into labeled sections based on regex header patterns.
    """
    lines = cleaned_text.split("\n")
    sections = {
        "contact": [],
        "education": [],
        "experience": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "other": []
    }
    
    current_section = "contact"
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if line matches a known section header
        matched_section = None
        if len(line_stripped) < 40:
            for section_name, pattern in SECTION_PATTERNS.items():
                if re.search(pattern, line_stripped):
                    matched_section = section_name
                    break
                    
        if matched_section:
            current_section = matched_section
        else:
            sections[current_section].append(line_stripped)
            
    return {k: "\n".join(v) for k, v in sections.items()}

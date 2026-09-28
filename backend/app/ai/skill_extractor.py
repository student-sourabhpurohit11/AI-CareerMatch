import re
from typing import List, Dict, Any, Optional
import spacy
from sqlalchemy.orm import Session
from app.models.skill import Skill

# Load spaCy pipeline once
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """
    Extracts candidate email, phone, and name heuristics using regex and linguistic rules.
    """
    email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    phone_pattern = r"(?:(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?)"

    emails = re.findall(email_pattern, text)
    email = emails[0] if emails else None

    phones = re.findall(phone_pattern, text)
    phone = "".join(phones[0]) if phones else None

    # Name extraction heuristic: check first 3 non-empty lines
    name = None
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:3]:
        # Filter out email, phone, URLs, or long sentences
        if "@" in line or "http" in line or len(line.split()) > 4 or len(line) > 40:
            continue
        # Use spaCy NER if available
        if nlp:
            doc = nlp(line)
            persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
            if persons:
                name = persons[0]
                break
        if not name and len(line.split()) in [2, 3]:
            name = line
            break

    return {
        "name": name,
        "email": email,
        "phone": phone
    }


def extract_skills_from_text(text: str, db: Session) -> List[Dict[str, Any]]:
    """
    Matches candidate text against controlled MySQL skills taxonomy using normalized token boundaries.
    Prevents false positives (e.g. matching 'C' inside 'Cloud' or 'Go' inside 'Good').
    """
    all_skills = db.query(Skill).all()
    text_lower = text.lower()
    
    extracted = []
    
    for skill in all_skills:
        s_name = skill.normalized_name.lower()
        
        # Word boundary pattern for alphanumeric skills; special handling for C++, C#, CI/CD
        if s_name == "c++":
            pattern = r"(?i)(?:\b|(?<=\W))c\+\+(?:\b|(?=\W))"
        elif s_name == "c#":
            pattern = r"(?i)(?:\b|(?<=\W))c\#(?:\b|(?=\W))"
        elif s_name == "ci/cd":
            pattern = r"(?i)\bci/cd\b"
        elif s_name == ".net":
            pattern = r"(?i)\.net\b"
        elif len(s_name) <= 2:
            pattern = rf"\b{re.escape(s_name)}\b"
        else:
            pattern = rf"\b{re.escape(s_name)}\b"

        if re.search(pattern, text_lower):
            extracted.append({
                "id": skill.id,
                "name": skill.name,
                "normalized_name": skill.normalized_name,
                "category": skill.category
            })
            
    return extracted

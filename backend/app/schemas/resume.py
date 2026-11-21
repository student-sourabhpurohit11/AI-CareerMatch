from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    uploaded_at: Optional[datetime] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None
    overall_score: float
    skills_score: float
    experience_score: float
    education_score: float
    project_score: float
    completeness_score: float
    presentation_score: Optional[float] = None
    strengths_json: Optional[List[str]] = None
    improvements_json: Optional[List[str]] = None
    summary_text: Optional[str] = None
    extracted_skills: Optional[List[str]] = None
    categorized_skills: Optional[Dict[str, List[str]]] = None
    detected_sections: Optional[Dict[str, str]] = None
    top_matches: Optional[List[Dict[str, Any]]] = None
    analyzed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_type: str
    file_size_bytes: int
    is_active: bool
    uploaded_at: datetime
    analysis: Optional[ResumeAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

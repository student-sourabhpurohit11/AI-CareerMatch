from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float
    skills_score: float
    experience_score: float
    education_score: float
    project_score: float
    completeness_score: float
    strengths_json: Optional[List[str]] = None
    improvements_json: Optional[List[str]] = None
    summary_text: Optional[str] = None
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

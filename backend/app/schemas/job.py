from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class CompanyResponse(BaseModel):
    id: int
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SkillSimple(BaseModel):
    id: int
    name: str
    normalized_name: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class JobSkillResponse(BaseModel):
    id: int
    skill: SkillSimple
    is_required: bool
    weight: float

    model_config = ConfigDict(from_attributes=True)


class JobResponse(BaseModel):
    id: int
    title: str
    job_type: str
    location: str
    experience_years_min: int
    experience_years_max: int
    min_education: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    description: str
    responsibilities: Optional[str] = None
    posted_date: datetime
    company: Optional[CompanyResponse] = None
    job_skills: List[JobSkillResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MatchedSkillInfo(BaseModel):
    id: int
    name: str
    is_required: bool


class JobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    company_name: str
    location: str
    compatibility: float
    explicit_skill_score: float
    semantic_similarity: float
    matched_skills: List[MatchedSkillInfo]
    missing_skills: List[MatchedSkillInfo]
    rationale: str

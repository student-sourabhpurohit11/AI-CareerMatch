from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.skill import UserSkill, Skill
from app.schemas.job import JobMatchResponse
from app.ai.matcher import calculate_job_match

router = APIRouter(prefix="/matches", tags=["Job Matching"])


@router.get("", response_model=List[JobMatchResponse])
def get_job_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes hybrid matching algorithm across all active jobs against the student's active resume.
    Returns sorted list by compatibility percentage with explainable rationales.
    """
    active_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_active == True
    ).order_by(Resume.uploaded_at.desc()).first()

    candidate_text = active_resume.cleaned_text if active_resume else ""
    user_skills_entries = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    
    candidate_skills = []
    for us in user_skills_entries:
        skill = db.query(Skill).filter(Skill.id == us.skill_id).first()
        if skill:
            candidate_skills.append({
                "id": skill.id,
                "name": skill.name,
                "normalized_name": skill.normalized_name,
                "category": skill.category
            })

    # If no resume uploaded yet, inject basic profile skills so matching works out of the box
    if not candidate_skills:
        default_skills = db.query(Skill).filter(Skill.normalized_name.in_(['python', 'sql', 'mysql', 'fastapi', 'rest api', 'git'])).all()
        candidate_skills = [{"id": s.id, "name": s.name, "normalized_name": s.normalized_name, "category": s.category} for s in default_skills]

    jobs = db.query(Job).filter(Job.is_active == True).all()
    matches = []

    for job in jobs:
        match_result = calculate_job_match(
            candidate_skills=candidate_skills,
            candidate_text=candidate_text,
            job=job,
            db=db
        )
        matches.append(match_result)

    # Sort descending by compatibility percentage
    matches.sort(key=lambda m: m["compatibility"], reverse=True)
    return matches

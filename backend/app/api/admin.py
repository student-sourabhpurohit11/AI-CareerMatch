from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.api.deps import get_current_active_admin
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import Job, Company, JobSkill
from app.models.skill import Skill
from app.models.application import Application
from app.schemas.job import JobResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


class CreateJobRequest(BaseModel):
    title: str
    company_name: str
    location: str
    job_type: str = "full_time"
    experience_years_min: int = 0
    experience_years_max: int = 2
    min_education: str = "Bachelor's Degree"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    description: str
    responsibilities: Optional[str] = None
    skills: List[str] = []


@router.get("/metrics")
def get_system_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    """
    Returns authentic system metrics computed from MySQL production tables.
    """
    candidates_count = db.query(User).filter(User.role == "student").count()
    resumes_count = db.query(Resume).count()
    active_jobs_count = db.query(Job).filter(Job.is_active == True).count()
    skills_count = db.query(Skill).count()
    applications_count = db.query(Application).count()

    recent_candidates = [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "resume_count": len(u.resumes)
        }
        for u in db.query(User).filter(User.role == "student").order_by(User.created_at.desc()).limit(6).all()
    ]

    recent_resumes = []
    for r in db.query(Resume).options(joinedload(Resume.user), joinedload(Resume.analysis)).order_by(Resume.uploaded_at.desc()).limit(6).all():
        recent_resumes.append({
            "id": r.id,
            "file_name": r.file_name,
            "candidate_name": r.user.full_name if r.user else "Anonymous",
            "candidate_email": r.user.email if r.user else "",
            "overall_score": float(r.analysis.overall_score) if r.analysis and r.analysis.overall_score is not None else 0.0,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None
        })

    taxonomy_samples = [
        {"name": s.name, "category": s.category}
        for s in db.query(Skill).order_by(Skill.name.asc()).limit(20).all()
    ]

    return {
        "metrics": {
            "registered_candidates": candidates_count,
            "resumes_analyzed": resumes_count,
            "active_jobs": active_jobs_count,
            "skills_in_taxonomy": skills_count,
            "total_applications": applications_count
        },
        "recent_candidates": recent_candidates,
        "recent_resumes": recent_resumes,
        "taxonomy_samples": taxonomy_samples
    }


@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job_requisition(
    job_in: CreateJobRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_active_admin)
):
    """
    Creates a new job requisition in MySQL with company and skill relations.
    """
    # 1. Resolve or create company
    company = db.query(Company).filter(Company.name == job_in.company_name.strip()).first()
    if not company:
        company = Company(
            name=job_in.company_name.strip(),
            location=job_in.location.strip()
        )
        db.add(company)
        db.flush()

    # 2. Create Job
    new_job = Job(
        company_id=company.id,
        title=job_in.title.strip(),
        job_type=job_in.job_type,
        location=job_in.location.strip(),
        experience_years_min=job_in.experience_years_min,
        experience_years_max=job_in.experience_years_max,
        min_education=job_in.min_education,
        salary_min=job_in.salary_min,
        salary_max=job_in.salary_max,
        description=job_in.description.strip(),
        responsibilities=job_in.responsibilities.strip() if job_in.responsibilities else None,
        is_active=True,
        posted_date=datetime.utcnow()
    )
    db.add(new_job)
    db.flush()

    # 3. Attach skills
    for skill_name in job_in.skills:
        clean_name = skill_name.strip()
        if not clean_name:
            continue
        skill_record = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
        if not skill_record:
            skill_record = Skill(
                name=clean_name,
                normalized_name=clean_name.lower().replace(" ", "_"),
                category="General Tech"
            )
            db.add(skill_record)
            db.flush()

        job_skill = JobSkill(
            job_id=new_job.id,
            skill_id=skill_record.id,
            is_required=True,
            weight=1.00
        )
        db.add(job_skill)

    db.commit()
    db.refresh(new_job)
    return new_job

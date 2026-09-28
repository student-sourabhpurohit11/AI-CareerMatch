from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.job import Job
from app.schemas.job import JobResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
def get_active_jobs(db: Session = Depends(get_db)):
    """
    Returns all active career requisitions with associated company details and required skills.
    """
    return db.query(Job).filter(Job.is_active == True).order_by(Job.posted_date.desc()).all()


@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job

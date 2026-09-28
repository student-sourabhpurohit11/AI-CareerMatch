from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.schemas.resume import ResumeResponse, ResumeAnalysisResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a PDF or DOCX resume, validates file constraints, parses structural text,
    executes NLP skill extraction, computes explainable scores, and stores records in MySQL.
    """
    return ResumeService.process_and_save_resume(file=file, user=current_user, db=db)


@router.get("", response_model=List[ResumeResponse])
def get_user_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all resume versions uploaded by the authenticated student.
    """
    return ResumeService.get_user_resumes(user_id=current_user.id, db=db)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_single_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = ResumeService.get_resume_by_id(resume_id=resume_id, user_id=current_user.id, db=db)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = ResumeService.delete_resume(resume_id=resume_id, user_id=current_user.id, db=db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return {"message": "Resume deleted successfully"}


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisResponse)
def get_resume_analysis(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches the explainable scoring breakdown, strengths, and areas for improvement.
    """
    resume = ResumeService.get_resume_by_id(resume_id=resume_id, user_id=current_user.id, db=db)
    if not resume or not resume.analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found for this resume")
    return resume.analysis

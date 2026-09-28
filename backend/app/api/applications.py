from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application
from app.models.job import Job
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_or_save_job(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Applies to or saves a job to candidate's tracking pipeline.
    """
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing_app = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == app_in.job_id
    ).first()

    if existing_app:
        existing_app.status = app_in.status or "applied"
        if app_in.notes:
            existing_app.notes = app_in.notes
        db.commit()
        db.refresh(existing_app)
        return existing_app

    new_app = Application(
        user_id=current_user.id,
        job_id=app_in.job_id,
        status=app_in.status or "applied",
        applied_at=datetime.now(timezone.utc) if app_in.status == "applied" else None,
        notes=app_in.notes
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.get("", response_model=List[ApplicationResponse])
def get_user_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Application).filter(
        Application.user_id == current_user.id
    ).order_by(Application.updated_at.desc()).all()


@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    app_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_record = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app_record.status = app_update.status
    if app_update.notes:
        app_record.notes = app_update.notes
    db.commit()
    db.refresh(app_record)
    return app_record


@router.delete("/{app_id}", status_code=status.HTTP_200_OK)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_record = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == current_user.id
    ).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    db.delete(app_record)
    db.commit()
    return {"message": "Application deleted from pipeline"}

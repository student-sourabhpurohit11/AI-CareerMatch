import os
import shutil
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.skill import UserSkill, Skill
from app.ai.parser import extract_text_from_pdf, extract_text_from_docx, clean_text, detect_sections
from app.ai.skill_extractor import extract_skills_from_text, extract_contact_info
from app.ai.resume_analyzer import analyze_resume_sections


class ResumeService:
    @staticmethod
    def process_and_save_resume(
        file: UploadFile,
        user: User,
        db: Session
    ) -> Resume:
        # 1. Validate file extension
        filename = file.filename or ""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".pdf", ".docx"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a PDF or DOCX file."
            )

        file_type = "pdf" if ext == ".pdf" else "docx"

        # 2. Ensure target upload directory exists
        upload_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            settings.UPLOAD_DIR
        )
        os.makedirs(upload_dir, exist_ok=True)

        # 3. Generate unique stored file path
        unique_filename = f"{user.id}_{uuid.uuid4().hex[:8]}{ext}"
        saved_file_path = os.path.join(upload_dir, unique_filename)

        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(saved_file_path)
        if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            os.remove(saved_file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_MB}MB."
            )

        # 4. Text Extraction Pipeline
        try:
            if file_type == "pdf":
                raw_text = extract_text_from_pdf(saved_file_path)
            else:
                raw_text = extract_text_from_docx(saved_file_path)
        except Exception as e:
            os.remove(saved_file_path)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Unable to extract text from document: {str(e)}"
            )

        cleaned_text = clean_text(raw_text)
        if not cleaned_text or len(cleaned_text.strip()) < 30:
            os.remove(saved_file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume appears empty or unreadable."
            )

        # 5. NLP Section Partitioning & Skill Extraction
        sections = detect_sections(cleaned_text)
        extracted_skills = extract_skills_from_text(cleaned_text, db)
        contact_info = extract_contact_info(cleaned_text)

        # 6. Compute Explainable Score & Health Analysis
        analysis_data = analyze_resume_sections(sections, extracted_skills, cleaned_text)

        # 7. Create DB Record for Resume
        db_resume = Resume(
            user_id=user.id,
            file_name=filename,
            file_path=saved_file_path,
            file_type=file_type,
            file_size_bytes=file_size,
            raw_text=raw_text,
            cleaned_text=cleaned_text,
            is_active=True
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)

        # 8. Create DB Record for Resume Analysis
        db_analysis = ResumeAnalysis(
            resume_id=db_resume.id,
            overall_score=analysis_data["overall_score"],
            skills_score=analysis_data["skills_score"],
            experience_score=analysis_data["experience_score"],
            education_score=analysis_data["education_score"],
            project_score=analysis_data["project_score"],
            completeness_score=analysis_data["completeness_score"],
            strengths_json=analysis_data["strengths_json"],
            improvements_json=analysis_data["improvements_json"],
            summary_text=analysis_data["summary_text"]
        )
        db.add(db_analysis)

        # 9. Sync Extracted Skills into user_skills Table
        for s in extracted_skills:
            existing = db.query(UserSkill).filter(
                UserSkill.user_id == user.id,
                UserSkill.skill_id == s["id"]
            ).first()
            if not existing:
                u_skill = UserSkill(
                    user_id=user.id,
                    skill_id=s["id"],
                    resume_id=db_resume.id,
                    source="extracted"
                )
                db.add(u_skill)

        db.commit()
        db.refresh(db_resume)
        return db_resume

    @staticmethod
    def get_user_resumes(user_id: int, db: Session) -> List[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc()).all()

    @staticmethod
    def get_resume_by_id(resume_id: int, user_id: int, db: Session) -> Optional[Resume]:
        return db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user_id).first()

    @staticmethod
    def delete_resume(resume_id: int, user_id: int, db: Session) -> bool:
        resume = ResumeService.get_resume_by_id(resume_id, user_id, db)
        if not resume:
            return False
        if os.path.exists(resume.file_path):
            try:
                os.remove(resume.file_path)
            except OSError:
                pass
        db.delete(resume)
        db.commit()
        return True

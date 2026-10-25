import os
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Response
from fastapi.responses import FileResponse
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


@router.get("/{resume_id}/file")
def get_resume_raw_file(
    resume_id: int,
    download: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Streams the uploaded PDF/DOCX file for in-browser preview or attachment download.
    """
    resume = ResumeService.get_resume_by_id(resume_id=resume_id, user_id=current_user.id, db=db)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file not found on storage")

    media_type = (
        "application/pdf"
        if resume.file_type == "pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    disposition = "attachment" if download else "inline"

    return FileResponse(
        path=resume.file_path,
        media_type=media_type,
        filename=resume.file_name,
        headers={
            "Content-Disposition": f'{disposition}; filename="{resume.file_name}"'
        }
    )


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
    Fetches the comprehensive explainable scoring breakdown, strengths, areas for improvement,
    detected sections, categorized skills, and top matching jobs.
    """
    resume = ResumeService.get_resume_by_id(resume_id=resume_id, user_id=current_user.id, db=db)
    if not resume or not resume.analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found for this resume")

    from app.models.skill import Skill, UserSkill
    from app.ai.parser import detect_sections
    from app.ai.skill_extractor import extract_contact_info
    from app.models.job import Job
    from app.ai.matcher import calculate_job_match

    # Extract candidate contact details and sections
    text_corpus = resume.cleaned_text or resume.raw_text or ""
    contact_info = extract_contact_info(text_corpus)
    sections = detect_sections(text_corpus)

    # Fetch skills associated with this resume
    skills_query = (
        db.query(Skill.id, Skill.name, Skill.normalized_name, Skill.category)
        .join(UserSkill, Skill.id == UserSkill.skill_id)
        .filter(UserSkill.resume_id == resume.id)
        .all()
    )
    if not skills_query:
        skills_query = (
            db.query(Skill.id, Skill.name, Skill.normalized_name, Skill.category)
            .join(UserSkill, Skill.id == UserSkill.skill_id)
            .filter(UserSkill.user_id == current_user.id)
            .all()
        )

    extracted_skill_names = [s[1] for s in skills_query]

    # Categorize skills for rich display
    category_labels = {
        "programming_language": "Programming Languages",
        "framework": "Frameworks & Libraries",
        "database": "Databases & Storage",
        "cloud": "Cloud & DevOps",
        "tool": "Developer Tools & Platforms",
        "other": "Core Competencies"
    }
    categorized_skills = {}
    for s_id, s_name, s_norm, s_cat in skills_query:
        cat_title = category_labels.get(s_cat, s_cat.replace("_", " ").title() if s_cat else "Other Competencies")
        categorized_skills.setdefault(cat_title, []).append(s_name)

    # Fetch top matching jobs for this specific resume
    candidate_skills = [
        {"id": s[0], "name": s[1], "normalized_name": s[2], "category": s[3]}
        for s in skills_query
    ]
    jobs = db.query(Job).filter(Job.is_active == True).limit(8).all()
    top_matches = []
    for job in jobs:
        try:
            m = calculate_job_match(
                candidate_skills=candidate_skills,
                candidate_text=text_corpus,
                job=job,
                db=db
            )
            matched_names = [s["name"] if isinstance(s, dict) else str(s) for s in m.get("matched_skills", [])]
            missing_names = [s["name"] if isinstance(s, dict) else str(s) for s in m.get("missing_skills", [])]
            top_matches.append({
                "job_id": job.id,
                "title": job.title,
                "company": job.company.name if job.company else "Tech Corp",
                "location": job.location,
                "compatibility": m["compatibility"],
                "matched_skills": matched_names[:4],
                "missing_skills": missing_names[:3]
            })
        except Exception:
            pass
    top_matches.sort(key=lambda x: x["compatibility"], reverse=True)

    return ResumeAnalysisResponse(
        id=resume.analysis.id,
        resume_id=resume.analysis.resume_id,
        file_name=resume.file_name,
        file_type=resume.file_type.upper() if resume.file_type else "PDF",
        file_size_bytes=resume.file_size_bytes,
        uploaded_at=resume.uploaded_at,
        candidate_name=contact_info.get("name") or current_user.full_name,
        candidate_email=contact_info.get("email") or current_user.email,
        candidate_phone=contact_info.get("phone"),
        overall_score=float(resume.analysis.overall_score),
        skills_score=float(resume.analysis.skills_score),
        experience_score=float(resume.analysis.experience_score),
        education_score=float(resume.analysis.education_score),
        project_score=float(resume.analysis.project_score),
        completeness_score=float(resume.analysis.completeness_score),
        strengths_json=resume.analysis.strengths_json or [],
        improvements_json=resume.analysis.improvements_json or [],
        summary_text=resume.analysis.summary_text,
        extracted_skills=extracted_skill_names,
        categorized_skills=categorized_skills,
        detected_sections=sections,
        top_matches=top_matches[:3],
        analyzed_at=resume.analysis.analyzed_at
    )


@router.get("/{resume_id}/report", status_code=status.HTTP_200_OK)
def download_resume_report(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a structured, printable text/markdown executive report ready for direct file download.
    """
    from fastapi import Response
    analysis_data = get_resume_analysis(resume_id=resume_id, db=db, current_user=current_user)

    lines = [
        "=" * 80,
        " AI-CAREERMATCH | EXPLAINABLE RESUME ANALYSIS & CAREER AUDIT REPORT",
        "=" * 80,
        "",
        "DOCUMENT METADATA",
        f"- Target File: {analysis_data.file_name}",
        f"- Format: {analysis_data.file_type}",
        f"- Size: {(analysis_data.file_size_bytes / 1024):.1f} KB" if analysis_data.file_size_bytes else "- Size: N/A",
        f"- Candidate Name: {analysis_data.candidate_name or 'Candidate'}",
        f"- Candidate Email: {analysis_data.candidate_email or 'N/A'}",
        f"- Candidate Phone: {analysis_data.candidate_phone or 'N/A'}",
        f"- Analyzed At: {analysis_data.analyzed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "",
        "-" * 80,
        "EXECUTIVE READINESS SCORECARD",
        "-" * 80,
        f"OVERALL PROFILE SCORE: {analysis_data.overall_score:.1f} / 100",
        "",
        "DIMENSION BREAKDOWN:",
        f"  * Technical Skills Breadth:        {analysis_data.skills_score:.1f}%",
        f"  * Project Depth & Execution:       {analysis_data.project_score:.1f}%",
        f"  * Practical Experience:            {analysis_data.experience_score:.1f}%",
        f"  * Education & Academic Alignment:  {analysis_data.education_score:.1f}%",
        f"  * Completeness & Structure:        {analysis_data.completeness_score:.1f}%",
        "",
        "-" * 80,
        "AI EVALUATION SUMMARY",
        "-" * 80,
        f"\"{analysis_data.summary_text}\"",
        "",
        "-" * 80,
        "IDENTIFIED KEY STRENGTHS",
        "-" * 80,
    ]

    for idx, strength in enumerate(analysis_data.strengths_json or [], 1):
        lines.append(f"  {idx}. [✓] {strength}")

    lines.extend([
        "",
        "-" * 80,
        "ACTIONABLE AREAS TO IMPROVE",
        "-" * 80,
    ])

    for idx, imp in enumerate(analysis_data.improvements_json or [], 1):
        lines.append(f"  {idx}. [○] {imp}")

    lines.extend([
        "",
        "-" * 80,
        f"EXTRACTED SKILLS TAXONOMY ({len(analysis_data.extracted_skills or [])} Identified)",
        "-" * 80,
    ])

    if analysis_data.categorized_skills:
        for cat, skills in analysis_data.categorized_skills.items():
            lines.append(f"  [{cat}]: {', '.join(skills)}")
    else:
        lines.append(f"  {', '.join(analysis_data.extracted_skills or ['None identified'])}")

    if analysis_data.top_matches:
        lines.extend([
            "",
            "-" * 80,
            "TOP MATCHING JOB ROLES IN MARKET",
            "-" * 80,
        ])
        for match in analysis_data.top_matches:
            lines.append(
                f"  * {match['title']} at {match['company']} ({match['location']}) "
                f"- {match['compatibility']}% Compatibility"
            )
            matched_list = match.get('matched_skills', [])
            matched_strs = [s["name"] if isinstance(s, dict) else str(s) for s in matched_list]
            if matched_strs:
                lines.append(f"    Matched Skills: {', '.join(matched_strs)}")

    lines.extend([
        "",
        "=" * 80,
        "End of Report | AI-CareerMatch Cloud Platform",
        "=" * 80,
    ])

    report_content = "\n".join(lines)
    clean_filename = f"Resume_Analysis_Report_{analysis_data.file_name.rsplit('.', 1)[0]}.txt"
    return Response(
        content=report_content,
        media_type="text/plain; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{clean_filename}"'
        }
    )

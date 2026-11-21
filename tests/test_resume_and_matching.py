import pytest
from fastapi.testclient import TestClient
import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.database.session import SessionLocal
from app.models.job import Job
from app.models.skill import Skill
from app.ai.parser import clean_text, detect_sections
from app.ai.skill_extractor import extract_skills_from_text, extract_contact_info
from app.ai.resume_analyzer import analyze_resume_sections
from app.ai.matcher import calculate_job_match

client = TestClient(app)


def test_text_cleaning_and_section_detection():
    sample_raw = """
    Alex Rivera
    alex.rivera@example.com | +91 9876543210
    
    EDUCATION
    B.Tech in Computer Science and Engineering - 2026
    Institute of Technology
    
    TECHNICAL SKILLS
    Python, FastAPI, SQL, MySQL, React, Docker, Git, REST API
    
    PROJECTS
    AI-CareerMatch Platform
    Built an intelligent explainable resume parser and matching platform using FastAPI, React, and MySQL.
    
    EXPERIENCE
    Software Engineering Intern at CloudTech
    Developed REST APIs and optimized database queries.
    """
    cleaned = clean_text(sample_raw)
    assert "Alex Rivera" in cleaned
    
    sections = detect_sections(cleaned)
    assert len(sections["skills"]) > 0
    assert len(sections["education"]) > 0
    assert len(sections["projects"]) > 0
    assert len(sections["experience"]) > 0


def test_nlp_skill_extraction():
    db = SessionLocal()
    sample_text = "Experienced in Python, FastAPI, Docker, SQL, MySQL, and Machine Learning."
    extracted = extract_skills_from_text(sample_text, db)
    db.close()
    
    skill_names = [s["name"] for s in extracted]
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "Docker" in skill_names
    assert "MySQL" in skill_names
    assert "Machine Learning" in skill_names


def test_explainable_resume_scoring():
    sample_text = """
    Alex Rivera
    alex.rivera@example.com | +91 9876543210
    github.com/alexrivera | linkedin.com/in/alexrivera
    
    EDUCATION
    B.Tech in Computer Science and Engineering - 2026
    Institute of Technology, CGPA: 8.8/10
    
    TECHNICAL SKILLS
    Python, FastAPI, SQL, MySQL, React, Docker, Git, REST API
    
    PROJECTS
    AI-CareerMatch Platform (github.com/alexrivera/ai-careermatch)
    Built an intelligent explainable resume parser and matching platform using FastAPI, React, and MySQL. Reduced matching latency by 45% and served 500+ student queries.
    
    EXPERIENCE
    Software Engineering Intern at CloudTech (Jan 2024 - Present)
    Developed and optimized REST APIs, automated database workflows, and deployed microservices using Docker.
    """
    sections = detect_sections(sample_text)
    extracted_skills = [
        {"name": "Python", "category": "programming_language"},
        {"name": "FastAPI", "category": "framework"},
        {"name": "MySQL", "category": "database"},
        {"name": "Docker", "category": "cloud"},
        {"name": "Git", "category": "tool"},
        {"name": "React", "category": "framework"}
    ]
    analysis = analyze_resume_sections(sections, extracted_skills, sample_text)
    assert analysis["overall_score"] >= 70.0
    assert len(analysis["strengths_json"]) > 0
    assert len(analysis["improvements_json"]) > 0
    assert "summary_text" in analysis


def test_job_matching_algorithm():
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == 1).first()
    assert job is not None

    candidate_skills = [
        {"id": 1, "name": "Python", "normalized_name": "python", "category": "programming_language"},
        {"id": 13, "name": "FastAPI", "normalized_name": "fastapi", "category": "framework"},
        {"id": 21, "name": "MySQL", "normalized_name": "mysql", "category": "database"},
        {"id": 8, "name": "SQL", "normalized_name": "sql", "category": "programming_language"}
    ]
    match = calculate_job_match(
        candidate_skills=candidate_skills,
        candidate_text="Backend developer with Python and FastAPI experience.",
        job=job,
        db=db
    )
    db.close()

    assert match["compatibility"] > 60.0
    assert len(match["matched_skills"]) >= 2
    assert "rationale" in match
    assert len(match["rationale"]) > 10


def test_jobs_api_endpoint():
    response = client.get("/api/jobs")
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 4
    assert jobs[0]["title"] is not None

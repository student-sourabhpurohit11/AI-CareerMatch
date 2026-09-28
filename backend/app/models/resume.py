from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(Enum("pdf", "docx", name="resume_file_types"), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    raw_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, unique=True)
    overall_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    skills_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    experience_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    education_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    project_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    completeness_score = Column(Numeric(5, 2), nullable=False, default=0.00)
    strengths_json = Column(JSON, nullable=True)
    improvements_json = Column(JSON, nullable=True)
    summary_text = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="analysis")

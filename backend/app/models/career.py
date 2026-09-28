from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Boolean, Numeric, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(150), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    typical_skills_json = Column(JSON, nullable=False)
    average_salary_lpa = Column(String(50), nullable=True)
    growth_outlook = Column(String(100), default="High")
    created_at = Column(DateTime, default=datetime.utcnow)


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    priority = Column(Enum("high", "medium", "low", name="skill_gap_priorities"), default="high")
    recommendation_note = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skill_gaps")
    job = relationship("Job")
    skill = relationship("Skill")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(150), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    level = Column(Enum("beginner", "intermediate", "advanced", name="course_levels"), default="beginner")
    description = Column(Text, nullable=True)
    course_url = Column(String(500), nullable=True)
    is_free = Column(Boolean, default=True)
    rating = Column(Numeric(2, 1), default=4.5)
    created_at = Column(DateTime, default=datetime.utcnow)

    skill = relationship("Skill", back_populates="courses")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_type = Column(Enum("role", "course", "project", name="recommendation_types"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    relevance_score = Column(Numeric(5, 2), default=85.00)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

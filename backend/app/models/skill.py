from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.session import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    normalized_name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(
        Enum("programming_language", "framework", "database", "cloud", "tool", "ai_ml", "soft_skill", "concept", name="skill_categories"),
        nullable=False,
        default="tool",
        index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="skill", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uk_user_skill"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    proficiency = Column(Enum("beginner", "intermediate", "advanced", "expert", name="proficiency_levels"), default="intermediate")
    source = Column(Enum("extracted", "manual", name="skill_sources"), default="extracted")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="user_skills")
    skill = relationship("Skill", back_populates="user_skills")
    resume = relationship("Resume")

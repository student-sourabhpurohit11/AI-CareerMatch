from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Boolean, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.session import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), unique=True, nullable=False)
    website = Column(String(255), nullable=True)
    industry = Column(String(150), nullable=True)
    location = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    job_type = Column(Enum("full_time", "internship", "part_time", "contract", name="job_types"), default="full_time")
    location = Column(String(150), nullable=False)
    experience_years_min = Column(Integer, default=0)
    experience_years_max = Column(Integer, default=2)
    min_education = Column(String(100), default="Bachelor's Degree")
    salary_min = Column(Numeric(10, 2), nullable=True)
    salary_max = Column(Numeric(10, 2), nullable=True)
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    posted_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="jobs")
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class JobSkill(Base):
    __tablename__ = "job_skills"
    __table_args__ = (UniqueConstraint("job_id", "skill_id", name="uk_job_skill"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    is_required = Column(Boolean, default=True)
    weight = Column(Numeric(3, 2), default=1.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")

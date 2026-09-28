from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.job import JobResponse


class ApplicationCreate(BaseModel):
    job_id: int
    status: Optional[str] = "applied"
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    applied_at: Optional[datetime] = None
    updated_at: datetime
    notes: Optional[str] = None
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)

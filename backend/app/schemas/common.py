from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    database: str
    timestamp: datetime


class MessageResponse(BaseModel):
    message: str
    detail: Optional[Any] = None

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new student (or admin) account with email, full name, and password.
    Validates email uniqueness and hashes password with Bcrypt.
    """
    return AuthService.register_user(db=db, user_in=user_in)


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and issues an RFC 7519 JWT Bearer token with role claim.
    """
    user = AuthService.authenticate_user(
        db=db, email=login_data.email, password=login_data.password
    )
    return AuthService.generate_token_for_user(user)


@router.get("/me", response_model=UserResponse)
def get_authenticated_user(current_user: User = Depends(get_current_user)):
    """
    Returns the profile and claims of the currently authenticated user from the bearer token.
    """
    return current_user

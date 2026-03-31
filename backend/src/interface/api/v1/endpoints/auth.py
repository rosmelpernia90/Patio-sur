"""Authentication endpoints: login, register, current user, user management."""
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import create_access_token, hash_password, verify_password
from src.infrastructure.database.models.user_model import UserModel
from src.infrastructure.database.session import get_db_session
from src.interface.api.v1.dependencies.auth import get_current_user, require_role

router = APIRouter()


# ==================== SCHEMAS ====================

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "viewer"


class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ==================== AUTH ENDPOINTS ====================

@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db_session)):
    """Authenticate user and return JWT token."""
    result = await db.execute(select(UserModel).where(UserModel.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contacte al administrador.",
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.flush()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    return LoginResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me/password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Change current user's password."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contrasena actual incorrecta",
        )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contrasena debe tener al menos 6 caracteres",
        )

    current_user.hashed_password = hash_password(body.new_password)
    await db.flush()
    return {"message": "Contrasena actualizada correctamente"}


# ==================== USER MANAGEMENT (gerente only) ====================

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: UserModel = Depends(require_role("gerente")),
    db: AsyncSession = Depends(get_db_session),
):
    """List all users. Requires gerente role."""
    result = await db.execute(select(UserModel).order_by(UserModel.created_at))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: CreateUserRequest,
    current_user: UserModel = Depends(require_role("gerente")),
    db: AsyncSession = Depends(get_db_session),
):
    """Create a new user. Requires gerente role."""
    # Validate role
    valid_roles = {"gerente", "controller", "ingeniero", "viewer"}
    if body.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rol invalido. Roles validos: {', '.join(valid_roles)}",
        )

    # Check duplicate email
    existing = await db.execute(select(UserModel).where(UserModel.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )

    if len(body.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contrasena debe tener al menos 6 caracteres",
        )

    user = UserModel(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
        role=body.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return UserResponse.model_validate(user)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    current_user: UserModel = Depends(require_role("gerente")),
    db: AsyncSession = Depends(get_db_session),
):
    """Update a user. Requires gerente role."""
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    valid_roles = {"gerente", "controller", "ingeniero", "viewer"}

    if body.full_name is not None:
        user.full_name = body.full_name
    if body.role is not None:
        if body.role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Rol invalido. Roles validos: {', '.join(valid_roles)}",
            )
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active

    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: UserModel = Depends(require_role("gerente")),
    db: AsyncSession = Depends(get_db_session),
):
    """Delete a user. Requires gerente role. Cannot delete yourself."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminarse a si mismo",
        )

    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    await db.delete(user)
    await db.flush()

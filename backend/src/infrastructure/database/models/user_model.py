"""User SQLAlchemy model for authentication and authorization."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.database.models.base import Base


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default="viewer"
    )
    # Roles: gerente, controller, ingeniero, viewer
    #   gerente    = full access (all modules)
    #   controller = financial modules (budget, transactions, invoices, cash-flow, reports, business-case)
    #   ingeniero  = technical modules (wbs, documents, dashboard)
    #   viewer     = read-only access to dashboard

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<User {self.email} role={self.role}>"

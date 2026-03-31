"""SQLAlchemy ORM model for Alerts."""
from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.database.models.base import Base


class AlertModel(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    severity: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    metric: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metric_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    alert_date: Mapped[str] = mapped_column(String(10), nullable=False)  # ISO format: YYYY-MM-DD
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    project = relationship("ProjectModel", back_populates="alerts")

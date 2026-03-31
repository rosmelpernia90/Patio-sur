"""SQLAlchemy ORM model for Project."""
from typing import Optional
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.database.models.base import Base


class ProjectModel(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    estimated_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    actual_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    total_budget: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planning")
    location: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    project_manager: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    wbs_items = relationship("WBSItemModel", back_populates="project", cascade="all, delete-orphan")
    budget_items = relationship("BudgetItemModel", back_populates="project", cascade="all, delete-orphan")
    transactions = relationship("TransactionModel", back_populates="project", cascade="all, delete-orphan")
    invoices = relationship("InvoiceModel", back_populates="project", cascade="all, delete-orphan")
    cash_flow_entries = relationship("CashFlowEntryModel", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("AlertModel", back_populates="project", cascade="all, delete-orphan")

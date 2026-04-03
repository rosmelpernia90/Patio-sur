"""API Endpoints: Cash Flow Management."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dtos.cash_flow_dto import (
    CashFlowEntryCreate,
    CashFlowEntryResponse,
    CashFlowEntryUpdate,
)
from src.infrastructure.database.session import get_db_session
from src.infrastructure.database.models.cash_flow_model import CashFlowEntryModel

router = APIRouter()


@router.get("", response_model=List[CashFlowEntryResponse])
async def list_cash_flow(
    project_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """List all cash flow entries for a project (ordered by period)."""
    stmt = (
        select(CashFlowEntryModel)
        .where(CashFlowEntryModel.project_id == project_id)
        .order_by(CashFlowEntryModel.year, CashFlowEntryModel.month)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=CashFlowEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_cash_flow_entry(
    project_id: str,
    data: CashFlowEntryCreate,
    db: AsyncSession = Depends(get_db_session),
):
    """Create or update a cash flow forecast for a specific month."""
    # Check if entry already exists
    stmt = select(CashFlowEntryModel).where(
        CashFlowEntryModel.project_id == project_id,
        CashFlowEntryModel.year == data.year,
        CashFlowEntryModel.month == data.month,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.projected_income = data.projected_income
        existing.projected_expense = data.projected_expense
        if data.notes:
            existing.notes = data.notes
        await db.flush()
        await db.refresh(existing)
        return existing

    entry = CashFlowEntryModel(
        project_id=project_id,
        year=data.year,
        month=data.month,
        flow_type="forecast",
        projected_income=data.projected_income,
        projected_expense=data.projected_expense,
        notes=data.notes,
    )
    db.add(entry)
    await db.flush()
    await db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=CashFlowEntryResponse)
async def update_cash_flow_entry(
    project_id: str,
    entry_id: str,
    data: CashFlowEntryUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update a cash flow entry with actual values."""
    stmt = select(CashFlowEntryModel).where(
        CashFlowEntryModel.id == entry_id,
        CashFlowEntryModel.project_id == project_id,
    )
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Cash flow entry not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    await db.flush()
    await db.refresh(entry)
    return entry

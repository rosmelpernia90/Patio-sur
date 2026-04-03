"""API Endpoints: Alerts CRUD."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.application.dtos.alert_dto import (
    AlertCreate,
    AlertResponse,
    AlertSummaryResponse,
    AlertUpdate,
    AlertResolve,
)
from src.infrastructure.database.session import get_db_session
from src.infrastructure.database.models.alert_model import AlertModel

router = APIRouter()


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    project_id: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
):
    """List all alerts for the project."""
    stmt = (
        select(AlertModel)
        .where(AlertModel.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .order_by(AlertModel.alert_date.desc())
    )
    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return alerts


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    project_id: str,
    data: AlertCreate,
    db: AsyncSession = Depends(get_db_session),
):
    """Create a new alert."""
    alert = AlertModel(
        project_id=project_id,
        severity=data.severity,
        category=data.category,
        title=data.title,
        description=data.description,
        impact=data.impact,
        recommendation=data.recommendation,
        metric=data.metric,
        metric_label=data.metric_label,
        alert_date=data.alert_date,
    )
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    return alert


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """Get alert details by ID."""
    stmt = select(AlertModel).where(AlertModel.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    data: AlertUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update an existing alert."""
    stmt = select(AlertModel).where(AlertModel.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)

    await db.flush()
    await db.refresh(alert)
    return alert


@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    data: AlertResolve,
    db: AsyncSession = Depends(get_db_session),
):
    """Mark an alert as resolved."""
    from datetime import datetime

    stmt = select(AlertModel).where(AlertModel.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = data.resolved_by

    await db.flush()
    await db.refresh(alert)
    return alert


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """Delete an alert."""
    stmt = select(AlertModel).where(AlertModel.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    await db.delete(alert)

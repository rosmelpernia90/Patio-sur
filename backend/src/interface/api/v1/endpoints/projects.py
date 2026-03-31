"""API Endpoints: Projects CRUD."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dtos.project_dto import (
    ProjectCreate,
    ProjectResponse,
    ProjectSummaryResponse,
    ProjectUpdate,
)
from src.infrastructure.database.session import get_db_session
from src.infrastructure.database.models.project_model import ProjectModel

router = APIRouter()


@router.get("/", response_model=List[ProjectSummaryResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
):
    """List all projects with summary information."""
    from sqlalchemy import select
    stmt = select(ProjectModel).offset(skip).limit(limit).order_by(ProjectModel.created_at.desc())
    result = await db.execute(stmt)
    projects = result.scalars().all()
    return projects


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db_session),
):
    """Create a new project."""
    project = ProjectModel(
        name=data.name,
        code=data.code,
        description=data.description,
        client_name=data.client_name,
        start_date=data.start_date,
        estimated_end_date=data.estimated_end_date,
        total_budget=data.total_budget,
        currency=data.currency,
        location=data.location,
        project_manager=data.project_manager,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """Get project details by ID."""
    from sqlalchemy import select
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db_session),
):
    """Update an existing project."""
    from sqlalchemy import select
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db_session),
):
    """Delete a project."""
    from sqlalchemy import select
    stmt = select(ProjectModel).where(ProjectModel.id == project_id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    await db.delete(project)

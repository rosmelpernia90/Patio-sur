"""API v1 Router - aggregates all endpoint routers."""
from fastapi import APIRouter

from src.interface.api.v1.endpoints.auth import router as auth_router
from src.interface.api.v1.endpoints.projects import router as projects_router
from src.interface.api.v1.endpoints.wbs import router as wbs_router
from src.interface.api.v1.endpoints.budget import router as budget_router
from src.interface.api.v1.endpoints.transactions import router as transactions_router
from src.interface.api.v1.endpoints.invoices import router as invoices_router
from src.interface.api.v1.endpoints.cash_flow import router as cash_flow_router
from src.interface.api.v1.endpoints.alerts import router as alerts_router
from src.interface.api.v1.endpoints.reports import router as reports_router
from src.interface.api.v1.endpoints.dashboard import router as dashboard_router
from src.interface.api.v1.endpoints.documents import router as documents_router
from src.interface.api.v1.endpoints.preferences import router as preferences_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_v1_router.include_router(wbs_router, prefix="/projects/{project_id}/wbs", tags=["WBS"])
api_v1_router.include_router(budget_router, prefix="/projects/{project_id}/budget", tags=["Budget"])
api_v1_router.include_router(transactions_router, prefix="/projects/{project_id}/transactions", tags=["Transactions"])
api_v1_router.include_router(invoices_router, prefix="/projects/{project_id}/invoices", tags=["Invoices"])
api_v1_router.include_router(cash_flow_router, prefix="/projects/{project_id}/cash-flow", tags=["Cash Flow"])
api_v1_router.include_router(alerts_router, prefix="/projects/{project_id}/alerts", tags=["Alerts"])
api_v1_router.include_router(reports_router, prefix="/projects/{project_id}/reports", tags=["Reports"])
api_v1_router.include_router(dashboard_router, prefix="/projects/{project_id}/dashboard", tags=["Dashboard"])
api_v1_router.include_router(documents_router)
api_v1_router.include_router(preferences_router)

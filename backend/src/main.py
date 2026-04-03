"""
Patio Sur - Project Management Application
Main FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from src.core.config import get_settings
from src.core.security import hash_password
from src.infrastructure.database.models import Base, UserModel
from src.infrastructure.database.session import engine, AsyncSessionLocal
from src.interface.api.v1.router import api_v1_router

settings = get_settings()


async def seed_admin_user():
    """Create default admin user if no users exist."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel).limit(1))
        if result.scalar_one_or_none() is None:
            admin = UserModel(
                email="gerente@pcmejia.com",
                hashed_password=hash_password("PcMejia2025*"),
                full_name="Gerente PC Mejia",
                role="gerente",
                is_active=True,
            )
            session.add(admin)

            # Create additional demo users
            demo_users = [
                ("controller@pcmejia.com", "Controller2025*", "Ana Martinez", "controller"),
                ("ingeniero@pcmejia.com", "Ingeniero2025*", "Juan Rodriguez", "ingeniero"),
                ("viewer@pcmejia.com", "Viewer2025*", "Maria Lopez", "viewer"),
            ]
            for email, pwd, name, role in demo_users:
                session.add(UserModel(
                    email=email,
                    hashed_password=hash_password(pwd),
                    full_name=name,
                    role=role,
                    is_active=True,
                ))

            await session.commit()
            print("  ✅ Usuarios iniciales creados:")
            print("     📧 gerente@pcmejia.com / PcMejia2025*  (Gerente - acceso total)")
            print("     📧 controller@pcmejia.com / Controller2025*  (Controller Financiero)")
            print("     📧 ingeniero@pcmejia.com / Ingeniero2025*  (Ingeniero)")
            print("     📧 viewer@pcmejia.com / Viewer2025*  (Solo lectura)")
        else:
            print("  ✅ Usuarios existentes encontrados")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed admin
    print(f"🔌 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("  ✅ Base de datos inicializada")
    await seed_admin_user()
    yield
    # Shutdown
    print("🔌 Application shutting down...")
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de Gestión de Proyectos de Obra Eléctrica - Control Financiero y Operativo",
    lifespan=lifespan,
    redirect_slashes=False,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}

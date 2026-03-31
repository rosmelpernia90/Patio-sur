"""Application configuration using pydantic-settings."""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Patio Sur - Gestión de Proyectos"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database - MySQL via aiomysql (async driver compatible con mysql+pymysql)
    DATABASE_URL: str = "mysql+aiomysql://root:SessionsAdmin159**@192.168.10.153:3306/proyectog"
    DATABASE_ECHO: bool = False

    # JWT Auth
    SECRET_KEY: str = "pcmejia-patio-sur-s3cr3t-k3y-ch4ng3-1n-pr0d"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    # Reports
    REPORTS_OUTPUT_DIR: str = "./reports_output"
    COMPANY_LOGO_PATH: str = "./assets/logo.png"
    COMPANY_NAME: str = "Patio Sur - Obra Eléctrica"

    # Alerts thresholds
    BUDGET_WARNING_THRESHOLD: float = 95.0
    INVOICE_DUE_ALERT_DAYS: int = 15

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()

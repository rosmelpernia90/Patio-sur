"""User preferences persistence — stores JSON data server-side."""
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request

DATA_DIR = Path(__file__).resolve().parents[6] / "data" / "preferences"
DATA_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_KEYS = {"payment_items", "incomes", "credit_params"}

router = APIRouter(prefix="/preferences", tags=["preferences"])


def _file(key: str) -> Path:
    if key not in ALLOWED_KEYS:
        raise HTTPException(status_code=400, detail=f"Clave no permitida: {key}")
    return DATA_DIR / f"{key}.json"


@router.get("/{key}")
async def get_preference(key: str):
    f = _file(key)
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        return None


@router.put("/{key}")
async def set_preference(key: str, request: Request):
    f = _file(key)
    body = await request.body()
    # Validate it's valid JSON
    try:
        data = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="JSON inválido")
    f.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return {"saved": True}

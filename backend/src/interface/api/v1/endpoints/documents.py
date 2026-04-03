"""Document upload/download/preview endpoints."""
import json
import shutil
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

SHAREPOINT_DIR = Path(__file__).resolve().parents[6] / "data" / "Sharepoint"

MIME_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
}

PREVIEWABLE = {".pdf", ".jpg", ".jpeg", ".png"}

ALLOWED_CATEGORIES = {"contratos", "ofertas", "facturas", "reportes", "fotos"}

router = APIRouter(prefix="/documents", tags=["documents"])


def _category_dir(category: str) -> Path:
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Categoría no permitida: {category}")
    d = SHAREPOINT_DIR / category
    d.mkdir(parents=True, exist_ok=True)
    return d


def _find_file(category_dir: Path, doc_id: str) -> Optional[Path]:
    for path in category_dir.iterdir():
        if path.stem == doc_id and path.suffix != ".meta":
            return path
    return None


def _meta_path(category_dir: Path, doc_id: str) -> Path:
    return category_dir / f"{doc_id}.meta"


def _save_meta(category_dir: Path, doc_id: str, original_name: str) -> None:
    _meta_path(category_dir, doc_id).write_text(
        json.dumps({"original_name": original_name}), encoding="utf-8"
    )


def _read_meta(category_dir: Path, doc_id: str) -> str:
    meta = _meta_path(category_dir, doc_id)
    if meta.exists():
        try:
            return json.loads(meta.read_text(encoding="utf-8")).get("original_name", doc_id)
        except Exception:
            pass
    return doc_id


@router.post("/upload/{category}")
async def upload_document(
    category: str,
    doc_id: str = Form(...),
    file: UploadFile = File(...),
):
    """Upload a document for a given category and ID."""
    cat_dir = _category_dir(category)
    ext = Path(file.filename).suffix.lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {ext}")

    existing = _find_file(cat_dir, doc_id)
    if existing:
        existing.unlink()

    dest = cat_dir / f"{doc_id}{ext}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    _save_meta(cat_dir, doc_id, file.filename)

    return {
        "doc_id": doc_id,
        "category": category,
        "filename": dest.name,
        "original_name": file.filename,
        "previewable": ext in PREVIEWABLE,
    }


@router.get("/{category}/{doc_id}/preview")
async def preview_document(category: str, doc_id: str):
    """Serve file inline for in-app preview (PDF, images)."""
    cat_dir = _category_dir(category)
    path = _find_file(cat_dir, doc_id)
    if not path:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    ext = path.suffix.lower()
    if ext not in PREVIEWABLE:
        raise HTTPException(status_code=415, detail="Vista previa no disponible para este tipo de archivo")
    return FileResponse(
        path=str(path),
        media_type=MIME_TYPES[ext],
        headers={"Content-Disposition": "inline"},
    )


@router.get("/{category}/{doc_id}/download")
async def download_document(category: str, doc_id: str):
    """Download a document."""
    cat_dir = _category_dir(category)
    path = _find_file(cat_dir, doc_id)
    if not path:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    original_name = _read_meta(cat_dir, doc_id)
    return FileResponse(
        path=str(path),
        filename=original_name,
        media_type=MIME_TYPES.get(path.suffix.lower(), "application/octet-stream"),
        headers={"Content-Disposition": f"attachment; filename={original_name}"},
    )


@router.delete("/{category}/{doc_id}")
async def delete_document(category: str, doc_id: str):
    """Delete a document and its metadata."""
    cat_dir = _category_dir(category)
    path = _find_file(cat_dir, doc_id)
    if not path:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    path.unlink()
    meta = _meta_path(cat_dir, doc_id)
    if meta.exists():
        meta.unlink()
    return {"deleted": True}


@router.get("/{category}")
async def list_documents(category: str):
    """List all documents in a category with original names."""
    cat_dir = _category_dir(category)
    files = {}
    for path in cat_dir.iterdir():
        if path.suffix == ".meta":
            continue
        files[path.stem] = {
            "filename": _read_meta(cat_dir, path.stem),
            "previewable": path.suffix.lower() in PREVIEWABLE,
        }
    return files


# ── Backwards-compatible aliases for contratos (used in CashFlowPage) ──
@router.post("/upload-contrato")
async def upload_contrato(item_id: str = Form(...), file: UploadFile = File(...)):
    return await upload_document("contratos", item_id, file)


@router.get("/contrato/{item_id}/preview")
async def preview_contrato(item_id: str):
    return await preview_document("contratos", item_id)


@router.get("/contrato/{item_id}")
async def download_contrato(item_id: str):
    return await download_document("contratos", item_id)


@router.delete("/contrato/{item_id}")
async def delete_contrato(item_id: str):
    return await delete_document("contratos", item_id)


@router.get("/contratos")
async def list_contratos():
    return await list_documents("contratos")

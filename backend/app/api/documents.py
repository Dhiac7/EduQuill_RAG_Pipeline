from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid, os
from app.rag.pipeline import ingest_document  # adjust import if needed

router = APIRouter()
UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF supported")
    doc_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    with open(save_path, "wb") as f:
        f.write(await file.read())

    ingest_document(save_path, doc_id=doc_id, title=file.filename)
    return {"doc_id": doc_id, "filename": file.filename}

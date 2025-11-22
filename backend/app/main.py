from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, documents, chat

app = FastAPI(title="EduQuill RAG API")

# --- CORS configuration ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # or ["*"] for everything in dev
    allow_credentials=True,
    allow_methods=["*"],          # allow POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

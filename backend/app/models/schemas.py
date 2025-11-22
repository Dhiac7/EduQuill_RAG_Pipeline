from pydantic import BaseModel
from typing import Literal

class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None
    k: int = 5
    model: str = "qwen2.5:14b-instruct"
    provider_type: Literal["ollama", "groq"] = "ollama"
    api_key: str | None = None

class ChatResponseSource(BaseModel):
    doc_id: str
    title: str
    chunk_index: int
    text: str
    score: float

class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatResponseSource]

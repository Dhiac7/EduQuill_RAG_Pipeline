from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse, ChatResponseSource
from app.rag.pipeline import rag_answer
from app.rag.session_memory import add_message

router = APIRouter()

@router.post("/query", response_model=ChatResponse)
async def chat_query(payload: ChatRequest):
    answer, data = await rag_answer(
        payload.query, 
        k=payload.k, 
        session_id=payload.session_id,
        model=payload.model,
        provider_type=payload.provider_type,
        api_key=payload.api_key
    )

    # Save conversation history if session_id is provided
    if payload.session_id:
        add_message(payload.session_id, payload.query, answer)

    sources = []
    for text, meta, score in zip(
        data["docs"], data["metadatas"], data["scores"]
    ):
        sources.append(
            ChatResponseSource(
                doc_id=meta.get("doc_id", ""),
                title=meta.get("title", ""),
                chunk_index=meta.get("chunk_index", -1),
                text=text,
                score=float(score),
            )
        )

    return ChatResponse(answer=answer, sources=sources)

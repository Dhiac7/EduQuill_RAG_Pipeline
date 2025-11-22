from typing import List, Dict, Tuple
from langchain_community.document_loaders import PyPDFLoader
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.rag.vector_store import ChromaVectorStore
from app.rag.llm_client import generate_answer


def pdf_to_chunks(file_path: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    """Load PDF and split into chunks using LangChain."""
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    # Use LangChain's RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    return [chunk.page_content for chunk in chunks]


def ingest_document(file_path: str, doc_id: str, title: str):
    """Ingest document into vector store using LangChain."""
    store = ChromaVectorStore()
    chunks = pdf_to_chunks(file_path)
    metadatas: List[Dict] = [{"doc_id": doc_id, "title": title, "chunk_index": i}
                             for i in range(len(chunks))]
    store.add_chunks(doc_id=doc_id, chunks=chunks, metadatas=metadatas)


async def rag_answer(
    query: str, 
    k: int = 5, 
    session_id: str | None = None,
    model: str = "llama3",
    provider_type: str = "ollama",
    api_key: str | None = None
) -> Tuple[str, dict]:
    """Perform RAG query using LangChain components."""
    store = ChromaVectorStore()
    result = store.query(query, top_k=k)

    docs: List[str] = result["documents"][0]
    metadatas = result["metadatas"][0]
    distances = result["distances"][0]

    answer = await generate_answer(
        query, 
        docs, 
        session_id=session_id,
        model=model,
        provider_type=provider_type,
        api_key=api_key
    )

    return answer, {
        "docs": docs,
        "metadatas": metadatas,
        "scores": distances,
    }
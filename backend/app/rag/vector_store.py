from langchain_chroma import Chroma
from typing import List, Dict
from langchain_core.documents import Document

from app.rag.embeddings import get_embedding_model


class ChromaVectorStore:
    def __init__(self, collection_name: str = "eduquill_docs"):
        """Initialize LangChain Chroma vector store."""
        embeddings = get_embedding_model()
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory="data/chroma"
        )

    def add_chunks(self, doc_id: str, chunks: List[str], metadatas: List[Dict]):
        """Add document chunks to the vector store."""
        # Create LangChain Document objects with unique IDs
        documents = []
        ids = []
        for i, (chunk, meta) in enumerate(zip(chunks, metadatas)):
            chunk_id = f"{doc_id}_{i}"
            documents.append(
                Document(
                    page_content=chunk,
                    metadata={**meta, "doc_id": doc_id}
                )
            )
            ids.append(chunk_id)
        
        # Add documents to vectorstore with IDs
        # Note: Persistence is automatic when persist_directory is provided
        self.vectorstore.add_documents(documents, ids=ids)

    def query(self, query: str, top_k: int = 5):
        """Query the vector store and return results in the original format."""
        # Use similarity_search_with_score to get scores
        results = self.vectorstore.similarity_search_with_score(query, k=top_k)
        
        # Format results to match original structure
        docs = []
        metadatas = []
        distances = []
        
        for doc, score in results:
            docs.append(doc.page_content)
            metadatas.append(doc.metadata)
            # Convert similarity score to distance (lower is better)
            distances.append(float(score))
        
        return {
            "documents": [docs],
            "metadatas": [metadatas],
            "distances": [distances],
        }
    
    def as_retriever(self, k: int = 5):
        """Get a LangChain retriever for use in chains."""
        return self.vectorstore.as_retriever(search_kwargs={"k": k})

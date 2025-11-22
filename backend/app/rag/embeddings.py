from functools import lru_cache

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    # Fallback to deprecated version if new package not available
    from langchain_community.embeddings import HuggingFaceEmbeddings


@lru_cache()
def get_embedding_model():
    """Get LangChain HuggingFace embeddings model."""
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": False}
    )

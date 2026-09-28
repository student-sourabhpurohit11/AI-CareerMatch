from typing import List, Union
import numpy as np

_model = None


def get_embedding_model():
    """
    Lazy-loads the open-source SentenceTransformer all-MiniLM-L6-v2 model.
    Runs entirely on local CPU / Apple Silicon Neural Engine without any paid API keys.
    """
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        # all-MiniLM-L6-v2 is ultra fast (~80MB), highly accurate for semantic sentence representations
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def compute_embedding(text: str) -> np.ndarray:
    """Computes a 384-dimensional dense vector embedding for input text."""
    if not text or not text.strip():
        return np.zeros(384, dtype=np.float32)
    model = get_embedding_model()
    # Normalize embeddings to enable fast cosine similarity via dot product
    embedding = model.encode(text, normalize_embeddings=True)
    return np.array(embedding, dtype=np.float32)


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """
    Calculates cosine similarity between two dense embedding vectors.
    Returns a score between 0.0 and 1.0.
    """
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    similarity = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
    # Clip between 0.0 and 1.0 to guard against floating-point inaccuracies
    return max(0.0, min(1.0, (similarity + 1.0) / 2.0))

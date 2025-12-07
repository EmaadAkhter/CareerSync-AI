import os
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import time

INDEX_NAME = "occupations-index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384

_model_cache = None


def get_model():
    """Lazy load and cache the model"""
    global _model_cache
    if _model_cache is None:
        _model_cache = SentenceTransformer(EMBEDDING_MODEL)
    return _model_cache


def vectorize_and_store(data, index_name=INDEX_NAME):
    load_dotenv()

    model = get_model()  
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    if index_name in pc.list_indexes().names():
        pc.delete_index(index_name)
        time.sleep(5)

    pc.create_index(
        name=index_name,
        dimension=EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)

    index = pc.Index(index_name)

    vectors = []
    for i, row in enumerate(data):
        text = " ".join([f"{k}: {v}" for k, v in row.items()])
        embedding = model.encode(text).tolist()

        vector = {
            "id": str(i),
            "values": embedding,
            "metadata": row
        }
        vectors.append(vector)

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch)

    return index


def get_pinecone_index(index_name=INDEX_NAME):
    load_dotenv()
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    return pc.Index(index_name)


def search_by_query(query, top_k=5, index=None):
    if index is None:
        index = get_pinecone_index()
    model = get_model()
    query_embedding = model.encode(query, convert_to_tensor=False).tolist()

    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )

    matches = []
    for match in results['matches']:
        matches.append({
            'id': match['id'],
            'score': match['score'],
            'metadata': match['metadata']
        })

    return matches

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pickle
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

model = None
career_embeddings = None
df = None


def load_data():
    global model, career_embeddings, df

    logger.info("Loading model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    logger.info("Loading career data...")
    df = pd.read_csv("vector_pkl/occ.csv")
    logger.info(f"Loaded {len(df)} careers")

    df["full_text"] = (
            df["job_title"].fillna('') + ". " +
            df["Short_description"].fillna('') + " " +
            df["Skills_required"].fillna('')
    )

    logger.info("Loading embeddings...")
    with open("vector_pkl/career_embeddings.pkl", "rb") as f:
        career_embeddings = pickle.load(f)

    logger.info("Ready!")


def get_reasoning(user_embedding, job_title, description, skills):
    components = [description] + (skills.split() if skills else [])
    components = [c for c in components if c.strip()]

    if not components:
        return f"{job_title} could be a good fit for you."

    component_embeddings = model.encode(components, normalize_embeddings=True)
    user_embedding = user_embedding.reshape(1, -1) if user_embedding.ndim == 1 else user_embedding

    similarities = cosine_similarity(user_embedding, component_embeddings)[0]
    top_indices = np.argsort(similarities)[::-1][:3]
    top_reasons = [components[i] for i in top_indices]

    if len(top_reasons) == 1:
        return f"{job_title} matches because it involves {top_reasons[0]}."
    elif len(top_reasons) == 2:
        return f"{job_title} matches because it involves {top_reasons[0]} and {top_reasons[1]}."
    else:
        return f"{job_title} matches because it involves {', '.join(top_reasons[:-1])}, and {top_reasons[-1]}."


@app.get("/")
def root():
    return FileResponse("templates/index.html")


@app.post("/api/match-careers")
def match_careers(data: dict):
    user_text = " ".join(str(v).strip() for v in data.values() if v and str(v).strip())
    if not user_text:
        return {"error": "Please tell us something about yourself"}

    user_embedding = model.encode("Represent this sentence for retrieval: " + user_text, normalize_embeddings=True)
    similarities = cosine_similarity([user_embedding], career_embeddings)[0]
    top_indices = np.argsort(similarities)[::-1][:5]

    matches = []
    for idx in top_indices:
        row = df.iloc[idx]
        matches.append({
            'job_title': row["job_title"],
            'description': row["Short_description"],
            'skills': row["Skills_required"],
            'similarity_score': float(similarities[idx]),
            'match_percentage': float(similarities[idx] * 100),
            'reasoning': get_reasoning(user_embedding, row["job_title"], row["Short_description"],
                                       row["Skills_required"])
        })

    return {"matches": matches}


@app.get("/api/health")
def health():
    return {
        'status': 'ok',
        'careers': len(df) if df is not None else 0
    }


app.mount("/", StaticFiles(directory="templates", html=True), name="static")

if __name__ == "__main__":
    logger.info("Starting app...")
    load_data()
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))

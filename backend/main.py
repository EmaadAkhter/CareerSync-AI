from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pickle
from pathlib import Path
from pydantic import BaseModel, Field
import logging
import gc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AppState:
    model = None
    career_embeddings = None
    df = None


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        base_path = Path("vector_pkl")
        if not base_path.exists():
            raise FileNotFoundError(f"Directory {base_path} not found")

        logger.info("Loading model...")
        state.model = SentenceTransformer("paraphrase-MiniLM-L3-v2", device="cpu")
        
        logger.info("Loading career data...")
        state.df = pd.read_csv(
            base_path / "occ.csv",
            usecols=["job_title", "Short_description", "Skills_required"]
        )
        logger.info(f"Loaded {len(state.df)} careers")

      
        logger.info("Loading embeddings...")
        with open(base_path / "career_embeddings.pkl", "rb") as f:
            state.career_embeddings = pickle.load(f)
        
        state.career_embeddings = state.career_embeddings.astype(np.float32)
        
        gc.collect()

        logger.info("Ready!")
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        raise

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CareerRequest(BaseModel):
    # Core fields weighted higher
    interests: str = Field(default="", description="Primary interests")
    skills: str = Field(default="", description="Core skills")
    problem_solving: str = Field(default="", description="Problem types")
    values: str = Field(default="", description="Core values")

    # Secondary fields
    interests_fulltime: str = ""
    interests_appeal: str = ""
    skills_natural: str = ""
    skills_energized: str = ""
    problem_method: str = ""
    problem_enjoy: str = ""
    work_style: str = ""
    work_routine: str = ""
    work_goals: str = ""
    values_why: str = ""
    values_choice: str = ""
    career_inspiration: str = ""
    inspiration_standout: str = ""
    inspiration_pursue: str = ""
    environment_preference: str = ""
    environment_why: str = ""
    focus_preference: str = ""
    impact_preference: str = ""
    impact_why: str = ""


@app.post("/api/match-careers")
def match_careers(data: CareerRequest):
    if state.model is None or state.df is None:
        raise HTTPException(status_code=503, detail="Service not ready")

    # Build user text
    primary_text = " ".join([
        data.interests * 2,
        data.skills * 2,
        data.problem_solving,
        data.values
    ]).strip()

    secondary_text = " ".join([
        data.interests_fulltime, data.interests_appeal,
        data.skills_natural, data.skills_energized,
        data.problem_method, data.problem_enjoy,
        data.work_style, data.work_routine, data.work_goals,
        data.values_why, data.values_choice,
        data.career_inspiration, data.inspiration_standout, data.inspiration_pursue,
        data.environment_preference, data.environment_why, data.focus_preference,
        data.impact_preference, data.impact_why
    ]).strip()

    user_text = f"{primary_text} {secondary_text}".strip()

    if not user_text:
        raise HTTPException(status_code=400, detail="Please provide some information about yourself")

    user_embedding = state.model.encode(
        user_text, 
        normalize_embeddings=True,
        show_progress_bar=False
    ).astype(np.float32)
    
    # Calculate similarities
    similarities = cosine_similarity([user_embedding], state.career_embeddings)[0]
    top_indices = np.argsort(similarities)[::-1][:5]

    # Build response
    matches = []
    for idx in top_indices:
        row = state.df.iloc[idx]
        matches.append({
            'job_title': row["job_title"],
            'description': row["Short_description"],
            'skills': row["Skills_required"],
            'similarity_score': float(similarities[idx]),
            'match_percentage': float(similarities[idx] * 100)
        })

    return {"matches": matches}


@app.get("/api/health")
def health():
    return {
        'status': 'ok' if state.df is not None else 'loading',
        'careers': len(state.df) if state.df is not None else 0
    }


@app.get("/")
def root():
    return {"message": "CareerSync API is running"}

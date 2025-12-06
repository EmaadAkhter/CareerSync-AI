from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from embedder_utils import get_pinecone_index, search_by_query
from contextlib import asynccontextmanager
import gc

index = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global index


    try:
        index = get_pinecone_index()

        stats = index.describe_index_stats()

    except Exception as e:
        raise

    yield



app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CareerFormData(BaseModel):
    interests: str
    interests_fulltime: str
    interests_appeal: str
    skills: str
    skills_natural: str
    skills_energized: str
    problem_solving: str
    problem_method: str
    problem_enjoy: str
    work_style: str
    work_routine: str
    work_goals: str
    values: str
    values_why: str
    values_choice: str
    career_inspiration: str
    inspiration_standout: str
    inspiration_pursue: str
    environment_preference: str
    environment_why: str
    focus_preference: str
    impact_preference: str
    impact_why: str


def build_career_query(form_data: CareerFormData) -> str:

    core_parts = [
        f"Interests: {form_data.interests}",
        f"Skills: {form_data.skills}",
        f"Values: {form_data.values}",
    ]

    additional_parts = [
        f"Problem solving: {form_data.problem_solving}",
        f"Work style: {form_data.work_style}",
        f"Environment: {form_data.environment_preference}",
        f"Impact: {form_data.impact_preference}"
    ]

    all_parts = core_parts + [p for p in additional_parts if p.strip()]
    return " | ".join(all_parts)


def search_careers(query: str, k: int = 5) -> list:
    return search_by_query(query, top_k=k, index=index)


def transform_to_career_matches(results: list, form_data: CareerFormData) -> list:
    matches = []

    for result in results:
        career = result['metadata']
        score = result['score']

        reasoning_parts = []

        if form_data.interests:
            reasoning_parts.append(f"Your interest in {form_data.interests} aligns well with this role")

        if form_data.skills:
            reasoning_parts.append(f"your skills in {form_data.skills} are valuable here")

        if form_data.values:
            reasoning_parts.append(f"this career matches your values around {form_data.values}")

        reasoning = ". ".join(reasoning_parts) if reasoning_parts else "Strong match based on your profile"
        reasoning += f". Match confidence: {score:.1%}"

        match = {
            "job_title": (
                    career.get("job_title") or
                    career.get("title") or
                    career.get("name") or
                    "Unknown Career"
            ),
            "match_percentage": score * 100,
            "description": career.get("description", "No description available"),
            "reasoning": reasoning,
            "skills": (
                    career.get("required_skills") or
                    career.get("skills") or
                    ""
            ),
            "industry": career.get("industry", ""),
            "salary_range": career.get("salary_range", ""),
            "education": career.get("education", ""),
            "work_environment": career.get("work_environment", "")
        }
        matches.append(match)

    return matches


@app.post("/api/match-careers")
async def match_careers(form_data: CareerFormData):
    try:

        search_query = build_career_query(form_data)

        results = search_careers(search_query, k=5)

        matches = transform_to_career_matches(results, form_data)

        gc.collect()

        return {"matches": matches}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    try:
        stats = index.describe_index_stats()

        return {
            "status": "ok",
            "pinecone_connected": True,
            "total_vectors": stats['total_vector_count'],
            "model": "loaded on-demand (not in memory)"
        }
    except Exception as e:
        return {
            "status": "error",
            "pinecone_connected": False,
            "error": str(e)
        }


@app.get("/")
async def root():
    return {
        "name": "Career Path Finder API",
        "version": "0.2.0",
        "note": "Optimized for low memory usage"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

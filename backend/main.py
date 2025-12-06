from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from embedder_utils import get_pinecone_index, search_by_query, get_model
from contextlib import asynccontextmanager

index = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global index

    try:
        get_model()

        index = get_pinecone_index()
        stats = index.describe_index_stats()

    except Exception as e:
        print(f"Startup error: {e}")
        raise

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://career-sync-ai-ten.vercel.app",
                   "https://career-sync-ai-ten.vercel.app",
                   "career-sync-ai-git-main-emaadansaris-projects.vercel.app",
                   "career-sync-njy77dgk3-emaadansaris-projects.vercel.app"],
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

    query_parts = [
        f"Primary interests: {form_data.interests}",
        f"Full-time interests: {form_data.interests_fulltime}",
        f"Core skills: {form_data.skills}",
        f"Natural strengths: {form_data.skills_natural}",
        f"Problem solving approach: {form_data.problem_solving}",
        f"Work style: {form_data.work_style}",
        f"Values: {form_data.values}",
        f"Work environment preference: {form_data.environment_preference}",
        f"Impact goals: {form_data.impact_preference}",
    ]

    query_parts = [p for p in query_parts if p.split(": ", 1)[1].strip()]

    return " ".join(query_parts)


def search_careers(query: str, k: int = 5) -> list:

    if not query.strip():
        raise ValueError("Query cannot be empty")
    return search_by_query(query, top_k=k, index=index)


def transform_to_career_matches(results: list, form_data: CareerFormData) -> list:

    matches = []

    for result in results:
        career = result['metadata']
        score = result['score']

        match = {
            "job_title": (
                    career.get("job_title") or
                    career.get("title") or
                    career.get("name") or
                    "Unknown Career"
            ),
            "match_percentage": round(score * 100, 1),
            "description": career.get("description", "No description available"),
            "reasoning": f"This career has a {score:.1%} semantic similarity to your profile based on interests, skills, and values.",
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

        if not search_query.strip():
            raise HTTPException(
                status_code=400,
                detail="Form data is empty or invalid"
            )

        results = search_careers(search_query, k=5)

        if not results:
            return {"matches": [], "message": "No matches found"}

        matches = transform_to_career_matches(results, form_data)

        return {"matches": matches}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/health")
async def health_check():
    try:
        stats = index.describe_index_stats()

        return {
            "status": "ok",
            "pinecone_connected": True,
            "total_vectors": stats['total_vector_count'],
            "model": "all-mpnet-base-v2 (768 dimensions)",
            "index_name": "occupations-index"
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
        "version": "0.3.0",
        "model": "all-mpnet-base-v2",
        "dimension": 768
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

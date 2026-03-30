from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from embedder_utils import get_pinecone_index, search_by_query, get_model
from resume_utils import ResumeExtractor
from contextlib import asynccontextmanager
import gc
import asyncio
import os
# torch threading will be set inside get_index or handlers when first needed

index = None


def get_index():
    """Lazy load the Pinecone index"""
    global index
    if index is None:
        try:
            print("Connecting to Pinecone index...")
            index = get_pinecone_index()
            print("Successfully connected to Pinecone index.")
        except Exception as e:
            print(f"Failed to connect to Pinecone: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")
    return index


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Minimal lifespan to ensure port binding happens immediately
    port = os.getenv("PORT", "8000")
    print(f"Application starting on port: {port}")
    
    # Pre-load the ONNX model in the background
    # This avoids the first-request lag
    async def preload_model():
        try:
            print("Background: Starting model pre-load...")
            get_model()
            print("Background: Model pre-load complete.")
        except Exception as e:
            print(f"Background: Model pre-load failed: {e}")

    asyncio.create_task(preload_model())
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://career-sync-ai-ten.vercel.app",
        "https://career-sync-ai-git-main-emaadansaris-projects.vercel.app",
        "https://career-sync-njy77dgk3-emaadansaris-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
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
    return search_by_query(query, top_k=k, index=get_index())


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
            "description": career.get("description") or career.get("Short_description") or "No description available",
            "reasoning": reasoning,
            "skills": (
                career.get("required_skills") or
                career.get("skills") or
                career.get("Skills_required") or
                ""
            ),
            "industry": career.get("industry") or career.get("Industry") or "",
            "salary_range": career.get("salary_range") or career.get("Pay_grade") or "",
            "education": career.get("education") or "",
            "work_environment": career.get("work_environment") or ""
        }
        matches.append(match)

    return matches


@app.post("/api/match-resume")
async def match_resume(file: UploadFile = File(...)):
    """Analyze a resume and suggest matching careers"""
    try:
        content = await file.read()
        
        # 1. Extract text from resume
        try:
            raw_text = ResumeExtractor.extract_text(content, file.filename)
            search_query = ResumeExtractor.prepare_query(raw_text)
            print(f"Extracted resume query: {search_query[:100]}...")
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        
        # 2. Perform vector search using existing AI engine
        try:
            results = await asyncio.wait_for(
                asyncio.to_thread(search_careers, search_query, 6),
                timeout=25.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Search request timed out")

        # 3. Transform to matches (mocking some form data for reasoning)
        from pydantic import BaseModel
        class MockForm:
            interests = "your professional experience"
            skills = "the background provided in your resume"
            values = "the details in your resume"
        
        matches = transform_to_career_matches(results, MockForm())
        
        # Cleanup
        del results
        gc.collect()

        return {"matches": matches}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/match-careers")
async def match_careers(form_data: CareerFormData):
    try:
        search_query = build_career_query(form_data)

        try:
            results = await asyncio.wait_for(
                asyncio.to_thread(search_careers, search_query, 5),
                timeout=25.0
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Search request timed out")

        matches = transform_to_career_matches(results, form_data)
        
        # Explicitly clear intermediate variables and collect garbage
        del results
        gc.collect()

        return {"matches": matches}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
@app.head("/health")
async def health_check():
    try:
        # Avoid blocking health check if index isn't ready
        current_index = get_index()
        stats = current_index.describe_index_stats()
        
        try:
            import psutil
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            return {
                "status": "ok",
                "pinecone_connected": True,
                "total_vectors": stats['total_vector_count'],
                "memory_mb": round(memory_mb, 2)
            }
        except ImportError:
            return {
                "status": "ok",
                "pinecone_connected": True,
                "total_vectors": stats['total_vector_count']
            }
    except Exception as e:
        return {
            "status": "error",
            "pinecone_connected": False,
            "error": str(e)
        }


@app.get("/")
@app.head("/")
async def root():
    return {
        "name": "Career Path Finder API",
        "version": "0.3.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

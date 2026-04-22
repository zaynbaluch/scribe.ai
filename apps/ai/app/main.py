from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

# Configure loguru
logger.remove()
logger.add(sys.stdout, colorize=True, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

app = FastAPI(
    title="Scribe.ai Service",
    description="AI service for parsing, tailoring, and generating resume content.",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ────────────────────────────────────────────────────────
from app.routers.jobs import router as jobs_router
from app.routers.tailor import router as tailor_router
from app.routers.ats import router as ats_router
from app.routers.resume import router as resume_router

app.include_router(jobs_router)
app.include_router(tailor_router)
app.include_router(ats_router)
app.include_router(resume_router)

# ─── Health Check ────────────────────────────────────────────────────────────

@app.get("/ai/health")
async def health_check():
    logger.info("Health check endpoint hit")
    return {"status": "ok", "service": "ai", "version": "0.3.0"}

@app.on_event("startup")
async def startup_event():
    logger.info("AI Service starting up (Phase 4: ATS Optimization)...")

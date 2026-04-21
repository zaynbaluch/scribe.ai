from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

# Configure loguru
logger.remove()
logger.add(sys.stdout, colorize=True, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>")

app = FastAPI(
    title="Scribe.ai Service",
    description="AI service for parsing and tailoring resumes.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ai/health")
async def health_check():
    logger.info("Health check endpoint hit")
    return {"status": "ok", "service": "ai"}

@app.on_event("startup")
async def startup_event():
    logger.info("AI Service starting up...")

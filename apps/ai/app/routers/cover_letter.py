from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from loguru import logger
from app.services.cover_letter_engine import generate_cover_letter

router = APIRouter(prefix="/ai/cover-letter", tags=["cover-letter"])

class CoverLetterRequest(BaseModel):
    profile: Dict[str, Any]
    jd_keywords: Dict[str, Any]
    jd_text: str
    tone: Optional[str] = "formal"

@router.post("/generate")
async def api_generate_cover_letter(req: CoverLetterRequest):
    logger.info("Received request to generate cover letter.")
    try:
        content = generate_cover_letter(req.profile, req.jd_keywords, req.jd_text, req.tone)
        return {"content": content}
    except Exception as e:
        logger.error(f"Error generating cover letter: {e}")
        raise HTTPException(status_code=500, detail=str(e))

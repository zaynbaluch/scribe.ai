"""
Tailor Router — Resume tailoring and cover letter generation endpoints.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from loguru import logger
from app.services.tailor_engine import tailor_resume
from app.services.cover_letter import generate_cover_letter, stream_cover_letter

router = APIRouter(prefix="/ai", tags=["tailor"])


class TailorRequest(BaseModel):
    profile: Dict[str, Any]
    jdKeywords: Dict[str, Any]
    jdText: str = Field(..., min_length=10)


class CoverLetterRequest(BaseModel):
    profile: Dict[str, Any]
    jdText: str = Field(..., min_length=10)
    jdKeywords: Dict[str, Any]
    tone: str = "formal"
    stream: bool = False


@router.post("/tailor")
async def tailor_resume_endpoint(req: TailorRequest):
    """Full resume tailoring — rewrites summary and bullets."""
    try:
        result = tailor_resume(req.profile, req.jdKeywords, req.jdText)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Tailoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))




@router.post("/cover-letter")
async def generate_cover_letter_endpoint(req: CoverLetterRequest):
    """Generate a cover letter. Supports streaming via SSE."""
    try:
        if req.stream:
            def event_stream():
                for chunk in stream_cover_letter(req.profile, req.jdText, req.jdKeywords, req.tone):
                    yield f"data: {chunk}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(event_stream(), media_type="text/event-stream")
        else:
            result = generate_cover_letter(req.profile, req.jdText, req.jdKeywords, req.tone)
            return {"success": True, "data": {"content": result}}
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

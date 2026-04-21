"""
ATS Router — ATS scoring endpoint.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from loguru import logger
from app.services.ats_scorer import compute_ats_score

router = APIRouter(prefix="/ai", tags=["ats"])


class AtsScoreRequest(BaseModel):
    resumeData: Dict[str, Any]
    jdKeywords: Optional[Dict[str, Any]] = None


@router.post("/ats-score")
async def get_ats_score(req: AtsScoreRequest):
    """Compute ATS compatibility score for a resume."""
    try:
        result = compute_ats_score(req.resumeData, req.jdKeywords)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"ATS scoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

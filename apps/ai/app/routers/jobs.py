"""
Jobs Router — JD parsing, match scoring, and URL fetching endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from loguru import logger
from app.services.jd_parser import parse_jd
from app.services.match_scorer import compute_match
from app.services.url_fetcher import fetch_jd_from_url

router = APIRouter(prefix="/ai", tags=["jobs"])


class ParseJDRequest(BaseModel):
    text: str = Field(..., min_length=10)

class MatchScoreRequest(BaseModel):
    profile: Dict[str, Any]
    jdKeywords: Dict[str, Any]

class FetchURLRequest(BaseModel):
    url: str = Field(..., min_length=5)


@router.post("/parse-jd")
async def parse_job_description(req: ParseJDRequest):
    """Parse a job description and extract keywords + metadata."""
    try:
        result = parse_jd(req.text)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"JD parsing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/match-score")
async def get_match_score(req: MatchScoreRequest):
    """Compute match score between profile and JD keywords."""
    try:
        result = compute_match(req.profile, req.jdKeywords)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Match scoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch-url")
async def fetch_url(req: FetchURLRequest):
    """Fetch and extract text from a job posting URL."""
    try:
        result = await fetch_jd_from_url(req.url)
        if result.get("error"):
            raise HTTPException(status_code=400, detail=result["error"])
        return {"success": True, "data": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"URL fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

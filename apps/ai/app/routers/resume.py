from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import PyPDF2
from io import BytesIO
import re

router = APIRouter(prefix="/ai", tags=["Resume Parsing"])

class ParsedSkill(BaseModel):
    name: str
    category: str

class ParsedExperience(BaseModel):
    company: str
    position: str
    startDate: str
    endDate: str
    description: str

class ParsedEducation(BaseModel):
    institution: str
    degree: str
    field: str
    startDate: str
    endDate: str

class ParseResumeResponse(BaseModel):
    summary: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    experiences: List[ParsedExperience] = []
    education: List[ParsedEducation] = []
    skills: List[ParsedSkill] = []
    projects: list = []
    certifications: list = []
    rawText: str
    confidence: float

@router.post("/parse-resume", response_model=ParseResumeResponse)
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
            
        # Optional: Here you can connect to Ollama or OpenAI to extract structured data
        
        phone_match = re.search(r'[\+]?\d[\d\s()-]{7,}', text)
        
        return ParseResumeResponse(
            summary=None,
            headline=None,
            phone=phone_match.group(0).strip() if phone_match else None,
            experiences=[],
            education=[],
            skills=[],
            projects=[],
            certifications=[],
            rawText=text,
            confidence=0.5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

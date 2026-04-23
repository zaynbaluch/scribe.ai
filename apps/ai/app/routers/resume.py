from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import PyPDF2
from io import BytesIO
import re

router = APIRouter(prefix="/ai", tags=["Resume Parsing"])

class ParsedSkill(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = "Other"

class ParsedExperience(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    description: Optional[str] = None
    bullets: List[str] = []

class ParsedEducation(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None

class ParsedProject(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    techStack: List[str] = []
    bullets: List[str] = []

class ParsedCertification(BaseModel):
    name: Optional[str] = None
    issuer: Optional[str] = None
    date: Optional[str] = None

class ParseResumeResponse(BaseModel):
    summary: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    experiences: List[ParsedExperience] = []
    education: List[ParsedEducation] = []
    skills: List[ParsedSkill] = []
    projects: List[ParsedProject] = []
    certifications: List[ParsedCertification] = []
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
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        from app.providers.factory import get_llm_provider
        llm = get_llm_provider()

        system = (
            "You are an expert resume parser. Extract structured data from the following resume text. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. Use EXACT WORDS from the resume for summaries, descriptions, and bullet points. Do not paraphrase or summarize unless the information is extremely long or missing.\n"
            "2. Map 'About Me', 'Professional Profile', or 'Personal Statement' sections to the 'summary' field.\n"
            "3. DO NOT invent false details. If a field is missing, use null or empty list.\n"
            "4. DO NOT include dates for projects.\n"
            "5. Return ONLY a valid JSON object. No markdown, no explanations.\n\n"
            "JSON structure must match:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"headline\": \"string\",\n"
            "  \"phone\": \"string\",\n"
            "  \"experiences\": [{\"company\": \"str\", \"title\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\", \"description\": \"str\", \"bullets\": [\"str\"]}],\n"
            "  \"education\": [{\"institution\": \"str\", \"degree\": \"str\", \"field\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\"}],\n"
            "  \"skills\": [{\"name\": \"str\", \"category\": \"str\"}],\n"
            "  \"projects\": [{\"name\": \"str\", \"description\": \"str\", \"techStack\": [\"str\"]}],\n"
            "  \"certifications\": [{\"name\": \"str\", \"issuer\": \"str\", \"date\": \"str\"}]\n"
            "}\n"
        )
        
        prompt = f"Resume Text:\n\n{text[:6000]}" # Limit to 6000 chars for context window
        
        raw_json = llm.generate(prompt, system=system, temperature=0.1)
        
        # Clean up JSON if LLM added markdown wrappers
        clean_json = re.sub(r'```json\s*(.*?)\s*```', r'\1', raw_json, flags=re.DOTALL).strip()
        
        import json
        data = json.loads(clean_json)
        
        return ParseResumeResponse(
            summary=data.get("summary"),
            headline=data.get("headline"),
            phone=data.get("phone"),
            experiences=data.get("experiences", []),
            education=data.get("education", []),
            skills=data.get("skills", []),
            projects=data.get("projects", []),
            certifications=data.get("certifications", []),
            rawText=text,
            confidence=0.9
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

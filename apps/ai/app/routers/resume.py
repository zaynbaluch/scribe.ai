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
    title: str
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
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        from app.providers.factory import get_llm_provider
        llm = get_llm_provider()

        system = (
            "You are an expert resume parser. Extract structured data from the following resume text. "
            "Return ONLY a valid JSON object. Do not include markdown formatting or explanations. "
            "JSON structure must match:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"headline\": \"string\",\n"
            "  \"phone\": \"string\",\n"
            "  \"experiences\": [{\"company\": \"str\", \"title\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\", \"description\": \"str\"}],\n"
            "  \"education\": [{\"institution\": \"str\", \"degree\": \"str\", \"field\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\"}],\n"
            "  \"skills\": [{\"name\": \"str\", \"category\": \"str\"}],\n"
            "  \"projects\": [{\"name\": \"str\", \"description\": \"str\", \"techStack\": [\"str\"]}],\n"
            "  \"certifications\": [{\"name\": \"str\", \"issuer\": \"str\", \"date\": \"str\"}]\n"
            "}\n"
            "If a field is missing, use null or an empty list. Ensure dates are in YYYY-MM-DD or readable format."
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

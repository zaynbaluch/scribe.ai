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
    name: Optional[str] = None
    summary: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
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
            "1. EXTRACT NAME: The candidate's name is at the VERY TOP of the resume (first 1-3 lines). It can be of any cultural background (Western, Muslim, African, Asian, etc.). If you see a large text at the start, it is likely the name. DO NOT leave this empty. Infer it from the context if not explicitly labeled.\n"
            "2. PHONE ACCURACY: The 'phone' field MUST ONLY contain a valid telephone number. STRICT RULE: DO NOT put an email address in the phone field. If you find an email, put it in the 'email' field. If no phone number is found, leave the 'phone' field as null. Support all international formats.\n"
            "3. EDUCATION LOGIC: Split degrees into 'degree' (e.g. BS, MS, PhD, BBA) and 'field' (e.g. Computer Science, Business Administration). Do not repeat the field in the degree.\n"
            "4. SKILLS PRIORITY: Extract technical skills (languages, frameworks, tools, methodologies) FIRST. List them at the beginning of the skills array. Then include soft skills or inferred skills.\n"
            "5. SOCIAL LINKS: Extract LinkedIn, GitHub, and Website handles or URLs into their respective fields. Be thorough and search the entire header area.\n"
            "6. EXPERIENCE: Use EXACT text for job titles and bullet points. Ensure the 'description' is a concise summary and 'bullets' contains the detailed points.\n"
            "7. Return ONLY valid JSON.\n\n"
            "JSON structure:\n"
            "{\n"
            "  \"name\": \"string\",\n"
            "  \"summary\": \"string\",\n"
            "  \"headline\": \"string\",\n"
            "  \"phone\": \"string\",\n"
            "  \"email\": \"string\",\n"
            "  \"linkedin\": \"string\",\n"
            "  \"github\": \"string\",\n"
            "  \"website\": \"string\",\n"
            "  \"experiences\": [{\"company\": \"str\", \"title\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\", \"description\": \"str\", \"bullets\": [\"str\"]}],\n"
            "  \"education\": [{\"institution\": \"str\", \"degree\": \"str\", \"field\": \"str\", \"startDate\": \"str\", \"endDate\": \"str\"}],\n"
            "  \"skills\": [{\"name\": \"str\", \"category\": \"str\"}],\n"
            "  \"projects\": [{\"name\": \"str\", \"description\": \"str\", \"techStack\": [\"str\"], \"bullets\": [\"str\"]}],\n"
            "  \"certifications\": [{\"name\": \"str\", \"issuer\": \"str\", \"date\": \"str\"}]\n"
            "}\n"
        )
        
        prompt = f"Resume Text:\n\n{text[:6000]}"
        
        raw_json = llm.generate(prompt, system=system, temperature=0.1)
        clean_json = re.sub(r'```json\s*(.*?)\s*```', r'\1', raw_json, flags=re.DOTALL).strip()
        
        import json
        import logging
        logger = logging.getLogger("uvicorn")
        
        # More robust JSON cleaning
        json_start = clean_json.find('{')
        json_end = clean_json.rfind('}')
        if json_start != -1 and json_end != -1:
            clean_json = clean_json[json_start:json_end+1]
        
        try:
            data = json.loads(clean_json)
        except json.JSONDecodeError as je:
            logger.error(f"Failed to parse JSON from LLM: {clean_json}")
            raise HTTPException(status_code=500, detail=f"Invalid JSON from AI: {str(je)}")

        # Post-processing to fix phone field if it contains an email
        phone = data.get("phone")
        email = data.get("email")
        if phone and "@" in phone:
            if not email:
                email = phone
            phone = None
        
        return ParseResumeResponse(
            name=data.get("name"),
            summary=data.get("summary"),
            headline=data.get("headline"),
            phone=phone,
            email=email,
            linkedin=data.get("linkedin"),
            github=data.get("github"),
            website=data.get("website"),
            experiences=data.get("experiences", []),
            education=data.get("education", []),
            skills=data.get("skills", []),
            projects=data.get("projects", []),
            certifications=data.get("certifications", []),
            rawText=text,
            confidence=0.9
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        import logging
        logger = logging.getLogger("uvicorn")
        logger.error(f"Resume parsing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

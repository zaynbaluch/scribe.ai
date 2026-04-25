from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import PyPDF2
import docx
from io import BytesIO
import re
import json
import logging

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
    filename = file.filename.lower()
    if not (filename.endswith('.pdf') or filename.endswith('.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        content = await file.read()
        text = ""
        
        if filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        elif filename.endswith('.docx'):
            try:
                doc = docx.Document(BytesIO(content))
                for para in doc.paragraphs:
                    if para.text:
                        text += para.text + "\n"
            except Exception as e:
                import zipfile
                from xml.etree import ElementTree
                logger.warning(f"python-docx failed, falling back to manual XML extraction: {str(e)}")
                try:
                    with zipfile.ZipFile(BytesIO(content)) as zf:
                        xml_content = zf.read('word/document.xml')
                        tree = ElementTree.fromstring(xml_content)
                        # Namespace for Word XML
                        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                        # Extract all text nodes
                        for t in tree.findall('.//w:t', ns):
                            if t.text:
                                text += t.text + " "
                except Exception as xml_err:
                    logger.error(f"Manual XML extraction also failed: {str(xml_err)}")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail=f"Could not extract text from {filename.split('.')[-1].upper()}")

        logger = logging.getLogger("uvicorn")

        from app.providers.factory import get_llm_provider
        llm = get_llm_provider()

        system = (
            "You are an expert resume parser. Extract structured data from the following resume text. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. EXTRACT NAME: The candidate's name is at the VERY TOP of the resume (first 1-3 lines). It can be of any cultural background. If no name is found, leave as null.\n"
            "2. PHONE & EMAIL: Extract these carefully. Do not put an email in the phone field.\n"
            "3. GENTLE EXTRACTION: Resumes are unconventional. If a section (like Education or Experience) is missing, return an empty array []. "
            "If a specific field within an entry (like 'degree' or 'company') is missing, return null. DO NOT invent data.\n"
            "4. DATE HANDLING: Return dates in ISO format (YYYY-MM-DD) if possible. If only a year is provided, use YYYY-01-01. "
            "If a date is 'Present' or 'Current', use null for the endDate. If a date is completely missing, use null.\n"
            "5. EDUCATION & EXPERIENCE: Split degrees from fields. Use EXACT text for job titles. If an entry has no identifiable title or company/institution, you may still include it if it has a description, but prefer to omit completely empty entries.\n"
            "6. CLEANING: Extracted text from PDFs often contains stray spaces within words (e.g., 'T e chnology' or 'mehb o ob'). You MUST fix these artifacts by merging the words based on context, especially for names, emails, and well-known institutions/technologies. DO NOT invent information that isn't there.\n"
            "7. SKILLS: Extract technical skills first, then soft skills.\n"
            "8. Return ONLY valid JSON.\n\n"
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
        
        prompt = f"Resume Text:\n\n{text[:8000]}"
        
        # Use generate_json for native JSON mode and increase tokens to prevent truncation
        data = llm.generate_json(prompt, system=system, temperature=0.1, max_tokens=4096)
        
        try:
            logger.info(f"Successfully parsed resume for {data.get('name')}")
        except Exception as e:
            logger.error(f"Error logging parsed data: {str(e)}")

        # Post-processing to fix phone field if it contains an email
        phone = data.get("phone")
        email = data.get("email")
        
        # Regex fallback for phone if LLM failed
        if not phone:
            # Look for common phone patterns like 03xx-xxxxxxx or +xx xxx xxxxxxx
            phone_match = re.search(r'(\+?\d[\d\s-]{7,15})', text)
            if phone_match:
                extracted_phone = phone_match.group(1).strip()
                # Basic validation: ensure it's not an email or too short
                if "@" not in extracted_phone and len(re.sub(r'\D', '', extracted_phone)) >= 7:
                    phone = extracted_phone
                    logger.info(f"Regex Fallback Phone Found: {phone}")

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
        logger = logging.getLogger("uvicorn")
        logger.error(f"Resume parsing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

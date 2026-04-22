"""
Cover Letter Engine — LLM-powered cover letter generation.
"""
from typing import Dict, Any
from loguru import logger
from app.providers.factory import get_llm_provider

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm_provider()
    return _llm


def generate_cover_letter(profile: Dict[str, Any], jd_keywords: Dict, jd_text: str, tone: str = "formal") -> str:
    """Generate a highly targeted cover letter based on profile and JD."""
    llm = _get_llm()

    job_title = jd_keywords.get("title", "the open position")
    all_keywords = jd_keywords.get("required", []) + jd_keywords.get("preferred", [])
    keyword_str = ", ".join(all_keywords[:15])
    jd_context = jd_text[:1000]

    # Extract some basic info from profile to keep prompt concise
    name = profile.get("name", "Applicant")
    experiences = []
    for exp in profile.get("experiences", [])[:3]:  # Take top 3
        experiences.append(f"{exp.get('title')} at {exp.get('company')}")
    
    skills = [s.get("name", "") for s in profile.get("skills", [])[:10]]

    tone_guidance = {
        "formal": "Keep the tone highly professional, structured, and formal.",
        "conversational": "Use a warm, engaging, and conversational tone while remaining professional.",
        "storytelling": "Structure the cover letter as a compelling narrative about the applicant's journey and impact."
    }.get(tone, "Keep the tone professional and structured.")

    system = (
        "You are an expert career coach and cover letter writer. "
        "Write a targeted, compelling cover letter based on the applicant's profile and the job description. "
        f"{tone_guidance} "
        "Structure: 1. Strong opening (why them). 2. Highlight 1-2 highly relevant experiences matching the JD. "
        "3. Cultural fit / enthusiasm. 4. Professional closing. "
        "Return ONLY the cover letter text. Do not include placeholder blocks like [Company Address]. "
        "Just write the content starting with 'Dear Hiring Manager,' or similar."
    )

    prompt = (
        f"Applicant Name: {name}\n"
        f"Applicant Top Skills: {', '.join(skills)}\n"
        f"Applicant Key Roles: {', '.join(experiences)}\n\n"
        f"Target Role: {job_title}\n"
        f"Job Keywords: {keyword_str}\n"
        f"Job Description Snippet: {jd_context}\n\n"
        f"Cover Letter:"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.7, max_tokens=600)
        return result.strip()
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {e}")
        return "Dear Hiring Manager,\n\nI am writing to express my interest in the position. Please find my resume attached.\n\nSincerely,\n" + name

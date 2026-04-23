"""
Cover Letter Engine — LLM-powered cover letter generation.
"""
from typing import Dict, Any
import re
from loguru import logger
from app.providers.factory import get_llm_provider

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm_provider()
    return _llm


def clean_cover_letter_body(text: str, name: str = "") -> str:
    """
    Remove common letter artifacts like salutations and sign-offs if they leak into the body.
    """
    lines = text.strip().split('\n')
    if not lines:
        return ""

    # Remove salutations from the top
    salutation_patterns = [
        r'^Dear\s+.*?,?\s*$',
        r'^To\s+Whom\s+It\s+May\s+Concern,?\s*$',
        r'^Greetings,?\s*$',
        r'^Hi\s+.*?,?\s*$',
        r'^Hello,?\s*$',
    ]
    
    while lines and any(re.match(p, lines[0].strip(), re.I) for p in salutation_patterns):
        lines.pop(0)
    
    # Trim empty lines after salutation
    while lines and not lines[0].strip():
        lines.pop(0)

    # Remove sign-offs from the bottom
    signoff_patterns = [
        r'^Sincerely,?\s*$',
        r'^Regards,?\s*$',
        r'^Best\s+regards,?\s*$',
        r'^Best,?\s*$',
        r'^Thank\s+you,?\s*$',
        r'^Thanks,?\s*$',
        r'^Yours\s+truly,?\s*$',
    ]
    
    # Remove signature lines (usually the last 1-3 lines)
    while lines:
        last_line = lines[-1].strip()
        if not last_line:
            lines.pop()
            continue
        
        is_signoff = any(re.match(p, last_line, re.I) for p in signoff_patterns)
        is_name = name.lower() in last_line.lower() if name else False
        
        if is_signoff or is_name:
            lines.pop()
        else:
            break

    # Final trim
    return '\n'.join(lines).strip()


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
        "Write a targeted, compelling cover letter body text based on the applicant's profile and the job description. "
        f"{tone_guidance} "
        "STRICT INSTRUCTIONS:\n"
        "1. DO NOT include any salutation (e.g., 'Dear Hiring Manager').\n"
        "2. DO NOT include any sign-off (e.g., 'Sincerely', 'Regards').\n"
        "3. DO NOT include your name or signature at the end.\n"
        "4. Return ONLY the body paragraphs (usually 3-4 paragraphs).\n"
        "5. START IMMEDIATELY with the first sentence of the introduction."
    )

    prompt = (
        f"Applicant Name: {name}\n"
        f"Applicant Top Skills: {', '.join(skills)}\n"
        f"Applicant Key Roles: {', '.join(experiences)}\n\n"
        f"Target Role: {job_title}\n"
        f"Job Keywords: {keyword_str}\n"
        f"Job Description Snippet: {jd_context}\n\n"
        "Write the cover letter body paragraphs only:"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.7, max_tokens=600)
        return clean_cover_letter_body(result.strip(), name=name)
    except Exception as e:
        logger.error(f"Failed to generate cover letter: {e}")
        return "I am writing to express my interest in the position. Please find my resume attached."

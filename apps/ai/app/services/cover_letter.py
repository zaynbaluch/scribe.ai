"""
Cover Letter Generator — LLM-powered cover letter creation with tone control.
"""
from typing import Dict, Any, Optional, Generator
import re
from loguru import logger
from app.providers.factory import get_llm_provider

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm_provider()
    return _llm

TONE_INSTRUCTIONS = {
    "formal": "Write in a professional, formal tone. Use polished language suitable for corporate environments.",
    "conversational": "Write in a warm, conversational tone. Be personable while remaining professional. Show enthusiasm naturally.",
    "storytelling": "Write in a narrative, storytelling style. Open with a compelling hook and weave the candidate's experience into a story.",
}


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


def generate_cover_letter(
    profile: Dict[str, Any],
    jd_text: str,
    jd_keywords: Dict,
    tone: str = "formal",
    resume_content: Optional[Dict] = None,
) -> str:
    """Generate a full cover letter."""
    llm = _get_llm()

    job_title = jd_keywords.get("title", "the position")
    company = jd_keywords.get("company", "your company")
    required = jd_keywords.get("required", [])
    name = profile.get("name", "")
    headline = profile.get("headline", "")
    summary = profile.get("summary", "")

    # Build experience highlights
    exp_highlights = []
    for exp in profile.get("experiences", [])[:3]:
        title = exp.get("title", "")
        co = exp.get("company", "")
        bullets = exp.get("bullets", [])[:2]
        exp_highlights.append(f"- {title} at {co}: {'; '.join(b for b in bullets if b)}")

    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["formal"])

    system = (
        f"You are an expert cover letter writer. {tone_instruction}\n"
        "The user has ALREADY written the header, date, salutation ('Dear Hiring Manager,'), "
        "and the closing ('Sincerely, [Name]').\n"
        "Your task is ONLY to write the body paragraphs that go BETWEEN the greeting and the closing.\n"
        "STRICT RULES:\n"
        "1. DO NOT include ANY greeting or salutation.\n"
        "2. DO NOT include ANY sign-off or name.\n"
        "3. START IMMEDIATELY with the first sentence of the letter body.\n"
        "4. Output 3-4 professional paragraphs."
    )

    prompt = (
        f"Candidate: {name}, {headline}\n"
        f"Target Role: {job_title} at {company}\n"
        f"Key Requirements: {', '.join(required[:8])}\n\n"
        f"Candidate Summary: {summary}\n\n"
        f"Key Experience:\n" + "\n".join(exp_highlights) + "\n\n"
        f"Write ONLY the body paragraphs (nothing else):"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.7, max_tokens=800)
        return clean_cover_letter_body(result.strip(), name=name)
    except Exception as e:
        logger.error(f"Cover letter generation failed: {e}")
        return f"[Error generating cover letter: {str(e)}]"


def stream_cover_letter(
    profile: Dict[str, Any],
    jd_text: str,
    jd_keywords: Dict,
    tone: str = "formal",
) -> Generator[str, None, None]:
    """Stream a cover letter for real-time UI updates."""
    llm = _get_llm()

    job_title = jd_keywords.get("title", "the position")
    company = jd_keywords.get("company", "your company")
    required = jd_keywords.get("required", [])
    name = profile.get("name", "")
    headline = profile.get("headline", "")
    summary = profile.get("summary", "")

    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["formal"])

    system = (
        f"You are an expert cover letter writer. {tone_instruction}\n"
        "Write ONLY the body paragraphs. NO greeting, NO signature. Just the text between them."
    )

    prompt = (
        f"Candidate: {name}, {headline}\n"
        f"Summary: {summary}\n"
        f"Target: {job_title} at {company}\n"
        f"Requirements: {', '.join(required[:8])}\n"
        f"JD: {jd_text[:400]}\n\n"
        f"Body paragraphs:"
    )

    try:
        # Note: Streaming doesn't easily allow post-processing the whole text,
        # but the prompt should be sufficient for most cases.
        yield from llm.stream(prompt, system=system, temperature=0.7, max_tokens=800)
    except Exception as e:
        logger.error(f"Cover letter streaming failed: {e}")
        yield f"[Error: {str(e)}]"

"""
Cover Letter Generator — LLM-powered cover letter creation with tone control.
"""
from typing import Dict, Any, Optional, Generator
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
        "Write a compelling cover letter that:\n"
        "1. Opens with a strong hook related to the company or role\n"
        "2. Highlights 2-3 most relevant experiences/achievements\n"
        "3. Shows knowledge of the company and role requirements\n"
        "4. Closes with confidence and a clear call to action\n"
        "Format: 3-4 paragraphs. Return ONLY the letter body (no date/address/signature block)."
    )

    prompt = (
        f"Candidate: {name}, {headline}\n"
        f"Target Role: {job_title} at {company}\n"
        f"Key Requirements: {', '.join(required[:8])}\n\n"
        f"Candidate Summary: {summary}\n\n"
        f"Key Experience:\n" + "\n".join(exp_highlights) + "\n\n"
        f"Job Description Excerpt:\n{jd_text[:600]}\n\n"
        f"Write the cover letter body:"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.7, max_tokens=800)
        return result.strip()
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
        "Write a compelling 3-4 paragraph cover letter body. No date/address/signature."
    )

    prompt = (
        f"Candidate: {name}, {headline}\n"
        f"Summary: {summary}\n"
        f"Target: {job_title} at {company}\n"
        f"Requirements: {', '.join(required[:8])}\n"
        f"JD: {jd_text[:400]}\n\n"
        f"Cover letter:"
    )

    try:
        yield from llm.stream(prompt, system=system, temperature=0.7, max_tokens=800)
    except Exception as e:
        logger.error(f"Cover letter streaming failed: {e}")
        yield f"[Error: {str(e)}]"

"""
Tailor Engine — LLM-powered resume content tailoring.
Rewrites individual bullets, summaries, and injects keywords.
"""
from typing import Dict, List, Optional, Any
from loguru import logger
from app.providers.factory import get_llm_provider

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = get_llm_provider()
    return _llm


def tailor_bullet(original: str, jd_context: str, keywords: List[str], job_title: str = "") -> Dict:
    """Rewrite a single bullet point to better match the JD."""
    llm = _get_llm()

    keyword_str = ", ".join(keywords[:10])
    system = (
        "You are an expert resume writer. Rewrite the bullet point to better match the job description. "
        "Keep the core achievement but naturally incorporate relevant keywords. "
        "Use strong action verbs and quantify impact where possible. "
        "Keep it concise (1-2 lines). Return ONLY the rewritten bullet, no explanations."
    )
    prompt = (
        f"Job Title: {job_title}\n"
        f"Key Skills: {keyword_str}\n"
        f"JD Context: {jd_context[:500]}\n\n"
        f"Original bullet: {original}\n\n"
        f"Rewritten bullet:"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.6, max_tokens=200)
        result = result.strip().strip('"').strip("'").strip("-").strip("•").strip()
        return {"original": original, "tailored": result, "changed": result.lower() != original.lower()}
    except Exception as e:
        logger.error(f"Failed to tailor bullet: {e}")
        return {"original": original, "tailored": original, "changed": False, "error": str(e)}


def tailor_summary(original: str, jd_context: str, keywords: List[str], job_title: str = "") -> Dict:
    """Rewrite the professional summary to target the JD."""
    llm = _get_llm()

    keyword_str = ", ".join(keywords[:10])
    system = (
        "You are an expert resume writer. Rewrite the professional summary to target this specific role. "
        "Highlight the most relevant experience and skills for the job. "
        "Keep it 2-3 sentences. Return ONLY the rewritten summary."
    )
    prompt = (
        f"Target Role: {job_title}\n"
        f"Key Skills: {keyword_str}\n"
        f"JD Context: {jd_context[:500]}\n\n"
        f"Original summary: {original}\n\n"
        f"Tailored summary:"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.6, max_tokens=300)
        return {"original": original, "tailored": result.strip(), "changed": True}
    except Exception as e:
        logger.error(f"Failed to tailor summary: {e}")
        return {"original": original, "tailored": original, "changed": False, "error": str(e)}


def tailor_resume(profile: Dict[str, Any], jd_keywords: Dict, jd_text: str) -> Dict:
    """
    Full resume tailoring. Rewrites summary + all experience bullets.
    Returns original vs tailored for each item.
    """
    job_title = jd_keywords.get("title", "")
    all_keywords = jd_keywords.get("required", []) + jd_keywords.get("preferred", [])
    jd_context = jd_text[:800]

    suggestions = []

    # Tailor summary
    summary = profile.get("summary", "")
    if summary:
        result = tailor_summary(summary, jd_context, all_keywords, job_title)
        suggestions.append({
            "section": "summary",
            "type": "summary",
            "index": 0,
            **result,
        })

    # Tailor experience bullets and descriptions
    for i, exp in enumerate(profile.get("experiences", [])):
        bullets = exp.get("bullets", [])
        if bullets:
            for j, bullet in enumerate(bullets):
                if not bullet:
                    continue
                result = tailor_bullet(bullet, jd_context, all_keywords, job_title)
                suggestions.append({
                    "section": "experience",
                    "type": "bullet",
                    "experienceIndex": i,
                    "bulletIndex": j,
                    "experienceTitle": exp.get("title", ""),
                    "company": exp.get("company", ""),
                    **result,
                })
        else:
            desc = exp.get("description", "")
            if desc:
                # We can reuse tailor_summary for the description as it's a block of text
                result = tailor_summary(desc, jd_context, all_keywords, job_title)
                suggestions.append({
                    "section": "experience",
                    "type": "description",
                    "experienceIndex": i,
                    "experienceTitle": exp.get("title", ""),
                    "company": exp.get("company", ""),
                    **result,
                })

    # Tailor project descriptions
    for i, proj in enumerate(profile.get("projects", [])):
        desc = proj.get("description", "")
        tech_stack = proj.get("techStack", [])
        
        # Check if project is relevant (tech stack overlaps with keywords)
        is_relevant = any(kw.lower() in [t.lower() for t in tech_stack] for kw in all_keywords)
        
        if desc:
            # We add a hint about the project tech stack if it's relevant
            system = (
                "You are an expert resume writer. Rewrite the provided project description to better match the target role. "
                "CRITICAL INSTRUCTION: DO NOT write a summary of the role. DO NOT write about what the company is seeking. "
                "You MUST ONLY rewrite the specific project description provided below. Highlight the relevant technologies and impact. "
                "Keep it concise (1-3 sentences). Return ONLY the rewritten project description."
            )
            prompt = (
                f"Target Role: {job_title}\n"
                f"Key Skills: {', '.join(all_keywords[:10])}\n"
                f"Project Tech Stack: {', '.join(tech_stack)}\n"
                f"Original description to rewrite: {desc}\n\n"
                f"Tailored project description:"
            )
            try:
                result = _get_llm().generate(prompt, system=system, temperature=0.6, max_tokens=300)
                tailored = result.strip()
                suggestions.append({
                    "section": "projects",
                    "type": "description",
                    "projectIndex": i,
                    "projectName": proj.get("name", ""),
                    "original": desc,
                    "tailored": tailored,
                    "changed": tailored.lower() != desc.lower()
                })
            except Exception as e:
                logger.error(f"Failed to tailor project: {e}")

    # Suggest section order based on JD keywords
    suggested_order = suggest_section_order(profile, jd_keywords)

    return {
        "suggestions": suggestions,
        "suggestedSectionOrder": suggested_order,
        "keywordsUsed": all_keywords[:15],
    }


def suggest_section_order(profile: Dict, jd_keywords: Dict) -> List[str]:
    """Rule-based section reordering based on JD relevance."""
    default_order = ["summary", "experience", "skills", "projects", "education", "certifications"]
    categories = jd_keywords.get("categories", {})

    # If JD emphasizes projects/open-source or we have relevant tech stack, move projects up
    # Since we can't easily access the score here, we'll aggressively move projects up if we have them and it's a technical role.
    if len(profile.get("projects", [])) > 0:
        if "projects" in default_order:
            default_order.remove("projects")
            # Put projects right after summary! (Index 1)
            default_order.insert(1, "projects")

    return default_order

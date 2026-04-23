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


def tailor_experience(exp: Dict[str, Any], jd_context: str, keywords: List[str], job_title: str = "") -> Dict:
    """Rewrite experience details into 2-3 fresh, high-impact bullets."""
    llm = _get_llm()

    keyword_str = ", ".join(keywords[:10])
    original_bullets = "\n".join(exp.get("bullets", []))
    original_desc = exp.get("description", "")
    
    system = (
        "You are an expert resume writer. Rewrite the provided job experience into 2-3 HIGH-IMPACT bullet points. "
        "CRITICAL INSTRUCTIONS:\n"
        "1. Use PAST TENSE for all actions.\n"
        "2. DO NOT invent new skills or experiences. Only use provided info.\n"
        "3. Focus on results and quantify impact where possible.\n"
        "4. Return ONLY the bullet points, each starting with '• '."
    )
    prompt = (
        f"Target Role: {job_title}\n"
        f"Job: {exp.get('title')} at {exp.get('company')}\n"
        f"Original Details:\n{original_desc}\n{original_bullets}\n\n"
        f"Tailored Bullets (2-3 items, PAST TENSE):"
    )

    try:
        result = llm.generate(prompt, system=system, temperature=0.6, max_tokens=300)
        lines = [line.strip().strip('•').strip('-').strip() for line in result.split('\n') if line.strip()]
        tailored_bullets = lines[:3] # Ensure at most 3
        
        return {
            "original_bullets": exp.get("bullets", []),
            "tailored_bullets": tailored_bullets,
            "changed": len(tailored_bullets) > 0
        }
    except Exception as e:
        logger.error(f"Failed to tailor experience: {e}")
        return {"original_bullets": exp.get("bullets", []), "tailored_bullets": exp.get("bullets", []), "changed": False}


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

    # Tailor experience
    for i, exp in enumerate(profile.get("experiences", [])):
        result = tailor_experience(exp, jd_context, all_keywords, job_title)
        if result["changed"]:
            suggestions.append({
                "section": "experience",
                "type": "bullets",
                "experienceIndex": i,
                "experienceTitle": exp.get("title", ""),
                "company": exp.get("company", ""),
                "original": "\n".join(exp.get("bullets", [])),
                "tailored": "\n".join(result["tailored_bullets"]),
                "changed": True
            })

    # Tailor projects
    for i, proj in enumerate(profile.get("projects", [])):
        tech_stack = proj.get("techStack", [])
        desc = proj.get("description", "")
        bullets = proj.get("bullets", [])
        
        system = (
            "You are an expert resume writer. Rewrite the project details into a concise description with 1-2 impact bullets. "
            "CRITICAL INSTRUCTIONS:\n"
            "1. Use PAST TENSE.\n"
            "2. DO NOT invent facts. Only use provided info.\n"
            "3. Keep it VERY CONCISE (at most 2 high-impact bullets).\n"
            "4. Return ONLY the bullet points, each starting with '• '."
        )
        prompt = (
            f"Target Role: {job_title}\n"
            f"Project: {proj.get('name')}\n"
            f"Tech Stack: {', '.join(tech_stack)}\n"
            f"Original Details: {desc}\n" + "\n".join(bullets) + "\n\n"
            f"Tailored Project Details (PAST TENSE):"
        )
        try:
            result = _get_llm().generate(prompt, system=system, temperature=0.6, max_tokens=250)
            lines = [line.strip().strip('•').strip('-').strip() for line in result.split('\n') if line.strip()]
            tailored_bullets = lines[:2]
            
            suggestions.append({
                "section": "projects",
                "type": "bullets",
                "projectIndex": i,
                "projectName": proj.get("name", ""),
                "original": desc + "\n" + "\n".join(bullets),
                "tailored": "\n".join(tailored_bullets),
                "changed": len(tailored_bullets) > 0
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

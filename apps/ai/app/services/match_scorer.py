"""
Match Scorer — Compute match score between a profile and a JD.
Uses TF-IDF cosine similarity + skill taxonomy. No LLM required.
"""
from typing import Dict, List, Any
from loguru import logger

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    logger.warning("scikit-learn not installed, using basic matching")


def compute_match(profile: Dict[str, Any], jd_keywords: Dict[str, Any]) -> Dict:
    """
    Compute match score between a user profile and parsed JD keywords.
    Returns 0-100 score + categorized breakdown.
    """
    # Extract profile skills as a flat list
    profile_skills = set()
    for skill in profile.get("skills", []):
        name = skill.get("name", "").lower().strip()
        if name:
            profile_skills.add(name)

    # Also extract keywords from experience bullets
    profile_text_parts = []
    if profile.get("summary"):
        profile_text_parts.append(profile["summary"])
    for exp in profile.get("experiences", []):
        if exp.get("description"):
            profile_text_parts.append(exp["description"])
        for bullet in exp.get("bullets", []):
            if bullet:
                profile_text_parts.append(bullet)
    for proj in profile.get("projects", []):
        if proj.get("description"):
            profile_text_parts.append(proj["description"])
        for ts in proj.get("techStack", []):
            profile_skills.add(ts.lower().strip())

    profile_text = " ".join(profile_text_parts).lower()

    # JD keywords
    jd_required = [s.lower().strip() for s in jd_keywords.get("required", [])]
    jd_preferred = [s.lower().strip() for s in jd_keywords.get("preferred", [])]
    jd_all = [s.lower().strip() for s in jd_keywords.get("allSkills", [])]

    # ─── Skill-based matching ────────────────────────────────────────────
    strong_matches = []
    partial_matches = []
    gaps = []

    for skill in jd_required:
        if skill in profile_skills or skill in profile_text:
            strong_matches.append(skill)
        elif _fuzzy_match(skill, profile_skills, profile_text):
            partial_matches.append(skill)
        else:
            gaps.append(skill)

    for skill in jd_preferred:
        if skill in jd_required:
            continue
        if skill in profile_skills or skill in profile_text:
            strong_matches.append(skill)
        elif _fuzzy_match(skill, profile_skills, profile_text):
            partial_matches.append(skill)
        # Preferred skills don't count as gaps

    # ─── Score calculation ───────────────────────────────────────────────
    total_required = len(jd_required) if jd_required else 1
    required_matched = sum(1 for s in jd_required if s in [m.lower() for m in strong_matches])
    required_partial = sum(1 for s in jd_required if s in [m.lower() for m in partial_matches])

    # Weighted: full match = 1.0, partial = 0.5
    skill_score = ((required_matched * 1.0 + required_partial * 0.5) / total_required) * 100

    # ─── TF-IDF similarity (bonus) ──────────────────────────────────────
    tfidf_score = 0
    if HAS_SKLEARN and profile_text and jd_all:
        try:
            jd_text = " ".join(jd_all)
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([profile_text, jd_text])
            sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            tfidf_score = sim * 100
        except Exception as e:
            logger.warning(f"TF-IDF scoring failed: {e}")

    # Combine: 70% skill match + 30% TF-IDF similarity
    final_score = int(min(100, max(0, skill_score * 0.7 + tfidf_score * 0.3)))

    # Capitalize for display
    strong_display = [s.title() for s in strong_matches]
    partial_display = [s.title() for s in partial_matches]
    gaps_display = [s.title() for s in gaps]

    result = {
        "score": final_score,
        "strong": strong_display,
        "partial": partial_display,
        "gaps": gaps_display,
        "breakdown": {
            "skillScore": round(skill_score, 1),
            "tfidfScore": round(tfidf_score, 1),
            "requiredTotal": total_required,
            "requiredMatched": required_matched,
        }
    }

    logger.info(f"Match score: {final_score} ({len(strong_matches)} strong, {len(partial_matches)} partial, {len(gaps)} gaps)")
    return result


def _fuzzy_match(skill: str, profile_skills: set, profile_text: str) -> bool:
    """Check for partial/fuzzy matches (e.g., 'react' matches 'reactjs')."""
    # Check substrings
    for ps in profile_skills:
        if skill in ps or ps in skill:
            return True
    # Check in full text
    if skill in profile_text:
        return True
    # Common aliases
    aliases = {
        "k8s": "kubernetes", "kubernetes": "k8s",
        "postgres": "postgresql", "postgresql": "postgres",
        "js": "javascript", "ts": "typescript",
        "nodejs": "node.js", "node.js": "nodejs",
        "nextjs": "next.js", "next.js": "nextjs",
        "react.js": "react", "reactjs": "react",
        "vue.js": "vue", "vuejs": "vue",
    }
    if skill in aliases:
        alt = aliases[skill]
        if alt in profile_skills or alt in profile_text:
            return True
    return False

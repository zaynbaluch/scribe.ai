"""
JD Parser — Extract keywords, skills, and metadata from job descriptions.
Uses TF-IDF + keyword matching. No LLM required.
"""
import re
from typing import Dict, List, Optional
from loguru import logger

# ─── Skill Taxonomy ──────────────────────────────────────────────────────────

SKILL_TAXONOMY = {
    # Languages
    "python": "language", "javascript": "language", "typescript": "language",
    "java": "language", "c++": "language", "c#": "language", "go": "language",
    "rust": "language", "ruby": "language", "php": "language", "swift": "language",
    "kotlin": "language", "scala": "language", "r": "language", "sql": "language",
    "html": "language", "css": "language", "bash": "language", "shell": "language",
    # Frameworks
    "react": "framework", "angular": "framework", "vue": "framework", "vue.js": "framework",
    "next.js": "framework", "nextjs": "framework", "express": "framework", "express.js": "framework",
    "django": "framework", "flask": "framework", "fastapi": "framework",
    "spring": "framework", "spring boot": "framework", "rails": "framework",
    "node.js": "framework", "nodejs": "framework", "nest.js": "framework",
    "svelte": "framework", "nuxt": "framework", ".net": "framework",
    "tailwind": "framework", "bootstrap": "framework",
    # Databases
    "postgresql": "database", "postgres": "database", "mysql": "database",
    "mongodb": "database", "redis": "database", "sqlite": "database",
    "dynamodb": "database", "cassandra": "database", "elasticsearch": "database",
    "supabase": "database", "firebase": "database",
    # Cloud / Infra
    "aws": "cloud", "azure": "cloud", "gcp": "cloud", "google cloud": "cloud",
    "docker": "tool", "kubernetes": "tool", "k8s": "tool",
    "terraform": "tool", "ansible": "tool", "jenkins": "tool",
    "ci/cd": "tool", "github actions": "tool", "gitlab ci": "tool",
    # Tools
    "git": "tool", "linux": "tool", "nginx": "tool", "graphql": "tool",
    "rest api": "tool", "restful": "tool", "grpc": "tool",
    "prisma": "tool", "drizzle": "tool", "typeorm": "tool", "sequelize": "tool",
    "webpack": "tool", "vite": "tool", "jest": "tool", "pytest": "tool",
    "figma": "tool", "jira": "tool", "confluence": "tool",
    # ML/AI
    "machine learning": "ml", "deep learning": "ml", "tensorflow": "ml",
    "pytorch": "ml", "scikit-learn": "ml", "pandas": "ml", "numpy": "ml",
    "nlp": "ml", "computer vision": "ml", "llm": "ml", "langchain": "ml",
    # Soft skills
    "leadership": "soft_skill", "communication": "soft_skill",
    "problem solving": "soft_skill", "teamwork": "soft_skill",
    "agile": "soft_skill", "scrum": "soft_skill", "mentoring": "soft_skill",
    "collaboration": "soft_skill", "time management": "soft_skill",
}

# ─── Requirement Indicators ─────────────────────────────────────────────────

REQUIRED_INDICATORS = [
    "required", "must have", "must-have", "essential", "minimum",
    "requirements:", "qualifications:", "you have", "you bring",
]
PREFERRED_INDICATORS = [
    "preferred", "nice to have", "nice-to-have", "bonus", "plus",
    "desirable", "advantageous", "ideally",
]


def parse_jd(text: str) -> Dict:
    """
    Parse a job description and extract structured data.
    Returns keywords, metadata, and classification.
    """
    if not text or not text.strip():
        return {"error": "Empty job description"}

    logger.info(f"Parsing JD ({len(text)} chars)")
    lower = text.lower()

    # ─── Extract Skills ──────────────────────────────────────────────────
    found_skills = {}
    for skill, category in SKILL_TAXONOMY.items():
        # Word boundary match to avoid false positives
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, lower):
            # Normalize skill name
            canonical = skill.replace(".", "").title()
            if canonical not in found_skills:
                found_skills[canonical] = category

    # ─── Classify Required vs Preferred ──────────────────────────────────
    required_skills = []
    preferred_skills = []

    # Split into sections by common headings
    sections = re.split(r'\n(?=\s*(?:requirements|qualifications|what you|responsibilities|preferred|nice|bonus))', lower)

    for section in sections:
        is_required = any(ind in section[:200] for ind in REQUIRED_INDICATORS)
        is_preferred = any(ind in section[:200] for ind in PREFERRED_INDICATORS)

        for skill in found_skills:
            skill_lower = skill.lower()
            if skill_lower in section:
                if is_preferred:
                    if skill not in preferred_skills:
                        preferred_skills.append(skill)
                elif is_required or not is_preferred:
                    if skill not in required_skills:
                        required_skills.append(skill)

    # Skills not in either list go to required by default
    all_classified = set(required_skills + preferred_skills)
    for skill in found_skills:
        if skill not in all_classified:
            required_skills.append(skill)

    # ─── Extract Metadata ────────────────────────────────────────────────
    title = _extract_title(text)
    company = _extract_company(text)
    location = _extract_location(text)
    experience_years = _extract_experience_years(text)

    # ─── Detect Tone ─────────────────────────────────────────────────────
    tone = _detect_tone(text)

    result = {
        "title": title,
        "company": company,
        "location": location,
        "experienceYears": experience_years,
        "tone": tone,
        "required": required_skills,
        "preferred": preferred_skills,
        "tools": [s for s, c in found_skills.items() if c == "tool"],
        "softSkills": [s for s, c in found_skills.items() if c == "soft_skill"],
        "allSkills": list(found_skills.keys()),
        "categories": {cat: [s for s, c in found_skills.items() if c == cat] for cat in set(found_skills.values())},
    }

    logger.info(f"Parsed JD: {len(found_skills)} skills found, {len(required_skills)} required, {len(preferred_skills)} preferred")
    return result


def _extract_title(text: str) -> Optional[str]:
    """Try to extract job title from the first few lines."""
    lines = text.strip().split('\n')
    for line in lines[:5]:
        line = line.strip()
        if 10 < len(line) < 100 and not line.startswith('http'):
            # Likely a title if it's short and at the top
            cleaned = re.sub(r'[^\w\s\-/,()]', '', line).strip()
            if cleaned and not any(w in cleaned.lower() for w in ['about', 'company', 'apply', 'posted']):
                return cleaned
    return None


def _extract_company(text: str) -> Optional[str]:
    """Try to extract company name."""
    patterns = [
        r'(?:at|@)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[\n,\-|])',
        r'(?:company|employer)[\s:]+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[\n,\-|])',
    ]
    for p in patterns:
        m = re.search(p, text)
        if m:
            return m.group(1).strip()
    return None


def _extract_location(text: str) -> Optional[str]:
    """Extract location mentions."""
    patterns = [
        r'(?:location|based in|office in)[\s:]+([A-Za-z\s,]+?)(?:\n|$)',
        r'\b(remote|hybrid|on-?site)\b',
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip() if m.lastindex else m.group(0).strip()
    return None


def _extract_experience_years(text: str) -> Optional[int]:
    """Extract years of experience requirement."""
    m = re.search(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)', text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def _detect_tone(text: str) -> str:
    """Simple tone classifier based on language patterns."""
    lower = text.lower()
    startup_words = ['startup', 'fast-paced', 'wear many hats', 'scrappy', 'hustle', 'disrupt', 'mission-driven']
    corporate_words = ['enterprise', 'fortune 500', 'compliance', 'stakeholder', 'governance', 'corporate']
    creative_words = ['creative', 'design-driven', 'portfolio', 'visual', 'brand', 'aesthetic']

    scores = {
        'startup': sum(1 for w in startup_words if w in lower),
        'corporate': sum(1 for w in corporate_words if w in lower),
        'creative': sum(1 for w in creative_words if w in lower),
    }

    best = max(scores, key=scores.get)
    return best if scores[best] >= 2 else 'formal'

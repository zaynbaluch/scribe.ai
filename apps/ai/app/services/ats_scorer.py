"""
ATS Scorer — Rule-based ATS compatibility checker.
Checks formatting, completeness, keyword density, and section standards.
No LLM required — pure rule engine.
"""
import re
from typing import Dict, List, Any, Optional
from loguru import logger


# ─── Standard ATS Section Names ─────────────────────────────────────────────

ATS_STANDARD_SECTIONS = {
    "summary", "professional summary", "objective", "profile",
    "experience", "work experience", "professional experience", "employment",
    "education", "academic background",
    "skills", "technical skills", "core competencies",
    "projects", "personal projects",
    "certifications", "certificates", "licenses",
    "publications", "research",
    "volunteer", "volunteer experience", "community involvement",
    "awards", "honors", "achievements",
}

# ─── Issue severity levels ──────────────────────────────────────────────────

CRITICAL = "critical"
WARNING = "warning"
INFO = "info"


def compute_ats_score(
    resume_data: Dict[str, Any],
    jd_keywords: Optional[Dict[str, Any]] = None,
) -> Dict:
    """
    Run all ATS checks and return a 0-100 score with an actionable report.
    
    Args:
        resume_data: The baseProfileSnapshot from the resume.
        jd_keywords: Optional parsed JD keywords for keyword density check.
    
    Returns:
        { score, issues, checks, summary }
    """
    logger.info("Running ATS score computation")

    issues: List[Dict] = []
    checks: List[Dict] = []

    # ─── 1. Contact Information ──────────────────────────────────────────
    contact_score, contact_issues = _check_contact_info(resume_data)
    issues.extend(contact_issues)
    checks.append({"name": "Contact Information", "score": contact_score, "maxScore": 15})

    # ─── 2. Section Completeness ─────────────────────────────────────────
    completeness_score, completeness_issues = _check_completeness(resume_data)
    issues.extend(completeness_issues)
    checks.append({"name": "Section Completeness", "score": completeness_score, "maxScore": 20})

    # ─── 3. Experience Quality ───────────────────────────────────────────
    exp_score, exp_issues = _check_experience_quality(resume_data)
    issues.extend(exp_issues)
    checks.append({"name": "Experience Quality", "score": exp_score, "maxScore": 20})

    # ─── 4. Skills Section ───────────────────────────────────────────────
    skills_score, skills_issues = _check_skills(resume_data)
    issues.extend(skills_issues)
    checks.append({"name": "Skills Section", "score": skills_score, "maxScore": 15})

    # ─── 5. Summary / Objective ──────────────────────────────────────────
    summary_score, summary_issues = _check_summary(resume_data)
    issues.extend(summary_issues)
    checks.append({"name": "Professional Summary", "score": summary_score, "maxScore": 10})

    # ─── 6. Education ────────────────────────────────────────────────────
    edu_score, edu_issues = _check_education(resume_data)
    issues.extend(edu_issues)
    checks.append({"name": "Education", "score": edu_score, "maxScore": 10})

    # ─── 7. Keyword Density (only if JD provided) ───────────────────────
    keyword_score = 0
    max_keyword = 10
    if jd_keywords and jd_keywords.get("required"):
        keyword_score, kw_issues = _check_keyword_density(resume_data, jd_keywords)
        issues.extend(kw_issues)
    else:
        keyword_score = max_keyword  # No JD = skip, full marks
    checks.append({"name": "Keyword Match", "score": keyword_score, "maxScore": max_keyword})

    # ─── Aggregate Score ─────────────────────────────────────────────────
    total_score = sum(c["score"] for c in checks)
    max_score = sum(c["maxScore"] for c in checks)
    final_score = int(round((total_score / max_score) * 100)) if max_score > 0 else 0

    critical_count = sum(1 for i in issues if i["severity"] == CRITICAL)
    warning_count = sum(1 for i in issues if i["severity"] == WARNING)

    result = {
        "score": final_score,
        "checks": checks,
        "issues": issues,
        "summary": {
            "critical": critical_count,
            "warnings": warning_count,
            "passed": len(checks) - critical_count,
        },
    }

    logger.info(f"ATS Score: {final_score}/100 ({critical_count} critical, {warning_count} warnings)")
    return result


# ─── Individual Check Functions ──────────────────────────────────────────────

def _check_contact_info(data: Dict) -> tuple:
    """Check for essential contact information."""
    score = 15
    issues = []

    if not data.get("phone"):
        issues.append({
            "severity": CRITICAL,
            "category": "Contact",
            "message": "Missing phone number",
            "fix": "Add a phone number to your profile.",
            "autoFixable": False,
        })
        score -= 5

    if not data.get("linkedinUrl") and not data.get("website"):
        issues.append({
            "severity": WARNING,
            "category": "Contact",
            "message": "No LinkedIn or website URL",
            "fix": "Add a LinkedIn profile or personal website link.",
            "autoFixable": False,
        })
        score -= 3

    if not data.get("location"):
        issues.append({
            "severity": WARNING,
            "category": "Contact",
            "message": "No location specified",
            "fix": "Add a city/region (e.g., 'San Francisco, CA' or 'Remote').",
            "autoFixable": False,
        })
        score -= 2

    # Name check (should exist from the user model, but let's be safe)
    if not data.get("name") and not data.get("headline"):
        issues.append({
            "severity": CRITICAL,
            "category": "Contact",
            "message": "Missing name or headline",
            "fix": "Ensure your name and professional headline are set in your profile.",
            "autoFixable": False,
        })
        score -= 5

    return max(0, score), issues


def _check_completeness(data: Dict) -> tuple:
    """Check if all essential sections have content."""
    score = 20
    issues = []

    experiences = data.get("experiences", [])
    education = data.get("education", [])
    skills = data.get("skills", [])

    if not experiences:
        issues.append({
            "severity": CRITICAL,
            "category": "Completeness",
            "message": "No work experience listed",
            "fix": "Add at least one work experience entry.",
            "autoFixable": False,
        })
        score -= 8

    if not education:
        issues.append({
            "severity": WARNING,
            "category": "Completeness",
            "message": "No education listed",
            "fix": "Add your educational background.",
            "autoFixable": False,
        })
        score -= 4

    if not skills:
        issues.append({
            "severity": CRITICAL,
            "category": "Completeness",
            "message": "No skills listed",
            "fix": "Add a skills section with relevant technical and soft skills.",
            "autoFixable": False,
        })
        score -= 6

    if not data.get("summary"):
        issues.append({
            "severity": WARNING,
            "category": "Completeness",
            "message": "No professional summary",
            "fix": "Add a 2-3 sentence professional summary at the top.",
            "autoFixable": False,
        })
        score -= 2

    return max(0, score), issues


def _check_experience_quality(data: Dict) -> tuple:
    """Check bullet point quality in experience entries."""
    score = 20
    issues = []
    experiences = data.get("experiences", [])

    if not experiences:
        return 0, []

    total_bullets = 0
    weak_bullets = 0
    action_verb_pattern = re.compile(
        r'^(Led|Developed|Built|Designed|Implemented|Created|Managed|Improved|'
        r'Increased|Reduced|Automated|Delivered|Launched|Optimized|Streamlined|'
        r'Achieved|Generated|Collaborated|Spearheaded|Orchestrated|Architected|'
        r'Established|Maintained|Monitored|Configured|Deployed|Integrated|'
        r'Analyzed|Conducted|Coordinated|Drove|Engineered|Executed|Facilitated|'
        r'Formulated|Guided|Initiated|Mentored|Negotiated|Oversaw|Pioneered|'
        r'Resolved|Revamped|Scaled|Secured|Simplified|Supervised|Transformed|'
        r'Upgraded|Utilized|Validated)',
        re.IGNORECASE
    )
    quantified_pattern = re.compile(r'\d+%|\d+x|\$[\d,]+|\d+ (users?|clients?|teams?|projects?|applications?)')

    for i, exp in enumerate(experiences):
        bullets = exp.get("bullets", [])
        if not bullets or len(bullets) == 0:
            issues.append({
                "severity": WARNING,
                "category": "Experience",
                "message": f"'{exp.get('title', 'Position')}' has no bullet points",
                "fix": "Add 3-5 bullet points describing your achievements.",
                "autoFixable": False,
            })
            score -= 3
            continue

        if len(bullets) < 2:
            issues.append({
                "severity": WARNING,
                "category": "Experience",
                "message": f"'{exp.get('title', 'Position')}' has only {len(bullets)} bullet(s)",
                "fix": "Add at least 3 bullet points per role.",
                "autoFixable": False,
            })
            score -= 2

        for bullet in bullets:
            if not bullet:
                continue
            total_bullets += 1
            if not action_verb_pattern.match(bullet.strip()):
                weak_bullets += 1

    # Check for quantified achievements
    all_bullets = [b for exp in experiences for b in exp.get("bullets", []) if b]
    quantified_count = sum(1 for b in all_bullets if quantified_pattern.search(b))

    if total_bullets > 0 and quantified_count == 0:
        issues.append({
            "severity": WARNING,
            "category": "Experience",
            "message": "No quantified achievements found",
            "fix": "Add metrics (%, $, numbers) to at least 2-3 bullets. E.g., 'Reduced load time by 40%'.",
            "autoFixable": False,
        })
        score -= 3

    if total_bullets > 0 and weak_bullets > total_bullets * 0.5:
        issues.append({
            "severity": INFO,
            "category": "Experience",
            "message": f"{weak_bullets}/{total_bullets} bullets don't start with strong action verbs",
            "fix": "Start each bullet with a strong action verb (Led, Built, Improved, etc.).",
            "autoFixable": False,
        })
        score -= 2

    return max(0, score), issues


def _check_skills(data: Dict) -> tuple:
    """Check skills section quality."""
    score = 15
    issues = []
    skills = data.get("skills", [])

    if not skills:
        return 0, [{"severity": CRITICAL, "category": "Skills", "message": "No skills listed", "fix": "Add skills.", "autoFixable": False}]

    if len(skills) < 5:
        issues.append({
            "severity": WARNING,
            "category": "Skills",
            "message": f"Only {len(skills)} skills listed",
            "fix": "ATS systems match on keywords. Add at least 8-10 relevant skills.",
            "autoFixable": False,
        })
        score -= 4

    # Check for categorization
    categories = set(s.get("category", "") for s in skills)
    if len(categories) <= 1:
        issues.append({
            "severity": INFO,
            "category": "Skills",
            "message": "Skills are not categorized",
            "fix": "Group skills by category (Languages, Frameworks, Tools, etc.) for better ATS parsing.",
            "autoFixable": False,
        })
        score -= 2

    return max(0, score), issues


def _check_summary(data: Dict) -> tuple:
    """Check professional summary quality."""
    score = 10
    issues = []
    summary = data.get("summary", "")

    if not summary:
        return 0, [{"severity": WARNING, "category": "Summary", "message": "No summary", "fix": "Add a 2-3 sentence professional summary.", "autoFixable": False}]

    word_count = len(summary.split())
    if word_count < 15:
        issues.append({
            "severity": WARNING,
            "category": "Summary",
            "message": f"Summary is too short ({word_count} words)",
            "fix": "Expand your summary to 30-50 words for better ATS performance.",
            "autoFixable": False,
        })
        score -= 3

    if word_count > 100:
        issues.append({
            "severity": INFO,
            "category": "Summary",
            "message": f"Summary is quite long ({word_count} words)",
            "fix": "Keep your summary concise (30-60 words) for readability.",
            "autoFixable": False,
        })
        score -= 2

    return max(0, score), issues


def _check_education(data: Dict) -> tuple:
    """Check education section."""
    score = 10
    issues = []
    education = data.get("education", [])

    if not education:
        return 3, [{"severity": WARNING, "category": "Education", "message": "No education listed", "fix": "Add your educational background.", "autoFixable": False}]

    for edu in education:
        if not edu.get("degree"):
            issues.append({
                "severity": WARNING,
                "category": "Education",
                "message": f"Missing degree for '{edu.get('school', 'institution')}'",
                "fix": "Specify the degree type (e.g., BS, MS, PhD).",
                "autoFixable": False,
            })
            score -= 2

        if not edu.get("startDate") and not edu.get("endDate"):
            issues.append({
                "severity": INFO,
                "category": "Education",
                "message": f"No dates for '{edu.get('school', 'institution')}'",
                "fix": "Add graduation or attendance dates.",
                "autoFixable": False,
            })
            score -= 1

    return max(0, score), issues


def _check_keyword_density(data: Dict, jd_keywords: Dict) -> tuple:
    """Check how many JD keywords appear in the resume."""
    score = 10
    issues = []

    required = [k.lower() for k in jd_keywords.get("required", [])]
    if not required:
        return score, []

    # Build full resume text
    text_parts = [data.get("summary", "")]
    for exp in data.get("experiences", []):
        text_parts.append(exp.get("title", ""))
        text_parts.extend(exp.get("bullets", []))
    for proj in data.get("projects", []):
        text_parts.append(proj.get("description", ""))
        text_parts.extend(proj.get("techStack", []))
    for skill in data.get("skills", []):
        text_parts.append(skill.get("name", ""))

    resume_text = " ".join(str(p) for p in text_parts if p).lower()

    matched = [k for k in required if k in resume_text]
    missing = [k for k in required if k not in resume_text]
    ratio = len(matched) / len(required) if required else 1

    if ratio < 0.5:
        issues.append({
            "severity": CRITICAL,
            "category": "Keywords",
            "message": f"Only {len(matched)}/{len(required)} required keywords found",
            "fix": f"Missing: {', '.join(k.title() for k in missing[:8])}. Add these to your skills or experience.",
            "autoFixable": False,
        })
        score = int(ratio * 10)
    elif ratio < 0.8:
        issues.append({
            "severity": WARNING,
            "category": "Keywords",
            "message": f"{len(matched)}/{len(required)} required keywords matched",
            "fix": f"Consider adding: {', '.join(k.title() for k in missing[:5])}.",
            "autoFixable": False,
        })
        score = int(ratio * 10)

    return max(0, score), issues

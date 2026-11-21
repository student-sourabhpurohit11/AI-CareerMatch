import re
import json
from typing import List, Dict, Any


# ─── Helper patterns ───────────────────────────────────────────────────────────

YEAR_PATTERN = re.compile(r"\b(20[0-2]\d|19[89]\d)\b")
GPA_PATTERN = re.compile(
    r"(?i)(cgpa|gpa|percentage|marks|score)[^\d]{0,10}(\d{1,2}\.?\d{0,2})\s*(?:/\s*(?:10|4|100))?|"
    r"\b([7-9]\.\d{1,2}|10\.0{1,2})\s*/\s*(10|4)\b|"
    r"\b(8[0-9]|9[0-9]|100)\s*%"
)
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_PATTERN = re.compile(r"(\+?\d[\d\s\-().]{7,15}\d)")
LINKEDIN_PATTERN = re.compile(r"(?i)(linkedin\.com/in/[\w\-]+|linkedin\.com/pub/[\w\-]+)")
GITHUB_PATTERN = re.compile(r"(?i)(github\.com/[\w\-]+)")
PORTFOLIO_PATTERN = re.compile(r"(?i)(https?://[^\s]{5,}|netlify\.app|vercel\.app|pages\.dev|herokuapp\.com)")
METRICS_PATTERN = re.compile(
    r"\b(\d[\d,]*\.?\d*\s*(?:%|k|K|M|ms|sec|seconds?|users?|requests?|queries?|records?|fps|mb|gb|lpa|cr|lakhs?))\b"
)
GITHUB_PROJECT_LINK = re.compile(r"(?i)github\.com/[\w\-]+/[\w\-]+")
DATE_RANGE_PATTERN = re.compile(
    r"(?i)(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*\s*\d{4}\s*[-–—to]+\s*"
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*\s*\d{4}|"
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z.]*\s*\d{4}\s*[-–—to]+\s*(?:present|current|now)"
)
INTERNSHIP_PATTERN = re.compile(
    r"(?i)\b(intern(?:ship)?|trainee|apprentice|co-op|graduate\s+trainee)\b"
)
JOB_TITLE_PATTERN = re.compile(
    r"(?i)\b(software\s+engineer|developer|programmer|analyst|architect|consultant|"
    r"data\s+scientist|ml\s+engineer|devops|sre|researcher|lead|manager)\b"
)
DEGREE_PATTERN = re.compile(
    r"(?i)\b(b\.?\s*tech|b\.?\s*e\.?|b\.?\s*sc|b\.?\s*s\.?|bachelor|m\.?\s*tech|"
    r"m\.?\s*sc|m\.?\s*s\.?|master|mba|phd|diploma|b\.?\s*c\.?\s*a|m\.?\s*c\.?\s*a)\b"
)
INSTITUTION_PATTERN = re.compile(
    r"(?i)\b(iit|nit|bits|iiit|institute|university|college|school|academy)\b"
)
CERTIFICATION_KEYWORDS = re.compile(
    r"(?i)\b(aws|azure|gcp|google|coursera|udemy|nptel|hackerrank|leetcode|"
    r"certified|certification|certificate|credential|badge)\b"
)


def _count_project_entries(projects_text: str) -> int:
    """Count distinct project blocks by looking for capitalized project name lines or bullet groups."""
    if not projects_text.strip():
        return 0
    # Count lines that look like project titles (short, start capital, not all lowercase)
    title_lines = [
        l for l in projects_text.split("\n")
        if l.strip() and len(l.strip()) < 80 and len(l.strip()) > 5
        and (l.strip()[0].isupper() or l.strip().startswith("-"))
        and not l.strip().lower().startswith(("technologies", "tech stack", "tools", "built", "used", "implemented"))
    ]
    # Rough heuristic: every 4-6 lines = 1 project block
    block_estimate = max(1, len(projects_text.strip().split("\n")) // 5)
    return min(len(title_lines), block_estimate + 2)


def _extract_experience_months(experience_text: str, full_text: str) -> int:
    """Calculate total months of experience from date ranges in text."""
    months_map = {
        "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
        "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
    }
    combined = experience_text + " " + full_text
    ranges = DATE_RANGE_PATTERN.findall(combined)
    total_months = 0
    for r in ranges:
        r_str = r if isinstance(r, str) else r[0] if r else ""
        years = YEAR_PATTERN.findall(r_str)
        if len(years) >= 2:
            total_months += max(0, (int(years[1]) - int(years[0])) * 12)
        elif len(years) == 1 and re.search(r"(?i)present|current|now", r_str):
            # Assume "present" = 2024
            total_months += max(0, (2026 - int(years[0])) * 12)
    return total_months


def analyze_resume_sections(
    sections: Dict[str, str],
    extracted_skills: List[Dict[str, Any]],
    raw_text: str
) -> Dict[str, Any]:
    """
    Deeply analyzes resume text across 7 dimensions to produce a realistic,
    explainable multi-factor score (0–100) with specific, evidence-based feedback.
    """
    strengths = []
    improvements = []
    full_text_lower = raw_text.lower()
    projects_text = sections.get("projects", "")
    experience_text = sections.get("experience", "")
    education_text = sections.get("education", "")
    skills_text = sections.get("skills", "")
    cert_text = sections.get("certifications", "")

    # ── 1. TECHNICAL SKILLS (Weight: 32%) ────────────────────────────────────
    skill_count = len(extracted_skills)
    categories = set(s.get("category", "") for s in extracted_skills)
    cat_count = len(categories)

    has_cloud = any(
        s.get("category") in ("cloud", "devops") or
        s.get("normalized_name", "").lower() in ("docker", "aws", "kubernetes", "linux", "gcp", "azure", "ci/cd")
        for s in extracted_skills
    )
    has_db = any(s.get("category") == "database" for s in extracted_skills)
    has_frameworks = any(s.get("category") == "framework" for s in extracted_skills)
    has_ml = any(
        s.get("category") == "ml_ai" or
        s.get("normalized_name", "").lower() in ("tensorflow", "pytorch", "scikit-learn", "numpy", "pandas", "spacy")
        for s in extracted_skills
    )

    if skill_count >= 15:
        skills_score = 97.0
        strengths.append(f"Exceptional technical breadth — {skill_count} verified skills spanning {cat_count} domains (languages, frameworks, databases, cloud)")
    elif skill_count >= 10:
        skills_score = 88.0
        strengths.append(f"Strong multi-stack competency: {skill_count} skills across {cat_count} technology categories")
    elif skill_count >= 6:
        skills_score = 75.0
        strengths.append(f"Solid core technical foundation with {skill_count} recognized technologies")
        improvements.append("Broaden your skill set by adding at least 3–4 more tools: a cloud platform (AWS/GCP), a container tool (Docker), and a testing framework")
    elif skill_count >= 3:
        skills_score = 58.0
        improvements.append(f"Only {skill_count} skills detected from the taxonomy. Explicitly list all tools, languages, and frameworks in a dedicated 'Technical Skills' section")
    elif skill_count >= 1:
        skills_score = 42.0
        improvements.append("Very few technical keywords detected. Add a comprehensive Skills section: programming languages, frameworks, databases, and cloud tools")
    else:
        skills_score = 22.0
        improvements.append("No controlled technical skills matched. Ensure your resume has a 'Skills' section with explicit technology names like Python, React, MySQL, Docker")

    if has_cloud:
        strengths.append("Cloud/DevOps proficiency present (Docker, AWS, GCP, Kubernetes, or CI/CD pipeline skills)")
    elif skill_count >= 3:
        improvements.append("Add cloud/DevOps skills (Docker, AWS Free Tier, GitHub Actions CI/CD) — these appear in 80%+ of modern tech job requirements")

    if has_db:
        strengths.append("Database expertise identified (SQL/NoSQL) — critical for backend and full-stack roles")
    elif skill_count >= 3:
        improvements.append("No database skills detected. Add MySQL, PostgreSQL, MongoDB, or Redis to show data layer competency")

    if has_ml:
        strengths.append("Machine Learning/AI stack present (TensorFlow, PyTorch, scikit-learn, spaCy, or Pandas)")

    if cat_count >= 4:
        strengths.append(f"Diverse polyglot profile spanning {cat_count} distinct tech categories — signals full-stack versatility")

    # ── 2. PROJECTS (Weight: 26%) ─────────────────────────────────────────────
    proj_len = len(projects_text.strip())
    num_projects = _count_project_entries(projects_text)
    has_project_links = bool(GITHUB_PROJECT_LINK.search(raw_text))
    has_live_links = bool(PORTFOLIO_PATTERN.search(raw_text))
    has_metrics = bool(METRICS_PATTERN.search(projects_text + " " + experience_text))
    has_tech_stack_per_project = bool(re.search(r"(?i)(tech(?:nologies|nology|[ ]stack)?|built\s+with|tools?\s*:|stack\s*:)", projects_text))

    if proj_len > 600:
        project_score = 88.0
        strengths.append(f"Rich project portfolio with {num_projects}+ substantial projects described in depth")
    elif proj_len > 300:
        project_score = 78.0
        strengths.append(f"Well-documented projects section with meaningful technical descriptions")
        improvements.append("Expand project descriptions to 3–5 bullet points each, covering: problem solved, technology used, and measurable outcome")
    elif proj_len > 80:
        project_score = 62.0
        improvements.append("Project descriptions are brief. Add: what problem each project solves, the full tech stack used, and any performance or user metrics")
    else:
        project_score = 38.0
        improvements.append("No substantial project section found. Add 2–3 projects (personal, academic, or open-source) with descriptions, GitHub links, and tech stacks")

    if has_project_links:
        project_score = min(100.0, project_score + 8.0)
        strengths.append("GitHub project repository links included — demonstrates open-source code visibility to recruiters")
    elif proj_len > 80:
        improvements.append("Add GitHub repository URLs to each project (e.g. github.com/yourname/project-name) for recruiter code review")

    if has_live_links:
        project_score = min(100.0, project_score + 5.0)
        strengths.append("Live deployment links found (Netlify/Vercel/Heroku) — shows ability to ship production-ready software")

    if has_metrics:
        project_score = min(100.0, project_score + 7.0)
        strengths.append("Quantified engineering outcomes (e.g. 40% faster, 500+ users, 200ms latency) — measurable impact stands out to hiring managers")
    elif proj_len > 80:
        improvements.append("Add measurable outcomes to project bullets: e.g. 'reduced API response time by 35%', 'served 500+ active users', 'processed 10K records/min'")

    if has_tech_stack_per_project:
        strengths.append("Per-project technology stacks explicitly listed — makes it easy for ATS systems and recruiters to match skills")

    # ── 3. EXPERIENCE (Weight: 20%) ───────────────────────────────────────────
    exp_len = len(experience_text.strip())
    has_internship = bool(INTERNSHIP_PATTERN.search(raw_text))
    has_job_title = bool(JOB_TITLE_PATTERN.search(experience_text + " " + raw_text))
    total_exp_months = _extract_experience_months(experience_text, raw_text)
    has_action_verbs = bool(re.search(
        r"(?i)\b(developed|built|designed|implemented|architected|led|optimized|"
        r"deployed|created|engineered|reduced|improved|automated|integrated|delivered|"
        r"collaborated|mentored|managed|scaled|refactored)\b",
        experience_text
    ))

    if total_exp_months >= 18:
        experience_score = 90.0
        strengths.append(f"Substantial professional experience ({total_exp_months // 12}y {total_exp_months % 12}m) across roles — signals reliability and production-level exposure")
    elif total_exp_months >= 6:
        experience_score = 78.0
        strengths.append(f"Meaningful work experience (~{total_exp_months} months) including internship or part-time role")
    elif has_internship or has_job_title:
        experience_score = 65.0
        strengths.append("Industry internship or trainee experience present — demonstrates real-world team collaboration")
        improvements.append("Expand each experience entry with 3–4 bullet points using action verbs (e.g. 'Developed a REST API that reduced data fetch time by 40%')")
    elif exp_len > 50:
        experience_score = 52.0
        improvements.append("Experience section present but lacks industry context. Add company name, role, duration (Month Year – Month Year), and specific contributions")
    else:
        experience_score = 38.0
        improvements.append("No industry experience detected. Add any internships, freelance, or open-source contribution roles — even part-time roles strengthen the profile")

    if has_action_verbs and exp_len > 50:
        experience_score = min(100.0, experience_score + 8.0)
        strengths.append("Experience section uses strong action verbs (developed, optimized, deployed) — improves ATS parsing and recruiter readability")
    elif exp_len > 50:
        improvements.append("Use strong action verbs to start experience bullets: 'Engineered', 'Deployed', 'Optimized', 'Automated', 'Reduced', 'Led'")

    if has_metrics and exp_len > 50:
        experience_score = min(100.0, experience_score + 5.0)

    # ── 4. EDUCATION (Weight: 10%) ────────────────────────────────────────────
    has_degree = bool(DEGREE_PATTERN.search(education_text + " " + raw_text))
    has_institution = bool(INSTITUTION_PATTERN.search(education_text + " " + raw_text))
    gpa_match = GPA_PATTERN.search(education_text + " " + raw_text)
    has_gpa = bool(gpa_match)
    edu_years = YEAR_PATTERN.findall(education_text)
    has_edu_year = len(edu_years) >= 1

    if has_degree and has_institution:
        education_score = 92.0
        strengths.append("Formal engineering degree from a recognized institution clearly stated")
    elif has_degree or has_institution:
        education_score = 80.0
        improvements.append("Include both your degree name (e.g. B.Tech Computer Science) AND the full institution name, with graduation year")
    elif len(education_text.strip()) > 20:
        education_score = 65.0
        improvements.append("Education section detected but lacks degree title or institution name — make both explicit")
    else:
        education_score = 50.0
        improvements.append("No education section found. Add degree name, institution, graduation year (expected or actual), and CGPA/percentage")

    if has_gpa:
        education_score = min(100.0, education_score + 6.0)
        strengths.append("Academic GPA/CGPA/percentage included — provides recruiters quantifiable performance signal")
    else:
        improvements.append("Add your CGPA or percentage (e.g. 'CGPA: 8.4/10') to your education entry — commonly required by campus placement teams")

    if has_edu_year:
        education_score = min(100.0, education_score + 2.0)

    # ── 5. COMPLETENESS & STRUCTURE (Weight: 7%) ─────────────────────────────
    has_contact = bool(EMAIL_PATTERN.search(raw_text))
    has_phone = bool(PHONE_PATTERN.search(raw_text))
    has_linkedin = bool(LINKEDIN_PATTERN.search(raw_text))
    has_github_profile = bool(GITHUB_PATTERN.search(raw_text))
    has_certifications = bool(CERTIFICATION_KEYWORDS.search(cert_text + " " + raw_text))
    word_count = len(raw_text.split())

    structure_checks = [
        has_contact, has_phone, len(education_text.strip()) > 20,
        len(experience_text.strip()) > 20 or has_internship,
        len(projects_text.strip()) > 20, skill_count > 0
    ]
    filled = sum(structure_checks)
    completeness_score = round((filled / len(structure_checks)) * 100, 1)

    if has_linkedin:
        completeness_score = min(100.0, completeness_score + 5.0)
        strengths.append("LinkedIn profile URL included — a professional presence signal for recruiters")
    else:
        improvements.append("Add your LinkedIn profile URL (linkedin.com/in/yourname) — 95% of recruiters verify LinkedIn before interview")

    if has_github_profile:
        completeness_score = min(100.0, completeness_score + 5.0)
        strengths.append("GitHub profile URL present — recruiters can directly verify code quality and contribution activity")
    else:
        improvements.append("Include your GitHub profile link (github.com/yourname) — essential for software engineering roles")

    if has_certifications:
        completeness_score = min(100.0, completeness_score + 5.0)
        strengths.append("Professional certifications or platform credentials listed (e.g. AWS, Coursera, NPTEL, HackerRank)")

    if word_count > 350:
        strengths.append(f"Well-detailed resume (~{word_count} words) — sufficient content depth for ATS parsing and recruiter evaluation")
    elif word_count < 150:
        improvements.append(f"Resume is too sparse (~{word_count} words). Aim for 400–600 words total. Expand project descriptions and experience bullets")

    # ── 6. LANGUAGE & PRESENTATION (Weight: 5%) ──────────────────────────────
    # Check for passive/weak language vs active engineering language
    passive_count = len(re.findall(r"(?i)\b(responsible for|helped with|assisted in|worked on|was involved)\b", raw_text))
    active_verb_count = len(re.findall(
        r"(?i)\b(developed|built|designed|engineered|deployed|optimized|reduced|improved|"
        r"automated|integrated|created|led|architected|refactored|implemented|delivered|scaled)\b",
        raw_text
    ))

    if active_verb_count >= 8:
        presentation_score = 90.0
        strengths.append(f"Strong, active voice throughout with {active_verb_count} engineering action verbs — demonstrates initiative and ownership")
    elif active_verb_count >= 4:
        presentation_score = 75.0
    elif passive_count > 2:
        presentation_score = 55.0
        improvements.append("Replace weak phrases like 'responsible for' or 'worked on' with strong action verbs: 'Engineered', 'Delivered', 'Automated', 'Optimized'")
    else:
        presentation_score = 65.0

    # Check for consistent date formatting
    if DATE_RANGE_PATTERN.search(raw_text):
        presentation_score = min(100.0, presentation_score + 5.0)
        strengths.append("Consistent date ranges (Month Year – Month Year) present for experience/projects — improves timeline clarity")

    # ── 7. WEIGHTED OVERALL SCORE ─────────────────────────────────────────────
    # Weights: Skills 32%, Projects 26%, Experience 20%, Education 10%, Completeness 7%, Presentation 5%
    overall_score = round(
        (0.32 * skills_score) +
        (0.26 * project_score) +
        (0.20 * experience_score) +
        (0.10 * education_score) +
        (0.07 * completeness_score) +
        (0.05 * presentation_score),
        1
    )

    # ── Build dynamic, specific AI summary ───────────────────────────────────
    skill_names_str = ", ".join(s["name"] for s in extracted_skills[:5]) if extracted_skills else "none detected"
    top_missing = []
    if not has_cloud:
        top_missing.append("cloud/DevOps skills")
    if not has_db:
        top_missing.append("database competencies")
    if not has_github_profile:
        top_missing.append("GitHub profile link")
    if not has_metrics:
        top_missing.append("quantified impact metrics")

    missing_str = " and ".join(top_missing[:2]) if top_missing else "presentation polish"

    if overall_score >= 82:
        summary = (
            f"Competitive profile scoring {overall_score}/100. {skill_count} verified skills detected including "
            f"{skill_names_str}. Profile demonstrates strong technical depth across {cat_count} domains. "
            f"{'Internship/professional experience further strengthens candidacy. ' if has_internship or total_exp_months > 0 else ''}"
            f"Key enhancement areas: {missing_str} — addressing these will push the score above 90 and maximize shortlisting probability."
        )
    elif overall_score >= 65:
        summary = (
            f"Moderate readiness score of {overall_score}/100. {skill_count} skills detected: {skill_names_str}. "
            f"Core technical foundation is present, but profile needs strengthening in: {missing_str}. "
            f"Adding GitHub links, quantified metrics, and cloud skills will significantly improve market competitiveness "
            f"and ATS ranking across tech roles."
        )
    else:
        summary = (
            f"Profile score of {overall_score}/100 — developing stage. "
            f"{'Only ' + str(skill_count) + ' skills found in the taxonomy' if skill_count < 5 else str(skill_count) + ' skills detected'}. "
            f"Priority improvements: add a comprehensive Skills section, 2–3 detailed projects with GitHub links, "
            f"and your LinkedIn/GitHub profile URLs. These changes alone can raise the score by 20–30 points."
        )

    return {
        "overall_score": overall_score,
        "skills_score": round(skills_score, 1),
        "experience_score": round(experience_score, 1),
        "education_score": round(education_score, 1),
        "project_score": round(project_score, 1),
        "completeness_score": round(completeness_score, 1),
        "presentation_score": round(presentation_score, 1),
        "strengths_json": strengths[:7],
        "improvements_json": improvements[:7],
        "summary_text": summary,
        # Additional metadata for the frontend
        "word_count": word_count,
        "has_github": has_github_profile,
        "has_linkedin": has_linkedin,
        "has_metrics": has_metrics,
        "has_certifications": has_certifications,
        "experience_months": total_exp_months,
        "num_projects": max(num_projects, 1 if proj_len > 50 else 0),
    }

import re
from typing import List, Dict, Any


def analyze_resume_sections(
    sections: Dict[str, str],
    extracted_skills: List[Dict[str, Any]],
    raw_text: str
) -> Dict[str, Any]:
    """
    Computes an explainable, multi-dimensional resume score (0-100) with concrete
    strengths, improvement recommendations, and section-by-section health analysis
    evaluated directly against real document contents.
    """
    strengths = []
    improvements = []
    combined_body = f"{sections.get('projects', '')} {sections.get('experience', '')}".lower()

    # 1. Technical Skills Evaluation (0 - 100)
    skill_count = len(extracted_skills)
    categories = set(s.get("category") for s in extracted_skills)
    
    if skill_count >= 10:
        skills_score = 95.0
        strengths.append(f"Outstanding technical skill breadth ({skill_count} verified competencies identified across modern stacks)")
    elif skill_count >= 6:
        skills_score = 85.0
        strengths.append(f"Strong core technical skill coverage ({skill_count} relevant technologies detected)")
    elif skill_count >= 3:
        skills_score = 70.0
        improvements.append("Expand technical skill breadth by adding frameworks, databases, or cloud tools")
    elif skill_count >= 1:
        skills_score = 55.0
        improvements.append("Crucial: Specify programming languages, frameworks, and database technologies explicitly under a dedicated Skills section")
    else:
        skills_score = 30.0
        improvements.append("No controlled technical skills identified in document text. Add a clear 'Skills' section listing your languages and tools.")

    if len(categories) >= 3:
        strengths.append(f"Diverse tech stack spanning {len(categories)} domains (e.g. languages, databases, frameworks)")
    else:
        improvements.append("Diversify skill profile across back-end, database, and cloud technologies")

    # Check for cloud / containerization presence
    has_cloud = any(s.get("category") == "cloud" or s.get("name", "").lower() in ["docker", "aws", "kubernetes", "linux"] for s in extracted_skills)
    if has_cloud:
        strengths.append("Production & DevOps exposure identified (Docker, Cloud, or Linux competencies)")
    else:
        improvements.append("Add cloud compute and containerization credentials (e.g. Docker, AWS, CI/CD) to meet modern software engineering requirements")

    # 2. Projects Depth Evaluation (0 - 100)
    projects_text = sections.get("projects", "")
    has_repo_links = bool(re.search(r"(?i)(github\.com|gitlab\.com|bitbucket\.org|http[s]?://|live demo|demo link)", projects_text + " " + raw_text))
    has_metrics = bool(re.search(r"\b(\d+[\%kKmM\+]?|\d+\s*(?:users|requests|ms|seconds|fps|queries|records))\b", projects_text + " " + sections.get("experience", "")))
    
    if len(projects_text.strip()) > 250:
        project_score = 85.0
        strengths.append("Multiple distinct technical projects documented with detailed descriptions")
    elif len(projects_text.strip()) > 35:
        project_score = 75.0
        strengths.append("Project section present with technical implementations")
    else:
        project_score = 55.0
        improvements.append("Add 2-3 substantial software projects with descriptions of features and technologies")

    if has_repo_links:
        project_score = min(100.0, project_score + 10.0)
        strengths.append("Includes repository or live deployment links demonstrating open-source code visibility")
    else:
        improvements.append("Include active GitHub repository links or hosted demo URLs for your projects so recruiters can review source code")

    if has_metrics:
        project_score = min(100.0, project_score + 5.0)
        strengths.append("Quantified engineering outcomes (measurable performance, efficiency, or scale metrics)")
    else:
        improvements.append("Add measurable outcomes to project bullets (e.g. 'reduced latency by 35%', 'handled 500+ requests/sec')")

    # 3. Education Evaluation (0 - 100)
    edu_text = sections.get("education", "")
    has_degree = bool(re.search(r"(?i)\b(b\.?tech|b\.?e\.?|b\.?s\.?|bachelor|m\.?tech|m\.?s\.?|master|diploma|computer science|engineering|information technology)\b", edu_text))
    has_institution = bool(re.search(r"(?i)\b(institute|university|college|academy|school)\b", edu_text))
    has_year = bool(re.search(r"\b(20[12]\d)\b", edu_text))
    has_gpa = bool(re.search(r"(?i)\b(cgpa|gpa|percentage|\d+\.\d+\s*/\s*10|\d+\.\d+\s*/\s*4|\b[789]\.\d+)\b", edu_text))

    if has_degree or has_institution or len(edu_text.strip()) > 30:
        education_score = 90.0
        strengths.append("Clear educational background with university degree credentials")
    else:
        education_score = 65.0
        improvements.append("Specify degree title, college/university name, and graduation year clearly")

    if has_gpa:
        strengths.append("Academic GPA / CGPA metric provided in education section")

    # 4. Experience / Internship Evaluation (0 - 100)
    exp_text = sections.get("experience", "")
    action_verbs = ["developed", "engineered", "implemented", "designed", "optimized", "built", "architected", "deployed", "managed", "collaborated"]
    found_action_verbs = [v for v in action_verbs if re.search(rf"\b{v}\b", exp_text.lower())]

    if len(exp_text.strip()) > 180:
        experience_score = 85.0
        strengths.append(f"Documented professional or internship experience ({len(found_action_verbs)} action verbs detected)")
    elif len(exp_text.strip()) > 30:
        experience_score = 75.0
        strengths.append("Practical internship or work experience recorded")
        improvements.append("Expand experience bullets with concrete contributions and measurable business impacts")
    else:
        experience_score = 60.0
        improvements.append("Add practical internship, open-source contributions, or student technical society experience")

    # 5. Completeness & Structural Quality (0 - 100)
    standard_sections = ["contact", "skills", "projects", "education", "experience"]
    present_sections = [sec for sec in standard_sections if len(sections.get(sec, "").strip()) > 15]
    completeness_score = round(min(100.0, (len(present_sections) / len(standard_sections)) * 100.0), 1)

    if completeness_score >= 80.0:
        strengths.append(f"High structural completeness: {len(present_sections)}/5 core sections cleanly identified by NLP parser")
    else:
        missing_sec_names = [s.capitalize() for s in standard_sections if s not in present_sections]
        improvements.append(f"Ensure all standard resume sections are present. Missing or brief sections: {', '.join(missing_sec_names)}")

    # 6. Overall Weighted Score
    # Weights: 35% Skills, 25% Projects, 20% Experience, 10% Education, 10% Completeness
    overall_score = round(
        (0.35 * skills_score) +
        (0.25 * project_score) +
        (0.20 * experience_score) +
        (0.10 * education_score) +
        (0.10 * completeness_score),
        1
    )

    # Formulate real explainable summary
    if overall_score >= 80:
        summary = (
            f"Solid technical profile scoring {overall_score}/100. Identified {skill_count} verified competencies across {len(categories)} domains. "
            "Profile is competitive for junior and associate engineering roles; incorporating measurable performance metrics and cloud credentials will further maximize recruiter impact."
        )
    elif overall_score >= 65:
        summary = (
            f"Moderate profile readiness ({overall_score}/100) with {skill_count} verified skills. Good foundational knowledge, with immediate opportunities to document project outcomes, "
            "add live GitHub links, and acquire cloud/containerization exposure."
        )
    else:
        summary = (
            f"Profile score is {overall_score}/100. Recommended to expand technical competencies, add 2-3 substantial projects with source code repositories, and detail academic and practical implementations."
        )

    return {
        "overall_score": overall_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "project_score": project_score,
        "completeness_score": completeness_score,
        "strengths_json": strengths[:5],
        "improvements_json": improvements[:5],
        "summary_text": summary
    }

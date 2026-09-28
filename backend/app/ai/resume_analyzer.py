from typing import List, Dict, Any


def analyze_resume_sections(
    sections: Dict[str, str],
    extracted_skills: List[Dict[str, Any]],
    raw_text: str
) -> Dict[str, Any]:
    """
    Computes an explainable, multi-dimensional resume score (0-100) with concrete
    strengths, improvement recommendations, and section-by-section health analysis.
    """
    strengths = []
    improvements = []
    
    # 1. Technical Skills Evaluation (0 - 100)
    skill_count = len(extracted_skills)
    categories = set(s.get("category") for s in extracted_skills)
    
    if skill_count >= 10:
        skills_score = 95.0
        strengths.append(f"Outstanding technical skill breadth ({skill_count} verified competencies identified)")
    elif skill_count >= 6:
        skills_score = 85.0
        strengths.append(f"Strong core technical skill coverage ({skill_count} relevant technologies)")
    elif skill_count >= 3:
        skills_score = 70.0
        improvements.append("Expand technical skill breadth by adding frameworks, databases, or cloud tools")
    else:
        skills_score = 50.0
        improvements.append("Crucial: Specify programming languages, frameworks, and database technologies explicitly")

    if len(categories) >= 3:
        strengths.append("Diverse tech stack spanning multiple domains (languages, databases, frameworks)")
    else:
        improvements.append("Diversify skill profile across back-end, database, and cloud technologies")

    # 2. Projects Depth Evaluation (0 - 100)
    projects_text = sections.get("projects", "")
    if len(projects_text) > 300:
        project_score = 85.0
        strengths.append("Multiple distinct technical projects documented")
    elif len(projects_text) > 100:
        project_score = 75.0
        strengths.append("Project section present with technical descriptions")
        improvements.append("Include live project URLs (GitHub, demo links) and architectural stack details")
    else:
        project_score = 55.0
        improvements.append("Add 2-3 substantial software projects with descriptions of features and technologies")

    # 3. Education Evaluation (0 - 100)
    edu_text = sections.get("education", "")
    if len(edu_text) > 40:
        education_score = 90.0
        strengths.append("Clear educational background and university degree credentials")
    else:
        education_score = 65.0
        improvements.append("Specify degree title, college/university name, and graduation year")

    # 4. Experience / Internship Evaluation (0 - 100)
    exp_text = sections.get("experience", "")
    if len(exp_text) > 200:
        experience_score = 85.0
        strengths.append("Documented work or internship experience")
    elif len(exp_text) > 50:
        experience_score = 75.0
        improvements.append("Add measurable outcomes to experience bullets (e.g. 'improved performance by 20%')")
    else:
        experience_score = 60.0
        improvements.append("Add practical internship, open-source contributions, or freelance experience")

    # 5. Completeness & Structural Quality (0 - 100)
    present_sections = sum(1 for sec, content in sections.items() if sec != "other" and len(content) > 30)
    completeness_score = min(100.0, present_sections * 20.0)

    # 6. Overall Weighted Score
    # Weights: 35% Skills, 25% Projects, 20% Experience, 10% Education, 10% Completeness
    overall_score = round(
        (0.35 * skills_score) +
        (0.25 * project_score) +
        (0.20 * experience_score) +
        (0.10 * education_score) +
        (0.10 * completeness_score),
        2
    )

    # Formulate explainable summary
    if overall_score >= 80:
        summary = (
            f"Solid technical profile scoring {overall_score}/100. Strong coverage across {skill_count} key technologies. "
            "Profile is competitive for junior and associate engineering roles; incorporating measurable project metrics will further enhance impact."
        )
    elif overall_score >= 65:
        summary = (
            f"Moderate profile readiness ({overall_score}/100). Good baseline competencies, with opportunities to improve project outcome detail "
            "and expand cloud/containerization exposure."
        )
    else:
        summary = (
            f"Profile score is {overall_score}/100. Recommended to expand technical competencies, projects section, and practical implementations."
        )

    return {
        "overall_score": overall_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "project_score": project_score,
        "completeness_score": completeness_score,
        "strengths_json": strengths,
        "improvements_json": improvements,
        "summary_text": summary
    }

from typing import List, Dict, Any
import numpy as np
from sqlalchemy.orm import Session
from app.models.job import Job, JobSkill
from app.models.skill import Skill
from app.ai.embeddings import compute_embedding, compute_cosine_similarity


def calculate_job_match(
    candidate_skills: List[Dict[str, Any]],
    candidate_text: str,
    job: Job,
    db: Session,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Computes an explainable multi-factor job compatibility percentage:
    Final Score = (w_skill * Skill Score) + (w_semantic * Semantic Sim) + (w_exp * Exp Score) + (w_edu * Edu Score)
    """
    if weights is None:
        weights = {
            "explicit_skill": 0.60,
            "semantic_similarity": 0.25,
            "experience_relevance": 0.10,
            "education_relevance": 0.05
        }

    candidate_skill_ids = set(s["id"] for s in candidate_skills)
    candidate_skill_names = set(s["normalized_name"].lower() for s in candidate_skills)

    job_skills = db.query(JobSkill).filter(JobSkill.job_id == job.id).all()

    matched_skills = []
    missing_skills = []
    total_required_weight = 0.0
    matched_required_weight = 0.0

    for js in job_skills:
        skill = db.query(Skill).filter(Skill.id == js.skill_id).first()
        if not skill:
            continue
            
        weight = float(js.weight or 1.0)
        is_req = bool(js.is_required)

        if is_req:
            total_required_weight += weight

        if skill.id in candidate_skill_ids or skill.normalized_name.lower() in candidate_skill_names:
            matched_skills.append({
                "id": skill.id,
                "name": skill.name,
                "is_required": is_req
            })
            if is_req:
                matched_required_weight += weight
        else:
            missing_skills.append({
                "id": skill.id,
                "name": skill.name,
                "is_required": is_req
            })

    # Explicit skill score calculation
    if total_required_weight > 0:
        explicit_skill_score = (matched_required_weight / total_required_weight) * 100.0
    else:
        explicit_skill_score = 70.0

    # Semantic similarity using Sentence Transformer embeddings
    try:
        cand_embed = compute_embedding(candidate_text[:1500])
        job_embed = compute_embedding((job.title + " " + job.description)[:1500])
        semantic_sim = compute_cosine_similarity(cand_embed, job_embed) * 100.0
    except Exception:
        semantic_sim = explicit_skill_score  # Fallback

    # Experience relevance score (0-100)
    experience_score = 80.0  # College entry-level baseline

    # Education relevance score (0-100)
    education_score = 90.0

    final_score = round(
        (weights["explicit_skill"] * explicit_skill_score) +
        (weights["semantic_similarity"] * semantic_sim) +
        (weights["experience_relevance"] * experience_score) +
        (weights["education_relevance"] * education_score),
        1
    )
    final_score = max(10.0, min(99.0, final_score))

    # Explainable rationale generation
    required_missing = [m["name"] for m in missing_skills if m["is_required"]]
    if final_score >= 80:
        if len(required_missing) == 0:
            rationale = "Exceptional compatibility across all mandatory core skill requirements."
        else:
            missing_names = ", ".join(required_missing[:2])
            rationale = f"Strong alignment with primary technical requirements, with minor gap in: {missing_names}."
    elif final_score >= 65:
        missing_names = ", ".join([m["name"] for m in missing_skills][:2])
        rationale = f"Good foundational alignment, with competencies such as {missing_names} recommended to maximize fit."
    else:
        rationale = "Entry-level alignment; key mandatory technologies remain to be acquired."

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company_name": job.company.name if job.company else "Tech Partner",
        "location": job.location,
        "compatibility": final_score,
        "explicit_skill_score": round(explicit_skill_score, 1),
        "semantic_similarity": round(semantic_sim, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "rationale": rationale
    }

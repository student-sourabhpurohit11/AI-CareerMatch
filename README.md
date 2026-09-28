# AI-CareerMatch
### AI-Powered Cloud-Based Resume Analysis, Job Matching, and Career Recommendation System

AI-CareerMatch is an intelligent, explainable career platform built for engineering students and job seekers. It leverages Natural Language Processing (NLP), semantic vector embeddings, and an explainable scoring engine to parse resumes, match candidates with live job requisitions, diagnose skill gaps, and provide actionable career pathways.

---

## 🌟 Key Features
- **Intelligent Resume Parsing:** Automated text extraction from PDF and DOCX files with section identification and candidate profiling.
- **Explainable Resume Scoring:** Multi-factor resume quality scoring (0-100) assessing skill breadth, projects, experience, and completeness.
- **Explainable Job Matching:** Hybrid matching engine combining explicit skill overlap, semantic embedding similarity (Sentence Transformers), experience relevance, and education alignment.
- **Skill-Gap Analysis:** Identifies missing required vs. preferred competencies with priority scoring (High/Medium/Low).
- **Career & Project Recommendations:** Targeted role suggestions with personalized project and course recommendations to bridge identified gaps.
- **Application Tracking:** Comprehensive job tracking pipeline (Saved, Applied, Interview, Selected, Rejected).
- **Admin Management Portal:** Administrative oversight for users, roles, jobs, companies, skills taxonomy, and analytical dashboards.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18+, Vite, Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | MySQL 8.x |
| **AI / NLP** | spaCy, Sentence-Transformers (`all-MiniLM-L6-v2`), scikit-learn, PyMuPDF, python-docx |
| **Authentication** | OAuth2 with JWT (JSON Web Tokens) & Passlib (Bcrypt) |
| **Cloud (Target)** | AWS (EC2, RDS MySQL, S3, CloudFront, CloudWatch) |

---

## 📁 Repository Structure
```
AI-CareerMatch/
├── frontend/             # React + Tailwind CSS client application
├── backend/              # FastAPI application & AI/NLP pipelines
│   └── app/
│       ├── api/          # REST route handlers
│       ├── models/       # SQLAlchemy ORM models
│       ├── schemas/      # Pydantic schemas (request/response validation)
│       ├── services/     # Business logic & authentication
│       ├── ai/           # Resume parser, NLP extractor, matcher, recommender
│       ├── database/     # DB engine, session factory, base models
│       └── core/         # Settings, JWT security, configuration
├── database/             # schema.sql, seed.sql, migrations
├── deployment/           # Docker and AWS CloudFormation / scripts
├── docs/                 # Architecture diagrams, API specs, viva prep
├── tests/                # Unit, integration, and security test suites
├── uploads/              # Local storage for uploaded candidate resumes
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

Detailed phase-by-phase instructions are documented as each module is built.

### Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- MySQL Server 8.x
- Git & CMake

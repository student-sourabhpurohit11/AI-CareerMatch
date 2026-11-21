# AI-CareerMatch
### AI-Powered Cloud-Based Resume Analysis, Job Matching, and Career Recommendation System


[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Project Overview

**AI-CareerMatch** is an explainable, production-ready career platform that analyzes resumes, computes hybrid semantic job compatibility scores, diagnoses prioritized skill gaps, and recommends targeted educational pathways.

Unlike traditional opaque "black-box" systems, AI-CareerMatch transparently details **why** a candidate is matched to a role, highlights missing required competencies with priority ratings (High, Medium, Low), and provides direct links to verified free courses to bridge identified gaps.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | MySQL 8.x (InnoDB, utf8mb4) |
| **AI / NLP** | spaCy (`en_core_web_sm`), Sentence-Transformers (`all-MiniLM-L6-v2`), scikit-learn |
| **Document Parsers** | PyMuPDF (PDF extraction), python-docx (DOCX extraction) |
| **Authentication** | OAuth2 Bearer JWT (JSON Web Tokens), Passlib (Bcrypt hashing) |
| **Testing** | pytest, HTTPX, Starlette TestClient (9/9 automated tests passing) |
| **Deployment** | Docker, Docker Compose, AWS (EC2, RDS MySQL, S3, CloudFront) |

---

## 🚀 Quick Start Guide (macOS Local Execution)

### 1. Database Setup (MySQL)
Ensure your local MySQL service is running via Homebrew:
```bash
brew services start mysql
```
Initialize the schema and seed data:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend Setup (FastAPI)
Navigate to the backend directory, activate the Python 3.12 virtual environment, and launch the server:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup (React 18 + Vite)
In a new terminal window:
```bash
cd frontend
npm run dev
```
Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🎓 Demo Accounts for Viva Evaluation

| Account Type | Email | Password | Role & Purpose |
| :--- | :--- | :--- | :--- |
| **Student Demo** | `student.test.unit@example.com` | `SecureStudentPass123` | Upload resumes, explore matches, track applications |
| **Admin Demo** | `admin@aicareermatch.com` | `Admin@123` | System metrics, company management, job postings |

*(Both accounts are pre-configured with 1-click quick-fill buttons on the login page).*

---

## 🧪 Automated Testing

Execute the comprehensive test suite verifying authentication, PDF/DOCX parsing, NLP extraction, explainable scoring, and job matching:
```bash
backend/.venv/bin/pytest tests/ -v
```
**Results: 9 / 9 Tests Passing (100% Success Rate).**

---

## 🐳 Docker Deployment

To run the entire system (FastAPI + React + MySQL 8) in isolated containers:
```bash
docker compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Cloud Architecture & Academic Report

- **AWS Cloud Deployment Blueprint:** Detailed in [deployment/aws/architecture.md](deployment/aws/architecture.md)
- **B.Tech Major Project Viva Report (31 Sections):** Comprehensive documentation in [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md)

# AI-CareerMatch — AWS Cloud Architecture & Deployment Guide

This document defines the production cloud architecture for deploying the **AI-CareerMatch** application to Amazon Web Services (AWS) in alignment with industry standards and B.Tech CSE project evaluation criteria.

---

## 1. Cloud Architecture Overview

```
                          [ Internet Users / Students / Admin ]
                                           │
                                           │ (HTTPS : 443)
                                           ▼
                              [ Amazon CloudFront CDN ]
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             (Static Assets)                                 (REST API /api)
                    ▼                                             ▼
       [ Amazon S3 (Public Bucket) ]                 [ Application Load Balancer ]
       - React 18 Production Bundle                               │
       - HTML / JS / CSS / Assets                                 │
                                                                  ▼
                                                      [ Amazon EC2 Instance ]
                                                      - Ubuntu 22.04 LTS
                                                      - FastAPI Application
                                                      - SentenceTransformers Engine
                                                      - spaCy NLP Pipeline
                                                      - Nginx + Gunicorn/Uvicorn
                                                                  │
                                      ┌───────────────────────────┴───────────────────────────┐
                                      ▼                                                       ▼
                          [ Amazon RDS for MySQL ]                                [ Amazon S3 (Private Bucket) ]
                          - MySQL 8.x Engine                                      - Resumes (PDF / DOCX)
                          - Multi-AZ Deployment                                   - Server-Side Encryption (SSE-S3)
                          - Automated Backups                                     - IAM Pre-Signed URL Access
                                      │                                                       │
                                      └───────────────────────────┬───────────────────────────┘
                                                                  ▼
                                                      [ Amazon CloudWatch ]
                                                      - Application & Access Logs
                                                      - EC2 CPU & RAM Alarms
```

---

## 2. Component Specifications

### 2.1 Frontend Hosting: Amazon S3 + Amazon CloudFront
- **Amazon S3**: Houses the compiled production React bundle (`frontend/dist/`). Configured as a private bucket with CloudFront Origin Access Control (OAC).
- **Amazon CloudFront**: Provides low-latency edge delivery worldwide, enforces HTTPS with AWS Certificate Manager (ACM), and redirects client-side 404s to `/index.html` to support React Router navigation seamlessly.

### 2.2 Backend Compute: Amazon EC2
- **Instance Type**: `t3.medium` or `t4g.medium` (2 vCPU, 4GB RAM) to smoothly accommodate PyTorch and SentenceTransformer vector embeddings in memory.
- **Process Supervisor**: `systemd` daemon managing Gunicorn workers with Uvicorn worker class (`uvicorn.workers.UvicornWorker`).
- **Reverse Proxy**: Nginx handling SSL termination, rate limiting, and request forwarding to port 8000.

### 2.3 Relational Database: Amazon RDS for MySQL
- **Engine**: MySQL Community 8.0.
- **Instance Class**: `db.t3.micro` (free tier eligible) or `db.t3.small`.
- **Subnet Configuration**: Placed strictly in private DB subnets without public IP addresses, accessible exclusively from the EC2 Security Group on port 3306.

### 2.4 File Storage: Amazon S3 (Private Resume Vault)
- Resumes are stored in a dedicated private S3 bucket (`s3://aicareermatch-resumes-prod/`).
- Enforces default encryption with AWS KMS or AES-256 (SSE-S3).
- Resumes are retrieved via short-lived AWS IAM Pre-Signed URLs (15-minute expiration) to guarantee zero unauthorized access.

### 2.5 Security, IAM & Networking
- **VPC**: Custom Virtual Private Cloud (`10.0.0.0/16`) across 2 Availability Zones.
- **Public Subnets**: Application Load Balancer and NAT Gateway.
- **Private Subnets**: EC2 Backend instances and RDS MySQL database.
- **Security Groups**:
  - `ALB-SG`: Ingress 80/443 from `0.0.0.0/0`.
  - `EC2-SG`: Ingress 8000 from `ALB-SG` only.
  - `RDS-SG`: Ingress 3306 from `EC2-SG` only.

---

## 3. Step-by-Step EC2 Deployment Commands

### Step 1: Connect to EC2 & Update Packages
```bash
ssh -i "your-key.pem" ubuntu@<ec2-public-ip>
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3.12-venv default-libmysqlclient-dev build-essential git nginx
```

### Step 2: Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/your-username/AI-CareerMatch.git
cd AI-CareerMatch/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Step 3: Configure Production .env
Configure MySQL host pointing to AWS RDS, unique JWT secret key, and production CORS origins.

### Step 4: Configure systemd Service (/etc/systemd/system/aicareermatch.service)
Enable and start the service with systemctl daemon-reload and systemctl enable aicareermatch.

### Step 5: Configure Nginx Reverse Proxy
Forward traffic from port 80/443 to internal port 8000 with gzip compression and WebSocket support.

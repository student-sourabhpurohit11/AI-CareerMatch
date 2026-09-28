-- ==============================================================================
-- AI-CareerMatch Seed Data (Controlled Skills Taxonomy, Jobs, Courses, Roles)
-- ==============================================================================

USE aicareermatch_db;

-- ------------------------------------------------------------------------------
-- 1. Skills Master Taxonomy
-- ------------------------------------------------------------------------------
INSERT INTO skills (name, normalized_name, category) VALUES
-- Programming Languages
('Python', 'python', 'programming_language'),
('JavaScript', 'javascript', 'programming_language'),
('TypeScript', 'typescript', 'programming_language'),
('Java', 'java', 'programming_language'),
('C++', 'c++', 'programming_language'),
('C#', 'c#', 'programming_language'),
('Go', 'go', 'programming_language'),
('SQL', 'sql', 'programming_language'),
('HTML', 'html', 'programming_language'),
('CSS', 'css', 'programming_language'),

-- Frameworks & Libraries
('React', 'react', 'framework'),
('Next.js', 'next.js', 'framework'),
('FastAPI', 'fastapi', 'framework'),
('Django', 'django', 'framework'),
('Flask', 'flask', 'framework'),
('Node.js', 'node.js', 'framework'),
('Express.js', 'express.js', 'framework'),
('Spring Boot', 'spring boot', 'framework'),
('Tailwind CSS', 'tailwind css', 'framework'),
('Bootstrap', 'bootstrap', 'framework'),

-- Databases & Storage
('MySQL', 'mysql', 'database'),
('PostgreSQL', 'postgresql', 'database'),
('MongoDB', 'mongodb', 'database'),
('Redis', 'redis', 'database'),
('Elasticsearch', 'elasticsearch', 'database'),
('SQLite', 'sqlite', 'database'),

-- Cloud & DevOps
('AWS', 'aws', 'cloud'),
('Docker', 'docker', 'cloud'),
('Kubernetes', 'kubernetes', 'cloud'),
('Linux', 'linux', 'cloud'),
('CI/CD', 'ci/cd', 'cloud'),
('GitHub Actions', 'github actions', 'cloud'),
('Terraform', 'terraform', 'cloud'),
('Nginx', 'nginx', 'cloud'),

-- AI / Machine Learning / Data Science
('Machine Learning', 'machine learning', 'ai_ml'),
('Deep Learning', 'deep learning', 'ai_ml'),
('Natural Language Processing', 'natural language processing', 'ai_ml'),
('NLP', 'nlp', 'ai_ml'),
('PyTorch', 'pytorch', 'ai_ml'),
('TensorFlow', 'tensorflow', 'ai_ml'),
('scikit-learn', 'scikit-learn', 'ai_ml'),
('spaCy', 'spacy', 'ai_ml'),
('Pandas', 'pandas', 'ai_ml'),
('NumPy', 'numpy', 'ai_ml'),
('Sentence Transformers', 'sentence transformers', 'ai_ml'),

-- Development Tools & Architecture
('Git', 'git', 'tool'),
('GitHub', 'github', 'tool'),
('Postman', 'postman', 'tool'),
('REST API', 'rest api', 'concept'),
('GraphQL', 'graphql', 'concept'),
('Microservices', 'microservices', 'concept'),
('Object-Oriented Programming', 'object-oriented programming', 'concept'),
('Data Structures & Algorithms', 'data structures & algorithms', 'concept'),
('Agile/Scrum', 'agile/scrum', 'soft_skill')
ON DUPLICATE KEY UPDATE category=VALUES(category);

-- ------------------------------------------------------------------------------
-- 2. Companies
-- ------------------------------------------------------------------------------
INSERT INTO companies (name, website, industry, location, description, logo_url) VALUES
('CloudScale Systems', 'https://cloudscale.io', 'Cloud Computing & Infrastructure', 'Bengaluru, India', 'Specializing in resilient cloud architectures and high-scale distributed systems.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60'),
('Nexora AI Labs', 'https://nexora.ai', 'Artificial Intelligence & Analytics', 'Hyderabad, India', 'Pioneering NLP and predictive intelligence solutions for Fortune 500 enterprises.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60'),
('Apex Fintech Global', 'https://apexfintech.com', 'Financial Technology', 'Mumbai, India', 'High-frequency trading platforms and ultra-secure transactional banking APIs.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=60'),
('InnoStack Solutions', 'https://innostack.tech', 'Enterprise Software', 'Pune, India', 'Building next-generation SaaS workflows and modern collaborative workplace software.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=60')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- ------------------------------------------------------------------------------
-- 3. Jobs
-- ------------------------------------------------------------------------------
INSERT INTO jobs (id, company_id, title, job_type, location, experience_years_min, experience_years_max, min_education, salary_min, salary_max, description, responsibilities) VALUES
(1, 1, 'Junior Backend Engineer (Python/FastAPI)', 'full_time', 'Bengaluru, India (Hybrid)', 0, 2, 'Bachelor''s in Computer Science or related field', 650000.00, 950000.00,
'Join our backend infrastructure team to build high-performance REST APIs, integrate distributed MySQL databases, and write modular Python microservices using FastAPI and Docker.',
'1. Design and maintain asynchronous FastAPI endpoints.\n2. Optimize MySQL database queries and schemas.\n3. Containerize microservices using Docker.\n4. Write unit and integration tests.'),

(2, 2, 'Associate AI/NLP Engineer', 'full_time', 'Hyderabad, India (On-site)', 0, 2, 'Bachelor''s or Master''s in CSE, AI or Data Science', 750000.00, 1100000.00,
'Nexora AI is looking for an enthusiastic Machine Learning / NLP Engineer to develop semantic text matching pipelines, vector similarity search algorithms, and document information extraction models.',
'1. Implement NLP tokenization, lemmatization, and NER using spaCy.\n2. Build vector embeddings using Sentence Transformers.\n3. Evaluate model performance using scikit-learn metrics.\n4. Deploy ML inference microservices in FastAPI.'),

(3, 3, 'Full Stack Developer (React & Node.js)', 'full_time', 'Mumbai, India (Hybrid)', 1, 3, 'Bachelor''s in Engineering or MCA', 700000.00, 1050000.00,
'Develop cutting-edge dashboard experiences with React, Tailwind CSS, and Node.js. You will bridge intuitive responsive user interfaces with robust backend business logic and transactional SQL databases.',
'1. Build dynamic frontend interfaces with React and Tailwind CSS.\n2. Write RESTful backend services using Node.js / Express.\n3. Integrate authentication and state management.\n4. Ensure cross-browser responsiveness and performance.'),

(4, 4, 'Cloud & DevOps Associate', 'full_time', 'Pune, India (Remote)', 0, 2, 'Bachelor''s in Information Technology or CSE', 600000.00, 850000.00,
'Help streamline automated CI/CD deployment pipelines, manage containerized clusters with Docker & Kubernetes, and monitor production workloads on AWS.',
'1. Configure GitHub Actions workflows for continuous integration.\n2. Manage container images and deployments using Docker.\n3. Provision cloud resources using AWS EC2, S3, and RDS.\n4. Set up system monitoring and log aggregation.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ------------------------------------------------------------------------------
-- 4. Job Skills Mapping (Explicit Requirements & Weights)
-- ------------------------------------------------------------------------------
-- Job 1: Junior Backend Engineer (Python, FastAPI, SQL, MySQL, REST API, Docker, Git)
INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 1, id, TRUE, 1.00 FROM skills WHERE normalized_name IN ('python', 'fastapi', 'sql', 'mysql', 'rest api')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 1, id, FALSE, 0.70 FROM skills WHERE normalized_name IN ('docker', 'git', 'redis', 'linux')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

-- Job 2: Associate AI/NLP Engineer (Python, NLP, spaCy, Sentence Transformers, scikit-learn, PyTorch)
INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 2, id, TRUE, 1.00 FROM skills WHERE normalized_name IN ('python', 'nlp', 'machine learning', 'scikit-learn', 'spacy')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 2, id, FALSE, 0.80 FROM skills WHERE normalized_name IN ('sentence transformers', 'pytorch', 'fastapi', 'git')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

-- Job 3: Full Stack Developer (React, JavaScript, Node.js, SQL, MySQL, Tailwind CSS)
INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 3, id, TRUE, 1.00 FROM skills WHERE normalized_name IN ('react', 'javascript', 'node.js', 'sql', 'mysql')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 3, id, FALSE, 0.70 FROM skills WHERE normalized_name IN ('tailwind css', 'typescript', 'rest api', 'git')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

-- Job 4: Cloud & DevOps Associate (Docker, AWS, Linux, CI/CD, Git)
INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 4, id, TRUE, 1.00 FROM skills WHERE normalized_name IN ('docker', 'aws', 'linux', 'ci/cd', 'git')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

INSERT INTO job_skills (job_id, skill_id, is_required, weight)
SELECT 4, id, FALSE, 0.70 FROM skills WHERE normalized_name IN ('kubernetes', 'github actions', 'python', 'nginx')
ON DUPLICATE KEY UPDATE weight=VALUES(weight);

-- ------------------------------------------------------------------------------
-- 5. Career Roles Master
-- ------------------------------------------------------------------------------
INSERT INTO career_roles (title, description, typical_skills_json, average_salary_lpa, growth_outlook) VALUES
('Backend Developer',
 'Designs, develops, and maintains server-side architecture, application logic, and database integrations to ensure high throughput and reliability.',
 '["Python", "FastAPI", "SQL", "MySQL", "REST API", "Docker", "Redis", "Git"]',
 '6.5 - 14.0 LPA', 'Very High'),

('AI / NLP Engineer',
 'Specializes in computational linguistics, deep learning text representation, semantic search, and building production machine learning pipelines.',
 '["Python", "NLP", "spaCy", "Sentence Transformers", "PyTorch", "scikit-learn", "Machine Learning"]',
 '8.0 - 18.0 LPA', 'Extremely High'),

('Full Stack Developer',
 'Bridges responsive user interfaces with server-side business logic, managing complete end-to-end web architectures from front-to-back.',
 '["React", "JavaScript", "TypeScript", "Node.js", "MySQL", "Tailwind CSS", "REST API"]',
 '7.0 - 15.0 LPA', 'High'),

('Cloud & DevOps Engineer',
 'Automates build pipelines, manages cloud infrastructure, container orchestration, and guarantees system uptime and security.',
 '["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "GitHub Actions", "Terraform"]',
 '7.5 - 16.0 LPA', 'Very High'),

('Data Analyst / Scientist',
 'Extracts actionable insights from structured and unstructured data through statistical modeling, feature engineering, and predictive analytics.',
 '["Python", "SQL", "Pandas", "NumPy", "scikit-learn", "Machine Learning"]',
 '6.0 - 13.0 LPA', 'High')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- ------------------------------------------------------------------------------
-- 6. Courses & Learning Resources (Free & Verified Educational References)
-- ------------------------------------------------------------------------------
INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'Python for Everybody Specialization', 'Coursera / Univ. of Michigan', id, 'beginner', 'Comprehensive fundamentals of Python programming, data structures, and networked application development.', 'https://www.coursera.org/specializations/python', TRUE, 4.8
FROM skills WHERE normalized_name = 'python';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'FastAPI Official Documentation & Tutorial', 'FastAPI Official Docs', id, 'intermediate', 'The official interactive tutorial covering asynchronous endpoints, Pydantic data validation, and dependency injection.', 'https://fastapi.tiangolo.com/tutorial/', TRUE, 4.9
FROM skills WHERE normalized_name = 'fastapi';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'Docker for Beginners - Full FreeCourse', 'freeCodeCamp', id, 'beginner', 'Master Docker containerization, Dockerfile creation, multi-stage builds, and multi-container Docker Compose.', 'https://www.youtube.com/watch?v=fqMOX6JJhGo', TRUE, 4.8
FROM skills WHERE normalized_name = 'docker';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'Natural Language Processing with spaCy', 'Ines Montani / Explosion', id, 'intermediate', 'Interactive course on building linguistic pipelines, custom entity recognizers, and rule-based extractors.', 'https://course.spacy.io/', TRUE, 4.9
FROM skills WHERE normalized_name = 'spacy';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'Sentence Transformers & Semantic Search', 'Hugging Face', id, 'intermediate', 'Learn to compute dense sentence embeddings and build semantic search applications with cosine similarity.', 'https://www.sbert.net/', TRUE, 4.9
FROM skills WHERE normalized_name = 'sentence transformers';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'AWS Cloud Practitioner Essentials', 'AWS Skill Builder', id, 'beginner', 'Official fundamental course covering AWS core services: EC2 compute, RDS databases, S3 storage, and IAM security.', 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials', TRUE, 4.7
FROM skills WHERE normalized_name = 'aws';

INSERT INTO courses (title, provider, skill_id, level, description, course_url, is_free, rating)
SELECT 'Complete React 18+ Guide with Projects', 'freeCodeCamp', id, 'intermediate', 'Component architecture, custom hooks, state management, client routing, and REST API integration.', 'https://www.youtube.com/watch?v=bMknfKXIFA8', TRUE, 4.8
FROM skills WHERE normalized_name = 'react';

-- ------------------------------------------------------------------------------
-- 7. Default Administrator Account (admin@aicareermatch.com / Admin@123)
-- PBKDF2 / Bcrypt Hash for "Admin@123"
-- ------------------------------------------------------------------------------
INSERT INTO users (email, password_hash, full_name, role, headline, bio) VALUES
('admin@aicareermatch.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W65WvWB79D67WBaC', 'System Administrator', 'admin', 'Lead System Administrator & Evaluator', 'Oversees candidate verification, corporate job listings, and algorithmic recommendation health.')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

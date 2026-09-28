import React from 'react';
import { Compass, Sparkles, CheckCircle2, TrendingUp, Code2, ArrowRight } from 'lucide-react';

const CareerRecommendations = () => {
  const roles = [
    {
      title: "Backend Developer (Python/FastAPI)",
      salary: "₹6.5 - 14.0 LPA",
      growth: "Very High",
      fit: "90% Fit",
      description: "Designs, develops, and maintains server-side architecture, application logic, and database integrations to ensure high throughput and reliability.",
      whyRecommended: [
        "Strong verified competency in Python, SQL, MySQL, and REST APIs",
        "Demonstrated project work in asynchronous backend development",
        "Database normalization and ORM query design capability"
      ],
      skillGaps: ["Redis Caching", "Docker Containerization"],
      recommendedProject: {
        title: "Containerized Distributed URL Shortener & Analytics API",
        tech: "Python, FastAPI, MySQL, Redis, Docker",
        description: "Build a high-performance RESTful URL redirector with rate limiting using Redis and containerize it using Docker."
      }
    },
    {
      title: "AI / NLP Engineer",
      salary: "₹8.0 - 18.0 LPA",
      growth: "Extremely High",
      fit: "82% Fit",
      description: "Specializes in computational linguistics, deep learning text representation, semantic search, and building production machine learning pipelines.",
      whyRecommended: [
        "Hands-on NLP experience using spaCy and scikit-learn",
        "Understanding of tokenization, entity recognition, and vector similarity",
        "FastAPI integration for serving machine learning inferences"
      ],
      skillGaps: ["PyTorch Deep Learning", "Dense Vector Search (Sentence Transformers)"],
      recommendedProject: {
        title: "Semantic Document Search & Question-Answering Service",
        tech: "Python, Sentence Transformers, FAISS, FastAPI",
        description: "Create an embedding-based document search engine that indexes PDF technical manuals and queries them using cosine similarity."
      }
    },
    {
      title: "Full Stack Engineer",
      salary: "₹7.0 - 15.0 LPA",
      growth: "High",
      fit: "76% Fit",
      description: "Bridges responsive user interfaces with server-side business logic, managing complete end-to-end web architectures from front-to-back.",
      whyRecommended: [
        "Demonstrated frontend capability with React and modern CSS",
        "Solid RESTful API integration and authentication flows",
        "Relational database modeling with MySQL"
      ],
      skillGaps: ["Node.js / Express Runtime", "TypeScript Strict Typing"],
      recommendedProject: {
        title: "Real-Time Collaborative Project Management Kanban",
        tech: "React, Node.js, WebSockets, Tailwind CSS, MySQL",
        description: "Build a kanban project board featuring real-time state synchronization, drag-and-drop cards, and role permissions."
      }
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Explainable Career Recommendations
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Personalized professional pathways synthesized from your verified skills, project history, and target tech industry demand.
        </p>
      </div>

      <div className="space-y-6">
        {roles.map((role, idx) => (
          <div key={idx} className="glass-card-interactive p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{role.title}</h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {role.fit}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Expected Salary: <strong className="text-slate-200">{role.salary}</strong> • Industry Growth Outlook: <strong className="text-brand-400">{role.growth}</strong>
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                <Compass className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{role.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Why Recommended */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Why This Role is Recommended
                </h3>
                <ul className="space-y-1.5">
                  {role.whyRecommended.map((reason, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remaining Gaps */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Remaining Gaps to Close
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {role.skillGaps.map((gap, i) => (
                    <span key={i} className="badge-missing text-xs">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Targeted Recommended Project */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/50 to-slate-900 border border-brand-500/20 space-y-2">
              <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
                <Code2 className="w-4 h-4" />
                <span>Targeted Resume-Boosting Project Recommendation</span>
              </div>
              <h4 className="text-sm font-bold text-white">{role.recommendedProject.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{role.recommendedProject.description}</p>
              <p className="text-[11px] text-slate-400">
                Suggested Stack: <span className="text-brand-300 font-medium">{role.recommendedProject.tech}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendations;

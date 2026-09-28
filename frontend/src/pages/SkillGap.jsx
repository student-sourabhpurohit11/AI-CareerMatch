import React from 'react';
import { TrendingUp, AlertTriangle, BookOpen, ExternalLink, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

const SkillGap = () => {
  const gaps = [
    {
      skill: "Docker",
      priority: "high",
      category: "Containerization & Cloud",
      importance: "Critical for backend and cloud roles. Needed to containerize microservices and ensure consistent deployment environments.",
      course: "Docker for Beginners - Full FreeCourse",
      provider: "freeCodeCamp",
      url: "https://www.youtube.com/watch?v=fqMOX6JJhGo"
    },
    {
      skill: "Redis",
      priority: "high",
      category: "In-Memory Database & Caching",
      importance: "Essential for distributed backend architectures to handle session management, fast caching, and rate limiting.",
      course: "Redis University - Fast Track",
      provider: "Redis Labs Official",
      url: "https://university.redis.com/"
    },
    {
      skill: "Sentence Transformers",
      priority: "medium",
      category: "AI / Semantic NLP",
      importance: "Required to compute dense vector embeddings and semantic search for AI/NLP Engineer requisitions.",
      course: "Sentence Transformers & Semantic Search",
      provider: "Hugging Face",
      url: "https://www.sbert.net/"
    },
    {
      skill: "AWS Cloud Fundamentals",
      priority: "medium",
      category: "Cloud Compute",
      importance: "Fundamental cloud knowledge covering EC2 compute, RDS databases, S3 storage, and IAM roles.",
      course: "AWS Cloud Practitioner Essentials",
      provider: "AWS Skill Builder",
      url: "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials"
    },
    {
      skill: "Kubernetes",
      priority: "low",
      category: "Container Orchestration",
      importance: "Advanced cluster scaling and container orchestration; recommended once Docker fundamentals are established.",
      course: "Kubernetes Basics Tutorial",
      provider: "Kubernetes Official Docs",
      url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/"
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Intelligent Skill-Gap Diagnostics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Algorithmic comparison between your extracted resume competencies and live target role requisitions.
        </p>
      </div>

      {/* Priority Legend Banner */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Gap Priority:</span>
          <span className="badge-priority-high">High Priority (Blocking Role Fit)</span>
          <span className="badge-priority-medium">Medium Priority (Competitive Edge)</span>
          <span className="badge-priority-low">Low Priority (Future Growth)</span>
        </div>
        <span className="text-brand-400 flex items-center gap-1 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          5 Identified Learning Pathways
        </span>
      </div>

      {/* Gaps List */}
      <div className="space-y-4">
        {gaps.map((gap, index) => (
          <div key={index} className="glass-card-interactive p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{gap.skill}</h2>
                <span className={
                  gap.priority === 'high'
                    ? 'badge-priority-high'
                    : gap.priority === 'medium'
                    ? 'badge-priority-medium'
                    : 'badge-priority-low'
                }>
                  {gap.priority} Priority
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {gap.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-slate-200">Why It's Needed:</strong> {gap.importance}
            </p>

            {/* Recommended Learning Resource */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{gap.course}</p>
                  <p className="text-[11px] text-slate-500">Provider: {gap.provider} • Free & Verified</p>
                </div>
              </div>
              <a
                href={gap.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors shrink-0"
              >
                <span>Start Learning</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGap;

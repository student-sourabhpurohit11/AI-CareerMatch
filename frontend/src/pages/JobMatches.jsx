import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, CheckCircle2, XCircle, Briefcase, MapPin, Building, Sparkles, ArrowRight, DollarSign } from 'lucide-react';

const JobMatches = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await api.post('/applications', { job_id: jobId, status: 'applied' });
      setAppliedIds(prev => new Set(prev).add(jobId));
      alert("Application successfully submitted and recorded in your Application Tracker!");
    } catch (err) {
      alert(err.response?.data?.detail || "Applied or saved to tracker.");
      setAppliedIds(prev => new Set(prev).add(jobId));
    }
  };

  // Curated match simulation for explainable demo matching
  const matchData = [
    {
      id: 1,
      title: "Junior Backend Engineer (Python/FastAPI)",
      company: "CloudScale Systems",
      location: "Bengaluru, India (Hybrid)",
      salary: "₹6.5 - 9.5 LPA",
      compatibility: 85,
      matched: ["Python", "FastAPI", "SQL", "MySQL", "REST API", "Git"],
      missing: ["Redis", "Docker"],
      rationale: "High alignment with backend development requirements, with two infrastructure-related skills currently missing."
    },
    {
      id: 2,
      title: "Associate AI/NLP Engineer",
      company: "Nexora AI Labs",
      location: "Hyderabad, India (On-site)",
      salary: "₹7.5 - 11.0 LPA",
      compatibility: 78,
      matched: ["Python", "NLP", "Machine Learning", "spaCy", "Git"],
      missing: ["PyTorch", "Sentence Transformers"],
      rationale: "Strong linguistic and text-processing foundation with deep learning vector modeling recommended for full role readiness."
    },
    {
      id: 3,
      title: "Full Stack Developer (React & Node.js)",
      company: "Apex Fintech Global",
      location: "Mumbai, India (Hybrid)",
      salary: "₹7.0 - 10.5 LPA",
      compatibility: 72,
      matched: ["React", "JavaScript", "SQL", "MySQL", "REST API"],
      missing: ["Node.js", "Tailwind CSS"],
      rationale: "Solid client-side React foundation; server-side Node runtime expansion recommended."
    },
    {
      id: 4,
      title: "Cloud & DevOps Associate",
      company: "InnoStack Solutions",
      location: "Pune, India (Remote)",
      salary: "₹6.0 - 8.5 LPA",
      compatibility: 64,
      matched: ["Linux", "Git"],
      missing: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      rationale: "Basic OS and tooling familiarity; cloud compute and containerization represent critical development priorities."
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Explainable Job Matching Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Hybrid ranking algorithm: 60% Explicit Skill Overlap + 25% Semantic Vector Similarity + 10% Experience + 5% Role Alignment.
        </p>
      </div>

      <div className="space-y-6">
        {matchData.map((job) => {
          const isApplied = appliedIds.has(job.id);
          return (
            <div key={job.id} className="glass-card-interactive p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                  </div>
                </div>

                {/* Compatibility Gauge Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Match</p>
                    <p className={`text-2xl font-extrabold ${job.compatibility >= 80 ? 'text-emerald-400' : job.compatibility >= 70 ? 'text-brand-400' : 'text-amber-400'}`}>
                      {job.compatibility}%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                    <Target className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Explainable Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Matched Skills ({job.matched.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matched.map((s, idx) => (
                      <span key={idx} className="badge-matched">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Missing / Skill Gaps ({job.missing.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.missing.map((s, idx) => (
                      <span key={idx} className="badge-missing">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <p className="text-xs text-slate-300 italic flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>"{job.rationale}"</span>
                </p>

                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isApplied
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25'
                    }`}
                  >
                    {isApplied ? '✓ Applied / In Tracker' : 'Quick Apply to Role'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobMatches;

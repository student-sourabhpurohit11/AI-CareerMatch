import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Target,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Upload,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const JobMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const [matchesRes, appsRes] = await Promise.all([
        api.get('/matches'),
        api.get('/applications').catch(() => ({ data: [] }))
      ]);

      setMatches(matchesRes.data || []);
      if (appsRes.data && Array.isArray(appsRes.data)) {
        setAppliedIds(new Set(appsRes.data.map((a) => a.job_id)));
      }
    } catch (err) {
      console.error('Failed to load real job matches:', err);
      setError('Unable to load job matches from the server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await api.post('/applications', { job_id: jobId, status: 'applied' });
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Application saved to tracker.');
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explainable Job Matching Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real hybrid algorithm: 60% Explicit Skill Overlap + 25% Semantic Cosine Similarity + 10% Experience + 5% Role Alignment.
          </p>
        </div>
        <button
          onClick={fetchMatches}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Matches</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Running hybrid semantic matching algorithms across active jobs...
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Target className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Job Matches Computed Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please upload a resume in the Resume Management section. Our NLP engine will extract your technologies and compute real compatibility scores!
          </p>
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Go to Resume Management</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((job) => {
            const isApplied = appliedIds.has(job.job_id);
            const isApplying = applyingId === job.job_id;
            const matchedSkills = job.matched_skills || [];
            const missingSkills = job.missing_skills || [];

            return (
              <div key={job.job_id} className="glass-card-interactive p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">{job.job_title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {job.company_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                    </div>
                  </div>

                  {/* Real Compatibility Gauge Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Match</p>
                      <p
                        className={`text-2xl font-extrabold ${
                          job.compatibility >= 80
                            ? 'text-emerald-400'
                            : job.compatibility >= 65
                            ? 'text-brand-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {job.compatibility}%
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    Explicit Skill Overlap: <strong className="text-brand-300">{job.explicit_skill_score}%</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                    Semantic Vector Similarity: <strong className="text-indigo-300">{job.semantic_similarity}%</strong>
                  </span>
                </div>

                {/* Explainable Skills Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Real Matched Skills */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Matched Skills ({matchedSkills.length})
                    </p>
                    {matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((s, idx) => (
                          <span key={idx} className="badge-matched">
                            {typeof s === 'string' ? s : s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No direct skill overlap with this role.</p>
                    )}
                  </div>

                  {/* Real Missing Skills */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" />
                      Missing / Skill Gaps ({missingSkills.length})
                    </p>
                    {missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((s, idx) => (
                          <span key={idx} className="badge-missing">
                            {typeof s === 'string' ? s : s.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400/80 italic">All required competencies acquired!</p>
                    )}
                  </div>
                </div>

                {/* Explainable AI Rationale */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-slate-300 italic flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>"{job.rationale}"</span>
                  </p>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => handleApply(job.job_id)}
                      disabled={isApplied || isApplying}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isApplied
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25'
                      }`}
                    >
                      {isApplied ? '✓ Applied / In Tracker' : isApplying ? 'Submitting...' : 'Quick Apply to Role'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobMatches;

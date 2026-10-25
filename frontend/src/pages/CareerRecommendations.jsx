import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Code2,
  ArrowRight,
  RefreshCw,
  Upload,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';

const CareerRecommendations = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/matches/career-recommendations');
      setRoles(res.data || []);
    } catch (err) {
      console.error('Failed to load career recommendations:', err);
      setError('Unable to load career pathways from server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explainable Career Recommendations
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personalized professional pathways synthesized directly from your verified skills, project history, and target tech industry demand.
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recalculate Fit</span>
        </button>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Computing role compatibility against industry demand profiles...
          </p>
        </div>
      ) : roles.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Career Pathways Available</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please upload a resume in the Resume Management section to calculate your personalized career role readiness scores!
          </p>
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resume</span>
          </Link>
        </div>
      ) : (
        /* Real Roles List */
        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role.id || role.title} className="glass-card-interactive p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{role.title}</h2>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        role.fit_percentage >= 70
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : role.fit_percentage >= 40
                          ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {role.fit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Expected Salary: <strong className="text-slate-200">{role.salary}</strong> • Industry Growth Outlook:{' '}
                    <strong className="text-brand-400">{role.growth}</strong>
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{role.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real Why Recommended */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Skill Overlap ({role.matchedSkills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.matchedSkills && role.matchedSkills.length > 0 ? (
                      role.matchedSkills.map((s, sIdx) => (
                        <span key={sIdx} className="badge-matched text-xs">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No direct core skill overlap identified yet.</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    {role.whyRecommended?.map((r, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Real Skill Gaps for this Role */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Competencies to Acquire ({role.skillGaps?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.skillGaps && role.skillGaps.length > 0 ? (
                      role.skillGaps.map((gap, gIdx) => (
                        <span key={gIdx} className="badge-missing text-xs">
                          {gap}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400/80 italic">All typical competencies already validated!</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Target these technologies to maximize recruiter ranking for {role.title} roles.
                  </p>
                </div>
              </div>

              {/* Recommended Practical Project */}
              {role.recommendedProject && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/30 to-slate-900 border border-brand-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      Recommended High-Impact Portfolio Project
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      Portfolio Booster
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{role.recommendedProject.title}</h4>
                  <p className="text-xs text-slate-300">{role.recommendedProject.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Target Tech Stack: <strong className="text-brand-300">{role.recommendedProject.tech}</strong>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerRecommendations;

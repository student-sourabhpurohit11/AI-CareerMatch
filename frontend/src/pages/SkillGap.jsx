import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Upload,
  Briefcase
} from 'lucide-react';

const SkillGap = () => {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSkillGaps = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/matches/skill-gaps');
      setGaps(res.data || []);
    } catch (err) {
      console.error('Failed to load skill gaps:', err);
      setError('Unable to diagnose skill gaps from server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGaps();
  }, []);

  const highCount = gaps.filter((g) => g.priority === 'high').length;
  const mediumCount = gaps.filter((g) => g.priority === 'medium').length;
  const lowCount = gaps.filter((g) => g.priority === 'low').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Intelligent Skill-Gap Diagnostics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Algorithmic comparison between your verified resume competencies and target tech requisitions in the portal.
          </p>
        </div>
        <button
          onClick={fetchSkillGaps}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-evaluate Gaps</span>
        </button>
      </div>

      {/* Priority Legend Banner */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">Gap Priority Breakdown:</span>
          <span className="badge-priority-high">High Priority: {highCount}</span>
          <span className="badge-priority-medium">Medium Priority: {mediumCount}</span>
          <span className="badge-priority-low">Low Priority: {lowCount}</span>
        </div>
        <span className="text-brand-400 flex items-center gap-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          {gaps.length} Identified Learning Pathways
        </span>
      </div>

      {/* Loading & Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Diagnosing skill deficiencies against active job vacancies...
          </p>
        </div>
      ) : gaps.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Critical Skill Gaps Detected!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Either you have matched all currently listed job requirements, or no active resume has been uploaded yet. Upload a resume to evaluate your profile.
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
        /* Real Gaps List */
        <div className="space-y-4">
          {gaps.map((gap, index) => (
            <div key={index} className="glass-card-interactive p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-bold text-white">{gap.skill}</h2>
                  <span
                    className={
                      gap.priority === 'high'
                        ? 'badge-priority-high'
                        : gap.priority === 'medium'
                        ? 'badge-priority-medium'
                        : 'badge-priority-low'
                    }
                  >
                    {gap.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{gap.category}</span>
                </div>

                {gap.jobs && gap.jobs.length > 0 && (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Affects {gap.jobs.length} position(s)</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{gap.importance}</p>

              {/* Recommended Course Card from Database */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-white">{gap.course}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified Free Resource
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Curated Provider: <strong className="text-slate-300">{gap.provider}</strong>
                    </p>
                  </div>
                </div>

                <a
                  href={gap.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 hover:text-white border border-brand-500/30 text-xs font-semibold transition-all shrink-0"
                >
                  <span>Start Learning</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillGap;

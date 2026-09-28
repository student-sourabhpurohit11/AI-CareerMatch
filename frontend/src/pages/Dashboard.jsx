import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Target,
  TrendingUp,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Upload,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    resumeScore: 82,
    matchedJobsCount: 4,
    skillGapsCount: 3,
    applicationsCount: 2,
    hasResume: false,
    topSkills: ['Python', 'SQL', 'FastAPI', 'Docker', 'Git'],
    recommendedRoles: ['Backend Developer', 'AI / NLP Engineer']
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumesRes, jobsRes, appsRes] = await Promise.all([
          api.get('/resumes').catch(() => ({ data: [] })),
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/applications').catch(() => ({ data: [] })),
        ]);

        const hasResume = resumesRes.data && resumesRes.data.length > 0;
        setStats(prev => ({
          ...prev,
          hasResume,
          matchedJobsCount: jobsRes.data ? jobsRes.data.length : 4,
          applicationsCount: appsRes.data ? appsRes.data.length : 0,
        }));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-950/40 to-slate-900 border border-brand-500/20 p-6 sm:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Career Optimization Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Your resume analysis and job matching pipeline is running. Explore your latest compatibility scores, bridge priority skill gaps, and track live applications.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/resumes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload & Analyze Resume
            </Link>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm transition-all"
            >
              <Target className="w-4 h-4 text-brand-400" />
              View Matched Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Resume Score */}
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resume Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">82</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2 rounded-full" style={{ width: '82%' }} />
          </div>
          <p className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>Strong technical skill breadth</span>
          </p>
        </div>

        {/* KPI 2: Matched Jobs */}
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Compatible Jobs
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.matchedJobsCount}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              &gt; 75% Match
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Top match: <span className="text-slate-200 font-medium">Junior Backend Engineer</span> (85%)
          </p>
        </div>

        {/* KPI 3: Skill Gaps */}
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Identified Gaps
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.skillGapsCount}</span>
            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              2 High Priority
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Recommended focus: <span className="text-slate-200 font-medium">Docker & Redis</span>
          </p>
        </div>

        {/* KPI 4: Applications */}
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.applicationsCount}</span>
            <span className="text-xs text-slate-400">In Pipeline</span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            1 Under Review, 1 Saved
          </p>
        </div>
      </div>

      {/* Main Grid: Skills & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Extracted Skills */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Extracted Candidate Competencies</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                NLP entities identified from your active resume profile
              </p>
            </div>
            <Link to="/resumes" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Manage Resumes →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.topSkills.map((skill, idx) => (
              <span key={idx} className="badge-skill text-sm py-1.5 px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                {skill}
              </span>
            ))}
            <span className="badge-skill text-sm py-1.5 px-3">React</span>
            <span className="badge-skill text-sm py-1.5 px-3">MySQL</span>
            <span className="badge-skill text-sm py-1.5 px-3">REST API</span>
            <span className="badge-skill text-sm py-1.5 px-3">Natural Language Processing</span>
          </div>

          {/* Explainable Insights Box */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Algorithmic Alignment Insight
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your profile displays strong alignment with modern server-side backend engineering and applied AI roles. Adding containerization practice (Docker) and message caching (Redis) will boost your match compatibility score by an estimated +12%.
            </p>
          </div>
        </div>

        {/* Right Column: Suggested Actions */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Recommended Next Steps</h2>
          
          <div className="space-y-3">
            <Link
              to="/skill-gap"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-brand-300">
                  Bridge Docker & Redis Gap
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Access free interactive learning modules.
                </p>
              </div>
            </Link>

            <Link
              to="/matches"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300">
                  Review Top Match (85%)
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Junior Backend Engineer at CloudScale Systems.
                </p>
              </div>
            </Link>

            <Link
              to="/career-paths"
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">
                  Explore Career Pathways
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review growth metrics for AI / NLP Engineer.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

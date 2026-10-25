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
  Briefcase,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeResume: null,
    resumeScore: 0,
    skillsScore: 0,
    extractedSkills: [],
    summaryText: '',
    matchedJobs: [],
    skillGaps: [],
    applications: []
  });

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [resumesRes, matchesRes, gapsRes, appsRes] = await Promise.all([
        api.get('/resumes').catch(() => ({ data: [] })),
        api.get('/matches').catch(() => ({ data: [] })),
        api.get('/matches/skill-gaps').catch(() => ({ data: [] })),
        api.get('/applications').catch(() => ({ data: [] }))
      ]);

      const resumes = resumesRes.data || [];
      const activeResume = resumes.find((r) => r.is_active) || resumes[0] || null;
      const matchedJobs = matchesRes.data || [];
      const skillGaps = gapsRes.data || [];
      const applications = appsRes.data || [];

      let score = 0;
      let skillsScore = 0;
      let extractedSkills = [];
      let summaryText = '';

      if (activeResume && activeResume.analysis) {
        score = activeResume.analysis.overall_score || 0;
        skillsScore = activeResume.analysis.skills_score || 0;
        extractedSkills = activeResume.analysis.extracted_skills || [];
        summaryText = activeResume.analysis.summary_text || '';
      }

      setDashboardData({
        activeResume,
        resumeScore: score,
        skillsScore,
        extractedSkills,
        summaryText,
        matchedJobs,
        skillGaps,
        applications
      });
    } catch (err) {
      console.error('Failed to load real dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const { activeResume, resumeScore, extractedSkills, summaryText, matchedJobs, skillGaps, applications } = dashboardData;

  const topMatch = matchedJobs.length > 0 ? matchedJobs[0] : null;
  const highPriorityGaps = skillGaps.filter((g) => g.priority === 'high');
  const topGapsStr = skillGaps.slice(0, 2).map((g) => g.skill).join(' & ') || 'None identified';

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
            {activeResume
              ? `Your active resume "${activeResume.file_name}" has been analyzed. Explore your real-time compatibility scores, bridge prioritized skill gaps, and track live applications.`
              : 'Welcome to AI-CareerMatch. Upload your resume to extract competencies, compute genuine hybrid match scores, and unlock personalized career recommendations.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/resumes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm shadow-lg shadow-brand-600/30 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{activeResume ? 'Update / Manage Resumes' : 'Upload & Analyze Resume'}</span>
            </Link>
            <Link
              to="/matches"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm transition-all"
            >
              <Target className="w-4 h-4 text-brand-400" />
              <span>View Matched Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Real Resume Score */}
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
            <span className="text-3xl font-bold text-white">
              {activeResume ? resumeScore : 'N/A'}
            </span>
            <span className="text-sm font-medium text-slate-400">
              {activeResume ? '/ 100' : 'No Resume'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, resumeScore))}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            {activeResume ? (
              <span>{resumeScore >= 80 ? 'High potential profile' : resumeScore >= 65 ? 'Moderate readiness' : 'Developing foundation'}</span>
            ) : (
              <span className="text-slate-400">Upload a resume to calculate score</span>
            )}
          </p>
        </div>

        {/* KPI 2: Real Matched Jobs */}
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
            <span className="text-3xl font-bold text-white">{matchedJobs.length}</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {matchedJobs.filter((m) => m.compatibility >= 70).length} High Fit
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400 line-clamp-1">
            {topMatch ? (
              <span>
                Top: <strong className="text-slate-200">{topMatch.job_title}</strong> ({topMatch.compatibility}%)
              </span>
            ) : (
              'No active jobs evaluated'
            )}
          </p>
        </div>

        {/* KPI 3: Real Skill Gaps */}
        <div className="glass-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Diagnosed Gaps
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{skillGaps.length}</span>
            <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {highPriorityGaps.length} High Priority
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-400 line-clamp-1">
            Focus: <strong className="text-slate-200">{topGapsStr}</strong>
          </p>
        </div>

        {/* KPI 4: Real Applications */}
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
            <span className="text-3xl font-bold text-white">{applications.length}</span>
            <span className="text-xs text-slate-400">In Pipeline</span>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {applications.length > 0
              ? `${applications.filter((a) => a.status === 'applied').length} Submitted, ${applications.filter((a) => a.status !== 'applied').length} Tracked`
              : 'No applications submitted yet'}
          </p>
        </div>
      </div>

      {/* Main Grid: Skills & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real Extracted Skills */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Extracted Candidate Competencies</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeResume
                  ? `Real NLP entities extracted directly from "${activeResume.file_name}"`
                  : 'No resume uploaded yet'}
              </p>
            </div>
            <Link to="/resumes" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Manage Resumes →
            </Link>
          </div>

          {extractedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill, idx) => (
                <span key={idx} className="badge-skill text-sm py-1.5 px-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs text-slate-400 italic">
                {activeResume
                  ? 'No technical skills matched the controlled taxonomy in this resume. Review your resume under Resume Management.'
                  : 'Upload your PDF or DOCX resume to extract your verified technologies!'}
              </p>
            </div>
          )}

          {/* Real AI Alignment Insight */}
          {summaryText && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Algorithmic Alignment Insight
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{summaryText}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Suggested Actions */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Recommended Next Steps</h2>

          <div className="space-y-3">
            {skillGaps.length > 0 && (
              <Link
                to="/skill-gap"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-brand-300">
                    Bridge {skillGaps[0]?.skill} Gap
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Explore curated course: {skillGaps[0]?.course}
                  </p>
                </div>
              </Link>
            )}

            {topMatch && (
              <Link
                to="/matches"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300">
                    Review Top Match ({topMatch.compatibility}%)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {topMatch.job_title} at {topMatch.company_name}
                  </p>
                </div>
              </Link>
            )}

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
                  Evaluate your fit across 5 software engineering specializations
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

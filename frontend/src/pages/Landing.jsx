import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Cpu, Target, Compass, ShieldCheck, Database, Layers } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AI-CareerMatch
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-brand-600/30 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>AI & NLP Powered Career Matching Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight mb-6">
            Smart Resume Analysis with{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Explainable Job Matching
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Extract verified technical competencies from PDF/DOCX resumes, compute semantic vector affinities against live job requisitions, and uncover actionable roadmaps to close your skill gaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/25 transition-all text-base"
            >
              Analyze Your Resume Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all text-base"
            >
              Explore Demo Accounts
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-brand-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Open-Source Local NLP</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-teal-400">0 - 100</p>
              <p className="text-xs text-slate-400 mt-1">Explainable Scoring Model</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-indigo-400">Dense Vectors</p>
              <p className="text-xs text-slate-400 mt-1">Sentence Transformers</p>
            </div>
            <div className="glass-card p-5">
              <p className="text-2xl font-bold text-amber-400">Real MySQL</p>
              <p className="text-xs text-slate-400 mt-1">Relational Consistency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Engineered with Explainability at its Core
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Say goodbye to opaque "black box" percentages. Every score and recommendation is supported by transparent evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card-interactive p-6">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Hybrid Matching Equation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Combines 60% explicit skill taxonomy overlap with 25% semantic embedding similarity and 15% experience/role alignment.
              </p>
              <span className="text-xs font-medium text-brand-400">Mathematically Verifiable</span>
            </div>

            <div className="glass-card-interactive p-6">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Skill Gap Diagnostics</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Directly maps your extracted resume competencies against industry requirements, prioritizing high-impact missing skills.
              </p>
              <span className="text-xs font-medium text-teal-400">Actionable Prioritization</span>
            </div>

            <div className="glass-card-interactive p-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Format Extraction</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Automated document parsing for both PDF and DOCX formats using PyMuPDF and python-docx with structural section parsing.
              </p>
              <span className="text-xs font-medium text-indigo-400">Production Reliability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AI-CareerMatch. B.Tech Computer Science Major Project.</p>
          <p>Powered by Python 3.12, FastAPI, React 18, MySQL 8, and spaCy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

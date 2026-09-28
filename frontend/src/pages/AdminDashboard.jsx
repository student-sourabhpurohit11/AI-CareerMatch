import React, { useState } from 'react';
import { ShieldAlert, Users, FileText, Briefcase, Award, Plus, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const metrics = [
    { label: "Registered Candidates", value: "24", icon: Users, color: "text-brand-400" },
    { label: "Resumes Analyzed", value: "38", icon: FileText, color: "text-emerald-400" },
    { label: "Active Jobs", value: "4", icon: Briefcase, color: "text-indigo-400" },
    { label: "Skills in Taxonomy", value: "54", icon: Award, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Administrative Control Panel</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System Overview & Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor system throughput, candidate registrations, resume parsing activity, and corporate job postings.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => (
          <div key={idx} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className="text-3xl font-bold text-white mt-4">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Post New Job Requisition</h2>
          <p className="text-xs text-slate-400">
            Publish a job with specific skill weights and educational criteria for candidate matching.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            ✓ Connected to MySQL <code className="text-brand-300">jobs</code> and <code className="text-brand-300">job_skills</code> tables with foreign key integrity.
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Skills Taxonomy Distribution</h2>
          <p className="text-xs text-slate-400">
            Controlled vocabulary ensuring deterministic and explainable match calculation.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["Python", "FastAPI", "React", "Docker", "MySQL", "AWS", "spaCy", "PyTorch", "Kubernetes", "Redis", "TypeScript"].map((s, i) => (
              <span key={i} className="badge-skill text-xs">{s}</span>
            ))}
            <span className="text-xs text-slate-500 self-center">+ 43 more</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

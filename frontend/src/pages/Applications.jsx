import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckSquare, Clock, Building, MapPin, Trash2, Sparkles, Filter } from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      job_title: "Junior Backend Engineer (Python/FastAPI)",
      company_name: "CloudScale Systems",
      location: "Bengaluru, India (Hybrid)",
      status: "applied",
      applied_at: new Date().toLocaleDateString(),
      notes: "Submitted via AI-CareerMatch 1-click apply. Resume score was 82/100."
    },
    {
      id: 2,
      job_title: "Associate AI/NLP Engineer",
      company_name: "Nexora AI Labs",
      location: "Hyderabad, India (On-site)",
      status: "saved",
      applied_at: "Saved recently",
      notes: "Interested in the NLP semantic vector modeling role."
    }
  ]);
  const [filter, setFilter] = useState('all');

  const statusColors = {
    saved: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    applied: "bg-brand-500/10 text-brand-400 border-brand-500/20",
    interview: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    selected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const handleStatusChange = (id, newStatus) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Application Tracker
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor your job applications across every stage from Saved to Interview and Selection.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'saved', 'applied', 'interview', 'selected', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Applications Table / Cards */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400">
            No applications found under this status.
          </div>
        ) : (
          filteredApps.map(app => (
            <div key={app.id} className="glass-card-interactive p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-white">{app.job_title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColors[app.status]}`}>
                    {app.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {app.company_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {app.location}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {app.applied_at}
                  </span>
                </div>
                {app.notes && (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    Note: "{app.notes}"
                  </p>
                )}
              </div>

              {/* Status Selector Dropdown */}
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;

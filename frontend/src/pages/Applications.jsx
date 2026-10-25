import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckSquare,
  Clock,
  Building,
  MapPin,
  Trash2,
  Sparkles,
  Filter,
  DollarSign,
  Briefcase,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus
} from 'lucide-react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const statusColors = {
    saved: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    applied: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    interview: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    selected: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to load applications from the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    const prevApps = [...applications];
    // Optimistic update
    setApplications(
      applications.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    try {
      await api.put(`/applications/${id}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update application status:', err);
      alert('Failed to update status on server. Reverting changes.');
      setApplications(prevApps);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, jobTitle) => {
    if (!window.confirm(`Are you sure you want to remove your application for "${jobTitle}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
      alert('Failed to delete application. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApps =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Application Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor and advance your job applications across every pipeline stage in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Find Jobs</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pipeline Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'saved', label: 'Saved', color: 'text-slate-300' },
          { key: 'applied', label: 'Applied', color: 'text-brand-400' },
          { key: 'interview', label: 'Interviewing', color: 'text-amber-400' },
          { key: 'selected', label: 'Selected', color: 'text-emerald-400' },
          { key: 'rejected', label: 'Archived', color: 'text-rose-400' },
        ].map((item) => (
          <div key={item.key} className="glass-card p-3.5 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              {item.label}
            </span>
            <span className={`text-2xl font-bold ${item.color} mt-1 block`}>
              {statusCounts[item.key] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'saved', 'applied', 'interview', 'selected', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab} {tab !== 'all' && `(${statusCounts[tab] || 0})`}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Fetching active pipeline records from database...
          </p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">
            {filter === 'all'
              ? 'No Applications In Your Pipeline Yet'
              : `No Applications in '${filter}' Stage`}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filter === 'all'
              ? 'Browse open positions matching your verified skills or explore live requisitions to apply.'
              : `You have zero roles marked as '${filter}'. You can move applications between stages anytime.`}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/job-matches"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore AI Matches</span>
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse All Jobs</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const jobTitle = app.job?.title || 'Engineering Role';
            const companyName = app.job?.company?.name || 'Partner Employer';
            const location = app.job?.location || 'Remote / Hybrid';
            const salary =
              app.job?.salary_min && app.job?.salary_max
                ? `₹${(app.job.salary_min / 100000).toFixed(1)} - ${(app.job.salary_max / 100000).toFixed(1)} LPA`
                : null;
            const dateStr = app.applied_at
              ? new Date(app.applied_at).toLocaleDateString()
              : app.updated_at
              ? new Date(app.updated_at).toLocaleDateString()
              : 'Recent';

            return (
              <div
                key={app.id}
                className="glass-card-interactive p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-base text-white">{jobTitle}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        statusColors[app.status] || statusColors.saved
                      }`}
                    >
                      {app.status}
                    </span>
                    {app.job?.job_type && (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded capitalize">
                        {app.job.job_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {companyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {location}
                    </span>
                    {salary && (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        {salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {app.status === 'applied' ? `Applied: ${dateStr}` : `Updated: ${dateStr}`}
                    </span>
                  </div>

                  {app.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/40 border border-slate-800/60 rounded-lg px-3 py-1.5 italic inline-block mt-1">
                      Note: "{app.notes}"
                    </p>
                  )}
                </div>

                {/* Actions & Status Dropdown */}
                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                    Stage:
                  </label>
                  <select
                    value={app.status}
                    disabled={actionLoading === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() => handleDelete(app.id, jobTitle)}
                    disabled={actionLoading === app.id}
                    title="Remove Application"
                    className="p-2 rounded-xl bg-slate-800/70 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;

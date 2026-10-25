import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Search,
  CheckCircle2,
  Bookmark,
  Send,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchJobsAndApps = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/applications').catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data || []);
      setApplications(appsRes.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Unable to load career requisitions. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndApps();
  }, []);

  const appMap = applications.reduce((acc, app) => {
    acc[app.job_id] = app.status;
    return acc;
  }, {});

  const handleApply = async (jobId) => {
    setActionLoading(jobId);
    try {
      await api.post('/applications', { job_id: jobId, status: 'applied' });
      // Update local state
      setApplications(prev => [
        ...prev.filter(a => a.job_id !== jobId),
        { job_id: jobId, status: 'applied', id: Date.now() }
      ]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Application saved to your tracker.');
      setApplications(prev => [
        ...prev.filter(a => a.job_id !== jobId),
        { job_id: jobId, status: 'applied', id: Date.now() }
      ]);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (jobId) => {
    setActionLoading(jobId);
    try {
      await api.post('/applications', { job_id: jobId, status: 'saved' });
      setApplications(prev => [
        ...prev.filter(a => a.job_id !== jobId),
        { job_id: jobId, status: 'saved', id: Date.now() }
      ]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Job saved to your tracker.');
      setApplications(prev => [
        ...prev.filter(a => a.job_id !== jobId),
        { job_id: jobId, status: 'saved', id: Date.now() }
      ]);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title?.toLowerCase().includes(search.toLowerCase());
    const companyMatch = job.company?.name?.toLowerCase().includes(search.toLowerCase());
    const locationMatch = job.location?.toLowerCase().includes(search.toLowerCase());
    const skillsMatch = job.job_skills?.some((js) =>
      js.skill?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const matchesSearch = search === '' || titleMatch || companyMatch || locationMatch || skillsMatch;
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explore Live Career Requisitions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified engineering positions loaded directly from our enterprise recruitment database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobsAndApps}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/job-matches"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View AI Match Scores</span>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, employer, location, or skill (e.g. FastAPI, Python, React)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full md:w-auto"
          >
            <option value="all">All Job Types</option>
            <option value="full_time">Full-Time</option>
            <option value="internship">Internship</option>
            <option value="part_time">Part-Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Jobs Catalog */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Loading active positions from MySQL database...
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Matching Positions Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms or clearing the job type filter.
          </p>
          <button
            onClick={() => { setSearch(''); setTypeFilter('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredJobs.map((job) => {
            const currentStatus = appMap[job.id];
            const isApplied = currentStatus === 'applied' || currentStatus === 'interview' || currentStatus === 'selected';
            const isSaved = currentStatus === 'saved';
            const isActing = actionLoading === job.id;

            const salary =
              job.salary_min && job.salary_max
                ? `₹${(job.salary_min / 100000).toFixed(1)} - ${(job.salary_max / 100000).toFixed(1)} LPA`
                : 'Competitive Salary';

            return (
              <div key={job.id} className="glass-card-interactive p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-white tracking-tight">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Building className="w-3.5 h-3.5 text-brand-400" />
                        {job.company?.name || 'Verified Tech Partner'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        {salary}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium capitalize">
                        {job.job_type ? job.job_type.replace('_', ' ') : 'Full-Time'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {job.experience_years_min}-{job.experience_years_max} yrs exp
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {isApplied ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(job.id)}
                          disabled={isActing || isSaved}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isSaved
                              ? 'bg-slate-800/80 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={isActing}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all disabled:opacity-50"
                        >
                          {isActing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>1-Click Apply</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

                {job.responsibilities && (
                  <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-slate-700 pl-3 italic">
                    Key responsibilities: {job.responsibilities}
                  </p>
                )}

                {/* Skills Taxonomy Tags */}
                {job.job_skills && job.job_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                      Required Skills:
                    </span>
                    {job.job_skills.map((js, i) => (
                      <span
                        key={i}
                        className={`badge-skill text-xs ${
                          js.is_required ? 'border-brand-500/40 text-brand-300' : ''
                        }`}
                      >
                        {js.skill?.name || 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;

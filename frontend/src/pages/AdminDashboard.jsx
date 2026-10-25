import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  FileText,
  Briefcase,
  Award,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [postingJob, setPostingJob] = useState(false);
  const [jobSuccess, setJobSuccess] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    company_name: '',
    location: '',
    job_type: 'full_time',
    experience_years_min: 0,
    experience_years_max: 2,
    min_education: "Bachelor's Degree",
    salary_min: 700000,
    salary_max: 1100000,
    description: '',
    responsibilities: '',
    skills_text: ''
  });

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/metrics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setError(
        err.response?.data?.detail ||
          'Administrative privileges required. Please log in as an administrator (admin@aicareermatch.com).'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    setError('');

    try {
      const payload = {
        title: jobForm.title,
        company_name: jobForm.company_name,
        location: jobForm.location,
        job_type: jobForm.job_type,
        experience_years_min: parseInt(jobForm.experience_years_min, 10) || 0,
        experience_years_max: parseInt(jobForm.experience_years_max, 10) || 2,
        min_education: jobForm.min_education,
        salary_min: jobForm.salary_min ? parseFloat(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseFloat(jobForm.salary_max) : null,
        description: jobForm.description,
        responsibilities: jobForm.responsibilities,
        skills: jobForm.skills_text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      };

      await api.post('/admin/jobs', payload);
      setJobSuccess(true);
      setTimeout(() => {
        setJobSuccess(false);
        setShowJobModal(false);
      }, 2000);

      // Refresh live numbers
      fetchMetrics();
      setJobForm({
        title: '',
        company_name: '',
        location: '',
        job_type: 'full_time',
        experience_years_min: 0,
        experience_years_max: 2,
        min_education: "Bachelor's Degree",
        salary_min: 700000,
        salary_max: 1100000,
        description: '',
        responsibilities: '',
        skills_text: ''
      });
    } catch (err) {
      console.error('Failed to post job requisition:', err);
      alert(err.response?.data?.detail || 'Failed to post job requisition.');
    } finally {
      setPostingJob(false);
    }
  };

  const metrics = data?.metrics
    ? [
        {
          label: 'Registered Candidates',
          value: data.metrics.registered_candidates,
          icon: Users,
          color: 'text-brand-400',
          desc: 'Verified student accounts'
        },
        {
          label: 'Resumes Analyzed',
          value: data.metrics.resumes_analyzed,
          icon: FileText,
          color: 'text-emerald-400',
          desc: 'Parsed by NLP engine'
        },
        {
          label: 'Active Job Requisitions',
          value: data.metrics.active_jobs,
          icon: Briefcase,
          color: 'text-indigo-400',
          desc: 'Corporate positions'
        },
        {
          label: 'Skills in Taxonomy',
          value: data.metrics.skills_in_taxonomy,
          icon: Award,
          color: 'text-amber-400',
          desc: 'Controlled vocabulary'
        }
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrative Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            System Overview & Operations
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time throughput metrics, candidate pipeline inspection, and job posting management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => setShowJobModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Error / Unauthorized Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] self-start sm:self-auto shrink-0"
          >
            Login as Admin
          </Link>
        </div>
      )}

      {/* Live System Metrics Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            Aggregating live production metrics from MySQL...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m, idx) => (
              <div key={idx} className="glass-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {m.label}
                  </span>
                  <m.icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{m.value}</p>
                <p className="text-[11px] text-slate-500">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Two-Column Management Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Candidates */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>Recent Registered Candidates</span>
                </h2>
                <span className="text-xs text-slate-500">Live MySQL users</span>
              </div>

              {data?.recent_candidates?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No candidates registered yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {data?.recent_candidates?.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{c.full_name}</p>
                        <p className="text-slate-500 text-[11px]">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-medium text-[10px] border border-brand-500/20">
                          {c.resume_count} {c.resume_count === 1 ? 'Resume' : 'Resumes'}
                        </span>
                        <p className="text-slate-600 text-[10px] mt-0.5">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Uploaded Resumes */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Recently Analyzed Resumes</span>
                </h2>
                <span className="text-xs text-slate-500">Parsed by NLP engine</span>
              </div>

              {data?.recent_resumes?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No resumes uploaded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {data?.recent_resumes?.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[220px]">
                        <p className="font-semibold text-slate-200 truncate">{r.file_name}</p>
                        <p className="text-slate-500 text-[11px] truncate">{r.candidate_name}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] border ${
                            r.overall_score >= 80
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : r.overall_score >= 60
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {r.overall_score.toFixed(0)}/100
                        </span>
                        <p className="text-slate-600 text-[10px] mt-0.5">
                          {r.uploaded_at ? new Date(r.uploaded_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills Taxonomy Section */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Controlled Skills Taxonomy Distribution</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified technical competencies indexed in MySQL for semantic matching and gap diagnosis.
                </p>
              </div>
              <span className="text-xs text-amber-400 font-semibold">
                {data?.metrics?.skills_in_taxonomy || 54} skills cataloged
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {data?.taxonomy_samples?.map((s, i) => (
                <span
                  key={i}
                  className="badge-skill text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {s.name}{' '}
                  <span className="text-[10px] text-slate-500 uppercase ml-1">({s.category})</span>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Post New Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 relative border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-bold text-white">Post New Job Requisition</h2>
              </div>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {jobSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job requisition published successfully to MySQL database!</span>
              </div>
            )}

            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.company_name}
                    onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                    placeholder="e.g. HyperScale AI Labs"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India (Hybrid)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Job Type
                  </label>
                  <select
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="internship">Internship</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Salary Min (₹ INR/yr)
                  </label>
                  <input
                    type="number"
                    value={jobForm.salary_min}
                    onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                    placeholder="700000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Salary Max (₹ INR/yr)
                  </label>
                  <input
                    type="number"
                    value={jobForm.salary_max}
                    onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                    placeholder="1200000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Required Skills (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={jobForm.skills_text}
                  onChange={(e) => setJobForm({ ...jobForm, skills_text: e.target.value })}
                  placeholder="e.g. Python, FastAPI, Docker, PyTorch, Sentence Transformers"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Job Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the role requirements, team structure, and projects..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Key Responsibilities
                </label>
                <textarea
                  rows="2"
                  value={jobForm.responsibilities}
                  onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })}
                  placeholder="e.g. Design semantic text embeddings, build CI/CD pipelines, optimize database queries..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingJob}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
                >
                  {postingJob ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{postingJob ? 'Publishing...' : 'Publish Job Requisition'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

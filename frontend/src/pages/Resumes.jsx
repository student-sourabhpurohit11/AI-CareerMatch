import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Resumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isPdfOrDocx = allowedTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx');

    if (!isPdfOrDocx) {
      setMessage({ text: 'Invalid file format. Please upload only PDF or DOCX files.', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File exceeds maximum limit of 5MB.', type: 'error' });
      return;
    }

    setSelectedFile(file);
    setMessage({ text: `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, type: 'info' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage({ text: 'Uploading document and executing AI/NLP extraction pipeline...', type: 'info' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ text: 'Resume uploaded and analyzed successfully!', type: 'success' });
      setSelectedFile(null);
      fetchResumes();
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || 'Failed to upload and parse resume. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter((r) => r.id !== id));
      setMessage({ text: 'Resume deleted successfully.', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to delete resume.', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Resume Management & AI Extraction
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload PDF or DOCX format resumes. Our automated pipeline extracts text, cleans formatting, and executes semantic NLP parsing.
        </p>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
            message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="glass-card p-6 sm:p-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-brand-500/60 rounded-2xl p-8 text-center transition-all bg-slate-950/40">
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resume-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-glow">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your resume'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF or DOCX (Max size: 5MB)
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>PyMuPDF & python-docx NLP engine active</span>
            </div>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-40"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing NLP...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Resumes List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Your Uploaded Resumes</h2>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading resumes...</div>
        ) : resumes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No resumes uploaded yet.</p>
            <p className="text-xs text-slate-500">
              Upload your resume above to unlock automated AI scoring and job matching!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-200">{resume.file_name}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {resume.file_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(resume.file_size_bytes / 1024).toFixed(1)} KB • Uploaded on{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link
                    to={`/resumes/${resume.id}/analysis`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resumes;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Target,
  FileCheck2,
  Loader2,
  RefreshCw,
  Cpu,
  Download
} from 'lucide-react';

const Resumes = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (resumeId, fileName = 'resume') => {
    try {
      const res = await api.get(`/resumes/${resumeId}/report`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = fileName.replace(/\.[^/.]+$/, "");
      a.download = `Resume_Analysis_Report_${cleanName}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      navigate(`/resumes/${resumeId}/analysis`);
    }
  };

  const handleDownloadOriginalResume = async (resumeId, fileName) => {
    try {
      const res = await api.get(`/resumes/${resumeId}/file?download=true`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download original resume:', err);
      setMessage({ text: 'Failed to download original document.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const validateAndSetFile = (file) => {
    if (!file) return false;

    const allowedExtensions = ['.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExt) {
      setMessage({
        text: 'Unsupported format. Please upload a PDF (.pdf) or Microsoft Word (.docx) document.',
        type: 'error'
      });
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File exceeds maximum size limit of 5MB.', type: 'error' });
      return false;
    }

    setSelectedFile(file);
    setMessage({
      text: `Ready to analyze: "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Upload & Analyze Now" to run the NLP pipeline.`,
      type: 'info'
    });
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setLatestAnalysis(null);

    // Multi-stage progress indicators
    setProcessingStage('1/3: Uploading document to secure storage...');
    const stageTimer1 = setTimeout(() => {
      setProcessingStage('2/3: PyMuPDF extracting structural text & sections...');
    }, 900);
    const stageTimer2 = setTimeout(() => {
      setProcessingStage('3/3: Running NLP skill extraction & scoring algorithms...');
    }, 2000);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Notice: Do NOT pass manual Content-Type header so Axios generates boundary automatically
      const res = await api.post('/resumes/upload', formData);
      const uploadedResume = res.data;

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setProcessingStage('');

      const scoreText = uploadedResume?.analysis?.overall_score != null
        ? `${uploadedResume.analysis.overall_score}/100`
        : 'Completed';
      setMessage({
        text: `Resume "${selectedFile.name}" analyzed successfully! Score: ${scoreText}.`,
        type: 'success'
      });
      setLatestAnalysis(uploadedResume);
      setSelectedFile(null);
      await fetchResumes();

    } catch (err) {
      console.error('Resume upload error:', err);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setProcessingStage('');

      const errorDetail =
        err.response?.data?.detail ||
        (err.message === 'Network Error'
          ? 'Cannot reach backend server. Please verify the API is running on http://127.0.0.1:8000.'
          : err.response?.data?.message || err.message || 'Failed to process resume. Please ensure the document contains selectable text and try again.');

      setMessage({
        text: errorDetail,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/resumes/${id}`);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (latestAnalysis?.id === id) {
        setLatestAnalysis(null);
      }
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
          Upload your PDF or DOCX resume. Our automated pipeline extracts text, categorizes skill taxonomy, and computes explainable readiness scores.
        </p>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm border transition-all ${
            message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-brand-500/10 border-brand-500/30 text-brand-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          {latestAnalysis && (
            <Link
              to={`/resumes/${latestAnalysis.id}/analysis`}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-300 whitespace-nowrap flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Latest Analysis Highlight Banner (Shown immediately upon upload) */}
      {latestAnalysis && (
        <div className="glass-card p-6 border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-brand-950/20 animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{latestAnalysis.file_name}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Analyzed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted and scored by AI-CareerMatch NLP engine
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Overall Score</p>
                <p className="text-3xl font-extrabold text-emerald-400">
                  {latestAnalysis.analysis?.overall_score ?? 'N/A'}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadReport(latestAnalysis.id, latestAnalysis.file_name)}
                className="px-3.5 py-2.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 hover:border-brand-500/40 transition-all flex items-center gap-2"
                title="Download Analysis Report"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                <span>Download Report</span>
              </button>
              <Link
                to={`/resumes/${latestAnalysis.id}/analysis`}
                className="px-4 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <span>View Full Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase">Skills Breadth</p>
              <p className="text-sm font-bold text-brand-300">{latestAnalysis.analysis?.skills_score ?? 0}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase">Projects Depth</p>
              <p className="text-sm font-bold text-indigo-300">{latestAnalysis.analysis?.project_score ?? 0}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase">Education</p>
              <p className="text-sm font-bold text-teal-300">{latestAnalysis.analysis?.education_score ?? 0}%</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 uppercase">Completeness</p>
              <p className="text-sm font-bold text-emerald-300">{latestAnalysis.analysis?.completeness_score ?? 0}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="glass-card p-6 sm:p-8">
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-slate-950/40 ${
              isDragging
                ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-brand-500/70 bg-brand-500/5'
                : 'border-slate-700 hover:border-brand-500/60'
            }`}
          >
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
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  selectedFile
                    ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300 scale-110 shadow-glow'
                    : 'bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-glow'
                }`}
              >
                {uploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-brand-400" />
                ) : selectedFile ? (
                  <FileCheck2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-base font-semibold text-white">
                  {selectedFile ? (
                    <span className="text-brand-300 flex items-center justify-center gap-2">
                      <span>Ready: {selectedFile.name}</span>
                      <span className="text-xs text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </span>
                  ) : isDragging ? (
                    'Drop resume here to select'
                  ) : (
                    'Click to select or drag and drop your resume'
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF (.pdf) or Microsoft Word (.docx) • Maximum: 5MB
                </p>
              </div>
            </label>
          </div>

          {/* Processing Animation Bar */}
          {uploading && (
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-400 animate-spin" />
                  <span>{processingStage || 'AI processing pipeline active...'}</span>
                </span>
                <span className="text-brand-400">Please wait...</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>PyMuPDF & python-docx NLP extraction engine active</span>
            </div>

            <div className="flex items-center gap-2">
              {selectedFile && !uploading && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Clear Selection
                </button>
              )}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-40"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Resume...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload & Analyze Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Uploaded Resumes List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Uploaded Resumes</h2>
          <button
            onClick={fetchResumes}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>Loading resumes...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm font-medium">No resumes uploaded yet.</p>
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
                      {resume.is_active && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(resume.file_size_bytes / 1024).toFixed(1)} KB • Uploaded on{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleDownloadOriginalResume(resume.id, resume.file_name)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Download Original Uploaded File"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Original</span>
                  </button>
                  <button
                    onClick={() => handleDownloadReport(resume.id, resume.file_name)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Download Analysis Report (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-400" />
                    <span className="hidden sm:inline">Report</span>
                  </button>
                  <Link
                    to={`/resumes/${resume.id}/analysis`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Analysis</span>
                  </Link>
                  <Link
                    to="/matches"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Matched Jobs</span>
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

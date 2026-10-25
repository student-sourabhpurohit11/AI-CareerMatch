import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Download,
  Printer,
  FileText,
  Check,
  ExternalLink,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Target,
  RefreshCw,
  FileCheck2,
  HelpCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

const ResumeAnalysis = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSectionTab, setActiveSectionTab] = useState('education');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleTogglePreview = async () => {
    if (!showDocPreview && !previewUrl) {
      setPreviewLoading(true);
      try {
        const res = await api.get(`/resumes/${id}/file`, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        setPreviewUrl(url);
        setShowDocPreview(true);
      } catch (err) {
        console.error('Failed to load document preview:', err);
        alert('Unable to load document preview from server.');
      } finally {
        setPreviewLoading(false);
      }
    } else {
      setShowDocPreview(!showDocPreview);
    }
  };

  const handleDownloadOriginalFile = async () => {
    try {
      const res = await api.get(`/resumes/${id}/file?download=true`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = analysis?.file_name || 'Resume_Document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download original document.');
    }
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/resumes/${id}/analysis`);
        setAnalysis(res.data);
      } catch (err) {
        console.error('Failed to load real resume analysis:', err);
        setError(
          err.response?.data?.detail ||
          'Analysis report unavailable for this resume ID. Please verify the resume exists or upload a new one.'
        );
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  // Handle formatted report download
  const handleDownloadReport = async (format = 'txt') => {
    setDownloading(true);
    setDownloadSuccess('');

    try {
      if (format === 'print') {
        window.print();
        setDownloading(false);
        return;
      }

      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysis, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Resume_Analysis_${analysis.file_name || 'report'}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setDownloadSuccess('JSON report exported successfully!');
        setTimeout(() => setDownloadSuccess(''), 3000);
        setDownloading(false);
        return;
      }

      // Default: Text / Markdown report download via backend or client generator
      try {
        const res = await api.get(`/resumes/${id}/report`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = (analysis.file_name || `resume_${id}`).replace(/\.[^/.]+$/, "");
        a.download = `Resume_Analysis_Report_${cleanName}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        // Fallback client-side generator if offline
        const content = generateClientReport(analysis);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Resume_Analysis_Report_${id}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }

      setDownloadSuccess('Report downloaded successfully!');
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setDownloading(false);
    }
  };

  const generateClientReport = (data) => {
    return `================================================================================
 AI-CAREERMATCH | EXPLAINABLE RESUME ANALYSIS & CAREER AUDIT REPORT
================================================================================

DOCUMENT METADATA:
- File Name: ${data.file_name || 'Resume'}
- Format: ${data.file_type || 'PDF'}
- Size: ${data.file_size_bytes ? (data.file_size_bytes / 1024).toFixed(1) + ' KB' : 'N/A'}
- Candidate Name: ${data.candidate_name || 'Candidate'}
- Candidate Email: ${data.candidate_email || 'N/A'}
- Candidate Phone: ${data.candidate_phone || 'N/A'}
- Analyzed At: ${new Date(data.analyzed_at || Date.now()).toLocaleString()}

EXECUTIVE READINESS SCORECARD:
- Overall Compatibility Score: ${data.overall_score} / 100
- Technical Skills Breadth: ${data.skills_score}%
- Projects Depth & Execution: ${data.project_score}%
- Practical Experience: ${data.experience_score}%
- Education Alignment: ${data.education_score}%
- Structural Completeness: ${data.completeness_score}%

EXECUTIVE SUMMARY:
"${data.summary_text}"

IDENTIFIED PROFILE STRENGTHS:
${(data.strengths_json || []).map((s, i) => `  ${i + 1}. [✓] ${s}`).join('\n')}

ACTIONABLE AREAS TO IMPROVE:
${(data.improvements_json || []).map((imp, i) => `  ${i + 1}. [○] ${imp}`).join('\n')}

EXTRACTED SKILLS TAXONOMY (${(data.extracted_skills || []).length} Identified):
${data.categorized_skills ? Object.entries(data.categorized_skills).map(([cat, list]) => `  [${cat}]: ${list.join(', ')}`).join('\n') : (data.extracted_skills || []).join(', ')}

================================================================================
Generated by AI-CareerMatch Semantic NLP Engine
================================================================================`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
        <p className="text-slate-400 font-medium text-sm">
          Generating comprehensive explainable analysis report...
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Analysis Report Unavailable</h2>
        <p className="text-sm text-slate-400">
          {error || 'We could not load the analysis report for this resume ID.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/resumes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resumes
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getScoreRating = (score) => {
    if (score >= 85) return { label: 'Excellent Readiness', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 75) return { label: 'High Potential Profile', color: 'text-brand-300', bg: 'bg-brand-500/10 border-brand-500/30' };
    if (score >= 60) return { label: 'Moderate Competency', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Developing Foundation', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getScoreRating(analysis.overall_score);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Print-Only Official Report Header */}
      <div className="hidden print:block border-b pb-4 mb-6 text-black">
        <h1 className="text-2xl font-bold">AI-CareerMatch | Resume Audit & Analysis Report</h1>
        <p className="text-xs text-gray-600 mt-1">
          Candidate: {analysis.candidate_name || 'N/A'} • Document: {analysis.file_name} • Generated: {new Date(analysis.analyzed_at || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {/* Top Header & Navigation Bar (Screen Only) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/resumes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Uploaded Resumes
        </Link>

        {/* Action Controls: Download Buttons & Job Matching */}
        <div className="flex flex-wrap items-center gap-2.5">
          {downloadSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              {downloadSuccess}
            </span>
          )}

          {/* Download Text Report */}
          <button
            onClick={() => handleDownloadReport('txt')}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-brand-500/40"
            title="Download full analysis report as text file"
          >
            <Download className="w-3.5 h-3.5 text-brand-400" />
            <span>Download Report (.txt)</span>
          </button>

          {/* Download PDF / Print Report */}
          <button
            onClick={() => handleDownloadReport('print')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-brand-500/40"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Print / PDF</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => handleDownloadReport('json')}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-all"
            title="Export raw JSON data"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {/* Preview Original Document */}
          <button
            onClick={handleTogglePreview}
            disabled={previewLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all hover:border-emerald-500/40"
            title="Preview original uploaded resume document"
          >
            {previewLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : showDocPreview ? (
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{showDocPreview ? 'Hide Original Document' : 'Preview Document'}</span>
          </button>

          {/* View Matched Jobs */}
          <Link
            to="/matches"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <span>See Compatible Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Original Document Preview Container */}
      {showDocPreview && previewUrl && (
        <div className="glass-card p-5 border-emerald-500/30 space-y-4 animate-fadeIn bg-slate-950/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Original Document: {analysis.file_name}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {analysis.file_type || 'PDF'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadOriginalFile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                <span>Download Original File</span>
              </button>
              <button
                onClick={() => setShowDocPreview(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {analysis.file_type === 'pdf' || analysis.file_name?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={previewUrl}
              title="Resume PDF Preview"
              className="w-full h-[650px] rounded-xl border border-slate-800 bg-slate-900"
            />
          ) : (
            <div className="p-8 text-center space-y-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <FileText className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">DOCX Word Document</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Microsoft Word DOCX files are parsed directly by our backend NLP parser. You can download the original file or examine the categorized extracted skills below.
              </p>
              <button
                onClick={handleDownloadOriginalFile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Download {analysis.file_name}</span>
              </button>
            </div>
          )}
        </div>
      )}


      {/* Document Meta Header Banner */}
      <div className="glass-card p-5 border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900 to-brand-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {analysis.file_name || 'Resume Document'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {analysis.file_type || 'PDF'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${rating.bg} ${rating.color}`}>
                  {rating.label}
                </span>
              </div>

              {/* Extracted Candidate Info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                {analysis.candidate_name && (
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {analysis.candidate_name}
                  </span>
                )}
                {analysis.candidate_email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {analysis.candidate_email}
                  </span>
                )}
                {analysis.candidate_phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {analysis.candidate_phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Analyzed on {new Date(analysis.analyzed_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20 self-start md:self-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explainable NLP Scoring Engine</span>
          </div>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Big Score Gauge */}
          <div className="text-center md:text-left md:border-r md:border-slate-800 pr-0 md:pr-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Explainable Resume Score
            </span>
            <div className="mt-3 flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                {analysis.overall_score}
              </span>
              <span className="text-xl text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className={`text-xs mt-2 font-semibold ${rating.color}`}>
              {rating.label}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Multi-dimensional weighted analysis across 5 core competency dimensions
            </p>
          </div>

          {/* 5-Dimensional Metric Bars */}
          <div className="md:col-span-2 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Technical Skills Breadth (Weight: 35%)</span>
                <span className="text-brand-300 font-bold">{analysis.skills_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, analysis.skills_score))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Project Depth & Engineering Outcomes (Weight: 25%)</span>
                <span className="text-indigo-300 font-bold">{analysis.project_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, analysis.project_score))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Practical Experience & Internships (Weight: 20%)</span>
                <span className="text-purple-300 font-bold">{analysis.experience_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, analysis.experience_score))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Education & Academic Alignment (Weight: 10%)</span>
                <span className="text-teal-300 font-bold">{analysis.education_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, analysis.education_score))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">Completeness & Section Health (Weight: 10%)</span>
                <span className="text-emerald-300 font-bold">{analysis.completeness_score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, analysis.completeness_score))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Executive Summary Blockquote */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <span className="text-brand-400 font-serif text-3xl leading-none">“</span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {analysis.summary_text}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths & Improvement Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Strengths */}
        <div className="glass-card p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Identified Profile Strengths</h2>
              <p className="text-[11px] text-slate-400">Validated competencies that enhance market competitiveness</p>
            </div>
          </div>
          <ul className="space-y-3 pt-2">
            {analysis.strengths_json && analysis.strengths_json.length > 0 ? (
              analysis.strengths_json.map((strength, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold text-sm leading-none shrink-0 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No specific strengths recorded.</li>
            )}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="glass-card p-6 space-y-4 border-amber-500/20">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Actionable Areas to Improve</h2>
              <p className="text-[11px] text-slate-400">High-leverage enhancements to raise your match score</p>
            </div>
          </div>
          <ul className="space-y-3 pt-2">
            {analysis.improvements_json && analysis.improvements_json.length > 0 ? (
              analysis.improvements_json.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="text-amber-400 font-bold text-sm leading-none shrink-0 mt-0.5">○</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">Profile has high completeness across all standard dimensions!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Categorized Skills Taxonomy */}
      <div className="glass-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Extracted NLP Skills Taxonomy
              </h2>
              <p className="text-xs text-slate-400">
                Controlled taxonomy matching mapped against database tech stacks
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 self-start sm:self-auto">
            {analysis.extracted_skills?.length || 0} Skills Detected
          </span>
        </div>

        {analysis.categorized_skills && Object.keys(analysis.categorized_skills).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.categorized_skills).map(([category, skills]) => (
              <div key={category} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  {category} ({skills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, sIdx) => (
                    <span key={sIdx} className="badge-skill text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : analysis.extracted_skills && analysis.extracted_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {analysis.extracted_skills.map((skill, idx) => (
              <span key={idx} className="badge-skill text-sm py-1.5 px-3">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No specific skills were extracted from the document. Please ensure your resume lists technologies under a dedicated Skills section.
          </p>
        )}
      </div>

      {/* Parsed Resume Structural Sections (Interactive Section Audit) */}
      {analysis.detected_sections && (
        <div className="glass-card p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Parsed Structural Document Sections
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect the exact content segmented by the PyMuPDF & regex partition engine
                </p>
              </div>
            </div>

            {/* Section Tab Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['education', 'projects', 'experience', 'skills', 'certifications'].map((tab) => {
                const hasContent = Boolean(analysis.detected_sections[tab]?.trim());
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSectionTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      activeSectionTab === tab
                        ? 'bg-brand-600 text-white shadow'
                        : hasContent
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        : 'bg-slate-900/40 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {tab}
                    {hasContent && <span className="ml-1 text-[10px] text-brand-300">•</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Section Content Display */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            {analysis.detected_sections[activeSectionTab] && analysis.detected_sections[activeSectionTab].trim() ? (
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {analysis.detected_sections[activeSectionTab]}
              </pre>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No content specifically detected for "{activeSectionTab}" section in this document.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Top Matching Market Jobs Preview */}
      {analysis.top_matches && analysis.top_matches.length > 0 && (
        <div className="glass-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Market Job Compatibility Preview
                </h2>
                <p className="text-xs text-slate-400">
                  Top opportunities matched to this resume using hybrid semantic cosine similarity
                </p>
              </div>
            </div>
            <Link
              to="/matches"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {analysis.top_matches.map((job) => (
              <div
                key={job.job_id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{job.title}</h3>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {job.compatibility}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.company}</span>
                  </p>
                </div>

                {job.matched_skills && job.matched_skills.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Matched Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.map((s, idx) => (
                        <span key={idx} className="badge-matched text-[11px] py-0.5 px-2">
                          {typeof s === 'string' ? s : s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  to="/matches"
                  className="w-full mt-2 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-center text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  View Job Match Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Download & Navigation Action Bar */}
      <div className="no-print glass-card p-6 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Save or Share this Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Download your audit report to review feedback offline or share with a mentor.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleDownloadReport('txt')}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (.txt)</span>
          </button>
          <button
            onClick={() => handleDownloadReport('print')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Building, MapPin, DollarSign, Search, CheckCircle2 } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const sampleJobs = [
    {
      id: 1,
      title: "Junior Backend Engineer (Python/FastAPI)",
      company: "CloudScale Systems",
      location: "Bengaluru, India (Hybrid)",
      type: "Full-Time",
      salary: "₹6.5 - 9.5 LPA",
      skills: ["Python", "FastAPI", "MySQL", "REST API", "Docker", "Git"],
      description: "Join our backend infrastructure team to build high-performance REST APIs, integrate distributed MySQL databases, and write modular Python microservices using FastAPI and Docker."
    },
    {
      id: 2,
      title: "Associate AI/NLP Engineer",
      company: "Nexora AI Labs",
      location: "Hyderabad, India (On-site)",
      type: "Full-Time",
      salary: "₹7.5 - 11.0 LPA",
      skills: ["Python", "NLP", "Machine Learning", "spaCy", "Sentence Transformers", "PyTorch"],
      description: "Nexora AI is looking for an enthusiastic Machine Learning / NLP Engineer to develop semantic text matching pipelines, vector similarity search algorithms, and document information extraction models."
    },
    {
      id: 3,
      title: "Full Stack Developer (React & Node.js)",
      company: "Apex Fintech Global",
      location: "Mumbai, India (Hybrid)",
      type: "Full-Time",
      salary: "₹7.0 - 10.5 LPA",
      skills: ["React", "JavaScript", "Node.js", "MySQL", "Tailwind CSS", "REST API"],
      description: "Develop cutting-edge dashboard experiences with React, Tailwind CSS, and Node.js. You will bridge intuitive responsive user interfaces with robust backend business logic."
    },
    {
      id: 4,
      title: "Cloud & DevOps Associate",
      company: "InnoStack Solutions",
      location: "Pune, India (Remote)",
      type: "Full-Time",
      salary: "₹6.0 - 8.5 LPA",
      skills: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Git"],
      description: "Help streamline automated CI/CD deployment pipelines, manage containerized clusters with Docker & Kubernetes, and monitor production workloads on AWS."
    }
  ];

  const displayedJobs = sampleJobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Explore Live Career Requisitions
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Browse verified engineering positions across high-growth technology firms.
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or required skill (e.g. FastAPI, Python, React)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Jobs Catalog */}
      <div className="space-y-5">
        {displayedJobs.map(job => (
          <div key={job.id} className="glass-card-interactive p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">{job.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                    {job.type}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.skills.map((s, i) => (
                <span key={i} className="badge-skill text-xs">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;

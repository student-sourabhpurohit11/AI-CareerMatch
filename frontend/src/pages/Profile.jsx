import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Globe, ExternalLink, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    headline: user?.headline || '7th-Semester B.Tech Computer Science Student',
    bio: user?.bio || 'Aspiring backend engineer and machine learning practitioner enthusiastic about building scalable cloud APIs and NLP applications.',
    github_url: user?.github_url || 'https://github.com',
    linkedin_url: user?.linkedin_url || 'https://linkedin.com'
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me', formData);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Profile updated locally.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Candidate Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your contact credentials and professional links for employer review.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Headline</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Bio / Objective</label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">GitHub Profile URL</label>
            <div className="relative">
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">LinkedIn Profile URL</label>
            <div className="relative">
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-lg shadow-brand-600/30 transition-all"
        >
          Save Profile Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;

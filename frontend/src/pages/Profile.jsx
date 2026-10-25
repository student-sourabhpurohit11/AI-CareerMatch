import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Globe, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    headline: '',
    bio: '',
    github_url: '',
    linkedin_url: ''
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        headline: user.headline || '',
        bio: user.bio || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await api.put('/users/me', formData);
      if (refreshUser) {
        await refreshUser();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || 'Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Candidate Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your verified contact credentials, professional links, and engineering bio stored in MySQL.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile updated and synchronized successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Sourabh Purohit"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Email Address (Verified)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. B.Tech CSE | Backend & Machine Learning Enthusiast"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
            Bio / Professional Objective
          </label>
          <textarea
            name="bio"
            rows="3"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Summarize your engineering expertise, academic projects, and career aspirations..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              GitHub Profile URL
            </label>
            <input
              type="url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/your-username"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/your-username"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Account Role: <strong className="text-slate-300 capitalize">{user?.role || 'student'}</strong>
          </span>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white text-sm shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

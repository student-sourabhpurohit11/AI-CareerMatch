import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Target,
  Compass,
  CheckSquare,
  User,
  ShieldAlert,
  LogOut,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
    { name: 'Job Matches', path: '/matches', icon: Target },
    { name: 'Explore Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Skill Gap Analysis', path: '/skill-gap', icon: TrendingUp },
    { name: 'Career Pathways', path: '/career-paths', icon: Compass },
    { name: 'Application Tracker', path: '/applications', icon: CheckSquare },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Console', path: '/admin', icon: ShieldAlert, adminOnly: true });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              AI-CareerMatch
            </h1>
            <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">
              Career Engine
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-brand-400 text-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name || 'Candidate'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-white">AI-CareerMatch</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive(item.path) ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

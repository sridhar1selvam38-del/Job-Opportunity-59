import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  DollarSign,
  Bookmark,
  ExternalLink,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  Globe2,
  X,
  Share2,
  ShieldCheck,
  TrendingUp,
  User,
  Heart,
  LogOut,
  Lock,
  Mail,
  Upload,
  Trash2,
  Plus,
  Bell,
  Check,
  Key,
  FileText
} from 'lucide-react';
import initialData from './data/initialData.json';

interface Job {
  id: number;
  title: string;
  slug: string;
  company_id: number;
  company_name: string;
  company_logo: string;
  company_website?: string;
  category_id: number;
  category_name: string;
  description: string;
  requirements?: string;
  benefits?: string;
  skills_required?: string;
  job_type: string;
  experience_level: string;
  work_mode: string;
  location: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  original_url: string;
  is_featured: number;
  is_remote: number;
  is_fresher: number;
  is_internship: number;
  views_count?: number;
  application_count?: number;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  website: string;
  industry: string;
  location: string;
  description?: string;
  job_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  job_count?: number;
}

interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar_url?: string;
  headline?: string;
  bio?: string;
  skills?: string;
  location?: string;
  experience_level?: string;
  resume_filename?: string;
  auth_provider?: string;
}

export default function App() {
  const [jobsList, setJobsList] = useState<Job[]>(() => {
    try {
      const stored = localStorage.getItem('jp_custom_jobs');
      if (stored) {
        return [...(initialData.jobs as Job[]), ...JSON.parse(stored)];
      }
    } catch {}
    return initialData.jobs as Job[];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'internships' | 'fresher' | 'remote' | 'companies' | 'saved'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('jp_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authRole, setAuthRole] = useState<'USER' | 'ADMIN'>('USER');

  // Dashboard & Admin Modals
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'profile' | 'saved' | 'applications' | 'alerts'>('profile');

  // User Profile fields
  const [profileHeadline, setProfileHeadline] = useState(currentUser?.headline || 'Software Engineer | Career Explorer');
  const [profileLocation, setProfileLocation] = useState(currentUser?.location || 'Chennai, India');
  const [profileSkills, setProfileSkills] = useState(currentUser?.skills || 'React, TypeScript, Python, Node.js');
  const [profileResumeName, setProfileResumeName] = useState(currentUser?.resume_filename || '');

  // LocalStorage saved jobs state
  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('jp_saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track applied jobs
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('jp_applied_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Job alerts
  const [alerts, setAlerts] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jp_user_alerts');
      return stored ? JSON.parse(stored) : ['React Frontend Engineer - Remote', 'Full-Stack Python Fresher'];
    } catch {
      return ['React Frontend Engineer - Remote'];
    }
  });
  const [newAlertKeyword, setNewAlertKeyword] = useState('');

  // Admin New Job form
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('Apex Financial Tech');
  const [newJobLocation, setNewJobLocation] = useState('Remote');
  const [newJobType, setNewJobType] = useState('Full-time');
  const [newJobSalaryMin, setNewJobSalaryMin] = useState('100000');
  const [newJobSalaryMax, setNewJobSalaryMax] = useState('130000');
  const [newJobDesc, setNewJobDesc] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      showToast('Please enter your email and password');
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const isAdmin = email.includes('admin') || authPassword === 'admin123';
    const user: AuthUser = {
      id: Math.floor(Math.random() * 10000) + 1,
      full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email: email,
      role: isAdmin ? 'ADMIN' : 'USER',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      headline: isAdmin ? 'Platform Administrator' : 'Software Professional',
      location: 'India',
      skills: 'React, Node.js, Cloud Run, SQL',
      auth_provider: 'LOCAL'
    };

    setCurrentUser(user);
    localStorage.setItem('jp_current_user', JSON.stringify(user));
    setShowAuthModal(false);
    showToast(`Welcome back, ${user.full_name}!`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFullName.trim() || !authEmail.trim() || !authPassword.trim()) {
      showToast('Please fill all required registration fields');
      return;
    }

    const email = authEmail.trim().toLowerCase();
    const user: AuthUser = {
      id: Math.floor(Math.random() * 10000) + 1,
      full_name: authFullName.trim(),
      email: email,
      role: authRole,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authFullName)}`,
      headline: 'Aspiring Professional',
      location: 'India',
      skills: 'JavaScript, Web Development',
      auth_provider: 'LOCAL'
    };

    setCurrentUser(user);
    localStorage.setItem('jp_current_user', JSON.stringify(user));
    setShowAuthModal(false);
    showToast('Registration successful! Welcome to JobPost Aggregator.');
  };

  const handleGoogleLogin = (customName?: string, customEmail?: string) => {
    const email = customEmail || 'sridhar1selvam38@gmail.com';
    const name = customName || 'Sridhar Selvam';
    const user: AuthUser = {
      id: 999,
      full_name: name,
      email: email,
      role: 'USER',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      headline: 'Full-Stack Developer | AI Enthusiast',
      location: 'Tamil Nadu, India',
      skills: 'React, Vite, Node.js, Python, Express',
      auth_provider: 'GOOGLE'
    };

    setCurrentUser(user);
    localStorage.setItem('jp_current_user', JSON.stringify(user));
    setShowAuthModal(false);
    showToast(`Signed in with Google as ${name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jp_current_user');
    setShowDashboardModal(false);
    setShowAdminModal(false);
    showToast('Successfully logged out.');
  };

  const toggleSaveJob = (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    setSavedJobIds((prev) => {
      let next: number[];
      if (prev.includes(jobId)) {
        next = prev.filter((id) => id !== jobId);
        showToast('Job removed from bookmarks');
      } else {
        next = [...prev, jobId];
        showToast('Job saved to bookmarks!');
      }
      localStorage.setItem('jp_saved_jobs', JSON.stringify(next));
      return next;
    });
  };

  const trackApplication = (jobId: number) => {
    if (!appliedJobIds.includes(jobId)) {
      const updated = [...appliedJobIds, jobId];
      setAppliedJobIds(updated);
      localStorage.setItem('jp_applied_jobs', JSON.stringify(updated));
    }
    showToast('Application tracked in your profile!');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updated: AuthUser = {
      ...currentUser,
      headline: profileHeadline,
      location: profileLocation,
      skills: profileSkills,
      resume_filename: profileResumeName
    };
    setCurrentUser(updated);
    localStorage.setItem('jp_current_user', JSON.stringify(updated));
    showToast('Profile updated successfully!');
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertKeyword.trim()) return;
    const next = [...alerts, newAlertKeyword.trim()];
    setAlerts(next);
    localStorage.setItem('jp_user_alerts', JSON.stringify(next));
    setNewAlertKeyword('');
    showToast('New career alert active!');
  };

  const handleDeleteAlert = (index: number) => {
    const next = alerts.filter((_, idx) => idx !== index);
    setAlerts(next);
    localStorage.setItem('jp_user_alerts', JSON.stringify(next));
    showToast('Alert removed');
  };

  const handleAddAdminJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      showToast('Please enter a job title');
      return;
    }

    const created: Job = {
      id: Date.now(),
      title: newJobTitle.trim(),
      slug: newJobTitle.toLowerCase().replace(/\s+/g, '-'),
      company_id: 1,
      company_name: newJobCompany,
      company_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
      category_id: 1,
      category_name: 'Software Engineering',
      description: newJobDesc || 'Exciting career opportunity joining our high-impact team.',
      job_type: newJobType,
      experience_level: '1-3 years',
      work_mode: 'Remote',
      location: newJobLocation,
      salary_min: parseInt(newJobSalaryMin, 10) || 80000,
      salary_max: parseInt(newJobSalaryMax, 10) || 120000,
      salary_currency: 'USD',
      original_url: 'https://example.com/apply',
      is_featured: 1,
      is_remote: 1,
      is_fresher: 0,
      is_internship: 0,
      created_at: new Date().toISOString()
    };

    const nextJobs = [created, ...jobsList];
    setJobsList(nextJobs);
    try {
      const customOnly = nextJobs.filter((j) => j.id > 1000);
      localStorage.setItem('jp_custom_jobs', JSON.stringify(customOnly));
    } catch {}

    setNewJobTitle('');
    setNewJobDesc('');
    showToast('New job posted successfully by Admin!');
    setShowAdminModal(false);
  };

  const companies: Company[] = initialData.companies as Company[];
  const categories: Category[] = initialData.categories as Category[];

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      // Tab filter
      if (activeTab === 'internships' && !job.is_internship && job.job_type !== 'Internship') return false;
      if (activeTab === 'fresher' && !job.is_fresher && job.experience_level !== 'Fresher') return false;
      if (activeTab === 'remote' && !job.is_remote && job.work_mode !== 'Remote') return false;
      if (activeTab === 'saved' && !savedJobIds.includes(job.id)) return false;

      // Category filter
      if (selectedCategory !== 'all' && String(job.category_id) !== selectedCategory) return false;

      // Type filter
      if (selectedType !== 'all' && job.job_type !== selectedType) return false;

      // Mode filter
      if (selectedMode !== 'all' && job.work_mode !== selectedMode) return false;

      // Level filter
      if (selectedLevel !== 'all' && job.experience_level !== selectedLevel) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchCompany = job.company_name.toLowerCase().includes(query);
        const matchSkills = (job.skills_required || '').toLowerCase().includes(query);
        const matchDesc = job.description.toLowerCase().includes(query);
        if (!matchTitle && !matchCompany && !matchSkills && !matchDesc) return false;
      }

      // Location filter
      if (locationTerm.trim()) {
        const loc = locationTerm.toLowerCase();
        if (!job.location.toLowerCase().includes(loc)) return false;
      }

      return true;
    });
  }, [jobsList, activeTab, selectedCategory, selectedType, selectedMode, selectedLevel, searchTerm, locationTerm, savedJobIds]);

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    if (min) return `$${min.toLocaleString()}+`;
    return 'Competitive';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('all')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200">
              J
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl">
                JOBPOST <span className="text-indigo-600">AGGREGATOR</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Search • Discover • Apply
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'internships'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Internships</span>
            </button>
            <button
              onClick={() => setActiveTab('remote')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'remote'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe2 className="w-4 h-4 text-sky-600" />
              <span>Remote</span>
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === 'companies'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${savedJobIds.length > 0 ? 'text-amber-500 fill-amber-500' : ''}`} />
              <span>Saved ({savedJobIds.length})</span>
            </button>
          </nav>

          {/* User Auth Buttons in Top Navbar */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-1.5 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-sm transition"
                >
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl transition flex items-center gap-1 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDashboardModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition border border-slate-200"
                >
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.full_name)}`}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>{currentUser.full_name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-10 pb-8 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Job Post Aggregator & Career Discovery
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Search. Discover. Apply.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6">
            Explore verified opportunities across top tech companies, startups, and remote teams with one-click bookmarking and application tracking.
          </p>

          {/* Search Box */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-indigo-100/60 border border-slate-200 flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 w-full md:flex-1 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-64 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              <input
                type="text"
                placeholder="City, State, or Remote..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <button
              onClick={() => setActiveTab('all')}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-300"
            >
              Search Jobs
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-indigo-600">{jobsList.length}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Active Postings</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{companies.length}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Top Employers</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-violet-600">{categories.length}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Categories</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="text-xl sm:text-2xl font-black text-amber-600">100%</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Verified Sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* If Companies Tab is selected */}
        {activeTab === 'companies' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Hiring Companies</h2>
              <p className="text-sm text-slate-500">Explore trusted organizations currently recruiting top talent.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((comp) => (
                <div key={comp.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={comp.logo_url}
                      alt={comp.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{comp.name}</h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {comp.industry}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4">{comp.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {comp.location}
                    </span>
                    <button
                      onClick={() => {
                        setSearchTerm(comp.name);
                        setActiveTab('all');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      View {comp.job_count} Jobs →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    Filters
                  </h3>
                  {(selectedCategory !== 'all' || selectedType !== 'all' || selectedMode !== 'all' || selectedLevel !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedType('all');
                        setSelectedMode('all');
                        setSelectedLevel('all');
                      }}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Disciplines</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Any Work Arrangement</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Work Mode</label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Any Location Mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Experience</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Experience Levels</option>
                    <option value="Fresher">Fresher / Entry-Level</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Job Listings List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-700">
                  Showing <span className="text-indigo-600">{filteredJobs.length}</span> positions
                </span>
                {activeTab === 'saved' && (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                    Bookmarked Jobs
                  </span>
                )}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base mb-1">No matching jobs found</h3>
                  <p className="text-xs text-slate-500 mb-4">Try clearing filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLocationTerm('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSelectedMode('all');
                      setSelectedLevel('all');
                      setActiveTab('all');
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => {
                    const isSaved = savedJobIds.includes(job.id);
                    const isApplied = appliedJobIds.includes(job.id);

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={job.company_logo}
                            alt={job.company_name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition text-base">
                                {job.title}
                              </h3>
                              {job.is_featured === 1 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                              {isApplied && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Applied
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mb-2">
                              {job.company_name} • <span className="text-slate-600">{job.category_name}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.location}
                              </span>
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                                {job.work_mode}
                              </span>
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
                                {job.job_type}
                              </span>
                              <span className="font-bold text-slate-900">
                                {formatSalary(job.salary_min, job.salary_max)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:shrink-0 self-end sm:self-center">
                          <button
                            onClick={(e) => toggleSaveJob(e, job.id)}
                            className={`p-2.5 rounded-xl border transition ${
                              isSaved
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            title={isSaved ? 'Remove Bookmark' : 'Save Job'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                          </button>
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-4">
                <img
                  src={selectedJob.company_logo}
                  alt={selectedJob.company_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                />
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedJob.title}</h2>
                  <div className="text-sm font-semibold text-slate-500">
                    {selectedJob.company_name} • {selectedJob.location}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Badges bar */}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg">
                  {selectedJob.job_type}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                  {selectedJob.work_mode}
                </span>
                <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg">
                  {selectedJob.experience_level}
                </span>
                <span className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg font-black">
                  {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Job Overview</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Key Requirements</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.requirements}</p>
                </div>
              )}

              {/* Benefits */}
              {selectedJob.benefits && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Perks & Benefits</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedJob.benefits}</p>
                </div>
              )}

              {/* Required Skills */}
              {selectedJob.skills_required && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skills_required.split(',').map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50 rounded-b-3xl">
              <button
                onClick={(e) => toggleSaveJob(e, selectedJob.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Bookmark className={`w-4 h-4 ${savedJobIds.includes(selectedJob.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                {savedJobIds.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => trackApplication(selectedJob.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition ${
                    appliedJobIds.includes(selectedJob.id)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {appliedJobIds.includes(selectedJob.id) ? '✓ Tracked Applied' : 'Track Application'}
                </button>
                <a
                  href={selectedJob.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Auth Modal (Login / Register / Google Auth) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl mx-auto mb-3 shadow-sm">
                J
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'login'
                  ? 'Access your saved jobs, alerts, and applications'
                  : 'Start your career discovery journey with verified employers'}
              </p>
            </div>

            {/* Google One-Click Login Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={() => handleGoogleLogin('Sridhar Selvam', 'sridhar1selvam38@gmail.com')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 transition flex items-center justify-center gap-3 font-bold text-sm text-slate-700 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Or with Email</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sridhar Selvam"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthRole('USER')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        authRole === 'USER'
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Job Seeker
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('ADMIN')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        authRole === 'ADMIN'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Administrator
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                ⚡ Quick Demo Accounts
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmail('admin@jobpost.com');
                    setAuthPassword('admin123');
                  }}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-left text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmail('alex.morgan@example.com');
                    setAuthPassword('password123');
                  }}
                  className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-left text-xs font-bold transition flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Candidate Demo</span>
                </button>
              </div>
            </div>

            {/* Toggle Mode */}
            <div className="mt-4 text-center">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Register now
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Dashboard Modal */}
      {showDashboardModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.full_name)}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">{currentUser.full_name}</h3>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <span>{currentUser.email}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDashboardModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dashboard Tabs */}
            <div className="px-6 pt-3 flex gap-2 border-b border-slate-100 overflow-x-auto">
              <button
                onClick={() => setDashboardTab('profile')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
                  dashboardTab === 'profile'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Profile & Resume
              </button>
              <button
                onClick={() => setDashboardTab('saved')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
                  dashboardTab === 'saved'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Saved Bookmarks ({savedJobIds.length})
              </button>
              <button
                onClick={() => setDashboardTab('applications')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
                  dashboardTab === 'applications'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tracked Applications ({appliedJobIds.length})
              </button>
              <button
                onClick={() => setDashboardTab('alerts')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 transition ${
                  dashboardTab === 'alerts'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Career Alerts ({alerts.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 flex-1 space-y-6">
              {dashboardTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                    <input
                      type="text"
                      value={profileHeadline}
                      onChange={(e) => setProfileHeadline(e.target.value)}
                      placeholder="e.g. Full-Stack Developer | React & Python"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                        placeholder="e.g. Chennai, India"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Skills</label>
                      <input
                        type="text"
                        value={profileSkills}
                        onChange={(e) => setProfileSkills(e.target.value)}
                        placeholder="e.g. React, TypeScript, Python"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Resume Document</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                      <FileText className="w-8 h-8 text-indigo-500 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 block">
                        {profileResumeName ? `Attached: ${profileResumeName}` : 'Upload Resume (PDF, DOCX)'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setProfileResumeName(e.target.files[0].name);
                            showToast(`Resume attached: ${e.target.files[0].name}`);
                          }
                        }}
                        className="hidden"
                        id="resumeUploadInput"
                      />
                      <label
                        htmlFor="resumeUploadInput"
                        className="mt-2 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    Save Profile Changes
                  </button>
                </form>
              )}

              {dashboardTab === 'saved' && (
                <div className="space-y-3">
                  {savedJobIds.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold">No saved jobs yet.</p>
                      <p className="text-xs">Click the bookmark icon on any job card to save it here.</p>
                    </div>
                  ) : (
                    jobsList
                      .filter((j) => savedJobIds.includes(j.id))
                      .map((job) => (
                        <div
                          key={job.id}
                          className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                        >
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {job.company_name} • {job.location} • {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowDashboardModal(false);
                                setSelectedJob(job);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => toggleSaveJob(e, job.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {dashboardTab === 'applications' && (
                <div className="space-y-3">
                  {appliedJobIds.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold">No tracked applications yet.</p>
                      <p className="text-xs">Click 'Track Application' on any job details page.</p>
                    </div>
                  ) : (
                    jobsList
                      .filter((j) => appliedJobIds.includes(j.id))
                      .map((job) => (
                        <div
                          key={job.id}
                          className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 bg-white"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                                Applied
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {job.company_name} • Applied on {new Date().toLocaleDateString()}
                            </span>
                          </div>
                          <a
                            href={job.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-lg text-slate-700 flex items-center gap-1"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))
                  )}
                </div>
              )}

              {dashboardTab === 'alerts' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddAlert} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Python Backend Engineer - Chennai"
                      value={newAlertKeyword}
                      onChange={(e) => setNewAlertKeyword(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
                    >
                      Add Alert
                    </button>
                  </form>

                  <div className="space-y-2">
                    {alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-bold text-slate-800">{alert}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteAlert(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && currentUser?.role === 'ADMIN' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-black text-slate-900">Administrator Console</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <div className="text-xl font-black text-purple-700">{jobsList.length}</div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase">Total Jobs</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <div className="text-xl font-black text-emerald-700">{companies.length}</div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Companies</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-xl">
                  <div className="text-xl font-black text-indigo-700">4</div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase">Job Sources</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <div className="text-xl font-black text-amber-700">100%</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase">Sync Status</div>
                </div>
              </div>

              {/* Add New Job Form */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" /> Post New Job
                </h4>
                <form onSubmit={handleAddAdminJob} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Cloud Architect"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Company</label>
                      <select
                        value={newJobCompany}
                        onChange={(e) => setNewJobCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Remote / Bangalore"
                        value={newJobLocation}
                        onChange={(e) => setNewJobLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Min Salary ($)</label>
                      <input
                        type="number"
                        value={newJobSalaryMin}
                        onChange={(e) => setNewJobSalaryMin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Max Salary ($)</label>
                      <input
                        type="number"
                        value={newJobSalaryMax}
                        onChange={(e) => setNewJobSalaryMax(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Job Description</label>
                    <textarea
                      rows={3}
                      placeholder="Responsibilities, team mission, and qualifications..."
                      value={newJobDesc}
                      onChange={(e) => setNewJobDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    Publish Job Listing
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © 2026 <strong>JobPost Aggregator</strong> — Centralized Career Discovery.
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <span>Powered by Node.js & React</span>
            <span>•</span>
            <span>Verified Sources</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

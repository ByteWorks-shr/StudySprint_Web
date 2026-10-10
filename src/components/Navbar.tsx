import React, { useState } from 'react';
import {
  Flame,
  Search,
  Mic,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Sparkles,
  FileText,
  Brain,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  GraduationCap,
  FlaskConical,
  Settings,
  Languages,
} from 'lucide-react';
import { ViewTab, UserStats } from '../types';
import { logoutUser } from '../firebase';
import type { User } from 'firebase/auth';
import { Language, t } from '../utils/i18n';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  stats: UserStats | null;
  currentUser: User | null;
  onOpenSearch: () => void;
  onOpenMic: () => void;
  onOpenAuth: () => void;
  onOpenProfile: (mode: 'profile' | 'settings') => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  currentUser,
  onOpenSearch,
  onOpenMic,
  onOpenAuth,
  onOpenProfile,
  lang,
  onLanguageChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getInitials = (name?: string | null) => {
    if (!name) return 'SS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navItems: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: t('navDashboard', lang), icon: BookOpen },
    { id: 'syllabus', label: t('navSyllabus', lang), icon: GraduationCap },
    { id: 'practicals', label: t('navPracticals', lang), icon: FlaskConical },
    { id: 'materials', label: t('navMaterials', lang), icon: FileText },
    { id: 'pdfs', label: t('navPdfs', lang), icon: BookOpen },
    { id: 'smart-plan', label: t('navSmartPlan', lang), icon: Brain },
    { id: 'planner', label: t('navPlanner', lang), icon: Calendar },
    { id: 'tasks', label: t('navTasks', lang), icon: CheckSquare },
    { id: 'timer', label: t('navTimer', lang), icon: Clock },
    { id: 'chat', label: t('navChat', lang), icon: Sparkles },
  ];

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  StudySprint
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Smart Study & Curriculum Hub
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate max-w-[120px]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hindi-English Language Switcher Toggle */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to English"
              >
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  lang === 'hi'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="हिंदी में बदलें (Hindi)"
              >
                <span>हिंदी</span>
              </button>
            </div>

            {/* Study Streak Badge */}
            <div
              title={`${stats?.currentStreak || 1} day study streak!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-xs"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
              <span>{stats?.currentStreak || 1}d</span>
              <span className="hidden md:inline text-[10px] text-amber-400/80 font-normal">
                {t('streak', lang)}
              </span>
            </div>

            {/* Minimal, Clean Quick Search Bar */}
            <div className="flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-2 py-1 transition shadow-xs gap-1.5">
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                title="Search materials, PDFs, topics, tasks (⌘K)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline text-slate-400 text-xs">{t('searchPlaceholder', lang).slice(0, 9)}...</span>
                <kbd className="hidden md:inline-flex items-center text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/80 font-mono">
                  ⌘K
                </kbd>
              </button>
              <div className="w-px h-3.5 bg-slate-700/60 hidden sm:block" />
              <button
                onClick={onOpenMic}
                className="p-1 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                title={t('voiceSearch', lang)}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition focus:outline-hidden cursor-pointer"
                  title={currentUser.displayName || 'User Profile'}
                >
                  {currentUser.photoURL && !imgError ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      onError={() => setImgError(true)}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {getInitials(currentUser.displayName)}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                      {currentUser.photoURL && !imgError ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {getInitials(currentUser.displayName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser.displayName || 'Student'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>
                    </div>

                    {/* Cloud Sync Status */}
                    <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800/80">
                      <span>{t('cloudSync', lang)}</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {t('connected', lang)}
                      </span>
                    </div>

                    {/* View Profile */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile('profile');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t('viewProfile', lang)}</span>
                    </button>

                    {/* Account Settings */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenProfile('settings');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t('accountSettings', lang)}</span>
                    </button>

                    <div className="h-px bg-slate-800 my-1" />

                    {/* Sign Out */}
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logoutUser();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('signOut', lang)}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signIn', lang)}</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="2xl:hidden py-3 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

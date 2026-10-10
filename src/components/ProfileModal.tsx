import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  CloudCheck,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles,
  Languages,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { updateUserProfile } from '../firebase';
import { Language } from '../utils/i18n';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  mode: 'profile' | 'settings';
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  mode,
  lang,
  onLanguageChange,
}) => {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || 'Student');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const getInitials = (name?: string | null) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setFeedback(null);
    try {
      await updateUserProfile(displayName.trim(), photoURL.trim() || undefined);
      setFeedback(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!' : 'Profile updated successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-600/30">
              {getInitials(currentUser.displayName)}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white truncate">
              {currentUser.displayName || 'StudySprint Student'}
            </h2>
            <p className="text-xs text-slate-400 truncate">{currentUser.email || 'No email associated'}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Cloud Sync Active
              </span>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {mode === 'profile' ? (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">User ID</span>
                <span className="text-xs text-slate-200 font-mono truncate block">
                  {currentUser.uid.slice(0, 16)}...
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Account Status</span>
                <span className="text-xs text-emerald-400 font-medium">Verified Student</span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'hi' ? 'प्रोफ़ाइल जानकारी संपादित करें' : 'Edit Profile Details'}
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {lang === 'hi' ? 'नाम' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {lang === 'hi' ? 'अवतार छवि URL (वैकल्पिक)' : 'Profile Image URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : lang === 'hi' ? 'परिवर्तन सहेजें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Account Settings View */
          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'भाषा प्राथमिकता (Language Preference)' : 'Language Preference'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    lang === 'en'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-xs">🇬🇧 English</span>
                    <span className="text-[10px] text-slate-400">Primary UI in English</span>
                  </div>
                  {lang === 'en' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => onLanguageChange('hi')}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    lang === 'hi'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-xs">🇮🇳 हिंदी (Hindi)</span>
                    <span className="text-[10px] text-slate-400">द्विभाषी इंटरफ़ेस</span>
                  </div>
                  {lang === 'hi' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <span className="text-xs font-semibold text-white block">
                {lang === 'hi' ? 'डेटा और क्लाउड सुरक्षा' : 'Data & Cloud Security'}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'hi'
                  ? 'आपके अध्ययन नोट्स, अपलोड की गई पीडीएफ और सिलेबस प्रगति Google Cloud Firestore में वास्तविक समय में सुरक्षित हैं।'
                  : 'Your study materials, uploaded PDFs, syllabus progress, and tasks are encrypted and synced in real time to Google Cloud Firestore.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsDemoStudent } from '../firebase';
import { Language, t } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang = 'en' }) => {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      setSuccessMsg(lang === 'hi' ? 'सफलतापूर्वक साइन इन किया गया!' : 'Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError(
          lang === 'hi'
            ? 'पॉपअप ब्लॉक हो गया था। कृपया ईमेल/पासवर्ड से साइन इन करें या पॉपअप की अनुमति दें।'
            : 'Popup was blocked by your browser. Please try Email login or allow popups.'
        );
      } else {
        setError(err.message || 'Google sign-in encountered an error. Please try email sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(lang === 'hi' ? 'कृपया ईमेल और पासवर्ड दर्ज करें।' : 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (tab === 'signin') {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg(lang === 'hi' ? 'साइन इन सफल!' : 'Welcome back! Signed in successfully.');
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim() || undefined);
        setSuccessMsg(lang === 'hi' ? 'खाता सफलतापूर्वक बनाया गया!' : 'Account created successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Authentication error';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = lang === 'hi' ? 'अमान्य ईमेल या पासवर्ड।' : 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = lang === 'hi' ? 'यह ईमेल पहले से पंजीकृत है। साइन इन करें।' : 'Email is already in use. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = lang === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemoStudent('Shreya Shalini', 'shreyashalini271@gmail.com');
      setSuccessMsg(lang === 'hi' ? 'छात्र प्रोफ़ाइल में लॉग इन किया गया!' : 'Signed in as Shreya Shalini (CSE 5th Sem)!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in demo profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'signin'
              ? lang === 'hi'
                ? 'StudySprint में साइन इन करें'
                : 'Sign in to StudySprint'
              : lang === 'hi'
              ? 'नया छात्र खाता बनाएं'
              : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'hi'
              ? 'अपने अध्ययन नोट्स, पीडीएफ और सिलेबस रोडमैप को क्लाउड में सुरक्षित रखें।'
              : 'Sync your study materials, PDFs, and syllabus roadmaps securely.'}
          </p>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>{lang === 'hi' ? 'Google से साइन इन करें' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            {lang === 'hi' ? 'या ईमेल से' : 'or with email'}
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Tab switcher: Sign in vs Register */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'signin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('signIn', lang)}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'hi' ? 'रजिस्टर करें' : 'Register'}
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {lang === 'hi' ? 'आपका नाम' : 'Your Full Name'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Shreya Shalini"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {lang === 'hi' ? 'ईमेल पता' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {lang === 'hi' ? 'पासवर्ड' : 'Password'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tab === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('signIn', lang)}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'hi' ? 'खाता बनाएं' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Sign In Button */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition font-medium"
          >
            ⚡ {lang === 'hi' ? 'त्वरित डेमो छात्र के रूप में जारी रखें (Shreya Shalini)' : 'One-Click Instant Sign In as Shreya Shalini (Demo)'}
          </button>
        </div>
      </div>
    </div>
  );
};

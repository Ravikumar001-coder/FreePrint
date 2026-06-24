import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const calculatePasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  };

  const pwStrength = calculatePasswordStrength(password);
  
  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-gray-200';
    if (score <= 50) return 'bg-rose-500';
    if (score <= 75) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return 'None';
    if (score <= 50) return 'Weak';
    if (score <= 75) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      if (mode === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
        setSuccessMsg(data.message || 'Reset link sent if email is registered.');
        setLoading(false);
        return;
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed');
      
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'login' ? 'Log in to continue your printing tasks.' 
              : mode === 'register' ? 'Register to unlock free PDF processing.'
              : 'Enter your email to receive a password reset link.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 flex items-start gap-2">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {mode !== 'forgot-password' && (
              <div className="relative flex flex-col gap-1">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {mode === 'register' && password.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      <div className={`flex-1 rounded-l-full ${password.length > 0 ? getStrengthColor(pwStrength) : 'bg-gray-200'}`} />
                      <div className={`flex-1 ${pwStrength > 25 ? getStrengthColor(pwStrength) : 'bg-gray-200'}`} />
                      <div className={`flex-1 ${pwStrength > 50 ? getStrengthColor(pwStrength) : 'bg-gray-200'}`} />
                      <div className={`flex-1 rounded-r-full ${pwStrength > 75 ? getStrengthColor(pwStrength) : 'bg-gray-200'}`} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">Password Strength: {getStrengthLabel(pwStrength)} (Requires 8+ chars, uppercase, number, symbol)</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'register' && pwStrength < 100)}
              className="w-full bg-indigo-600 text-white rounded-xl py-2.5 font-bold text-sm hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center transition-all mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : mode === 'login' ? 'Log In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}
            </button>
          </form>

          {mode !== 'forgot-password' && (
            <>
              <div className="mt-3 text-right">
                <button
                  type="button"
                  className="text-xs text-indigo-600 font-medium hover:underline"
                  onClick={() => setMode('forgot-password')}
                >
                  Forgot your password?
                </button>
              </div>

              <div className="relative mt-6 mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 text-xs uppercase tracking-wider font-semibold">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google authentication failed')}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </>
          )}

          <div className="mt-6 text-center text-xs text-slate-500 flex flex-col gap-1">
            {mode === 'login' && (
              <div>
                Don't have an account?{' '}
                <button type="button" className="text-indigo-600 font-bold hover:underline" onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}>
                  Sign up here
                </button>
              </div>
            )}
            {(mode === 'register' || mode === 'forgot-password') && (
              <div>
                Already have an account?{' '}
                <button type="button" className="text-indigo-600 font-bold hover:underline" onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}>
                  Log in here
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

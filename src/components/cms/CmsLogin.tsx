import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, Mail, ArrowLeft, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { cmsAuthApi } from '../../lib/cms-client';
import type { User } from '../../types/cms';

interface CmsLoginProps {
  onSuccess: (user: User) => void;
}

export default function CmsLogin({ onSuccess }: CmsLoginProps) {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotInput, setForgotInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generatedResetUrl, setGeneratedResetUrl] = useState<{ url: string; username: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please provide both your username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await cmsAuthApi.login(identifier, password);
      if (res.success && res.user) {
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      setError('Please enter your username or registered email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    setGeneratedResetUrl(null);

    try {
      const res = await cmsAuthApi.forgotPassword(forgotInput.trim());
      setSuccessMsg(res.message || 'Password reset email dispatched successfully.');
      if (res.resetUrl && res.username) {
        setGeneratedResetUrl({ url: res.resetUrl, username: res.username });
      }
      setForgotInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!resetToken) {
      setError('Missing or invalid password reset token.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await cmsAuthApi.resetPassword(resetToken, newPassword);
      setSuccessMsg(res.message || 'Password successfully updated.');
      setResetToken(null);
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setMode('login');
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#df0567]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#9b0348]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#121216]/90 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#df0567] to-[#80033b] text-white font-black text-xl shadow-xl shadow-[#df0567]/30">
              V
            </div>
            <div className="text-left">
              <span className="font-headline text-3xl text-[#df0567] tracking-tight uppercase leading-[0.82] font-black drop-shadow-sm block">
                ViralMuse
              </span>
              <span className="font-script text-sm text-[#df0567] font-bold tracking-tight lowercase leading-none block mt-1">
                social media agency
              </span>
            </div>
          </div>
          <p className="text-[11px] text-white/50 mt-2 uppercase tracking-widest font-semibold">
            {mode === 'login' ? 'Administrative Access Portal' : mode === 'forgot' ? 'Password Recovery' : 'Set New Password'}
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMsg && !generatedResetUrl && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Generated Reset Link Card for Testing & Instant Access */}
        {generatedResetUrl && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#df0567]/20 via-[#18181d] to-[#121216] border border-[#df0567]/40 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-[#df0567]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Password Reset Email Dispatched</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              An email with your secure password reset link has been dispatched via Resend. You can also click the secure reset button below for instant access:
            </p>
            <div className="bg-black/60 p-3 rounded-xl border border-white/10 break-all font-mono text-[11px] text-white/80">
              {generatedResetUrl.url}
            </div>
            <a
              href={generatedResetUrl.url}
              className="w-full py-2.5 px-4 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg no-underline"
            >
              <span>Open Reset Password Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567] focus:ring-1 focus:ring-[#df0567] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                    setGeneratedResetUrl(null);
                  }}
                  className="text-xs text-[#df0567] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567] focus:ring-1 focus:ring-[#df0567] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#df0567]/25 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : mode === 'forgot' ? (
          /* Forgot Password Form */
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <p className="text-xs text-white/70 leading-relaxed">
              Enter your username or registered email address below. We will send an email with a secure password reset link where you can set your new password.
            </p>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Username or Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="admin or hello@viralmuse.agency"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567] focus:ring-1 focus:ring-[#df0567] transition-all font-mono text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#df0567]/25 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Sending Reset Link...' : 'Send Password Reset Link'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMsg(null);
                  setGeneratedResetUrl(null);
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </form>
        ) : (
          /* Set New Password Form (Reset Token Present) */
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <p className="text-xs text-white/70 leading-relaxed">
              Enter your new secure password below to complete the reset process for your account.
            </p>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567] focus:ring-1 focus:ring-[#df0567] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567] focus:ring-1 focus:ring-[#df0567] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#df0567]/25 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetToken(null);
                  setError(null);
                  setSuccessMsg(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Credentials helper hint */}
        {mode === 'login' && !generatedResetUrl && (
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/60">
              <Sparkles className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Default Admin: <strong className="text-white">admin</strong> / <strong className="text-white">viralmuse2026!</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPlay, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authService } from '../services/api';
import TermsModal from '../components/TermsModal';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreedTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, fullName, role);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712] text-white flex flex-col justify-between p-6 md:p-10 lg:p-14 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Graphic Elements & Deep Blue Ambient Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,63,166,0.35),rgba(3,7,18,0.95))] pointer-events-none"></div>
      
      {/* Curved Blue Architectural Rings */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full border border-blue-500/10 pointer-events-none"></div>
      <div className="absolute -bottom-60 -left-32 w-[700px] h-[700px] rounded-full border-[18px] border-blue-600/15 pointer-events-none blur-xs"></div>
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Navbar */}
      <header className="relative z-20 flex items-center justify-between">
        {/* Brand Logo with glowing emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#070e24] rounded-[10px] flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M16 10h4M17 14h3M18 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Mini Jira
          </span>
        </div>

        {/* Top Right Motto */}
        <div className="text-xs font-medium tracking-widest text-slate-400 hidden sm:flex items-center gap-2">
          <span>Plan</span>
          <span className="text-blue-500 font-bold">•</span>
          <span>Track</span>
          <span className="text-blue-500 font-bold">•</span>
          <span>Deliver</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-20 my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full">
        {/* Left Section: Hero Messaging */}
        <div className="lg:col-span-7 space-y-7">
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
              Mini <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">Jira</span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-slate-300 tracking-tight">
              Agile Project Management System
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400 text-base max-w-md font-normal leading-relaxed">
              Start your journey <br />
              <span className="text-slate-200 font-medium">now with us</span>
            </p>

            {/* Pill CTA */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-sky-400/30">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <FiPlay className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
              </span>
              <span>Plan • Track • Deliver</span>
            </div>
          </div>

          {/* 3D-styled Neon Glass Kanban Board Illustration */}
          <div className="relative pt-6 max-w-md hidden md:block">
            <div className="bg-gradient-to-tr from-blue-950/80 via-slate-900/90 to-blue-900/50 rounded-2xl border border-blue-500/30 p-4 shadow-2xl shadow-blue-900/40 backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2 bg-[#071330]/60 p-2.5 rounded-xl border border-blue-500/20">
                  <div className="text-[11px] font-bold text-sky-300 px-1">To Do</div>
                  <div className="bg-[#0b1c45]/80 p-2 rounded-lg border border-blue-400/20 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                      <div className="h-1.5 w-12 bg-sky-400/40 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-[#071330]/60 p-2.5 rounded-xl border border-blue-500/20">
                  <div className="text-[11px] font-bold text-blue-300 px-1">In Progress</div>
                  <div className="bg-[#0b1c45]/80 p-2 rounded-lg border border-blue-400/20 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      <div className="h-1.5 w-14 bg-blue-400/40 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-[#071330]/60 p-2.5 rounded-xl border border-blue-500/20">
                  <div className="text-[11px] font-bold text-emerald-400 px-1">Done</div>
                  <div className="bg-[#0b1c45]/80 p-2 rounded-lg border border-blue-400/20 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <div className="h-1.5 w-12 bg-emerald-400/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Glassmorphism Register Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-[#0a142f]/80 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 border border-blue-500/30 shadow-[0_0_50px_rgba(14,63,166,0.3)] relative">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/40">
                <div className="w-full h-full bg-[#081333] rounded-[14px] flex items-center justify-center">
                  <svg className="w-8 h-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M16 10h4M17 14h3M18 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create an account
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Join our Agile Project Management System
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0d1c42]/80 border border-blue-500/30 rounded-2xl focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-xs text-white placeholder-slate-400 transition outline-none font-normal"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-[#0d1c42]/80 border border-blue-500/30 rounded-2xl focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-xs text-white placeholder-slate-400 transition outline-none font-normal"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    <FiLock />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 bg-[#0d1c42]/80 border border-blue-500/30 rounded-2xl focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-xs text-white placeholder-slate-400 transition outline-none font-normal"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-sm focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0d1c42]/80 border border-blue-500/30 rounded-2xl focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-xs text-white transition outline-none font-medium"
                >
                  <option value="developer" className="bg-[#0b1638] text-white">Developer</option>
                  <option value="manager" className="bg-[#0b1638] text-white">Project Manager</option>
                  <option value="admin" className="bg-[#0b1638] text-white">Administrator</option>
                </select>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-blue-500/40 bg-[#0d1c42] text-blue-600 focus:ring-sky-500/30 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-[11px] text-slate-300 leading-tight">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="text-sky-400 hover:underline font-bold"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="text-sky-400 hover:underline font-bold"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{loading ? 'Creating...' : 'Create account'}</span>
                <FiArrowRight className="text-sm" />
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-slate-700/60 flex-1"></div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">OR</span>
                <div className="h-px bg-slate-700/60 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={() => alert('Single Sign-On is configured through your organization admin.')}
                className="w-full py-2.5 bg-white text-slate-900 font-bold text-xs rounded-2xl hover:bg-slate-100 flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <FcGoogle className="text-base" />
                <span>Continue with Google</span>
              </button>
            </form>

            <div className="text-center mt-5 pt-3 border-t border-slate-700/40">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-sky-400 font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Terms */}
      <footer className="relative z-20 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800/40">
        <div>
          © {new Date().getFullYear()} Mini Jira Enterprise Platform. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <button 
            type="button"
            onClick={() => setTermsOpen(true)}
            className="hover:text-sky-400 underline transition cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => setTermsOpen(true)}
            className="hover:text-sky-400 underline transition cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <span className="text-slate-500">Tenant Security</span>
        </div>
      </footer>

      {/* Terms Modal */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  );
}

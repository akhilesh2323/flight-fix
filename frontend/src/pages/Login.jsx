import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Lock, User, AlertCircle, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Authentication failed. Please verify credentials or check backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Terminal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-xl shadow-sky-600/30 mb-4 border border-sky-400/30">
            <Plane className="w-8 h-8 -rotate-45" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono">
            FlightFix
          </h1>
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mt-1">
            Aircraft Maintenance & MRO Management System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Operator Sign In</h2>
              <p className="text-xs text-slate-400">Secure Aviation Terminal Access</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TLS 1.3 / JWT</span>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Username or Call Sign
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or manager"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Authorization Key / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Launch</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="block text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2.5 text-center">
              Quick Role Switch (Demo Accounts)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin', 'admin123')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                  username === 'admin'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('manager', 'manager123')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                  username === 'manager'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('tech1', 'tech123')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                  username === 'tech1'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                Technician
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          FlightFix MRO Suite &bull; React Three.js + Django REST + MySQL Architecture
        </p>
      </div>
    </div>
  );
};

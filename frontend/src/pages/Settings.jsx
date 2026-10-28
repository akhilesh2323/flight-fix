import React from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Shield,
  Server,
  User,
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-sky-400" />
          <span>MRO System Configuration & Telemetry</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Backend server settings, database connectivity, and operator privileges
        </p>
      </div>

      {/* Operator Profile */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-sky-400" />
          <span>Active Operator Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Operator Call Sign / Username</span>
            <span className="font-mono text-sm font-bold text-white">{user?.username}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Assigned Role</span>
            <span className="font-mono text-sm font-bold text-sky-400">{user?.role}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Contact Email</span>
            <span className="font-mono text-sm font-semibold text-slate-200">{user?.email || 'operator@flightfix.aero'}</span>
          </div>
        </div>
      </div>

      {/* Database & Architecture Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Status */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Database Engine</h3>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              CONNECTED
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Target Database:</span>
              <span className="font-mono font-bold text-white">MySQL (PyMySQL Driver) / SQLite</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Database Name:</span>
              <span className="font-mono text-slate-200">flightfix_db</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Host / Port:</span>
              <span className="font-mono text-slate-200">127.0.0.1:3306</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">ORM Schema:</span>
              <span className="font-mono text-emerald-400">Django ORM v5.2</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-medium text-slate-300">MySQL Plug-and-Play Notice:</p>
            <p className="text-[11px] leading-relaxed">
              To connect FlightFix directly to a running MySQL server, set <code className="text-sky-300 font-mono">USE_MYSQL=True</code> in <code className="text-sky-300 font-mono">backend/.env</code> and run <code className="text-sky-300 font-mono">python manage.py migrate</code>.
            </p>
          </div>
        </div>

        {/* System Stack */}
        <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Technical Architecture</h3>
            </div>
            <span className="text-xs font-mono text-sky-400">v1.0.0 Stable</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Frontend Layer:</span>
              <span className="font-mono text-white">React 18 + Vite + Tailwind CSS</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">3D Graphics Engine:</span>
              <span className="font-mono text-white">Three.js + React Three Fiber</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">API Gateway:</span>
              <span className="font-mono text-white">Django REST Framework + SimpleJWT</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">HTTP Client:</span>
              <span className="font-mono text-white">Axios Interceptors</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span className="text-[11px]">FlightFix complies with FAA Part 121 / 145 digital airworthiness record requirements.</span>
          </div>
        </div>
      </div>

      {/* Role Privileges Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17] p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 font-semibold">Capability / Operation</th>
                <th className="py-2.5 font-semibold text-center">Admin</th>
                <th className="py-2.5 font-semibold text-center">Maintenance Manager</th>
                <th className="py-2.5 font-semibold text-center">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              <tr>
                <td className="py-2.5 font-medium text-white">View 3D Aircraft & Fleet Telemetry</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-white">Create & Assign Maintenance Schedules</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-slate-600">&#10007;</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-white">Update Work Order Tasks & Log Spare Parts</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-white">Register / Delete Aircraft & Technicians</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-slate-600">&#10007;</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-white">Full System Configuration & User Admin</td>
                <td className="py-2.5 text-center text-emerald-400 font-bold">&#10003;</td>
                <td className="py-2.5 text-center text-slate-600">&#10007;</td>
                <td className="py-2.5 text-center text-slate-600">&#10007;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

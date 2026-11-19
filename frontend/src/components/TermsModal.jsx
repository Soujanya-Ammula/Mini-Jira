import React from 'react';
import { FiX, FiShield, FiFileText, FiCheckCircle } from 'react-icons/fi';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1530] text-slate-200 rounded-[28px] border border-blue-500/30 max-w-2xl w-full p-6 md:p-8 relative shadow-[0_0_60px_rgba(14,63,166,0.4)] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-sky-400 text-lg">
              <FiShield />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Terms of Service & Privacy</h3>
              <p className="text-xs text-slate-400">Enterprise Standard SaaS Terms • Mini Jira Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-5 text-xs text-slate-300 leading-relaxed font-normal">
          <div className="bg-blue-950/40 p-3.5 rounded-2xl border border-blue-500/20 text-slate-300 flex items-start gap-2.5">
            <FiCheckCircle className="text-sky-400 text-base shrink-0 mt-0.5" />
            <span>
              By accessing or creating an account on Mini Jira, you agree to comply with enterprise data protection standards, intellectual property protection, and authorized multi-tenant workspace policies.
            </span>
          </div>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-bold">1.</span> Authorized Corporate Use & User Accounts
            </h4>
            <p>
              Users must provide legitimate corporate or professional credentials. You are responsible for safeguarding your login credentials, API access keys, and all activities conducted through your workspace account.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-bold">2.</span> Data Privacy & Tenant Isolation
            </h4>
            <p>
              Mini Jira enforces strict organization and workspace level tenant data isolation. Project assets, issues, code attachments, sprint plans, and internal review feedback are proprietary to your designated enterprise organization.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-bold">3.</span> Acceptable Use & Security Compliance
            </h4>
            <p>
              Users shall not transmit malicious payloads, execute reverse engineering, or attempt unpermitted privilege escalation across roles. Violations may result in immediate suspension by your organization's Super Administrator.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-bold">4.</span> SLA & Platform Availability
            </h4>
            <p>
              The platform strives for continuous uptime and data backup redundancy. Maintenance windows and version deployments are announced prior to system updates.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400 font-bold">5.</span> Intellectual Property & Export
            </h4>
            <p>
              All customer workflow configurations, story data, worklogs, and reviews remain the exclusive property of the subscribing organization and can be exported according to enterprise policy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-blue-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Effective as of 2026. Updated regularly.</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
}

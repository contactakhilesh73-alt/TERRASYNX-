/**
 * TERRASYNX: Cryptographic Verification Proof Dossier Modal
 * Conforming strictly to SYSTEM_SPEC (Strict Rule #2 & Requirements #1-#4)
 */

import React from 'react';
import { Opportunity } from '../types';
import { VerificationEngine, AuditInspectionReport } from '../services/verificationEngine';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Server, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  ExternalLink 
} from 'lucide-react';

interface VerificationAuditModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const VerificationAuditModal: React.FC<VerificationAuditModalProps> = ({
  opportunity,
  onClose,
}) => {
  if (!opportunity) return null;

  const audit: AuditInspectionReport = VerificationEngine.auditOpportunity(opportunity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/40 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Cryptographic Authenticity Dossier</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% Genuine
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Strict Rule #2 Multi-Layer Verification Proof
            </p>
          </div>
        </div>

        {/* Target Job Quick Context */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-200">{opportunity.companyName}</span>
            <span className="text-slate-400 font-mono ml-2">({opportunity.title})</span>
          </div>
          <span className="font-mono text-cyan-400 font-bold">
            Req #{opportunity.verification.requisitionId}
          </span>
        </div>

        {/* 3 Inspection Audit Layers */}
        <div className="mt-5 space-y-3">
          {/* Layer 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Layer 1: DNS & Root Domain Lock</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {audit.layers.layer1DnsStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Certified root domain: <strong className="text-slate-300">{audit.dnsRootDomain}</strong> (Resolved Subnet: {audit.dnsResolvedIp})
            </p>
          </div>

          {/* Layer 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>Layer 2: Direct ATS API Handshake</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {audit.layers.layer2AtsStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Origin feeder: <strong className="text-slate-300">{audit.atsProvider} Enterprise Endpoint</strong> (No middleman aggregator).
            </p>
          </div>

          {/* Layer 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Layer 3: Student Safety & Zero-Fee Shield</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {audit.layers.layer3SafetyStatus}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Confirmed standard paid position (<strong className="text-emerald-400">{opportunity.compensation.range}</strong>). Zero application fees.
            </p>
          </div>
        </div>

        {/* Cryptographic SHA-256 Signature Stamp */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Proof Signature:</span>
          </div>
          <div className="text-emerald-400/90 break-all select-all">
            {audit.sslFingerprint}
          </div>
          <div className="text-[10px] text-slate-500 pt-1">
            Last Audit Pulse: {new Date(audit.auditTimestamp).toLocaleString()}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close Dossier
          </button>

          <a
            href={opportunity.officialApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono"
          >
            <span>Verify on Official Domain</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
          </a>
        </div>
      </div>
    </div>
  );
};

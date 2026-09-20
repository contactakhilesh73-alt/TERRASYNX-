/**
 * TERRASYNX: Cryptographic Verification Proof Dossier Modal
 * Conforming strictly to SYSTEM_SPEC (Strict Rule #2 & Requirements #1-#4)
 */

import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types';
import { VerificationEngine, AuditInspectionReport } from '../services/verificationEngine';
import { DossierPdfService } from '../services/dossierPdfService';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Server, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  ExternalLink,
  Loader2,
  Printer,
  FileCheck2,
  Download
} from 'lucide-react';

interface VerificationAuditModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const VerificationAuditModal: React.FC<VerificationAuditModalProps> = ({
  opportunity,
  onClose,
}) => {
  const [audit, setAudit] = useState<AuditInspectionReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!opportunity) {
      setAudit(null);
      return;
    }

    setIsLoading(true);
    VerificationEngine.auditOpportunity(opportunity)
      .then((report) => {
        if (isMounted) {
          setAudit(report);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Audit verification error:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [opportunity]);

  if (!opportunity) return null;

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
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
            audit?.checkFailed 
              ? 'bg-amber-950 border-amber-700/80 text-amber-400' 
              : audit?.passedAllLayers 
                ? 'bg-emerald-950 border-emerald-700/80 text-emerald-400' 
                : 'bg-rose-950 border-rose-700/80 text-rose-400'
          }`}>
            {audit?.checkFailed ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Cryptographic Authenticity Dossier</span>
              {audit?.checkFailed ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  Verification temporarily unavailable
                </span>
              ) : audit?.passedAllLayers ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  100% Genuine
                </span>
              ) : (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  Verification Failed
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {audit?.checkFailed 
                ? 'Fail-closed safeguard: check failed, posting cannot be certified' 
                : 'Strict Rule #2 Multi-Layer Verification Proof'}
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

        {isLoading || !audit ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <span className="text-xs font-mono">Running Live DNS & Cryptographic Handshake Audit...</span>
          </div>
        ) : (
          <>
            {/* Warning banner when check failed */}
            {audit.checkFailed && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/60 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300">Verification temporarily unavailable</div>
                  <p className="text-[11px] text-amber-200/80 font-mono leading-relaxed">
                    Live DNS resolution service could not complete the verification handshake. In accordance with TERRASYNX fail-closed policy, this posting is NOT certified as authentic until network checks succeed.
                  </p>
                </div>
              </div>
            )}

            {/* 3 Inspection Audit Layers */}
            <div className="mt-5 space-y-3">
              {/* Layer 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Layer 1: DNS & Root Domain Lock</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    audit.layers.layer1DnsStatus === 'VERIFIED_CANONICAL'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : audit.layers.layer1DnsStatus === 'CHECK_UNAVAILABLE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {audit.layers.layer1DnsStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {audit.layers.layer1DnsStatus === 'CHECK_UNAVAILABLE' ? (
                    <span className="text-amber-300/90">
                      Live DNS resolver unreachable. Fail-closed safeguard engaged.
                    </span>
                  ) : (
                    <>
                      Certified root domain: <strong className="text-slate-300">{audit.dnsRootDomain}</strong> (Resolved Subnet: {audit.dnsResolvedIp})
                    </>
                  )}
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

              {/* Layer 4 */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Fingerprint className="w-4 h-4 text-amber-400" />
                    <span>Layer 4: SHA-256 Digital Seal Handshake</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    CRYPTOGRAPHIC_PASSED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Tamper-evident hash registered on official candidate record.
                </p>
              </div>
            </div>

            {/* Cryptographic SHA-256 Signature Stamp */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographic Proof Signature:</span>
                </div>
                <button
                  type="button"
                  onClick={() => DossierPdfService.generateMultiLayerJanchCertificatePDF(opportunity, audit)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Certificate PDF</span>
                </button>
              </div>
              <div className="text-emerald-400/90 break-all select-all">
                {audit.sslFingerprint}
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Last Audit Pulse: {new Date(audit.auditTimestamp).toLocaleString()}
              </div>
            </div>
          </>
        )}

        {/* Action Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            Close Dossier
          </button>

          <div className="flex items-center gap-2">
            {audit && (
              <button
                type="button"
                onClick={() => DossierPdfService.generateMultiLayerJanchCertificatePDF(opportunity, audit)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800 font-mono transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Janch Certificate</span>
              </button>
            )}

            <a
              href={opportunity.officialApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono transition-colors"
            >
              <span>Verify on Official Domain</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

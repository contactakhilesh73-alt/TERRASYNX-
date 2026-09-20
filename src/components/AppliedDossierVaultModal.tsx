/**
 * TERRASYNX: Permanent Applied Dossier Archive & Workspace Integrity Vault (Req #8 & Req #12)
 * Permanent storage of application receipts, SHA-256 proof certificates,
 * ephemeral alert auto-purging, and 1-click multi-tenant workspace backup/restore.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  FolderArchive,
  RefreshCw,
  X,
  Clock,
  Key,
  Database,
  Printer,
  Search,
  Filter
} from 'lucide-react';
import { AppliedDossierService, AppliedJobRecord } from '../services/appliedDossierService';
import { DossierPdfService } from '../services/dossierPdfService';
import { StudentProfile, Opportunity } from '../types';

interface AppliedDossierVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  opportunities: Opportunity[];
  mutedAlertIds: string[];
}

export const AppliedDossierVaultModal: React.FC<AppliedDossierVaultModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  opportunities,
  mutedAlertIds,
}) => {
  const [records, setRecords] = useState<AppliedJobRecord[]>(AppliedDossierService.getAppliedRecords());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState(AppliedDossierService.getPurgeTelemetry());
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = AppliedDossierService.subscribe(() => {
      setRecords(AppliedDossierService.getAppliedRecords());
      setTelemetry(AppliedDossierService.getPurgeTelemetry());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const filteredRecords = records.filter(r => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' || 
      r.companyName.toLowerCase().includes(query) ||
      r.jobTitle.toLowerCase().includes(query) ||
      r.confirmationId.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || r.currentStage === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyId = (confId: string) => {
    navigator.clipboard.writeText(confId);
    setCopiedId(confId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerPurge = () => {
    const result = AppliedDossierService.executeEphemeralAlertPurge(opportunities);
    setPurgeFeedback(`Purged ${result.purgedCount} expired ephemeral reminders at ${new Date(result.timestamp).toLocaleTimeString()}`);
    setTimeout(() => setPurgeFeedback(null), 4000);
  };

  const handleExportWorkspace = () => {
    setIsExporting(true);
    AppliedDossierService.exportWorkspace(studentProfile, mutedAlertIds);
    setTimeout(() => setIsExporting(false), 1200);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = AppliedDossierService.importWorkspace(content);
        if (result.success) {
          alert(`Workspace restored successfully! Loaded ${result.data?.appliedRecords.length} records.`);
        } else {
          alert(`Restore failed: ${result.message}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Permanent Applied Dossier & Workspace Vault
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Req #8 & #12
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Permanent cryptographic submission records, ephemeral alert auto-purging, and multi-tenant workspace snapshots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Scorecard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Permanent Applied Dossier
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white">
                {records.length}{' '}
                <span className="text-xs font-normal text-slate-400">records</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero data loss guarantee. Anchored with SHA-256 tokens.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ephemeral Alerts Auto-Purged
                </span>
                <Trash2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-amber-400">
                {telemetry.lifetimePurged}{' '}
                <span className="text-xs font-normal text-slate-400">alerts swept</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">
                  Last swept: {new Date(telemetry.lastPurgeTimestamp).toLocaleTimeString()}
                </span>
                <button
                  onClick={handleTriggerPurge}
                  className="text-[10px] font-semibold text-amber-300 hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-2.5 h-2.5 mr-0.5" /> Purge Now
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Workspace Multi-Tenancy (Req #12)
                </span>
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-200">
                100% Isolated State
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={handleExportWorkspace}
                  disabled={isExporting}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/50 transition-colors flex items-center space-x-1"
                >
                  <Download className="w-3 h-3 mr-1" /> Export JSON
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3 mr-1" /> Restore
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Sweep Feedback Banner */}
          {purgeFeedback && (
            <div className="px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{purgeFeedback}</span>
            </div>
          )}

          {/* Applied Dossier Records List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Certified Submissions & Official Records
                </h3>
                <span className="text-xs text-slate-400">
                  ({filteredRecords.length} of {records.length})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => DossierPdfService.generateAppliedHistoryPDF(studentProfile, filteredRecords)}
                  disabled={filteredRecords.length === 0}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 disabled:opacity-50"
                  title="Download / Print Official Certified PDF Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download Applied History PDF</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by company, role, or confirmation ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied / In Review</option>
                <option value="assessment">Assessment / OA</option>
                <option value="interview">Technical Interview</option>
                <option value="offer">Offer Received</option>
              </select>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-800/30 border border-slate-700/40 text-slate-400 text-xs">
                {records.length === 0
                  ? 'No permanent application records stored yet. Apply to any opportunity on the Radar to generate a certified cryptographic receipt.'
                  : 'No applications match your filter criteria.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.opportunityId}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-base">
                            {record.companyName}
                          </span>
                          <span className="text-xs text-slate-400">({record.companyDomain})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {record.portalType}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {record.currentStage.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-medium mt-0.5">
                          {record.jobTitle}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {(() => {
                          const opp = opportunities.find(o => o.id === record.opportunityId);
                          if (!opp) return null;
                          return (
                            <button
                              onClick={async () => {
                                const { VerificationEngine } = await import('../services/verificationEngine');
                                const audit = await VerificationEngine.auditOpportunity(opp);
                                DossierPdfService.generateMultiLayerJanchCertificatePDF(opp, audit);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors flex items-center space-x-1 cursor-pointer"
                              title="Print Official Multi-Layer Janch Certificate"
                            >
                              <ShieldCheck className="w-3 h-3 mr-1 text-cyan-400" /> Janch Cert
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => DossierPdfService.generateSingleApplicationPDF(studentProfile, record)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center space-x-1"
                          title="Print / Save Official PDF Receipt"
                        >
                          <Printer className="w-3 h-3 mr-1 text-emerald-400" /> PDF Receipt
                        </button>
                        <button
                          onClick={() => AppliedDossierService.downloadProofCertificate(record)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3 mr-1 text-amber-400" /> Cert
                        </button>
                        <a
                          href={record.officialApplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Portal
                        </a>
                      </div>
                    </div>

                    {/* Meta details bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate font-mono text-slate-300">
                          {record.confirmationId}
                        </span>
                        <button
                          onClick={() => handleCopyId(record.confirmationId)}
                          className="text-slate-400 hover:text-amber-300 p-0.5"
                          title="Copy Confirmation ID"
                        >
                          {copiedId === record.confirmationId ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Submitted {new Date(record.appliedTimestamp).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">Persona:</span>
                        <span className="text-slate-300 truncate">{record.resumePersonaUsed}</span>
                      </div>
                    </div>

                    {/* SHA-256 Hash */}
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-slate-800 truncate flex items-center space-x-2">
                      <span className="text-amber-400 font-bold">SHA-256 PROOF:</span>
                      <span className="truncate">{record.sha256Proof}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cryptographic Dossier Active • Zero Cross-User Leakage</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};

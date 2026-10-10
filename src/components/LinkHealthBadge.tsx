import React, { useState, useEffect } from 'react';
import { UrlHealthResolver, UrlHealthState } from '../services/urlHealthResolver';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface LinkHealthBadgeProps {
  url: string;
  companyDomain?: string;
  className?: string;
  compact?: boolean;
}

export const LinkHealthBadge: React.FC<LinkHealthBadgeProps> = ({
  url,
  companyDomain,
  className = '',
  compact = false,
}) => {
  const [state, setState] = useState<UrlHealthState | 'CHECKING'>('CHECKING');
  const [displayText, setDisplayText] = useState<string>('Verifying link...');

  useEffect(() => {
    let isMounted = true;
    if (!url) {
      setState('UNKNOWN');
      setDisplayText('Could not verify, check the official page');
      return;
    }

    setState('CHECKING');
    UrlHealthResolver.probeUrlHealth(url, companyDomain)
      .then((status) => {
        if (!isMounted) return;
        setState(status.state);
        setDisplayText(status.displayText);
      })
      .catch(() => {
        if (!isMounted) return;
        setState('UNKNOWN');
        setDisplayText('Could not verify, check the official page');
      });

    return () => {
      isMounted = false;
    };
  }, [url, companyDomain]);

  if (state === 'CHECKING') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-slate-400 border border-slate-800 ${className}`}
        title="Verifying link health with official portal..."
      >
        <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-500" />
        <span>{compact ? 'Verifying...' : 'Verifying Link'}</span>
      </span>
    );
  }

  if (state === 'ALIVE') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-sm ${className}`}
        title="Verified Active: Link successfully probed against allowlisted employer portal."
      >
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        <span>Verified Active</span>
      </span>
    );
  }

  if (state === 'DEAD') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 shadow-sm ${className}`}
        title="Link Inactive (404/410): Requisition appears closed by host."
      >
        <XCircle className="w-2.5 h-2.5 text-rose-400" />
        <span>Link Inactive (404)</span>
      </span>
    );
  }

  // state === 'UNKNOWN'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm ${className}`}
      title="Could not verify, check the official page (Timeout, firewall, or external network block)"
    >
      <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
      <span>{compact ? 'Check Official Page' : 'Could not verify, check the official page'}</span>
    </span>
  );
};

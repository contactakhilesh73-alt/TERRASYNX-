import React from 'react';
import { 
  ShieldAlert, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Sparkles 
} from 'lucide-react';
import { ProfileCompletionResult } from '../utils/profileCompletion';

interface ProfileCompletionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfileEditor: () => void;
  completion: ProfileCompletionResult;
  targetOpportunityTitle?: string;
}

export const ProfileCompletionGateModal: React.FC<ProfileCompletionGateModalProps> = ({
  isOpen,
  onClose,
  onOpenProfileEditor,
  completion,
  targetOpportunityTitle = 'this opportunity',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden">
        
        {/* Header Strip */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                Profile Completion Required (90%+)
              </h3>
              <p className="text-[11px] font-mono text-amber-400/90">
                Application Gating Sentinel Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Progress Overview Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-slate-300">
                Current Profile Completeness:
              </span>
              <span className={`text-sm font-mono font-black ${
                completion.percentage >= 90 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {completion.percentage}% / 100%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  completion.percentage >= 90 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${Math.max(5, completion.percentage)}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To apply for <strong className="text-white">{targetOpportunityTitle}</strong>, TERRASYNX requires a minimum of <strong className="text-amber-300">90% profile completeness</strong>. This ensures real corporate ATS portals accept your dossier without form-rejection errors.
            </p>
          </div>

          {/* Missing Fields Checklist */}
          {completion.missingFields.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Required Items to Reach 90%+:</span>
              </h4>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {completion.missingFields.map((field) => (
                  <div 
                    key={field.id}
                    className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 font-sans">{field.label}</span>
                    <span className="font-mono text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30">
                      +{field.weight}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfileEditor();
              }}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-950/40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Complete Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

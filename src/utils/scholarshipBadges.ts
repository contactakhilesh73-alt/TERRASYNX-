import { LucideIcon, GraduationCap, Award, Sparkles, Briefcase, Star, Landmark, Plane, Coins, ShieldCheck, Calendar, AlertTriangle, HelpCircle } from 'lucide-react';
import { StudyLevel, CoverageType, DateConfidence } from '../types';

export interface BadgeConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

/**
 * Prompt 37: Study Level Badge Configuration
 * Values: 'class12_ug' | 'postgraduate' | 'summer_research' | 'internship'
 */
export function getStudyLevelBadgeConfig(studyLevel?: StudyLevel): BadgeConfig {
  switch (studyLevel) {
    case 'class12_ug':
      return {
        label: 'Class 12 / UG',
        icon: GraduationCap,
        className: 'bg-amber-950/80 text-amber-300 border border-amber-700/60',
      };
    case 'postgraduate':
      return {
        label: 'Postgraduate',
        icon: Award,
        className: 'bg-purple-950/80 text-purple-300 border border-purple-700/60',
      };
    case 'summer_research':
      return {
        label: 'Summer Research',
        icon: Sparkles,
        className: 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60',
      };
    case 'internship':
    default:
      return {
        label: 'Internship',
        icon: Briefcase,
        className: 'bg-blue-950/80 text-blue-300 border border-blue-700/60',
      };
  }
}

/**
 * Prompt 37: Coverage Type Badge Configuration
 * Values: 'FULL_RIDE' | 'FULL_TUITION' | 'STIPEND_ONLY' | 'TRAVEL_ONLY'
 * CRITICAL RULE: Never label a tuition-only award as "Full Ride".
 */
export function getCoverageTypeBadgeConfig(coverageType?: CoverageType): BadgeConfig {
  switch (coverageType) {
    case 'FULL_RIDE':
      return {
        label: 'Full Ride',
        icon: Star,
        className: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/60 font-black',
      };
    case 'FULL_TUITION':
      // CRITICAL: Never label a tuition-only award as "Full Ride"
      return {
        label: 'Full Tuition',
        icon: Landmark,
        className: 'bg-sky-950/80 text-sky-300 border border-sky-600/70 font-black',
      };
    case 'TRAVEL_ONLY':
      return {
        label: 'Travel Only',
        icon: Plane,
        className: 'bg-indigo-950/80 text-indigo-300 border border-indigo-600/70 font-black',
      };
    case 'PARTIAL_GRANT':
      return {
        label: 'Partial Grant, capped',
        icon: Coins,
        className: 'bg-teal-950/80 text-teal-300 border border-teal-600/70 font-black',
      };
    case 'NON_CASH':
      return {
        label: 'Non-Cash Award',
        icon: Award,
        className: 'bg-purple-950/80 text-purple-300 border border-purple-600/70 font-black',
      };
    case 'STIPEND_ONLY':
    default:
      return {
        label: 'Stipend Only',
        icon: Coins,
        className: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-black',
      };
  }
}

/**
 * Prompt 57: Date Confidence Badge Configuration
 * Values: 'OFFICIAL' | 'REPORTED' | 'CONFLICTING' | 'UNKNOWN'
 */
export function getDateConfidenceBadgeConfig(confidence?: DateConfidence): BadgeConfig {
  switch (confidence) {
    case 'OFFICIAL':
      return {
        label: 'Official Date',
        icon: ShieldCheck,
        className: 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/70 font-semibold',
      };
    case 'REPORTED':
      return {
        label: 'Reported Date',
        icon: Calendar,
        className: 'bg-sky-950/80 text-sky-300 border border-sky-600/70 font-semibold',
      };
    case 'CONFLICTING':
      return {
        label: 'Conflicting Dates',
        icon: AlertTriangle,
        className: 'bg-amber-950/80 text-amber-300 border border-amber-600/70 font-semibold',
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'Date Unknown',
        icon: HelpCircle,
        className: 'bg-slate-900 text-slate-400 border border-slate-700 font-semibold',
      };
  }
}


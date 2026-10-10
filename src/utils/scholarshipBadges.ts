import { LucideIcon, GraduationCap, Award, Sparkles, Briefcase, Star, Landmark, Plane, Coins } from 'lucide-react';
import { StudyLevel, CoverageType } from '../types';

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
    case 'STIPEND_ONLY':
    default:
      return {
        label: 'Stipend Only',
        icon: Coins,
        className: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-black',
      };
  }
}

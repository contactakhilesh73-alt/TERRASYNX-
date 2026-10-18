/**
 * TERRASYNX: Student Candidate Profile Completion & Gating Utility
 * 
 * Computes exact dossier completeness percentage (0-100%) based on essential
 * ATS submission fields. Gating mandate: At least 90% profile completeness
 * is required before applying to internships, scholarships, and hackathons.
 */

import { StudentProfile } from '../types';

export interface ProfileCompletionResult {
  percentage: number;
  isCompleteForApply: boolean; // >= 90%
  completedFieldsCount: number;
  totalFieldsCount: number;
  missingFields: Array<{
    id: string;
    label: string;
    weight: number;
  }>;
}

export function calculateProfileCompletion(profile: StudentProfile | null | undefined): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      isCompleteForApply: false,
      completedFieldsCount: 0,
      totalFieldsCount: 9,
      missingFields: [
        { id: 'fullName', label: 'Full Candidate Name', weight: 10 },
        { id: 'email', label: 'Verified Email Address', weight: 10 },
        { id: 'collegeName', label: 'University / College Name', weight: 10 },
        { id: 'degree', label: 'Degree / Major Track', weight: 10 },
        { id: 'graduationYear', label: 'Graduation Year', weight: 10 },
        { id: 'currentCgpa', label: 'Current CGPA / Academic Standing', weight: 10 },
        { id: 'primarySkills', label: 'Core Technical Skills (at least 2)', weight: 15 },
        { id: 'resume', label: 'Resume File or Upload', weight: 15 },
        { id: 'links', label: 'GitHub, LinkedIn, or Portfolio Link', weight: 10 },
      ],
    };
  }

  const checklist: Array<{
    id: string;
    label: string;
    weight: number;
    isFilled: boolean;
  }> = [
    {
      id: 'fullName',
      label: 'Full Candidate Name',
      weight: 10,
      isFilled: Boolean(profile.fullName && profile.fullName.trim().length >= 2),
    },
    {
      id: 'email',
      label: 'Verified Email Address',
      weight: 10,
      isFilled: Boolean(profile.email && profile.email.includes('@') && profile.email.includes('.')),
    },
    {
      id: 'collegeName',
      label: 'University / College Name',
      weight: 10,
      isFilled: Boolean(profile.collegeName && profile.collegeName.trim().length >= 2),
    },
    {
      id: 'degree',
      label: 'Degree / Major Track',
      weight: 10,
      isFilled: Boolean(profile.degree && profile.degree.trim().length >= 2),
    },
    {
      id: 'graduationYear',
      label: 'Graduation Year',
      weight: 10,
      isFilled: Boolean(profile.graduationYear && Number(profile.graduationYear) >= 2020),
    },
    {
      id: 'currentCgpa',
      label: 'Current CGPA / Academic Standing',
      weight: 10,
      isFilled: Boolean(profile.currentCgpa && profile.currentCgpa.trim().length > 0),
    },
    {
      id: 'primarySkills',
      label: 'Core Technical Skills (at least 2)',
      weight: 15,
      isFilled: Boolean(Array.isArray(profile.primarySkills) && profile.primarySkills.length >= 2),
    },
    {
      id: 'resume',
      label: 'Resume File or Upload',
      weight: 15,
      isFilled: Boolean(profile.resumeFileName && profile.resumeFileName.trim().length > 0),
    },
    {
      id: 'links',
      label: 'GitHub, LinkedIn, or Portfolio Link',
      weight: 10,
      isFilled: Boolean(
        (profile.githubUrl && profile.githubUrl.trim().length > 5) ||
        (profile.linkedinUrl && profile.linkedinUrl.trim().length > 5) ||
        (profile.portfolioUrl && profile.portfolioUrl.trim().length > 5)
      ),
    },
  ];

  let totalWeight = 0;
  let earnedWeight = 0;
  let completedCount = 0;
  const missingFields: Array<{ id: string; label: string; weight: number }> = [];

  for (const item of checklist) {
    totalWeight += item.weight;
    if (item.isFilled) {
      earnedWeight += item.weight;
      completedCount++;
    } else {
      missingFields.push({ id: item.id, label: item.label, weight: item.weight });
    }
  }

  const percentage = Math.min(100, Math.round((earnedWeight / totalWeight) * 100));

  return {
    percentage,
    isCompleteForApply: percentage >= 90,
    completedFieldsCount: completedCount,
    totalFieldsCount: checklist.length,
    missingFields,
  };
}

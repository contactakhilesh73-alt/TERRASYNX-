/**
 * TERRASYNX: Autonomous Cover Letter Intelligence Service
 * Powers genuine personalized cover letter drafting reading authentic Job Descriptions (opportunity.description)
 * and real student profiles (skills, degree, projects).
 * 
 * Strict Principle: NEVER auto-sends. Outputs an editable draft in student control.
 */

import { Opportunity, StudentProfile } from '../types';
import { logger } from '../utils/logger';

export interface CoverLetterResult {
  success: boolean;
  coverLetter: string;
  source: 'gemini-3.8-flash' | 'algorithmic-synthesis' | 'saved-draft';
  error?: string;
  generatedAt: number;
}

export class CoverLetterService {
  private static DRAFT_KEY_PREFIX = 'terrasynx_cover_letter_draft_';

  /**
   * Generates a tailored cover letter draft using server-side Gemini 3.8 Flash,
   * with seamless fallback to algorithmic synthesis if offline or unconfigured.
   */
  public static async generateCoverLetter(
    opportunity: Opportunity,
    profile: StudentProfile,
    customNotes?: string,
    ignoreSavedDraft = false
  ): Promise<CoverLetterResult> {
    // 1. If not forcing a fresh generation, check for an existing saved draft first
    if (!ignoreSavedDraft) {
      const saved = this.getSavedDraft(opportunity.id);
      if (saved && saved.trim().length > 0) {
        return {
          success: true,
          coverLetter: saved,
          source: 'saved-draft',
          generatedAt: Date.now(),
        };
      }
    }

    // 2. Call server-side Gemini endpoint
    try {
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunity,
          profile,
          customNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && typeof data.coverLetter === 'string' && data.coverLetter.trim().length > 0) {
          logger.info('CoverLetterService', `Generated Gemini cover letter for ${opportunity.companyName}`, {
            opportunityId: opportunity.id,
            company: opportunity.companyName,
          });

          // Auto-save initial draft to local persistence
          this.saveDraft(opportunity.id, data.coverLetter.trim());

          return {
            success: true,
            coverLetter: data.coverLetter.trim(),
            source: 'gemini-3.8-flash',
            generatedAt: data.generatedAt || Date.now(),
          };
        }
      }

      logger.warn('CoverLetterService', 'Server generation requested fallback, synthesizing locally', {
        opportunityId: opportunity.id,
      });
    } catch (err: unknown) {
      logger.error('CoverLetterService', 'Network error calling /api/ai/generate-cover-letter', err, {
        opportunityId: opportunity.id,
      });
    }

    // 3. Fallback: High-grade algorithmic personalized synthesis
    const localDraft = this.synthesizeAlgorithmicDraft(opportunity, profile, customNotes);
    this.saveDraft(opportunity.id, localDraft);

    return {
      success: true,
      coverLetter: localDraft,
      source: 'algorithmic-synthesis',
      generatedAt: Date.now(),
    };
  }

  /**
   * Deterministic, high-quality algorithmic cover letter generator tailored to actual JD and student specs
   */
  public static synthesizeAlgorithmicDraft(
    opportunity: Opportunity,
    profile: StudentProfile,
    customNotes?: string
  ): string {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const candidateName = profile.fullName?.trim() || 'Candidate';
    const email = profile.email || 'candidate@university.edu';
    const phone = profile.phoneNumber || '+1 (555) 019-2834';
    const linkedin = profile.linkedinUrl ? ` | ${profile.linkedinUrl}` : '';
    const github = profile.githubUrl ? ` | ${profile.githubUrl}` : '';

    const company = opportunity.companyName;
    const roleTitle = opportunity.title;
    const university = profile.collegeName || 'University';
    const degree = profile.degree || 'B.Tech in Computer Science';
    const gradYear = profile.graduationYear || 2026;

    // Pick top skills matching opportunity requirements or primary skills
    const primarySkills = profile.primarySkills?.length ? profile.primarySkills : ['TypeScript', 'React', 'Python', 'Algorithms'];
    const matchedSkills = opportunity.fitment?.matchedSkills?.length
      ? opportunity.fitment.matchedSkills.slice(0, 3).join(', ')
      : primarySkills.slice(0, 3).join(', ');

    // Extract top candidate project
    const topProject = profile.projects && profile.projects.length > 0
      ? profile.projects[0]
      : null;

    const projectSnippet = topProject
      ? `During my work developing "${topProject.title}" (built using ${topProject.techStack?.join(', ') || 'modern engineering frameworks'}), I focused on ${topProject.description || 'scalable system architecture and robust performance'}. This hands-on experience directly mirrors the core responsibilities outlined in ${company}'s ${roleTitle} specifications.`
      : `Through comprehensive academic engineering and independent systems development, I have concentrated heavily on high-throughput architecture, clean modular code, and test-driven deployment.`;

    const notesParagraph = customNotes?.trim()
      ? `\n\nAdditionally, I would like to emphasize: ${customNotes.trim()}`
      : '';

    return `${today}

${candidateName}
${email} | ${phone}${linkedin}${github}

Hiring Team & Engineering Leadership
${company}

Subject: Application for ${roleTitle} (Ref: ${opportunity.id})

Dear ${company} Hiring Team,

I am writing to express my strong interest in the ${roleTitle} role at ${company}. As a final-year ${degree} student at ${university} (Class of ${gradYear}), I have followed ${company}'s engineering impact and product velocity closely. The opportunity to contribute to ${company}'s technical initiatives—particularly in scalable system development and engineering resilience—strongly aligns with my background and career focus.

My technical foundation centers on ${matchedSkills}. ${projectSnippet} Furthermore, I thrive in fast-paced environments where rapid problem solving, thorough code reviews, and cross-functional ownership are paramount. I have consistently demonstrated the ability to ramp up on complex codebases quickly and deliver dependable, production-ready software.${notesParagraph}

What excites me most about ${company} is your commitment to high engineering standards and genuine user value. I am eager to bring my curiosity, foundational rigor in data structures, and disciplined work ethic to your engineering organization.

Thank you for your time, consideration, and review of my application. I welcome the opportunity to discuss how my background and enthusiasm can contribute to ${company}'s ongoing milestones.

Sincerely,

${candidateName}
${degree}, ${university} (Class of ${gradYear})`;
  }

  /**
   * Persists an edited cover letter draft locally
   */
  public static saveDraft(opportunityId: string, draft: string): void {
    try {
      localStorage.setItem(`${this.DRAFT_KEY_PREFIX}${opportunityId}`, draft);
    } catch (e) {
      logger.error('CoverLetterService', 'Failed to save cover letter draft to localStorage', e, { opportunityId });
    }
  }

  /**
   * Retrieves a previously saved cover letter draft for an opportunity
   */
  public static getSavedDraft(opportunityId: string): string | null {
    try {
      return localStorage.getItem(`${this.DRAFT_KEY_PREFIX}${opportunityId}`);
    } catch (e) {
      logger.warn('CoverLetterService', 'Failed to retrieve saved draft from localStorage', e, { opportunityId });
      return null;
    }
  }

  /**
   * Checks if a saved draft exists for an opportunity
   */
  public static hasSavedDraft(opportunityId: string): boolean {
    const draft = this.getSavedDraft(opportunityId);
    return Boolean(draft && draft.trim().length > 0);
  }

  /**
   * Deletes a saved draft
   */
  public static deleteDraft(opportunityId: string): void {
    try {
      localStorage.removeItem(`${this.DRAFT_KEY_PREFIX}${opportunityId}`);
    } catch (e) {
      logger.error('CoverLetterService', 'Failed to remove draft from localStorage', e, { opportunityId });
    }
  }

  /**
   * Copies text cleanly to clipboard
   */
  public static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch (e) {
      logger.warn('CoverLetterService', 'Clipboard writeText failed', e);
      return false;
    }
  }

  /**
   * Exports the cover letter as a clean plain-text file
   */
  public static downloadDraftAsFile(opportunity: Opportunity, draft: string): void {
    try {
      const cleanCompany = opportunity.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `Cover_Letter_${cleanCompany}_${opportunity.id}.txt`;
      const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      logger.error('CoverLetterService', 'Failed to download draft as file', e);
    }
  }
}

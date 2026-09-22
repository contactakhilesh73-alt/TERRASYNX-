import { Opportunity, StudentProfile } from '../types';
import { logger } from '../utils/logger';

export type EmailDraftType = 'cold-outreach' | 'referral-request';
export type RecipientPersona = 'recruiter' | 'engineering_manager' | 'alumni' | 'peer_engineer';

export interface EmailDraftData {
  type: EmailDraftType;
  recipientPersona: RecipientPersona;
  subject: string;
  body: string;
  attachmentChecklist: string[];
  keyHooks: string[];
  followUpAdvice: string;
  lastEditedAt?: number;
  isCustomized?: boolean;
}

export interface EmailDraftResult {
  success: boolean;
  draft: EmailDraftData;
  source: 'gemini-3.8-flash' | 'saved-draft' | 'algorithmic-synthesis';
  message?: string;
  error?: string;
}

const STORAGE_KEY_PREFIX = 'terrasynx_email_draft_';

export class EmailDraftService {
  /**
   * Generates a personalized cold outreach or referral email draft using Gemini AI,
   * falling back smoothly to an algorithmic synthesis matrix if offline or unconfigured.
   * 
   * STRICT SAFETY GUARANTEE:
   * This is a draft generator only. It never sends emails, never touches external email
   * accounts, and never alters candidate application stages automatically.
   */
  public static async generateEmailDraft(
    opportunity: Opportunity,
    profile: StudentProfile,
    type: EmailDraftType = 'referral-request',
    recipientPersona: RecipientPersona = 'alumni',
    customNotes?: string,
    forceFresh: boolean = false
  ): Promise<EmailDraftResult> {
    const draftKey = `${opportunity.id}_${type}`;

    // 1. Check if user already has a saved customized draft in local storage
    if (!forceFresh) {
      const saved = this.getSavedDraft(opportunity.id, type);
      if (saved) {
        return {
          success: true,
          draft: saved,
          source: 'saved-draft',
          message: 'Loaded your preserved local draft.'
        };
      }
    }

    // 2. Attempt server-side Gemini AI generation
    try {
      const response = await fetch('/api/ai/generate-email-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          profile,
          type,
          recipientPersona,
          customNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.draft?.body) {
          const draft: EmailDraftData = {
            type,
            recipientPersona,
            subject: data.draft.subject,
            body: data.draft.body,
            attachmentChecklist: Array.isArray(data.draft.attachmentChecklist)
              ? data.draft.attachmentChecklist
              : this.getDefaultAttachmentChecklist(opportunity, profile),
            keyHooks: data.draft.keyHooks || [],
            followUpAdvice: data.draft.followUpAdvice || 'Follow up politely in 4-5 business days if no response.',
            lastEditedAt: Date.now(),
            isCustomized: false
          };

          this.saveDraft(opportunity.id, draft);
          return {
            success: true,
            draft,
            source: 'gemini-3.8-flash',
            message: 'Draft synthesized with Gemini AI based on real JD and candidate credentials.'
          };
        }
      }
    } catch (err: any) {
      logger.error('EmailDraftService', 'Network error calling /api/ai/generate-email-draft', err, { opportunityId: opportunity.id });
    }

    // 3. Resilient Algorithmic Fallback
    const fallbackDraft = this.synthesizeAlgorithmicDraft(opportunity, profile, type, recipientPersona);
    this.saveDraft(opportunity.id, fallbackDraft);

    return {
      success: true,
      draft: fallbackDraft,
      source: 'algorithmic-synthesis',
      message: 'Synthesized using autonomous tactical template anchored to verified job parameters.'
    };
  }

  /**
   * Deterministic algorithmic synthesis engine for cold outreach & referral requests.
   * Leverages verified candidate projects, target company domain, role requirements,
   * and college identity.
   */
  public static synthesizeAlgorithmicDraft(
    opportunity: Opportunity,
    profile: StudentProfile,
    type: EmailDraftType = 'referral-request',
    recipientPersona: RecipientPersona = 'alumni'
  ): EmailDraftData {
    const candidateName = profile.fullName?.trim() || 'Candidate';
    const company = opportunity.companyName;
    const roleTitle = opportunity.title;
    const college = profile.collegeName || 'University';
    const gradYear = profile.graduationYear || 2026;
    const degree = profile.degree || 'B.Tech in Computer Science';

    const matchedSkills = opportunity.fitment?.matchedSkills?.length
      ? opportunity.fitment.matchedSkills.slice(0, 3).join(', ')
      : (profile.primarySkills?.slice(0, 3).join(', ') || 'TypeScript, Distributed Systems');

    const topProject = profile.projects && profile.projects.length > 0
      ? profile.projects[0]
      : {
          title: 'Distributed System Architecture',
          techStack: ['TypeScript', 'Go', 'Distributed Systems'],
          description: 'Engineered high-throughput event processing pipeline'
        };

    let subject = '';
    let body = '';
    let followUpAdvice = '';

    if (type === 'referral-request') {
      if (recipientPersona === 'alumni') {
        subject = `${college} '${String(gradYear).slice(-2)} Grad | Referral Inquiry: ${roleTitle} (${company})`;
        body = `Hi [Alum Name],

Hope you're having a productive week!

I'm ${candidateName}, a final-year ${degree} student at ${college} (Class of ${gradYear}), and I came across your profile while exploring the engineering team at ${company}. Huge respect for the work your team is shipping.

I noticed the open ${roleTitle} role on ${company}'s official careers portal and saw a strong alignment with my background in ${matchedSkills}. Recently, I built "${topProject.title}" (${topProject.techStack.join(', ')}), where I ${topProject.description}.

Given your experience at ${company}, I would be immensely grateful if you'd be open to submitting an internal referral for this opening, or sharing any advice on what the engineering team values most.

I have attached my 1-page resume and included the direct requisition link below for your convenience. Thank you so much for your time and guidance!

Warm regards,
${candidateName}
${profile.email}${profile.phoneNumber ? ` | ${profile.phoneNumber}` : ''}
LinkedIn: ${profile.linkedinUrl || 'linkedin.com/in/candidate'} | GitHub: ${profile.githubUrl || 'github.com/candidate'}`;
        followUpAdvice = 'Wait 5 business days. If no reply, send a gentle 2-sentence nudge on Tuesday morning.';
      } else {
        // Engineering Manager or Recruiter referral inquiry
        subject = `Referral / Candidate Intro: ${candidateName} — ${roleTitle} at ${company}`;
        body = `Hi [Name],

I hope this note finds you well.

My name is ${candidateName}, graduating in ${gradYear} with a ${degree} from ${college}. I am writing to express my strong interest in the ${roleTitle} position at ${company}.

My technical foundation directly aligns with your team's stack in ${matchedSkills}:
• Relevant Engineering: Built "${topProject.title}" using ${topProject.techStack.join(', ')} (${topProject.description}).
• Academic & Practical Foundations: Maintained a ${profile.currentCgpa || 'strong'} academic standing while actively contributing to production-grade repositories.

If you are open to it, I would truly appreciate an internal referral or a brief 10-minute introductory conversation to learn more about current engineering priorities at ${company}.

I have attached my tailored resume for your review. Thank you for your consideration!

Best regards,
${candidateName}
${profile.email} | ${profile.linkedinUrl || 'linkedin.com/in/candidate'}`;
        followUpAdvice = 'Recruiters and managers are inundated; follow up once after 4-5 business days.';
      }
    } else {
      // Cold Outreach Email
      subject = `${roleTitle} Candidate Intro: ${candidateName} (${topProject.title.slice(0, 24)})`;
      body = `Hi [Name],

I've been closely following ${company}'s recent technical engineering work and wanted to introduce myself directly.

I'm ${candidateName}, an upcoming ${gradYear} graduate from ${college} specializing in ${matchedSkills}.

I recently saw the ${roleTitle} opening and noticed the emphasis on solid architectural fundamentals. In my recent project "${topProject.title}", I ${topProject.description} using ${topProject.techStack.join(', ')}.

I'd love the opportunity to contribute this hands-on engineering drive to your team. Would you be open to a brief 10-15 minute chat next week, or reviewing my resume for this opening?

I've attached my 1-page resume for quick reference. Appreciate your time and consideration!

Sincerely,
${candidateName}
${profile.email}${profile.phoneNumber ? ` | ${profile.phoneNumber}` : ''}
${profile.githubUrl || 'github.com/candidate'}`;
      followUpAdvice = 'Cold emails have highest response rates on Tuesday through Thursday between 9:00 AM - 11:00 AM local time.';
    }

    return {
      type,
      recipientPersona,
      subject,
      body,
      attachmentChecklist: this.getDefaultAttachmentChecklist(opportunity, profile),
      keyHooks: [
        `Targeted alignment with ${company}'s ${matchedSkills}`,
        `Concrete project evidence: ${topProject.title}`
      ],
      followUpAdvice,
      lastEditedAt: Date.now(),
      isCustomized: false
    };
  }

  /**
   * Generates default checklist of recommended attachments/links based on JD.
   */
  public static getDefaultAttachmentChecklist(opportunity: Opportunity, profile: StudentProfile): string[] {
    const list: string[] = [
      'Tailored 1-page PDF Resume (Verified contact info & relevant skills highlighted)',
      `Direct Job Requisition Link (${opportunity.officialApplyUrl})`
    ];

    if (profile.githubUrl) {
      list.push(`GitHub Profile / Code Samples (${profile.githubUrl})`);
    }

    if (profile.currentCgpa) {
      list.push(`Academic Transcript / CGPA Proof (${profile.currentCgpa})`);
    }

    return list;
  }

  /**
   * Local storage persistence helpers
   */
  public static saveDraft(opportunityId: string, draft: EmailDraftData): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${opportunityId}_${draft.type}`;
      localStorage.setItem(key, JSON.stringify({
        ...draft,
        lastEditedAt: Date.now()
      }));
    } catch (e) {
      logger.error('EmailDraftService', 'Failed to save email draft locally', e);
    }
  }

  public static getSavedDraft(opportunityId: string, type: EmailDraftType): EmailDraftData | null {
    try {
      const key = `${STORAGE_KEY_PREFIX}${opportunityId}_${type}`;
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as EmailDraftData;
    } catch {
      return null;
    }
  }

  public static hasSavedDraft(opportunityId: string, type: EmailDraftType): boolean {
    return Boolean(this.getSavedDraft(opportunityId, type));
  }

  public static deleteDraft(opportunityId: string, type: EmailDraftType): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${opportunityId}_${type}`;
      localStorage.removeItem(key);
    } catch (e) {
      logger.error('EmailDraftService', 'Failed to delete email draft locally', e);
    }
  }

  /**
   * Copies formatted subject and body directly into clipboard.
   */
  public static async copyToClipboard(subject: string, body: string): Promise<boolean> {
    try {
      const fullText = `Subject: ${subject}\n\n${body}`;
      await navigator.clipboard.writeText(fullText);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates a standard mailto: URL to open the user's default email client
   * with the subject and body pre-filled.
   * STRICT NOTE: This never auto-sends. The user reviews and clicks Send themselves.
   */
  public static generateMailtoUrl(subject: string, body: string): string {
    const encodedSubject = encodeURIComponent(subject.trim());
    const encodedBody = encodeURIComponent(body.trim());
    return `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
  }

  /**
   * Exports the entire draft package as a clean .txt file.
   */
  public static exportAsText(draft: EmailDraftData, opportunity: Opportunity): void {
    const content = `=====================================================
TERRASYNX AUTONOMOUS EMAIL DRAFT (DRAFT ONLY)
Status: Pure local draft - Never auto-sent
Opportunity: ${opportunity.title} | ${opportunity.companyName}
Type: ${draft.type.toUpperCase()} (Target: ${draft.recipientPersona})
Generated / Last Saved: ${new Date(draft.lastEditedAt || Date.now()).toLocaleString()}
=====================================================

SUBJECT:
${draft.subject}

BODY:
${draft.body}

=====================================================
ATTACHMENT & LINK CHECKLIST (ATTACH BEFORE SENDING):
${draft.attachmentChecklist.map((item, idx) => `[ ] ${idx + 1}. ${item}`).join('\n')}

=====================================================
FOLLOW-UP STRATEGY:
${draft.followUpAdvice}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${opportunity.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${draft.type}_email_draft.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

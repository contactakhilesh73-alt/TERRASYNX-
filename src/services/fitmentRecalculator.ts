/**
 * TERRASYNX: Real-Time Dynamic Fitment & Eligibility Engine (Req #17 & #18)
 * Recalculates 10-D scores and skill match in real-time as the student profile changes.
 * Avoids rigid, stale hardcoded scores without requiring server roundtrips.
 */

import { Opportunity, StudentProfile, FitmentEvaluation } from '../types';
import { RoleSkillClassifier } from './roleSkillClassifier';

export class FitmentRecalculator {
  public static recalculate(opp: Opportunity, profile: StudentProfile): FitmentEvaluation {
    const allStudentSkills = [
      ...profile.primarySkills.map(s => s.toLowerCase()),
      ...profile.secondarySkills.map(s => s.toLowerCase()),
    ];

    // Determine authentic role classification
    const classification = RoleSkillClassifier.classifyRole(
      opp.title,
      opp.companyName,
      opp.department
    );

    // Detect if existing skills contain generic/stale engineering gaps on a non-systems role
    const existingMissing = opp.fitment?.missingSkills || [];
    const existingMatched = opp.fitment?.matchedSkills || [];
    const isGenericMismatched = existingMissing.some(s => {
      const lower = s.toLowerCase();
      return (
        lower.includes('kubernetes') ||
        lower.includes('cloud infrastructure') ||
        lower.includes('go concurrency')
      ) && classification.category !== 'backend_systems';
    });

    const baseMatched = (!isGenericMismatched && existingMatched.length > 0)
      ? existingMatched
      : classification.matchedSkills;

    const baseMissing = (!isGenericMismatched && existingMissing.length > 0)
      ? existingMissing
      : classification.missingSkills;

    // Combined unique skills required for this specific role domain
    const jobKeywords = Array.from(new Set([...baseMatched, ...baseMissing]));

    // Re-evaluate matching and missing skills based on student profile vs role requirements
    const matched: string[] = [];
    const missing: string[] = [];

    jobKeywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      const isMatch = allStudentSkills.some(skill => 
        skill.includes(kwLower) || kwLower.includes(skill)
      );

      if (isMatch) {
        if (!matched.includes(kw)) matched.push(kw);
      } else {
        if (!missing.includes(kw)) missing.push(kw);
      }
    });

    // Ensure missing skills always provide high-signal, domain-appropriate ATS gaps (never empty if student is missing core role skills)
    const finalMissingSkills = missing.length > 0
      ? missing.slice(0, 4)
      : (matched.length < baseMatched.length ? classification.missingSkills : []);

    // 1. Batch Eligibility (0 - 100)
    const isBatchMatched = opp.eligibility.allowedGraduationYears.includes(profile.graduationYear);
    const batchEligibility = isBatchMatched ? 100 : 40;

    // 2. Skills Alignment (0 - 100)
    const totalKeyReqs = Math.max(1, matched.length + missing.length);
    const skillsAlignment = Math.min(100, Math.round((matched.length / totalKeyReqs) * 100));

    // 3. Work Authorization / Location Fit
    let workAuthScore = 90;
    if (opp.eligibility.sponsorshipAvailable) {
      workAuthScore = 100;
    } else if (profile.workAuthorization === 'Requires H-1B Sponsorship') {
      workAuthScore = 45;
    } else if (profile.workAuthorization === 'F-1 (OPT / CPT Eligible)') {
      workAuthScore = 85;
    }

    // 4. Role Fit (based on preferred roles and student degree)
    const isPreferredRole = profile.preferredRoles.some(r => 
      opp.title.toLowerCase().includes(r.toLowerCase()) || 
      opp.department.toLowerCase().includes(r.toLowerCase())
    );
    const roleFit = isPreferredRole ? 95 : 82;

    // 5. Work Mode Fit
    let modeScore = 90;
    if (profile.preferredWorkMode !== 'any' && profile.preferredWorkMode !== opp.workMode) {
      modeScore = 70;
    }

    const companyPrestige = opp.fitment.dimensions.companyPrestige;
    const learningTrajectory = opp.fitment.dimensions.learningTrajectory;
    const compensationFairness = opp.fitment.dimensions.compensationFairness;

    // Weighted Overall Score (Req #17)
    const overallScore = Math.min(
      99,
      Math.max(
        35,
        Math.round(
          (roleFit * 0.20) +
          (skillsAlignment * 0.25) +
          (batchEligibility * 0.20) +
          (workAuthScore * 0.15) +
          (companyPrestige * 0.10) +
          (modeScore * 0.10)
        )
      )
    );

    // Grade Assignment
    let overallGrade: FitmentEvaluation['overallGrade'] = 'B';
    if (overallScore >= 92) overallGrade = 'A+';
    else if (overallScore >= 85) overallGrade = 'A';
    else if (overallScore >= 75) overallGrade = 'B';
    else if (overallScore >= 65) overallGrade = 'C';
    else if (overallScore >= 55) overallGrade = 'D';
    else overallGrade = 'F';

    // Tailored Verdict
    let strategicVerdict = opp.fitment.strategicVerdict;
    if (skillsAlignment > 80 && batchEligibility === 100) {
      strategicVerdict = `Strong direct fit for ${profile.fullName}. High ATS keyword match (${matched.length} key competencies aligned). Priority application recommended.`;
    } else if (batchEligibility < 100) {
      strategicVerdict = `Graduation batch mismatch (${profile.graduationYear} vs allowed [${opp.eligibility.allowedGraduationYears.join(', ')}]). High risk of automated ATS discard unless referral is secured.`;
    } else if (finalMissingSkills.length > 0) {
      strategicVerdict = `Moderate match. Bridge critical domain gaps in [${finalMissingSkills.slice(0, 2).join(', ')}] in resume before final submission.`;
    }

    return {
      overallScore,
      overallGrade,
      dimensions: {
        roleFit,
        skillsAlignment,
        batchEligibility,
        companyPrestige,
        learningTrajectory,
        compensationFairness,
      },
      missingSkills: finalMissingSkills,
      matchedSkills: matched,
      strategicVerdict,
    };
  }
}

/**
 * TERRASYNX: Student Profile & Preferences Context Studio (Phase 3 Point 2 / Req #18)
 * Real-time responsive control panel for candidate parameters, skills, batch year,
 * work authorization, and alert thresholds with live dynamic fitment recalculation.
 */

import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { 
  User, 
  GraduationCap, 
  ShieldCheck, 
  Briefcase, 
  Code2, 
  Plus, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  FileText, 
  Sliders,
  RotateCcw,
  Save,
  Globe
} from 'lucide-react';

interface ProfileSettingsViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => void;
  onResetDefaults: () => void;
  onClose?: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<StudentProfile>({ ...profile });
  const [newPrimarySkill, setNewPrimarySkill] = useState('');
  const [newSecondarySkill, setNewSecondarySkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Quick preset skills list for fast tagging
  const POPULAR_SKILLS = [
    'Python', 'TypeScript', 'React', 'Go', 'Rust', 'Distributed Systems',
    'PostgreSQL', 'Docker', 'Kubernetes', 'FastAPI', 'PyTorch', 'Next.js',
    'GraphQL', 'Kafka', 'AWS', 'System Design'
  ];

  const handleInputChange = (field: keyof StudentProfile, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPrimarySkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || formData.primarySkills.includes(trimmed)) return;
    const updated = [...formData.primarySkills, trimmed];
    setFormData(prev => ({ ...prev, primarySkills: updated }));
    setNewPrimarySkill('');
  };

  const handleRemovePrimarySkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.filter(s => s !== skill),
    }));
  };

  const handleAddSecondarySkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || formData.secondarySkills.includes(trimmed)) return;
    const updated = [...formData.secondarySkills, trimmed];
    setFormData(prev => ({ ...prev, secondarySkills: updated }));
    setNewSecondarySkill('');
  };

  const handleRemoveSecondarySkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      secondarySkills: prev.secondarySkills.filter(s => s !== skill),
    }));
  };

  const handleAddPreferredRole = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed || formData.preferredRoles.includes(trimmed)) return;
    setFormData(prev => ({
      ...prev,
      preferredRoles: [...prev.preferredRoles, trimmed],
    }));
    setNewRole('');
  };

  const handleRemovePreferredRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== role),
    }));
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsSavedBanner(true);
    setTimeout(() => {
      setIsSavedBanner(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Profile &amp; Context Studio • Req #18</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Candidate Profile &amp; Match Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Changes to your target batch, technical skill stack, and work authorization dynamically update 
            the <span className="text-cyan-300 font-medium">10-Dimensional Fitment Scores</span> and ATS keyword 
            match across all radar opportunities in real-time with zero page reload.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Reset all profile settings to canonical defaults?')) {
                onResetDefaults();
                setFormData({ ...profile });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {isSavedBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Candidate profile updated! All 10-D Fitment scores and Radar matching indexes have been recalculated in real time.</span>
          </div>
          <span className="text-[10px] text-emerald-400/70">Synced to Local Cache</span>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Academic & Identity Context */}
        <div className="space-y-6">
          {/* Identity & Contact */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold border-b border-slate-800/80 pb-3">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Identity &amp; Contact Credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">GitHub Profile URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Dossier */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold border-b border-slate-800/80 pb-3">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Academic Dossier &amp; Batch Eligibility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">University / Institute</label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Degree &amp; Major</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Current CGPA / GPA</label>
                <input
                  type="text"
                  value={formData.currentCgpa}
                  onChange={(e) => handleInputChange('currentCgpa', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Official Graduation Year <span className="text-cyan-400">*Critical for Batch Match</span>
                </label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={2025}>2025 (Immediate New Grad)</option>
                  <option value={2026}>2026 (Upcoming Graduate / Summer Intern)</option>
                  <option value={2027}>2027 (Pre-final Year)</option>
                  <option value={2028}>2028 (Undergrad Sophomore)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Batches Considered</label>
                <div className="flex items-center gap-2 pt-1.5">
                  {[2025, 2026, 2027].map(year => (
                    <label key={year} className="flex items-center gap-1.5 text-xs text-slate-300 font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetBatch.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, targetBatch: [...prev.targetBatch, year] }));
                          } else {
                            setFormData(prev => ({ ...prev, targetBatch: prev.targetBatch.filter(y => y !== year) }));
                          }
                        }}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Work Authorization & Legal Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold border-b border-slate-800/80 pb-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Work Authorization Status (Compliance Anchor)</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Current Immigration / Legal Status
              </label>
              <select
                value={formData.workAuthorization}
                onChange={(e) => handleInputChange('workAuthorization', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="US Citizen / Green Card">US Citizen / Permanent Resident (No sponsorship needed)</option>
                <option value="F-1 (OPT / CPT Eligible)">F-1 Student Visa (OPT / CPT Work Authorization Eligible)</option>
                <option value="Requires H-1B Sponsorship">Requires Immediate Employer Visa Sponsorship (H-1B)</option>
                <option value="India / APAC Domestic Only">India / APAC Domestic Only (Domestic Tax ID)</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                Used to filter out roles that automatically disqualify based on export control or visa constraints.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Skills, Roles, & Delivery Channels */}
        <div className="space-y-6">
          {/* Primary Skills */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Primary Technical Skills (Core Competencies)</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                {formData.primarySkills.length} Verified
              </span>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5">
              {formData.primarySkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/50 border border-cyan-700/50 text-cyan-200"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemovePrimarySkill(skill)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add primary skill (e.g. Distributed Systems)..."
                value={newPrimarySkill}
                onChange={(e) => setNewPrimarySkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPrimarySkill(newPrimarySkill);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleAddPrimarySkill(newPrimarySkill)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Add Suggestions */}
            <div>
              <span className="block text-[10px] font-mono text-slate-500 mb-1.5">Quick Add:</span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SKILLS.filter(s => !formData.primarySkills.includes(s) && !formData.secondarySkills.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    onClick={() => handleAddPrimarySkill(s)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-cyan-300 bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-800 transition-colors"
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary / Familiar Skills */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Secondary &amp; Tooling Skills</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
                {formData.secondarySkills.length} Added
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {formData.secondarySkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 border border-slate-700 text-slate-300"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSecondarySkill(skill)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add secondary skill (e.g. Docker, Redis)..."
                value={newSecondarySkill}
                onChange={(e) => setNewSecondarySkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSecondarySkill(newSecondarySkill);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleAddSecondarySkill(newSecondarySkill)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Role Preferences & Work Mode */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold border-b border-slate-800/80 pb-3">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>Target Roles &amp; Work Modality</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Preferred Work Mode</label>
                <select
                  value={formData.preferredWorkMode}
                  onChange={(e) => handleInputChange('preferredWorkMode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="any">Any (Remote, Hybrid, or On-site)</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-Site Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Urgency Alert Threshold</label>
                <select
                  value={formData.urgentAlertThresholdHours}
                  onChange={(e) => handleInputChange('urgentAlertThresholdHours', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={24}>Less than 24 hours left</option>
                  <option value={48}>Less than 48 hours left</option>
                  <option value={72}>Less than 72 hours left (Standard)</option>
                  <option value={120}>Less than 5 days left</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Target Roles</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.preferredRoles.map(role => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-950/40 border border-blue-800/50 text-blue-200"
                    >
                      <span>{role}</span>
                      <button
                        onClick={() => handleRemovePreferredRole(role)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add target role (e.g. Infrastructure Engineer)..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPreferredRole(newRole);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleAddPreferredRole(newRole)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Verified Projects Section (Truth-Anchored, Fix 1) */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Student Projects (Truth-Anchored)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                {(formData.projects || []).length} Verified Projects
              </span>
            </div>

            <p className="text-xs text-slate-400">
              ATS resumes and technical applications pull directly from these verified projects. Never fabricate credentials: enter real repositories and measurable results.
            </p>

            {/* List of current projects */}
            <div className="space-y-3">
              {(formData.projects || []).map((proj, idx) => (
                <div key={proj.id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white font-mono">{proj.title}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (formData.projects || []).filter((_, i) => i !== idx);
                        setFormData(prev => ({ ...prev, projects: updated }));
                      }}
                      className="text-slate-400 hover:text-red-400 text-xs font-mono"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-300">{proj.description}</p>
                  {proj.metricsAchieved && (
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Impact: {proj.metricsAchieved}
                    </div>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline block font-mono">
                      {proj.githubUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Form to add a new project */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-200 font-mono">+ Add Verified Project</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  id="newProjTitle"
                  placeholder="Project Title (e.g. Distributed Consensus Engine)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                <input
                  type="text"
                  id="newProjTech"
                  placeholder="Tech Stack (comma-separated, e.g. Go, gRPC, Docker)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <input
                type="text"
                id="newProjDesc"
                placeholder="Architectural Description (e.g. Implemented raft leader election and WAL...)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  id="newProjMetrics"
                  placeholder="Key Metrics (e.g. Sub-5ms p99 latency, 10k req/s)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                <input
                  type="url"
                  id="newProjGithub"
                  placeholder="GitHub URL (e.g. https://github.com/...)"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const titleEl = document.getElementById('newProjTitle') as HTMLInputElement;
                  const techEl = document.getElementById('newProjTech') as HTMLInputElement;
                  const descEl = document.getElementById('newProjDesc') as HTMLInputElement;
                  const metricsEl = document.getElementById('newProjMetrics') as HTMLInputElement;
                  const githubEl = document.getElementById('newProjGithub') as HTMLInputElement;

                  if (!titleEl?.value.trim() || !descEl?.value.trim()) return;

                  const newProj = {
                    id: `proj_${Date.now()}`,
                    title: titleEl.value.trim(),
                    techStack: techEl.value.split(',').map(s => s.trim()).filter(Boolean),
                    description: descEl.value.trim(),
                    metricsAchieved: metricsEl?.value.trim() || undefined,
                    githubUrl: githubEl?.value.trim() || undefined
                  };

                  setFormData(prev => ({
                    ...prev,
                    projects: [...(prev.projects || []), newProj]
                  }));

                  titleEl.value = '';
                  techEl.value = '';
                  descEl.value = '';
                  if (metricsEl) metricsEl.value = '';
                  if (githubEl) githubEl.value = '';
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Save Project to Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Multi-tenant profile state is isolated per candidate and cached locally.</span>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono shadow-lg shadow-cyan-950 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save &amp; Recalculate Fitment Matrix</span>
        </button>
      </div>
    </div>
  );
};

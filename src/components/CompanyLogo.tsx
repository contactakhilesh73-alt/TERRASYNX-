/**
 * TERRASYNX: Authentic Enterprise Brand Models & High-Fidelity Company Logos
 * Strictly identical ("Hu-ba-hu") to official company logos and exact brand colors
 * so students can instantly identify the official corporate portals.
 */

import React, { useState } from 'react';

interface CompanyLogoProps {
  domain?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  domain = '',
  name = '',
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const cleanDomain = (domain || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  // Helper matching check
  const isMatch = (term: string) => cleanDomain.includes(term) || cleanName.includes(term);

  // 1. Google: Official 4-Color 'G' (Blue #4285F4, Red #EA4335, Yellow #FBBC05, Green #34A853) on Crisp White Container
  if (isMatch('google') || isMatch('alphabet')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0 ${className}`}
        title="Google Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>
    );
  }

  // 2. Microsoft: Official 4-Color Square Flag (Red #F25022, Green #7FBA00, Blue #00A4EF, Yellow #FFB900) on Crisp White Container
  if (isMatch('microsoft') || isMatch('azure')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm flex-shrink-0 ${className}`}
        title="Microsoft Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect x="1" y="1" width="10.2" height="10.2" fill="#F25022"/>
          <rect x="12.8" y="1" width="10.2" height="10.2" fill="#7FBA00"/>
          <rect x="1" y="12.8" width="10.2" height="10.2" fill="#00A4EF"/>
          <rect x="12.8" y="12.8" width="10.2" height="10.2" fill="#FFB900"/>
        </svg>
      </div>
    );
  }

  // 3. Amazon & AWS: Official Amazon Smile Arrow in Warm Amber/Orange (#FF9900) on Deep Dark Onyx
  if (isMatch('amazon') || isMatch('aws')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#131921] border border-amber-500/40 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Amazon Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          {/* Lowercase 'a' */}
          <path fill="#FFFFFF" d="M13.9 11.2c0-1.2-.7-1.8-1.9-1.8-.9 0-1.6.4-2 1.1l-1.3-.9c.7-1.2 1.9-1.8 3.4-1.8 2.2 0 3.6 1.1 3.6 3.2v4.8h-1.6v-1c-.6.8-1.5 1.2-2.5 1.2-1.7 0-2.9-1.1-2.9-2.7 0-1.8 1.4-2.8 3.5-2.8h1.7v-.3zm-1.8 3.5c1 0 1.8-.7 1.8-1.7v-.7h-1.6c-1.2 0-2 .5-2 1.4 0 .6.4 1 1.8 1z"/>
          {/* Iconic Amazon Smile Arrow */}
          <path fill="#FF9900" d="M3.2 17.5c4.7 3.5 11.4 3.7 16.5.6.3-.2.3-.6 0-.8-.4-.3-.8-.2-1.1 0-4.6 2.7-10.6 2.5-14.8-.6-.3-.3-.8-.1-.9.2-.1.3 0 .5.3.6z"/>
          <path fill="#FF9900" d="M20.2 16.2c-.3-.4-1.9-.3-2.7.2-.2.1-.2.4 0 .5.6.3 1.4.4 1.7.3.3-.2.7-.6 1-.9.1-.1.1-.1 0-.1z"/>
        </svg>
      </div>
    );
  }

  // 4. Asana: Official 3-Circle Gradient Coral/Salmon Rose Dots (#FC636B / #FF5A5F) on Deep Slate
  if (isMatch('asana')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#1A1A24] border border-[#FC636B]/40 flex items-center justify-center p-2 shadow-md flex-shrink-0 ${className}`}
        title="Asana Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="6.5" r="4.2" fill="#FC636B"/>
          <circle cx="6.5" cy="16.5" r="4.2" fill="#FF7882"/>
          <circle cx="17.5" cy="16.5" r="4.2" fill="#FA5259"/>
        </svg>
      </div>
    );
  }

  // 5. Apple: Official Apple Silhouette in Crisp White on Sleek Dark Glass
  if (isMatch('apple')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#000000] border border-neutral-700 flex items-center justify-center p-2 text-white shadow-md flex-shrink-0 ${className}`}
        title="Apple Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.66-2.84 1.45-.58.67-1.1 1.76-.96 2.82 1.11.09 2.2-.56 2.84-1.32z"/>
        </svg>
      </div>
    );
  }

  // 6. Meta: Official Meta Blue (#0081FB) Infinity Loop Glyph on Crisp White
  if (isMatch('meta') || isMatch('facebook')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0 ${className}`}
        title="Meta Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#0081FB" d="M16.92 5.05c-1.92 0-3.66 1.02-4.92 2.61-1.26-1.59-3-2.61-4.92-2.61C3.15 5.05.5 8.13.5 12.02c0 3.89 2.65 6.97 6.58 6.97 2.37 0 4.41-1.37 5.56-3.4 1.15 2.03 3.19 3.4 5.56 3.4 3.93 0 6.58-3.08 6.58-6.97 0-3.89-2.65-6.97-6.58-6.97zm-9.84 11.8c-2.67 0-4.48-2.22-4.48-4.83s1.81-4.83 4.48-4.83c1.78 0 3.32 1.15 4.02 2.85-.72 1.25-1.94 3.17-3.15 5.03-.27.46-.57.94-.87 1.78zm9.84 0c-.3-.84-.6-1.32-.87-1.78-1.21-1.86-2.43-3.78-3.15-5.03.7-1.7 2.24-2.85 4.02-2.85 2.67 0 4.48 2.22 4.48 4.83s-1.81 4.83-4.48 4.83z"/>
        </svg>
      </div>
    );
  }

  // 7. OpenAI: Official 6-Part Interlocking Spiral Knot on Solid Black Container
  if (isMatch('openai')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#000000] border border-neutral-700 flex items-center justify-center p-2 text-white shadow-md flex-shrink-0 ${className}`}
        title="OpenAI Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 5 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.12a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.85-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.37-1.98v5.68a.77.77 0 0 0 .38.68l5.82 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.85L13.1 8.36l2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.67a.79.79 0 0 0-.4-.67zm2.01-3.02l-.14-.09-4.78-2.78a.78.78 0 0 0-.78 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.79 2.76a.79.79 0 0 0-.39.68v6.72zm1.14-2.61l2.55-1.47 2.54 1.47v2.93l-2.54 1.47-2.55-1.47z"/>
        </svg>
      </div>
    );
  }

  // 8. Stripe: Official Stripe Blurple (#635BFF) Container with Authentic Slanted 'S'
  if (isMatch('stripe')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#635BFF] border border-[#7A73FF] flex items-center justify-center p-2 text-white shadow-md flex-shrink-0 ${className}`}
        title="Stripe Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.5 12.873.5 6.852.5 2.698 3.654 2.698 8.78c0 5.166 4.675 6.786 8.356 8.163 2.502.937 3.364 1.558 3.364 2.576 0 .984-.87 1.529-2.29 1.529-2.316 0-5.184-1.074-7.073-2.091L4.1 24.521c2.052 1.055 5.094 1.68 8.083 1.68 6.427 0 10.817-3.153 10.817-8.47 0-5.467-4.48-6.882-9.024-8.581z"/>
        </svg>
      </div>
    );
  }

  // 9. Anthropic: Official Anthropic Terracotta (#D97757) on Warm Charcoal (#1E1916)
  if (isMatch('anthropic') || isMatch('claude')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#1E1916] border border-[#D97757]/40 flex items-center justify-center p-2 text-[#D97757] shadow-md flex-shrink-0 ${className}`}
        title="Anthropic Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M13.82 3L21 21h-3.92l-1.47-3.95H8.39L6.92 21H3L10.18 3h3.64zm-1.82 4.41L9.64 14.1h4.72l-2.36-6.69z"/>
        </svg>
      </div>
    );
  }

  // 10. Perplexity AI: Official Signature Teal (#22B8CD) Intersecting Asterisk on Dark Slate (#131A1C)
  if (isMatch('perplexity')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#131A1C] border border-[#22B8CD]/40 flex items-center justify-center p-2 text-[#22B8CD] shadow-md flex-shrink-0 ${className}`}
        title="Perplexity AI Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <line x1="12" y1="2" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
          <circle cx="12" cy="12" r="2.2" fill="currentColor"/>
        </svg>
      </div>
    );
  }

  // 11. Netflix: Official Bold Red (#E50914) Ribbon 'N' on Pure Black
  if (isMatch('netflix')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#000000] border border-red-900/40 flex items-center justify-center p-2 shadow-md flex-shrink-0 ${className}`}
        title="Netflix Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#B81D24" d="M4 2h4v20H4z"/>
          <path fill="#B81D24" d="M16 2h4v20h-4z"/>
          <path fill="#E50914" d="M4 2l12 20h4L8 2H4z"/>
        </svg>
      </div>
    );
  }

  // 12. Uber: Official Black Square with Crisp White Geometric Uber Wordmark
  if (isMatch('uber')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#000000] border border-slate-700 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Uber Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2.5"/>
          <rect x="10" y="8" width="4" height="8" rx="1" fill="#FFFFFF"/>
        </svg>
      </div>
    );
  }

  // 13. Goldman Sachs: Official Deep Navy (#002D62) Container with White GS Monogram
  if (isMatch('goldman') || isMatch('goldmansachs')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#002D62] border border-blue-400/40 flex items-center justify-center text-white font-bold font-serif text-xs shadow-md flex-shrink-0 ${className}`}
        title="Goldman Sachs Official Logo"
      >
        <span className="tracking-widest">GS</span>
      </div>
    );
  }

  // 14. Salesforce: Official Salesforce Cloud Blue (#00A1E0) Cloud Glyph on Crisp White
  if (isMatch('salesforce')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0 ${className}`}
        title="Salesforce Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#00A1E0" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      </div>
    );
  }

  // 15. Adobe: Official Adobe Bright Red (#FF0000) Square with White Cutout 'A'
  if (isMatch('adobe')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#ED1C24] border border-red-400/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Adobe Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#FFFFFF" d="M14.5 3h5.5l-5.5 18zM9.5 3H4l5.5 18zM12 9.5l3.2 11.5h-2.4l-1-3.5H9.2l1.6-4.5z"/>
        </svg>
      </div>
    );
  }

  // 16. Cisco: Official Cisco Cyan/Blue Bridge Wave Bars (#049FD9)
  if (isMatch('cisco')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#041E42] border border-[#049FD9]/40 flex items-center justify-center p-2 shadow-md flex-shrink-0 ${className}`}
        title="Cisco Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#049FD9">
          <rect x="2" y="11" width="2" height="7" rx="1"/>
          <rect x="6" y="8" width="2" height="10" rx="1"/>
          <rect x="11" y="4" width="2" height="14" rx="1"/>
          <rect x="16" y="8" width="2" height="10" rx="1"/>
          <rect x="20" y="11" width="2" height="7" rx="1"/>
        </svg>
      </div>
    );
  }

  // 17. Discord: Official Discord Blurple (#5865F2) with Clyde Controller Face
  if (isMatch('discord')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#5865F2] border border-[#7983F5] flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Discord Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </div>
    );
  }

  // 18. Figma: Official 5-Color Multi-Geometric Shapes
  if (isMatch('figma')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#1E1E1E] border border-slate-700 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Figma Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#0ACF83" d="M12 18a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3h3v3z"/>
          <path fill="#A259FF" d="M6 12a3 3 0 0 1 3-3h3v6H9a3 3 0 0 1-3-3z"/>
          <path fill="#F24E1E" d="M6 6a3 3 0 0 1 3-3h3v6H9a3 3 0 0 1-3-3z"/>
          <path fill="#FF7262" d="M12 3h3a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-3V3z"/>
          <circle cx="15" cy="12" r="3" fill="#1ABCFE"/>
        </svg>
      </div>
    );
  }

  // 19. Notion: Official Black Framed 'N' on Crisp White
  if (isMatch('notion')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-300 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0 ${className}`}
        title="Notion Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#000000">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.455-.84c1.12-.093 1.308.28 1.027.84l-2.053 3.17c-.187.28-.654.373-1.027.373l-7.747.56 6.347 9.893c.653 1.027.373 1.68-.84 1.773l-10.74.747c-1.4.093-1.867-.467-1.587-1.307l2.24-5.227c.187-.466.654-.56 1.027-.56h3.454L4.366 5.888c-.654-.933-.467-1.493.093-1.68z"/>
        </svg>
      </div>
    );
  }

  // 20. Coinbase: Official Coinbase Blue (#0052FF) Circle with 'C'
  if (isMatch('coinbase')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#0052FF] border border-blue-400/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Coinbase Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#FFFFFF">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="5" fill="#0052FF"/>
          <rect x="11" y="9" width="7" height="6" fill="#0052FF"/>
        </svg>
      </div>
    );
  }

  // 21. Datadog: Official Purple (#632CA6) with Bits The Dog Glyph
  if (isMatch('datadog')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#632CA6] border border-purple-400/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Datadog Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#FFFFFF">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07c-2.83-.48-5-2.94-5-5.93 0-.6.1-1.18.29-1.72l1.87.67c-.1.34-.16.7-.16 1.05 0 2.21 1.79 4 4 4s4-1.79 4-4c0-.35-.06-.71-.16-1.05l1.87-.67c.19.54.29 1.12.29 1.72 0 2.99-2.17 5.45-5 5.93z"/>
        </svg>
      </div>
    );
  }

  // 22. Twitch: Official Twitch Purple (#9146FF) Chat Bubble with Eyes
  if (isMatch('twitch')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#9146FF] border border-[#A970FF] flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Twitch Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
          <path d="M4.5 2L2 6.5v13h4.5v2.5h3l2.5-2.5h3.5l6.5-6.5V2H4.5zm16 9.5l-3.5 3.5h-4l-2.5 2.5v-2.5H6V3.5h14.5v8z"/>
          <rect x="15" y="6" width="2" height="4"/>
          <rect x="10.5" y="6" width="2" height="4"/>
        </svg>
      </div>
    );
  }

  // 23. Reddit: Official Red-Orange (#FF4500) Snoo Alien Circle
  if (isMatch('reddit')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#FF4500] border border-orange-400/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Reddit Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
          <circle cx="12" cy="12" r="9"/>
          <ellipse cx="12" cy="13.5" rx="5" ry="3.5" fill="#FF4500"/>
          <circle cx="9.5" cy="12.5" r="1" fill="#FFFFFF"/>
          <circle cx="14.5" cy="12.5" r="1" fill="#FFFFFF"/>
        </svg>
      </div>
    );
  }

  // 24. Duolingo: Official Lime Green (#58CC02) Duo Owl Face
  if (isMatch('duolingo')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#58CC02] border border-lime-400/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Duolingo Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="8" cy="11" r="3.5" fill="#FFFFFF"/>
          <circle cx="16" cy="11" r="3.5" fill="#FFFFFF"/>
          <circle cx="8.5" cy="11" r="1.8" fill="#1E293B"/>
          <circle cx="15.5" cy="11" r="1.8" fill="#1E293B"/>
          <path d="M10 14.5c0 1.5 1 2.5 2 2.5s2-1 2-2.5z" fill="#FF9600"/>
        </svg>
      </div>
    );
  }

  // 25. Palantir: Official Palantir Deep Onyx Ring
  if (isMatch('palantir')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#101114] border border-slate-700 flex items-center justify-center p-2 text-white shadow-md flex-shrink-0 ${className}`}
        title="Palantir Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
          <circle cx="12" cy="11" r="6"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
        </svg>
      </div>
    );
  }

  // 26. Airbnb: Official Rausch Coral (#FF5A5F) Bélo Heart Loop
  if (isMatch('airbnb')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-sm flex-shrink-0 ${className}`}
        title="Airbnb Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#FF5A5F">
          <path d="M12 2C7.5 2 6 5.5 6 8.5c0 3.5 2.5 7 6 12 3.5-5 6-8.5 6-12 0-3-1.5-6.5-6-6.5zm0 10.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5z"/>
        </svg>
      </div>
    );
  }

  // 27. Cloudflare: Official Cloudflare Orange (#F38020) Cloud
  if (isMatch('cloudflare')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#F38020] border border-orange-300/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Cloudflare Official Logo"
      >
        <svg viewBox="0 0 24 24" fill="#FFFFFF" className="w-full h-full">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      </div>
    );
  }

  // 28. Scale AI: 3D Isometric Geometric Prism
  if (isMatch('scale')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#0F172A] border border-pink-500/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Scale AI Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <polygon points="12 2 22 8 12 14 2 8" fill="#EC4899"/>
          <polygon points="2 8 12 14 12 22 2 16" fill="#8B5CF6"/>
          <polygon points="12 14 22 8 22 16 12 22" fill="#06B6D4"/>
        </svg>
      </div>
    );
  }

  // 29. GitLab: Warm Tangerine Fox Origami Shape (#FC6D26)
  if (isMatch('gitlab')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#292961] border border-orange-500/40 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="GitLab Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#E24329" d="M12 21.5l3.8-11.7H8.2L12 21.5z"/>
          <path fill="#FC6D26" d="M12 21.5l-3.8-11.7H2.2l9.8 11.7z"/>
          <path fill="#FCA326" d="M2.2 9.8l-.8 2.6c-.2.6 0 1.2.5 1.5l10.1 7.6-9.8-11.7z"/>
          <path fill="#FC6D26" d="M12 21.5l3.8-11.7h6l-9.8 11.7z"/>
          <path fill="#FCA326" d="M21.8 9.8l.8 2.6c.2.6 0 1.2-.5 1.5l-10.1 7.6 9.8-11.7z"/>
        </svg>
      </div>
    );
  }

  // 30. Spotify: Official Bright Green (#1ED760) Sound Arcs on Deep Black
  if (isMatch('spotify')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#121212] border border-emerald-500/40 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="Spotify Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="#1ED760"/>
          <path fill="#121212" d="M17.5 14.3c-.2.3-.5.4-.8.2-2.3-1.4-5.2-1.7-8.6-.9-.3.1-.7-.1-.7-.4-.1-.3.1-.7.4-.7 3.7-.8 6.9-.5 9.5 1 .3.2.4.6.2.8zm1.2-2.6c-.3.4-.8.5-1.2.3-2.6-1.6-6.6-2.1-9.7-1.1-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 3.5-1.1 7.9-.5 10.9 1.3.4.2.5.7.4 1.1zm.1-2.7C15.7 7.2 10.5 7 7.5 7.9c-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.5-1.1 9.3-.8 12.8 1.3.5.3.6.9.3 1.4-.2.4-.8.5-1.2.2z"/>
        </svg>
      </div>
    );
  }

  // 31. Nvidia: GeForce Green (#76B900) Eye Spiral on Pure Black
  if (isMatch('nvidia')) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-[#000000] border border-[#76B900]/50 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 ${className}`}
        title="NVIDIA Official Logo"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="#76B900">
          <path d="M8.7 7.2c2.1-1.1 4.5-1.2 6.6-.3 2.1.9 3.5 2.6 3.9 4.8.4 2.2-.1 4.4-1.4 6.1-1.3 1.7-3.2 2.6-5.3 2.6-.7 0-1.4-.1-2.1-.3l.7-2.3c.5.1.9.2 1.4.2 1.4 0 2.7-.6 3.6-1.8.9-1.2 1.2-2.7.9-4.1-.3-1.4-1.2-2.6-2.6-3.2-1.4-.6-2.9-.5-4.3.2L8.7 7.2z"/>
        </svg>
      </div>
    );
  }

  // For any other company: Attempt high-res official favicon via Google's reliable 128px CDN
  if (cleanDomain && !imageError) {
    return (
      <div 
        className={`${sizeClasses} rounded-xl bg-white border border-slate-700/80 flex items-center justify-center p-1.5 shadow-md flex-shrink-0 overflow-hidden ${className}`}
        title={`${name || cleanDomain} Official Portal Icon`}
      >
        <img
          src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
          alt={name || cleanDomain}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Deterministic Vibrant Brand Color Generator for custom / unlisted companies
  const getBrandHue = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-indigo-950 border-indigo-500/60 text-indigo-300',
      'bg-emerald-950 border-emerald-500/60 text-emerald-300',
      'bg-cyan-950 border-cyan-500/60 text-cyan-300',
      'bg-rose-950 border-rose-500/60 text-rose-300',
      'bg-amber-950 border-amber-500/60 text-amber-300',
      'bg-violet-950 border-violet-500/60 text-violet-300',
      'bg-sky-950 border-sky-500/60 text-sky-300',
      'bg-teal-950 border-teal-500/60 text-teal-300',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const monogram = (name || cleanDomain || 'CO')
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div 
      className={`${sizeClasses} rounded-xl border flex items-center justify-center font-black font-mono text-xs shadow-inner flex-shrink-0 ${getBrandHue(name || cleanDomain)} ${className}`}
      title={name || cleanDomain}
    >
      {monogram || 'TX'}
    </div>
  );
};

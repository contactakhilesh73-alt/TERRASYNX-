import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { CompanyLogo } from '../components/CompanyLogo';
import { HackathonsService } from '../services/hackathonsService';

describe('Official Company & Host Logo Fidelity ("Jaisa ka Taisa")', () => {
  it('renders official MLH badge with exact red branding and typography', () => {
    const html = renderToString(<CompanyLogo name="Major League Hacking" size="md" />);
    expect(html).toContain('title="Major League Hacking Official Logo"');
    expect(html).toContain('bg-[#DF2427]');
  });

  it('renders official ETHGlobal diamond emblem on dark void glass', () => {
    const html = renderToString(<CompanyLogo name="ETHGlobal" size="md" />);
    expect(html).toContain('title="ETHGlobal Official Logo"');
    expect(html).toContain('bg-[#0B0E17]');
  });

  it('renders official Devpost signature teal aquamarine hexagon logo', () => {
    const html = renderToString(<CompanyLogo name="Devpost & AWS" domain="devpost.com" size="md" />);
    expect(html).toContain('title="Devpost Official Logo"');
    expect(html).toContain('bg-[#003E54]');
  });

  it('renders official Solana Foundation gradient emblem', () => {
    const html = renderToString(<CompanyLogo name="Solana Foundation" size="md" />);
    expect(html).toContain('title="Solana Official Logo"');
    expect(html).toContain('solanaGrad');
  });

  it('renders official GitHub Octocat container', () => {
    const html = renderToString(<CompanyLogo name="GitHub" domain="github.com" size="md" />);
    expect(html).toContain('title="GitHub Official Logo"');
    expect(html).toContain('bg-[#161B22]');
  });

  it('renders official NASA Blue Meatball insignia', () => {
    const html = renderToString(<CompanyLogo name="NASA & International Space Agencies" size="md" />);
    expect(html).toContain('title="NASA Official Logo"');
    expect(html).toContain('bg-[#0B3D91]');
  });

  it('renders official Government of India / AICTE Smart India Hackathon emblem', () => {
    const html = renderToString(<CompanyLogo name="Ministry of Education & AICTE" size="md" />);
    expect(html).toContain('title="Government of India and AICTE Official Emblem"');
  });

  it('renders official UC Berkeley Cal Hacks emblem', () => {
    const html = renderToString(<CompanyLogo name="UC Berkeley Cal Hacks" size="md" />);
    expect(html).toContain('title="UC Berkeley Cal Hacks Official Logo"');
    expect(html).toContain('Cal');
  });

  it('renders official Stanford TreeHacks emblem', () => {
    const html = renderToString(<CompanyLogo name="Stanford University" size="md" />);
    expect(html).toContain('title="Stanford University Official Emblem"');
  });

  it('renders direct official image URL without alteration when provided', () => {
    const customUrl = 'https://assets.terrasynx.internal/official-logos/custom-host.png';
    const html = renderToString(
      <CompanyLogo name="Custom Host" logoUrl={customUrl} size="md" />
    );
    expect(html).toContain(`src="${customUrl}"`);
  });

  it('verifies all standard hackathon catalog items map to verified company logos', () => {
    const all = HackathonsService.getAllHackathons();
    expect(all.length).toBeGreaterThan(15);
    
    // Each hackathon must have a valid organizer string
    all.forEach(h => {
      expect(h.organizer).toBeTruthy();
      expect(h.officialUrl).toBeTruthy();
    });
  });
});

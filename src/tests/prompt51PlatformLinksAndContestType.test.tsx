import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HACKATHONS_DATABASE, HackathonsService } from '../services/hackathonsService';
import { isHostnameAllowed, validateSafeTargetUrl } from '../services/linkAllowlistService';
import { Hackathon, HackathonType } from '../types';
import { HackathonsPortal } from '../components/HackathonsPortal';
import { HackathonWhitePageModal } from '../components/HackathonWhitePageModal';
import { HackathonTrackingService } from '../services/hackathonTrackingService';

describe('Prompt 51: Platform Links, Contest Type, Allowlist & Fee/Stake Flags', () => {
  describe('1. Hackathon Type field', () => {
    it('supports HackathonType with "hackathon" and "coding-contest"', () => {
      const typeHackathon: HackathonType = 'hackathon';
      const typeContest: HackathonType = 'coding-contest';
      expect(typeHackathon).toBe('hackathon');
      expect(typeContest).toBe('coding-contest');
    });

    it('ensures all database hackathons have a valid type field assigned', () => {
      expect(HACKATHONS_DATABASE.length).toBeGreaterThan(0);
      for (const h of HACKATHONS_DATABASE) {
        expect(['hackathon', 'coding-contest']).toContain(h.type || 'hackathon');
      }
    });
  });

  describe('2. Link Allowlist for Platform & Contest Domains', () => {
    it('allows devfolio.co on the link allowlist', () => {
      expect(isHostnameAllowed('devfolio.co')).toBe(true);
      expect(isHostnameAllowed('www.devfolio.co')).toBe(true);
      expect(isHostnameAllowed('hackathons.devfolio.co')).toBe(true);
    });

    it('allows unstop.com on the link allowlist', () => {
      expect(isHostnameAllowed('unstop.com')).toBe(true);
      expect(isHostnameAllowed('www.unstop.com')).toBe(true);
      expect(isHostnameAllowed('competitions.unstop.com')).toBe(true);
    });

    it('allows codevita.tcsapps.com on the link allowlist', () => {
      expect(isHostnameAllowed('codevita.tcsapps.com')).toBe(true);
      expect(isHostnameAllowed('tcsapps.com')).toBe(true);
    });

    it('validates safe target URLs for newly allowlisted domains', async () => {
      const devfolioCheck = await validateSafeTargetUrl('https://devfolio.co/hackathons');
      expect(devfolioCheck.safe).toBe(true);

      const unstopCheck = await validateSafeTargetUrl('https://unstop.com/hackathons');
      expect(unstopCheck.safe).toBe(true);

      const codevitaCheck = await validateSafeTargetUrl('https://codevita.tcsapps.com/season12');
      expect(codevitaCheck.safe).toBe(true);
    });

    it('continues blocking untrusted public domains not on allowlist', async () => {
      expect(isHostnameAllowed('randomscamhackathon.net')).toBe(false);
      const res = await validateSafeTargetUrl('https://randomscamhackathon.net');
      expect(res.safe).toBe(false);
      expect(res.error).toContain('not in the program allowlist');
    });
  });

  describe('3. "Browse more" row on Hackathons page', () => {
    it('renders the "Browse more" row with plain link-out cards to Devpost, MLH, Devfolio and Unstop', () => {
      const html = renderToString(React.createElement(HackathonsPortal));

      // Header row
      expect(html).toContain('Browse More');

      // Devpost plain link-out card
      expect(html).toContain('devpost.com');
      expect(html).toContain('data-testid="browse-more-devpost"');
      expect(html).toContain('href="https://devpost.com"');

      // MLH plain link-out card
      expect(html).toContain('mlh.io');
      expect(html).toContain('data-testid="browse-more-mlh"');
      expect(html).toContain('href="https://mlh.io"');

      // Devfolio plain link-out card
      expect(html).toContain('devfolio.co');
      expect(html).toContain('data-testid="browse-more-devfolio"');
      expect(html).toContain('href="https://devfolio.co"');

      // Unstop plain link-out card
      expect(html).toContain('unstop.com');
      expect(html).toContain('data-testid="browse-more-unstop"');
      expect(html).toContain('href="https://unstop.com"');

      // Plain link-out attributes (target="_blank" and rel="noopener noreferrer")
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });
  });

  describe('4. "Fee / stake required" flag detection & display', () => {
    const freeHackathon: Hackathon = {
      id: 'free_hack',
      name: 'Open Global Hack',
      organizer: 'Open Foundation',
      type: 'hackathon',
      mode: 'online',
      country: 'Online/Global',
      themes: ['Open Source'],
      eligibilityText: 'All students worldwide',
      entryFeeText: '100% Free Entry',
      prizeText: '$10,000 in cash awards',
      dates: 'October 2026',
      registrationDeadline: 'Confirm on official page',
      officialUrl: 'https://devpost.com',
      source: 'recurring-series',
      status: 'NOT_ANNOUNCED',
    };

    const stakeHackathon: Hackathon = {
      id: 'stake_hack',
      name: 'Web3 Builder Stakeathon',
      organizer: 'Crypto Protocol DAO',
      type: 'hackathon',
      mode: 'online',
      country: 'Online/Global',
      themes: ['Blockchain'],
      eligibilityText: 'Builders with web3 wallets',
      entryFeeText: '0.05 ETH Stake required to confirm registration',
      prizeText: '$50,000 in protocol grants',
      dates: 'November 2026',
      registrationDeadline: 'Confirm on official page',
      officialUrl: 'https://ethglobal.com',
      source: 'recurring-series',
      status: 'NOT_ANNOUNCED',
    };

    const feeInDescriptionHackathon: Hackathon = {
      id: 'fee_in_desc_hack',
      name: 'Commercial Hackfest',
      organizer: 'Enterprise Corp',
      type: 'coding-contest',
      mode: 'in-person',
      country: 'United States',
      themes: ['Cloud'],
      eligibilityText: 'College students',
      entryFeeText: 'See terms',
      description: 'An entry fee of $25 per team is required for venue and server access.',
      prizeText: '$25,000',
      dates: 'December 2026',
      registrationDeadline: 'Confirm on official page',
      officialUrl: 'https://devpost.com',
      source: 'recurring-series',
      status: 'NOT_ANNOUNCED',
    };

    it('accurately identifies fee or stake through HackathonsService.hasFeeOrStake', () => {
      expect(HackathonsService.hasFeeOrStake(freeHackathon)).toBe(false);
      expect(HackathonsService.hasFeeOrStake(stakeHackathon)).toBe(true);
      expect(HackathonsService.hasFeeOrStake(feeInDescriptionHackathon)).toBe(true);

      // Other variations
      expect(HackathonsService.hasFeeOrStake({ entryFeeText: 'Participation stake exists ($20)' })).toBe(true);
      expect(HackathonsService.hasFeeOrStake({ entryFeeText: '50 USDC deposit stake' })).toBe(true);
      expect(HackathonsService.hasFeeOrStake({ datesNote: 'Note: Staking required before round 1' })).toBe(true);
    });

    it('renders "Fee / stake required" flag on HackathonWhitePageModal when fee/stake is present', () => {
      const stakeModalHtml = renderToString(
        React.createElement(HackathonWhitePageModal, {
          hackathon: stakeHackathon,
          isOpen: true,
          onClose: () => {},
        })
      );

      expect(stakeModalHtml).toContain('Fee / stake required');
      expect(stakeModalHtml).toContain('data-testid="whitepage-fee-stake-flag"');

      const freeModalHtml = renderToString(
        React.createElement(HackathonWhitePageModal, {
          hackathon: freeHackathon,
          isOpen: true,
          onClose: () => {},
        })
      );

      expect(freeModalHtml).toContain('100% Free Entry');
      expect(freeModalHtml).not.toContain('data-testid="whitepage-fee-stake-flag"');
    });

    it('renders "Fee / stake required" flag in printable white paper HTML', () => {
      const stakeHtml = HackathonTrackingService.generateWhitePageHTML(stakeHackathon);
      expect(stakeHtml).toContain('Fee / stake required');

      const freeHtml = HackathonTrackingService.generateWhitePageHTML(freeHackathon);
      expect(freeHtml).toContain('100% Free Guarantee');
    });
  });
});

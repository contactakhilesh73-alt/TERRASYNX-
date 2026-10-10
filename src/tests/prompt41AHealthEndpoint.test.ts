import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isPrivateOrLocalIp,
  isHostnameAllowed,
  validateSafeTargetUrl,
  HONEST_USER_AGENT
} from '../services/linkAllowlistService';
import { UrlHealthResolver } from '../services/urlHealthResolver';

describe('Prompt 41A: Hardened and Honest Link Health Endpoint & Sentinel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Private, Loopback, Link-Local & Reserved IP Rejection', () => {
    it('rejects loopback addresses', () => {
      expect(isPrivateOrLocalIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('127.0.0.254')).toBe(true);
      expect(isPrivateOrLocalIp('::1')).toBe(true);
      expect(isPrivateOrLocalIp('localhost')).toBe(true);
      expect(isPrivateOrLocalIp('0.0.0.0')).toBe(true);
    });

    it('rejects link-local addresses (including AWS/GCP cloud metadata 169.254.169.254)', () => {
      expect(isPrivateOrLocalIp('169.254.169.254')).toBe(true);
      expect(isPrivateOrLocalIp('169.254.1.1')).toBe(true);
      expect(isPrivateOrLocalIp('fe80::1')).toBe(true);
      expect(isPrivateOrLocalIp('fe80::200:5aee:feaa:20a2')).toBe(true);
    });

    it('rejects RFC 1918 private IPv4 networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', () => {
      expect(isPrivateOrLocalIp('10.0.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('10.255.255.255')).toBe(true);
      expect(isPrivateOrLocalIp('172.16.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('172.24.1.1')).toBe(true);
      expect(isPrivateOrLocalIp('172.31.255.255')).toBe(true);
      expect(isPrivateOrLocalIp('192.168.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('192.168.100.50')).toBe(true);
    });

    it('rejects IPv4-mapped IPv6 private and loopback addresses', () => {
      expect(isPrivateOrLocalIp('::ffff:127.0.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('::ffff:169.254.169.254')).toBe(true);
      expect(isPrivateOrLocalIp('::ffff:10.0.0.1')).toBe(true);
      expect(isPrivateOrLocalIp('::ffff:192.168.1.1')).toBe(true);
    });

    it('allows legitimate public IP addresses', () => {
      expect(isPrivateOrLocalIp('8.8.8.8')).toBe(false);
      expect(isPrivateOrLocalIp('1.1.1.1')).toBe(false);
      expect(isPrivateOrLocalIp('104.26.11.44')).toBe(false);
    });
  });

  describe('2. Program/Job Data Hostname Allowlist', () => {
    it('permits official hostnames appearing in our program/job data', () => {
      // ETH Zurich SSRF (Prompt 40)
      expect(isHostnameAllowed('inf.ethz.ch')).toBe(true);
      expect(isHostnameAllowed('ethz.ch')).toBe(true);

      // Postgraduate Scholarships (Prompt 38)
      expect(isHostnameAllowed('rhodeshouse.ox.ac.uk')).toBe(true);
      expect(isHostnameAllowed('gatescambridge.org')).toBe(true);
      expect(isHostnameAllowed('knight-hennessy.stanford.edu')).toBe(true);
      expect(isHostnameAllowed('schwarzmanscholars.org')).toBe(true);
      expect(isHostnameAllowed('studyinjapan.go.jp')).toBe(true);

      // Undergrad Merit Scholarships (Prompt 39)
      expect(isHostnameAllowed('vanderbilt.edu')).toBe(true);
      expect(isHostnameAllowed('admissions.vanderbilt.edu')).toBe(true);
      expect(isHostnameAllowed('usc.edu')).toBe(true);

      // Enterprise ATS Providers & Core Targets
      expect(isHostnameAllowed('boards.greenhouse.io')).toBe(true);
      expect(isHostnameAllowed('job-boards.greenhouse.io')).toBe(true);
      expect(isHostnameAllowed('jobs.lever.co')).toBe(true);
      expect(isHostnameAllowed('stripe.com')).toBe(true);
      expect(isHostnameAllowed('cloudflare.com')).toBe(true);
    });

    it('strictly rejects arbitrary or unverified external hostnames', () => {
      expect(isHostnameAllowed('attacker-server.com')).toBe(false);
      expect(isHostnameAllowed('evil-phishing.xyz')).toBe(false);
      expect(isHostnameAllowed('pastebin.com')).toBe(false);
      expect(isHostnameAllowed('webhook.site')).toBe(false);
      expect(isHostnameAllowed('169.254.169.254')).toBe(false);
      expect(isHostnameAllowed('localhost')).toBe(false);
      expect(isHostnameAllowed('127.0.0.1')).toBe(false);
    });
  });

  describe('3. Target URL Security Validation (SSRF Protection)', () => {
    it('blocks loopback and metadata endpoint URLs immediately', async () => {
      const res1 = await validateSafeTargetUrl('http://127.0.0.1/admin');
      expect(res1.safe).toBe(false);

      const res2 = await validateSafeTargetUrl('http://169.254.169.254/computeMetadata/v1/');
      expect(res2.safe).toBe(false);

      const res3 = await validateSafeTargetUrl('http://localhost:3000/api/health');
      expect(res3.safe).toBe(false);
    });

    it('blocks non-allowlisted public domains', async () => {
      const res = await validateSafeTargetUrl('https://example-phishing-attacker.org/jobs');
      expect(res.safe).toBe(false);
      expect(res.error).toContain('not in the program allowlist');
    });

    it('validates allowlisted program URLs as safe', async () => {
      const res = await validateSafeTargetUrl('https://inf.ethz.ch/studies/summer-research-fellowship.html');
      expect(res.safe).toBe(true);
      expect(res.parsedUrl?.hostname).toBe('inf.ethz.ch');
    });
  });

  describe('4. Honest User-Agent and Status Contract', () => {
    it('uses honest User-Agent string "TerrasynxLinkChecker/1.0"', () => {
      expect(HONEST_USER_AGENT).toBe('TerrasynxLinkChecker/1.0');
    });

    it('never invents status: returns { state: "UNKNOWN" } and "Could not verify, check the official page" on timeout/failure', async () => {
      // Mock fetch to simulate network failure / timeout
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout / corporate firewall'));

      try {
        const result = await UrlHealthResolver.probeUrlHealth('https://unreachable-simulation-url.ox.ac.uk');
        expect(result.state).toBe('UNKNOWN');
        expect(result.isAlive).toBe(false);
        expect(result.displayText).toBe('Could not verify, check the official page');
        // Crucial: Must NEVER return "Verified Active" on timeout or failure
        expect(result.displayText).not.toBe('Verified Active');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns { state: "ALIVE" } and "Verified Active" ONLY when backend confirms active HTTP 200', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          url: 'https://inf.ethz.ch/studies/summer-research-fellowship.html',
          isAlive: true,
          state: 'ALIVE',
          statusCode: 200,
        }),
      } as any);

      try {
        const result = await UrlHealthResolver.probeUrlHealth('https://inf.ethz.ch/studies/summer-research-fellowship.html');
        expect(result.state).toBe('ALIVE');
        expect(result.isAlive).toBe(true);
        expect(result.statusCode).toBe(200);
        expect(result.displayText).toBe('Verified Active');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns { state: "UNKNOWN" } and "Could not verify, check the official page" when backend returns state UNKNOWN', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          url: 'https://inf.ethz.ch/test',
          isAlive: false,
          state: 'UNKNOWN',
          statusCode: null,
          error: 'Connection timeout',
        }),
      } as any);

      try {
        const result = await UrlHealthResolver.probeUrlHealth('https://inf.ethz.ch/test-unknown-status');
        expect(result.state).toBe('UNKNOWN');
        expect(result.isAlive).toBe(false);
        expect(result.displayText).toBe('Could not verify, check the official page');
        expect(result.displayText).not.toBe('Verified Active');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});

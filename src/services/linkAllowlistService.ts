/**
 * TERRASYNX Link Security & Program Allowlist Sentinel
 * 
 * Enforces strict SSRF protection for /api/health/check-url:
 * 1. Allowlist-only verification: Only hostnames that appear in our own program/job data are permitted.
 * 2. Rejection of private, loopback, and link-local IP addresses (both literal and DNS-resolved).
 * 3. Safe redirect inspection: Redirect targets must also belong to the program allowlist.
 * 4. Honest User-Agent: "TerrasynxLinkChecker/1.0".
 * 5. Strict honesty: Never invent a 200/alive status on timeout or network error. Returns { state: 'UNKNOWN' }.
 */

import net from 'net';
import dns from 'dns/promises';
import { RECURRING_ANNUAL_INTERNSHIPS } from './upcomingInternshipsService';
import { VERIFIED_ATS_TARGETS } from '../data/atsTargets';
import { CANONICAL_PORTAL_REGISTRY } from './urlHealthResolver';

export const HONEST_USER_AGENT = 'TerrasynxLinkChecker/1.0';

/**
 * Validates whether an IP address is private, loopback, link-local, or reserved.
 */
export function isPrivateOrLocalIp(ipAddress: string | null | undefined): boolean {
  if (!ipAddress) return true;
  let ip = ipAddress.trim();

  // Normalize IPv4-mapped IPv6 (e.g., ::ffff:127.0.0.1)
  if (ip.toLowerCase().startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === 'localhost' || lower === '0.0.0.0') {
    return true;
  }

  // If it is not a syntactically valid IP address, it is not a private IP address
  if (!net.isIP(ip)) {
    return false;
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 10) return true; // 10.0.0.0/8 private
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (cloud metadata)
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 carrier-grade NAT
    if (a >= 224) return true; // 224.0.0.0/4 multicast & reserved
    return false;
  }

  if (net.isIPv6(ip)) {
    if (lower === '::1') return true;
    if (lower.startsWith('fe80:')) return true; // Link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local
    return false;
  }

  // Not a standard valid public IP
  return true;
}

/**
 * Builds the comprehensive set of allowed program & job hostnames and root domains.
 */
function buildProgramAllowlist(): { allowedHostnames: Set<string>; allowedRoots: Set<string> } {
  const allowedHostnames = new Set<string>();
  const allowedRoots = new Set<string>();

  function ingest(entry?: string | null) {
    if (!entry) return;
    try {
      let host = '';
      if (entry.startsWith('http://') || entry.startsWith('https://')) {
        const parsed = new URL(entry);
        host = parsed.hostname.toLowerCase().trim();
      } else {
        host = entry.toLowerCase().replace(/^\/+/, '').split('/')[0].split(':')[0].trim();
      }

      if (host) {
        allowedHostnames.add(host);
        allowedHostnames.add(host.replace(/^www\./, ''));

        // Extract registered root domain (last 2 parts, or last 3 for co.uk, gov.in, etc.)
        const parts = host.split('.');
        if (parts.length >= 2) {
          const root = parts.slice(-2).join('.');
          allowedRoots.add(root);
          if (parts.length >= 3 && ['co.uk', 'gov.in', 'ac.uk', 'gov.sg', 'edu.sg', 'go.jp', 'ac.in', 'org.in'].includes(parts.slice(-2).join('.'))) {
            allowedRoots.add(parts.slice(-3).join('.'));
          }
        }
      }
    } catch {
      // Ignore unparseable entries
    }
  }

  // 1. All recurring programs & internships (135+ programs)
  for (const cycle of RECURRING_ANNUAL_INTERNSHIPS) {
    ingest(cycle.officialCareersUrl);
    ingest(cycle.companyDomain);
  }

  // 2. All verified ATS company targets
  for (const target of VERIFIED_ATS_TARGETS) {
    ingest(target.domain);
  }

  // 3. Canonical portal registry
  for (const [domain, url] of Object.entries(CANONICAL_PORTAL_REGISTRY)) {
    ingest(domain);
    ingest(url);
  }

  // 4. Primary ATS endpoints & institutional aggregators in program data
  const coreAtsHostnames = [
    'boards.greenhouse.io',
    'job-boards.greenhouse.io',
    'jobs.lever.co',
    'jobs.smartrecruiters.com',
    'apply.workable.com',
    'mycareersfuture.gov.sg',
    'tech.gov.sg',
    'builtin.com',
    'news.ycombinator.com',
    'clearbit.com',
  ];
  for (const h of coreAtsHostnames) {
    ingest(h);
  }

  return { allowedHostnames, allowedRoots };
}

const { allowedHostnames: CACHED_HOSTNAMES, allowedRoots: CACHED_ROOTS } = buildProgramAllowlist();

/**
 * Checks if a hostname appears in our program/job data allowlist.
 */
export function isHostnameAllowed(rawHostname: string | null | undefined): boolean {
  if (!rawHostname) return false;
  const hostname = rawHostname.toLowerCase().trim().replace(/^www\./, '');

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return false;
  }

  // Direct exact match
  if (CACHED_HOSTNAMES.has(hostname) || CACHED_HOSTNAMES.has(`www.${hostname}`)) {
    return true;
  }

  // Subdomain match against an allowed program host or root
  for (const root of CACHED_ROOTS) {
    if (hostname === root || hostname.endsWith(`.${root}`)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates a target URL and verifies that its DNS resolution does not point to internal/private IPs.
 */
export async function validateSafeTargetUrl(rawUrl: string): Promise<{
  safe: boolean;
  error?: string;
  parsedUrl?: URL;
  resolvedIp?: string;
}> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, error: 'Missing target URL' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, error: 'Malformed URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { safe: false, error: 'Invalid URL protocol' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. Hostname allowlist check
  if (!isHostnameAllowed(hostname)) {
    return { safe: false, error: `Hostname "${hostname}" is not in the program allowlist` };
  }

  // 2. Reject direct IP literals if private/loopback
  if (isPrivateOrLocalIp(hostname)) {
    return { safe: false, error: 'Direct private or loopback IP address rejected' };
  }

  // 3. DNS resolution validation (SSRF and DNS rebinding protection)
  try {
    const lookupResult = await dns.lookup(hostname);
    if (isPrivateOrLocalIp(lookupResult.address)) {
      return { safe: false, error: `Resolved IP address ${lookupResult.address} is private or loopback` };
    }
    return { safe: true, parsedUrl: parsed, resolvedIp: lookupResult.address };
  } catch (dnsErr: any) {
    return { safe: false, error: `DNS resolution failed: ${dnsErr?.message || 'unknown error'}` };
  }
}

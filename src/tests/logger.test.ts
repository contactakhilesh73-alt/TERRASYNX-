import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, logStructured } from '../utils/logger';

describe('Structured Observability Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats structured log payload with timestamp, level, component, and message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const payload = logStructured('INFO', 'TestComponent', 'System initialized successfully', undefined, { testKey: 'value' });

    expect(payload.level).toBe('INFO');
    expect(payload.component).toBe('TestComponent');
    expect(payload.message).toBe('System initialized successfully');
    expect(payload.meta).toEqual({ testKey: 'value' });
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const loggedRaw = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(loggedRaw);
    expect(parsed.component).toBe('TestComponent');
    expect(parsed.level).toBe('INFO');
    expect(parsed.message).toBe('System initialized successfully');
    expect(parsed.meta.testKey).toBe('value');
  });

  it('properly captures and serializes Error instances with message and stack', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockError = new Error('DNS resolver timed out after 3500ms');
    mockError.name = 'TimeoutError';

    const payload = logger.error('VerificationEngine:DNS', 'Live DNS check failed', mockError, { domain: 'stripe.com' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedRaw = errorSpy.mock.calls[0][0];
    const parsed = JSON.parse(loggedRaw);

    expect(parsed.level).toBe('ERROR');
    expect(parsed.component).toBe('VerificationEngine:DNS');
    expect(parsed.message).toBe('Live DNS check failed');
    expect(parsed.errorDetail).toBeDefined();
    expect(parsed.errorDetail.name).toBe('TimeoutError');
    expect(parsed.errorDetail.message).toBe('DNS resolver timed out after 3500ms');
    expect(parsed.errorDetail.stack).toBeDefined();
    expect(parsed.meta.domain).toBe('stripe.com');
  });

  it('serializes string and object error details gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // String error detail
    logger.warn('AtsLiveService', 'Cache miss', 'LocalStorage quota exceeded');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    let parsed = JSON.parse(warnSpy.mock.calls[0][0]);
    expect(parsed.errorDetail).toBe('LocalStorage quota exceeded');

    // Plain object error detail
    logger.warn('Server:DNS', 'Lookup failed', { code: 'ENOTFOUND', syscall: 'getaddrinfo' });
    expect(warnSpy).toHaveBeenCalledTimes(2);
    parsed = JSON.parse(warnSpy.mock.calls[1][0]);
    expect(parsed.errorDetail.code).toBe('ENOTFOUND');
    expect(parsed.errorDetail.syscall).toBe('getaddrinfo');
  });

  it('handles empty errorDetail cleanly without adding undefined properties in JSON', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('Server:Bootstrap', 'TERRASYNX server started on port 3000');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(logSpy.mock.calls[0][0]);

    expect(parsed.component).toBe('Server:Bootstrap');
    expect(parsed.message).toBe('TERRASYNX server started on port 3000');
    expect(parsed.errorDetail).toBeUndefined();
    expect(parsed.meta).toBeUndefined();
  });
});

/**
 * TERRASYNX: Structured Observability Logger
 * Zero external dependencies.
 * Standardizes logs in machine-parseable and human-scannable JSON:
 * { timestamp, level, component, message, errorDetail, meta }
 * Fully compatible with Cloud Run log ingestion and local console debugging.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface FormattedErrorDetail {
  name?: string;
  message?: string;
  stack?: string;
  code?: string | number;
  raw?: unknown;
}

export interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  errorDetail?: FormattedErrorDetail | string;
  meta?: Record<string, unknown>;
}

function serializeErrorDetail(errorDetail: unknown): FormattedErrorDetail | string | undefined {
  if (errorDetail === undefined || errorDetail === null) {
    return undefined;
  }

  if (errorDetail instanceof Error) {
    const detail: FormattedErrorDetail = {
      name: errorDetail.name,
      message: errorDetail.message,
    };
    if (errorDetail.stack) {
      detail.stack = errorDetail.stack;
    }
    if ('code' in errorDetail) {
      detail.code = (errorDetail as Record<string, unknown>).code as string | number;
    }
    return detail;
  }

  if (typeof errorDetail === 'object') {
    try {
      return JSON.parse(JSON.stringify(errorDetail));
    } catch {
      return String(errorDetail);
    }
  }

  return String(errorDetail);
}

export function logStructured(
  level: LogLevel,
  component: string,
  message: string,
  errorDetail?: unknown,
  meta?: Record<string, unknown>
): StructuredLogPayload {
  const payload: StructuredLogPayload = {
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
  };

  const serializedErr = serializeErrorDetail(errorDetail);
  if (serializedErr !== undefined) {
    payload.errorDetail = serializedErr;
  }

  if (meta && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  const jsonString = JSON.stringify(payload);

  switch (level) {
    case 'ERROR':
      console.error(jsonString);
      break;
    case 'WARN':
      console.warn(jsonString);
      break;
    case 'DEBUG':
      if (typeof console.debug === 'function') {
        console.debug(jsonString);
      } else {
        console.log(jsonString);
      }
      break;
    case 'INFO':
    default:
      console.log(jsonString);
      break;
  }

  return payload;
}

export const logger = {
  info: (component: string, message: string, meta?: Record<string, unknown>) =>
    logStructured('INFO', component, message, undefined, meta),

  warn: (component: string, message: string, errorDetail?: unknown, meta?: Record<string, unknown>) =>
    logStructured('WARN', component, message, errorDetail, meta),

  error: (component: string, message: string, errorDetail?: unknown, meta?: Record<string, unknown>) =>
    logStructured('ERROR', component, message, errorDetail, meta),

  debug: (component: string, message: string, meta?: Record<string, unknown>) =>
    logStructured('DEBUG', component, message, undefined, meta),
};

/**
 * MILP Observability Utilities
 * Sentry integration and monitoring helpers
 */

/**
 * Check if Sentry is configured
 */
export function isSentryConfigured(): boolean {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  return !!(
    sentryDsn &&
    !sentryDsn.includes('placeholder') &&
    sentryDsn.startsWith('https://')
  );
}

/**
 * Get current observability status
 */
export function getObservabilityStatus(): {
  enabled: boolean;
  provider: string;
} {
  if (isSentryConfigured()) {
    return {
      enabled: true,
      provider: 'sentry',
    };
  }
  
  return {
    enabled: false,
    provider: 'console_only',
  };
}

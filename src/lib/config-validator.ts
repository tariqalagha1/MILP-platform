/**
 * MILP Production Configuration Validator
 * Validates all required production environment variables
 */

export interface ConfigValidation {
  name: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  value?: string;
  masked?: string;
}

export interface ValidationResult {
  config_validation: 'pass' | 'fail';
  missing_variables: string[];
  invalid_variables: string[];
  warnings: string[];
  details: ConfigValidation[];
}

// Check if a value is a placeholder
function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const placeholders = [
    'placeholder',
    'pk_test_placeholder',
    'sk_test_placeholder',
    'your-',
    'xxx',
    'changeme',
  ];
  return placeholders.some(p => value.toLowerCase().includes(p.toLowerCase()));
}

// Mask sensitive values for logging
function maskValue(value: string | undefined): string {
  if (!value) return 'NOT_SET';
  if (value.length < 8) return '***';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

// Validate Clerk keys format
function validateClerkKey(key: string | undefined, type: 'pk' | 'sk'): boolean {
  if (!key || isPlaceholder(key)) return false;
  if (type === 'pk') {
    return key.startsWith('pk_test_') || key.startsWith('pk_live_');
  }
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

// Validate Upstash URL format
function validateUpstashUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('upstash.io');
  } catch {
    return false;
  }
}

// Validate Sentry DSN format
function validateSentryDsn(dsn: string | undefined): boolean {
  if (!dsn) return false;
  try {
    const parsed = new URL(dsn);
    return parsed.hostname.includes('sentry.io') || parsed.hostname.includes('ingest.sentry.io');
  } catch {
    return false;
  }
}

// Validate DATABASE_URL format
function validateDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
  } catch {
    return false;
  }
}

export function validateProductionConfig(): ValidationResult {
  const configs: ConfigValidation[] = [];
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Clerk Publishable Key
  const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkPkValid = validateClerkKey(clerkPk, 'pk');
  configs.push({
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    present: !!clerkPk,
    valid: clerkPkValid,
    masked: maskValue(clerkPk),
  });
  if (!clerkPk || isPlaceholder(clerkPk)) {
    missing.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  } else if (!clerkPkValid) {
    invalid.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  // Clerk Secret Key
  const clerkSk = process.env.CLERK_SECRET_KEY;
  const clerkSkValid = validateClerkKey(clerkSk, 'sk');
  configs.push({
    name: 'CLERK_SECRET_KEY',
    required: true,
    present: !!clerkSk,
    valid: clerkSkValid,
    masked: maskValue(clerkSk),
  });
  if (!clerkSk || isPlaceholder(clerkSk)) {
    missing.push('CLERK_SECRET_KEY');
  } else if (!clerkSkValid) {
    invalid.push('CLERK_SECRET_KEY');
  }

  // Upstash Redis URL
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisUrlValid = validateUpstashUrl(redisUrl);
  configs.push({
    name: 'UPSTASH_REDIS_REST_URL',
    required: true,
    present: !!redisUrl,
    valid: redisUrlValid,
    masked: redisUrl ? `${new URL(redisUrl).hostname}` : 'NOT_SET',
  });
  if (!redisUrl) {
    missing.push('UPSTASH_REDIS_REST_URL');
  } else if (!redisUrlValid) {
    invalid.push('UPSTASH_REDIS_REST_URL');
  }

  // Upstash Redis Token
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  configs.push({
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: true,
    present: !!redisToken,
    valid: !!redisToken && redisToken.length > 10,
    masked: maskValue(redisToken),
  });
  if (!redisToken) {
    missing.push('UPSTASH_REDIS_REST_TOKEN');
  }

  // Sentry DSN
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const sentryValid = validateSentryDsn(sentryDsn);
  configs.push({
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: true,
    present: !!sentryDsn,
    valid: sentryValid,
    masked: sentryDsn ? 'configured' : 'NOT_SET',
  });
  if (!sentryDsn) {
    missing.push('NEXT_PUBLIC_SENTRY_DSN');
  } else if (!sentryValid) {
    invalid.push('NEXT_PUBLIC_SENTRY_DSN');
  }

  // Database URL
  const dbUrl = process.env.DATABASE_URL;
  const dbValid = validateDatabaseUrl(dbUrl);
  const isLocalDb = dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1');
  configs.push({
    name: 'DATABASE_URL',
    required: true,
    present: !!dbUrl,
    valid: dbValid,
    masked: dbUrl ? `${new URL(dbUrl).hostname}:${new URL(dbUrl).port}/${new URL(dbUrl).pathname.slice(1)}` : 'NOT_SET',
  });
  if (isLocalDb) {
    warnings.push('DATABASE_URL points to localhost - not suitable for production');
  }

  // NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  configs.push({
    name: 'NODE_ENV',
    required: true,
    present: !!nodeEnv,
    valid: nodeEnv === 'production',
    value: nodeEnv || 'NOT_SET',
  });
  if (nodeEnv !== 'production') {
    warnings.push('NODE_ENV is not set to production');
  }

  return {
    config_validation: missing.length === 0 && invalid.length === 0 ? 'pass' : 'fail',
    missing_variables: missing,
    invalid_variables: invalid,
    warnings,
    details: configs,
  };
}

export function isProductionReady(): boolean {
  const result = validateProductionConfig();
  return result.config_validation === 'pass' && result.warnings.length === 0;
}

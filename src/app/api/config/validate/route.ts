/**
 * MILP Configuration Validation API
 * GET /api/config/validate - Returns production configuration status
 */

import { NextResponse } from 'next/server';
import { validateProductionConfig, isProductionReady } from '@/lib/config-validator';

export async function GET() {
  const validation = validateProductionConfig();
  const productionReady = isProductionReady();

  return NextResponse.json({
    production_ready: productionReady,
    config_validation: validation.config_validation,
    missing_variables: validation.missing_variables,
    invalid_variables: validation.invalid_variables,
    warnings: validation.warnings,
    details: validation.details.map(d => ({
      name: d.name,
      present: d.present,
      valid: d.valid,
      masked: d.masked || d.value,
    })),
    timestamp: new Date().toISOString(),
  }, {
    status: productionReady ? 200 : 503,
  });
}

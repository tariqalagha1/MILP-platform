/**
 * MILP ROI Calculator - Core Business Engine
 * Calculates recoverable revenue for healthcare clinics
 * 
 * All outputs in SAR (Saudi Riyals)
 * Configurable recovery rates for flexibility
 */

/**
 * Configurable recovery rate defaults
 * These can be overridden per calculation
 */
export const DEFAULT_RECOVERY_RATES = {
  /** Percentage of no-shows that can be recovered with reminders */
  noShowRecoveryRate: 0.15,        // 15%
  /** Percentage of rejected claims that can be recovered */
  claimsRecoveryRate: 0.10,        // 10%
  /** Improvement in repeat visit rate achievable */
  repeatVisitImprovement: 0.08,    // 8%
} as const;

export interface RecoveryRates {
  noShowRecoveryRate: number;      // 0-1 decimal (e.g., 0.15 = 15%)
  claimsRecoveryRate: number;      // 0-1 decimal
  repeatVisitImprovement: number;  // 0-1 decimal
}

export interface ROIInputs {
  monthlyAppointments: number;    // Total monthly appointments
  avgAppointmentValue: number;    // SAR per appointment
  noShowRate: number;             // Percentage 0-100
  rejectedClaimsRate: number;     // Percentage 0-100
  avgClaimValue: number;          // SAR per claim
  repeatVisitRate: number;        // Percentage 0-100
  /** Optional override for recovery rates */
  recoveryRates?: Partial<RecoveryRates>;
}

export interface ROIBreakdown {
  // Input summary
  inputs: ROIInputs;
  
  // No-show recovery analysis
  currentNoShowsPerMonth: number;
  monthlyNoShowRevenue: number;
  noShowRecoveryRate: number;
  recoveredNoShowsPerMonth: number;
  recoveredNoShowRevenue90Days: number;
  
  // Claims recovery analysis
  monthlyClaims: number;
  currentRejectedClaimsPerMonth: number;
  monthlyRejectedClaimsRevenue: number;
  claimsRecoveryRate: number;
  recoveredClaimsPerMonth: number;
  recoveredClaimsRevenue90Days: number;
  
  // Repeat visit uplift
  currentRepeatVisitorsPerMonth: number;
  repeatVisitImprovement: number;
  additionalRepeatVisitorsPerMonth: number;
  additionalRepeatRevenue90Days: number;
  
  // Totals
  monthlyRevenueLeakage: number;
  totalRecoverablePerMonth: number;
  totalRecoverable90Days: number;
  annualizedSavings: number;
}

/**
 * Industry benchmarks for GCC healthcare
 */
export const GCC_BENCHMARKS = {
  noShowRate: {
    dental: 8.7,
    diagnostics: 6.5,
    outpatient: 9.2,
    dermatology: 7.8,
    physiotherapy: 10.5,
    overall: 8.5,
  },
  claimRejectionRate: {
    dental: 12.5,
    diagnostics: 8.2,
    outpatient: 15.3,
    overall: 12.0,
  },
  repeatVisitRate: {
    dental: 45,
    diagnostics: 35,
    outpatient: 52,
    overall: 44,
  },
} as const;

export type SectorType = 'dental' | 'diagnostics' | 'outpatient' | 'dermatology' | 'physiotherapy' | 'overall';
export type MetricType = 'noShowRate' | 'claimRejectionRate' | 'repeatVisitRate';

/**
 * Calculate ROI breakdown from input metrics
 */
export function calculateROI(inputs: ROIInputs): ROIBreakdown {
  const {
    monthlyAppointments,
    avgAppointmentValue,
    noShowRate,
    rejectedClaimsRate,
    avgClaimValue,
    repeatVisitRate,
    recoveryRates: customRates,
  } = inputs;

  // Merge custom rates with defaults
  const rates: RecoveryRates = {
    noShowRecoveryRate: customRates?.noShowRecoveryRate ?? DEFAULT_RECOVERY_RATES.noShowRecoveryRate,
    claimsRecoveryRate: customRates?.claimsRecoveryRate ?? DEFAULT_RECOVERY_RATES.claimsRecoveryRate,
    repeatVisitImprovement: customRates?.repeatVisitImprovement ?? DEFAULT_RECOVERY_RATES.repeatVisitImprovement,
  };

  // ============================================
  // NO-SHOW RECOVERY ANALYSIS
  // ============================================
  const currentNoShowsPerMonth = Math.round((monthlyAppointments * noShowRate) / 100);
  const monthlyNoShowRevenue = currentNoShowsPerMonth * avgAppointmentValue;
  
  // Calculate recoverable no-show revenue
  const recoveredNoShowsPerMonth = Math.round(currentNoShowsPerMonth * rates.noShowRecoveryRate);
  const recoveredNoShowRevenue90Days = recoveredNoShowsPerMonth * avgAppointmentValue * 3;

  // ============================================
  // CLAIMS RECOVERY ANALYSIS
  // ============================================
  const monthlyClaims = monthlyAppointments; // Assuming 1 claim per appointment
  const currentRejectedClaimsPerMonth = Math.round((monthlyClaims * rejectedClaimsRate) / 100);
  const monthlyRejectedClaimsRevenue = currentRejectedClaimsPerMonth * avgClaimValue;
  
  // Calculate recoverable claims revenue
  const recoveredClaimsPerMonth = Math.round(currentRejectedClaimsPerMonth * rates.claimsRecoveryRate);
  const recoveredClaimsRevenue90Days = recoveredClaimsPerMonth * avgClaimValue * 3;

  // ============================================
  // REPEAT VISIT UPLIFT
  // ============================================
  const currentRepeatVisitorsPerMonth = Math.round((monthlyAppointments * repeatVisitRate) / 100);
  const additionalRepeatVisitorsPerMonth = Math.round(currentRepeatVisitorsPerMonth * rates.repeatVisitImprovement);
  const additionalRepeatRevenue90Days = additionalRepeatVisitorsPerMonth * avgAppointmentValue * 3;

  // ============================================
  // TOTALS
  // ============================================
  const monthlyRevenueLeakage = monthlyNoShowRevenue + monthlyRejectedClaimsRevenue;
  
  const totalRecoverablePerMonth = 
    (recoveredNoShowsPerMonth * avgAppointmentValue) +
    (recoveredClaimsPerMonth * avgClaimValue) +
    (additionalRepeatVisitorsPerMonth * avgAppointmentValue);
  
  const totalRecoverable90Days = totalRecoverablePerMonth * 3;
  const annualizedSavings = totalRecoverablePerMonth * 12;

  return {
    // Store inputs for reference
    inputs,
    
    // No-show recovery
    currentNoShowsPerMonth,
    monthlyNoShowRevenue,
    noShowRecoveryRate: rates.noShowRecoveryRate * 100, // Convert to percentage
    recoveredNoShowsPerMonth,
    recoveredNoShowRevenue90Days,
    
    // Claims recovery
    monthlyClaims,
    currentRejectedClaimsPerMonth,
    monthlyRejectedClaimsRevenue,
    claimsRecoveryRate: rates.claimsRecoveryRate * 100, // Convert to percentage
    recoveredClaimsPerMonth,
    recoveredClaimsRevenue90Days,
    
    // Repeat visits
    currentRepeatVisitorsPerMonth,
    repeatVisitImprovement: rates.repeatVisitImprovement * 100, // Convert to percentage
    additionalRepeatVisitorsPerMonth,
    additionalRepeatRevenue90Days,
    
    // Totals
    monthlyRevenueLeakage,
    totalRecoverablePerMonth,
    totalRecoverable90Days,
    annualizedSavings,
  };
}

/**
 * Format SAR currency
 */
export function formatSAR(value: number): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-SA').format(Math.round(value));
}

/**
 * Generate executive summary text
 */
export function generateExecutiveSummary(breakdown: ROIBreakdown): string {
  const ninetyDayTotal = formatSAR(breakdown.totalRecoverable90Days);
  const annualTotal = formatSAR(breakdown.annualizedSavings);
  const leakage = formatSAR(breakdown.monthlyRevenueLeakage);
  
  return `Your clinic is losing approximately ${leakage} per month from no-shows and rejected claims. MILP can help recover ${ninetyDayTotal} over 90 days, with an annualized projected impact of ${annualTotal}.`;
}

/**
 * Generate detailed insights for executive report
 */
export function generateInsights(breakdown: ROIBreakdown): string[] {
  const insights: string[] = [];
  
  // No-show insight
  if (breakdown.currentNoShowsPerMonth > 0) {
    const rate = breakdown.inputs.noShowRate;
    if (rate > GCC_BENCHMARKS.noShowRate.overall) {
      insights.push(`Your no-show rate (${rate}%) is above the GCC average of ${GCC_BENCHMARKS.noShowRate.overall}%. Implementing automated reminders can recover ${formatSAR(breakdown.recoveredNoShowRevenue90Days)} in 90 days.`);
    } else {
      insights.push(`Your no-show rate (${rate}%) is at or below the GCC average. Continued reminder workflows can still recover ${formatSAR(breakdown.recoveredNoShowRevenue90Days)} over 90 days.`);
    }
  }
  
  // Claims insight
  if (breakdown.currentRejectedClaimsPerMonth > 0) {
    const rate = breakdown.inputs.rejectedClaimsRate;
    if (rate > GCC_BENCHMARKS.claimRejectionRate.overall) {
      insights.push(`Your claim rejection rate (${rate}%) is above the GCC average of ${GCC_BENCHMARKS.claimRejectionRate.overall}%. Improving claim quality can recover ${formatSAR(breakdown.recoveredClaimsRevenue90Days)} in 90 days.`);
    } else {
      insights.push(`Your claim rejection rate (${rate}%) is manageable. Targeted improvements can still recover ${formatSAR(breakdown.recoveredClaimsRevenue90Days)} over 90 days.`);
    }
  }
  
  // Repeat visit insight
  const repeatRate = breakdown.inputs.repeatVisitRate;
  if (repeatRate < GCC_BENCHMARKS.repeatVisitRate.overall) {
    insights.push(`Your repeat visit rate (${repeatRate}%) is below the GCC average of ${GCC_BENCHMARKS.repeatVisitRate.overall}%. Follow-up workflows can generate ${formatSAR(breakdown.additionalRepeatRevenue90Days)} in additional revenue over 90 days.`);
  } else {
    insights.push(`Your repeat visit rate (${repeatRate}%) is healthy. Enhanced follow-up can still drive ${formatSAR(breakdown.additionalRepeatRevenue90Days)} in additional revenue over 90 days.`);
  }
  
  return insights;
}

/**
 * Compare against GCC benchmarks
 */
export function compareToBenchmark(
  metric: MetricType,
  value: number,
  sector: SectorType = 'overall'
): { status: 'above' | 'below' | 'at'; message: string; benchmark: number; difference: number } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const benchmarkData = GCC_BENCHMARKS[metric] as any;
  const benchmark = benchmarkData[sector] ?? benchmarkData.overall;
  const difference = value - benchmark;
  
  let status: 'above' | 'below' | 'at';
  let message: string;
  
  if (Math.abs(difference) < 1) {
    status = 'at';
    message = `Your rate is in line with GCC average (${benchmark}%)`;
  } else if (metric === 'repeatVisitRate') {
    // For repeat visits, higher is better
    status = difference > 0 ? 'above' : 'below';
    message = `Your rate is ${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'above' : 'below'} GCC average (${benchmark}%)`;
  } else {
    // For no-show and rejection rates, lower is better
    status = difference < 0 ? 'above' : 'below';
    message = `Your rate is ${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'above' : 'below'} GCC average (${benchmark}%)`;
  }
  
  return { status, message, benchmark, difference };
}

/**
 * Calculate monthly leakage breakdown for charts
 */
export function calculateLeakageBreakdown(breakdown: ROIBreakdown) {
  return {
    noShowLoss: breakdown.monthlyNoShowRevenue,
    claimsLoss: breakdown.monthlyRejectedClaimsRevenue,
    total: breakdown.monthlyRevenueLeakage,
  };
}

/**
 * Calculate recovery breakdown for charts
 */
export function calculateRecoveryBreakdown(breakdown: ROIBreakdown) {
  return {
    noShowRecovery: breakdown.recoveredNoShowRevenue90Days,
    claimsRecovery: breakdown.recoveredClaimsRevenue90Days,
    repeatVisitUplift: breakdown.additionalRepeatRevenue90Days,
    total: breakdown.totalRecoverable90Days,
  };
}

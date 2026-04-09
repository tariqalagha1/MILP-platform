/**
 * MILP Platform Types
 */

// Re-export ROI types
export type { ROIInputs, ROIBreakdown } from '@/lib/roi-calculator';

// Subscription plans
export type Plan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

// User roles
export type UserRole = 'admin' | 'member' | 'viewer';

// Organization with branches
export interface OrganizationWithBranches {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  branches: Branch[];
}

// Branch
export interface Branch {
  id: string;
  name: string;
  organizationId: string;
}

// User
export interface User {
  id: string;
  clerkUserId: string;
  organizationId: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// Saved ROI Calculation
export interface SavedROICalculation {
  id: string;
  branchId: string;
  branch?: Branch;
  monthlyAppointments: number;
  avgAppointmentValue: number;
  noShowRate: number;
  rejectedClaimsRate: number;
  avgClaimValue: number;
  repeatVisitRate: number;
  recoverableRevenue90Days: number;
  annualizedSavings: number;
  createdAt: Date;
}

// Navigation items
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

// Dashboard metrics
export interface DashboardMetrics {
  noShowRate: number;
  noShowRateChange: number;
  claimRejectionRate: number;
  claimRejectionChange: number;
  repeatVisitRate: number;
  repeatVisitChange: number;
  revenueLeakage: number;
  recoveredRevenue: number;
}

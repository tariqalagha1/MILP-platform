'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ROIBreakdown, 
  formatSAR, 
  formatNumber, 
  generateExecutiveSummary,
  generateInsights,
  calculateLeakageBreakdown,
  calculateRecoveryBreakdown,
} from '@/lib/roi-calculator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Users, 
  FileWarning, 
  RefreshCw, 
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ROIResultsProps {
  breakdown: ROIBreakdown;
}

const COLORS = {
  noShow: '#f97316',
  claims: '#ef4444',
  repeat: '#3b82f6',
  recovered: '#10b981',
};

export function ROIResults({ breakdown }: ROIResultsProps) {
  const summary = generateExecutiveSummary(breakdown);
  const insights = generateInsights(breakdown);
  const leakageBreakdown = calculateLeakageBreakdown(breakdown);
  const recoveryBreakdown = calculateRecoveryBreakdown(breakdown);

  // Chart data
  const leakageChartData = [
    { name: 'No-Shows', value: leakageBreakdown.noShowLoss, fill: COLORS.noShow },
    { name: 'Claims', value: leakageBreakdown.claimsLoss, fill: COLORS.claims },
  ];

  const recoveryChartData = [
    { name: 'No-Show Recovery', value: recoveryBreakdown.noShowRecovery, fill: COLORS.noShow },
    { name: 'Claims Recovery', value: recoveryBreakdown.claimsRecovery, fill: COLORS.claims },
    { name: 'Repeat Visits', value: recoveryBreakdown.repeatVisitUplift, fill: COLORS.repeat },
  ];

  const monthlyTrendData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    recovered: breakdown.totalRecoverablePerMonth,
    cumulative: breakdown.totalRecoverablePerMonth * (i + 1),
  }));

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Leakage */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700 dark:text-red-300 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Monthly Revenue Leakage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatSAR(breakdown.monthlyRevenueLeakage)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Lost to no-shows & rejected claims
            </p>
          </CardContent>
        </Card>

        {/* 90-Day Recovery */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Recoverable in 90 Days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatSAR(breakdown.totalRecoverable90Days)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {formatSAR(breakdown.totalRecoverablePerMonth)}/month
            </p>
          </CardContent>
        </Card>

        {/* Annual Savings */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Annualized Savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatSAR(breakdown.annualizedSavings)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Projected yearly impact
            </p>
          </CardContent>
        </Card>

        {/* Repeat Visit Uplift */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-700 dark:text-purple-300 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Repeat Visit Uplift
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatSAR(breakdown.additionalRepeatRevenue90Days)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              +{formatNumber(breakdown.additionalRepeatVisitorsPerMonth)} visits/month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Leakage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-red-500" />
              Monthly Revenue Leakage
            </CardTitle>
            <CardDescription>
              Where revenue is being lost each month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leakageChartData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => formatSAR(v)} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v) => formatSAR(Number(v ?? 0))} />}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {leakageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recovery Potential */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              90-Day Recovery Potential
            </CardTitle>
            <CardDescription>
              Breakdown of recoverable revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recoveryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(name ?? '').split(' ')[0]} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {recoveryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v) => formatSAR(Number(v ?? 0))} />}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* No-Show Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              No-Show Recovery
            </CardTitle>
            <CardDescription>
              Reducing missed appointments with reminders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current no-shows/mo</span>
              <span className="font-medium">{formatNumber(breakdown.currentNoShowsPerMonth)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Revenue lost/mo</span>
              <span className="font-medium text-destructive">
                {formatSAR(breakdown.monthlyNoShowRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Recovery rate</span>
              <span className="font-medium text-emerald-600">
                {breakdown.noShowRecoveryRate.toFixed(0)}%
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recoverable (90 days)</span>
              <span className="font-bold text-emerald-600">
                {formatSAR(breakdown.recoveredNoShowRevenue90Days)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Claims Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-red-500" />
              Claims Recovery
            </CardTitle>
            <CardDescription>
              Recovering rejected claims
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Rejected claims/mo</span>
              <span className="font-medium">{formatNumber(breakdown.currentRejectedClaimsPerMonth)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Revenue lost/mo</span>
              <span className="font-medium text-destructive">
                {formatSAR(breakdown.monthlyRejectedClaimsRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Recovery rate</span>
              <span className="font-medium text-emerald-600">
                {breakdown.claimsRecoveryRate.toFixed(0)}%
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recoverable (90 days)</span>
              <span className="font-bold text-emerald-600">
                {formatSAR(breakdown.recoveredClaimsRevenue90Days)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Visit Uplift */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              Repeat Visit Uplift
            </CardTitle>
            <CardDescription>
              Improving patient retention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Repeat visitors/mo</span>
              <span className="font-medium">{formatNumber(breakdown.currentRepeatVisitorsPerMonth)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Improvement rate</span>
              <span className="font-medium text-emerald-600">
                {breakdown.repeatVisitImprovement.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Additional visits/mo</span>
              <span className="font-medium">{formatNumber(breakdown.additionalRepeatVisitorsPerMonth)}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Additional (90 days)</span>
              <span className="font-bold text-emerald-600">
                {formatSAR(breakdown.additionalRepeatRevenue90Days)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Assumptions Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Calculation Assumptions</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>No-show recovery: {breakdown.noShowRecoveryRate.toFixed(0)}% of missed appointments recoverable</li>
                <li>Claims recovery: {breakdown.claimsRecoveryRate.toFixed(0)}% of rejected claims recoverable</li>
                <li>Repeat visit improvement: {breakdown.repeatVisitImprovement.toFixed(0)}% uplift achievable</li>
              </ul>
              <p className="mt-2 text-xs">
                Actual results may vary based on implementation quality and market conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

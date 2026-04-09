'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  LayoutDashboard,
  Users, 
  Calendar, 
  FileWarning, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';
import Link from 'next/link';

interface DashboardData {
  summary: {
    totalPatients: number;
    totalAppointments: number;
    totalClaims: number;
    totalRevenue: number;
  };
  metrics: {
    noShowRate: number;
    claimsRejectionRate: number;
    overduePatients: number;
    recoverableAmount: number;
  };
  alerts: {
    highNoShowRate: boolean;
    highRejectionRate: boolean;
    overdueFollowUps: boolean;
  };
  recentActivity: {
    claims: Array<{
      id: string;
      claimNumber: string;
      status: string;
      amount: number;
    }>;
    appointments: Array<{
      id: string;
      patient: {
        externalId: string;
      };
      status: string;
      value: number;
    }>;
  };
}

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-green-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              Executive Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time overview of your clinic's performance
            </p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            {/* Alerts Section */}
            {(data.alerts.highNoShowRate || data.alerts.highRejectionRate || data.alerts.overdueFollowUps) && (
              <div className="space-y-2">
                {data.alerts.highNoShowRate && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>High No-Show Rate</AlertTitle>
                    <AlertDescription>
                      Your no-show rate is {data.metrics.noShowRate.toFixed(1)}%, which is above the GCC average of 8.5%.
                      <Link href="/dashboard/follow-up" className="ml-2 underline">
                        View follow-up recommendations
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
                {data.alerts.highRejectionRate && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>High Claim Rejection Rate</AlertTitle>
                    <AlertDescription>
                      Your claim rejection rate is {data.metrics.claimsRejectionRate.toFixed(1)}%, which is above the GCC average of 12%.
                      <Link href="/dashboard/claims" className="ml-2 underline">
                        Review rejected claims
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
                {data.alerts.overdueFollowUps && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Overdue Follow-ups</AlertTitle>
                    <AlertDescription>
                      {data.metrics.overduePatients} patients are overdue for their follow-up visits.
                      <Link href="/dashboard/follow-up" className="ml-2 underline">
                        View overdue patients
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-blue-700">
                    <Users className="h-3 w-3" />
                    Total Patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatNumber(data.summary.totalPatients)}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Active patients</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-green-700">
                    <DollarSign className="h-3 w-3" />
                    Total Revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {formatSAR(data.summary.totalRevenue)}
                  </div>
                  <p className="text-xs text-green-600 mt-1">From completed appointments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-purple-700">
                    <Calendar className="h-3 w-3" />
                    Appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {formatNumber(data.summary.totalAppointments)}
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Total scheduled</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-orange-700">
                    <FileWarning className="h-3 w-3" />
                    Claims
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">
                    {formatNumber(data.summary.totalClaims)}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">Total submitted</p>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* No-Show Rate */}
              <Card className={data.metrics.noShowRate > 15 ? 'border-red-200' : ''}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    No-Show Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold ${data.metrics.noShowRate > 15 ? 'text-red-600' : ''}`}>
                        {data.metrics.noShowRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        GCC avg: 8.5%
                      </p>
                    </div>
                    {getTrendIcon(data.metrics.noShowRate, 8.5)}
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${data.metrics.noShowRate > 15 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(data.metrics.noShowRate * 5, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Claims Rejection Rate */}
              <Card className={data.metrics.claimsRejectionRate > 15 ? 'border-red-200' : ''}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileWarning className="h-4 w-4" />
                    Claims Rejection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold ${data.metrics.claimsRejectionRate > 15 ? 'text-red-600' : ''}`}>
                        {data.metrics.claimsRejectionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        GCC avg: 12%
                      </p>
                    </div>
                    {getTrendIcon(data.metrics.claimsRejectionRate, 12)}
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${data.metrics.claimsRejectionRate > 15 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(data.metrics.claimsRejectionRate * 5, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recoverable Amount */}
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Recoverable Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-700">
                    {formatSAR(data.metrics.recoverableAmount)}
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Potential recovery from no-shows & rejected claims
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href="/dashboard/claims">
                      <Button size="sm" variant="secondary">
                        Review Claims
                      </Button>
                    </Link>
                    <Link href="/dashboard/follow-up">
                      <Button size="sm" variant="secondary">
                        Follow-ups
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/roi-calculator">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      ROI Calculator
                    </CardTitle>
                    <CardDescription>
                      Calculate recoverable revenue for your clinic
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/claims">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-primary" />
                      Claims Intelligence
                    </CardTitle>
                    <CardDescription>
                      Monitor and recover rejected claims
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/follow-up">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Patient Follow-up
                    </CardTitle>
                    <CardDescription>
                      Reduce no-shows and improve retention
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <LayoutDashboard className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome to MILP Revenue Intelligence</h2>
                    <p className="text-muted-foreground">
                      Your healthcare revenue recovery platform for GCC markets. Get started by loading demo data or exploring our modules.
                    </p>
                  </div>
                  <Button onClick={async () => {
                    await fetch('/api/seed', { method: 'POST' });
                    window.location.reload();
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Demo Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-sm font-bold">1</span>
                    Calculate ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 mb-3">
                    See how much revenue you can recover in 90 days with our GCC benchmarks.
                  </p>
                  <Link href="/dashboard/roi-calculator">
                    <Button variant="secondary" size="sm">Open Calculator</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 text-purple-800 text-sm font-bold">2</span>
                    Track Claims
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-600 mb-3">
                    Monitor rejected claims and identify recovery opportunities.
                  </p>
                  <Link href="/dashboard/claims">
                    <Button variant="secondary" size="sm">View Claims</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-800 text-sm font-bold">3</span>
                    Follow Up
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600 mb-3">
                    Reduce no-shows with intelligent patient follow-up workflows.
                  </p>
                  <Link href="/dashboard/follow-up">
                    <Button variant="secondary" size="sm">Patient Follow-up</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">GCC Healthcare Benchmarks</CardTitle>
                <CardDescription>Regional averages to compare your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">8.5%</div>
                    <p className="text-xs text-muted-foreground mt-1">Average No-Show Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">12%</div>
                    <p className="text-xs text-muted-foreground mt-1">Claims Rejection Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">15-25%</div>
                    <p className="text-xs text-muted-foreground mt-1">Recoverable Revenue</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">45%</div>
                    <p className="text-xs text-muted-foreground mt-1">Patient Retention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

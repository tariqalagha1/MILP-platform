'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileWarning, TrendingDown, TrendingUp, DollarSign, AlertCircle, RefreshCw, Eye, CheckCircle, ArrowLeftRight, Wrench, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';

interface ClaimStats {
  totalClaims: number;
  totalAmount: number;
  rejectionRate: number;
  rejectedClaims: number;
  recoverableAmount: number;
  statusBreakdown: Array<{
    status: string;
    _count: { status: number };
    _sum: { amount: number };
  }>;
  recentRejected: Array<{
    id: string;
    claimNumber: string;
    amount: number;
    rejectionReason: string;
    submittedAt: string;
    rejectionRisk?: number;
    missingFields?: string[];
    status: string;
  }>;
}

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  RECOVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

// Risk Badge Component
function RiskBadge({ risk }: { risk?: number }) {
  if (risk === undefined || risk === null) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  
  const getColorClass = (riskScore: number) => {
    if (riskScore >= 90) return 'bg-red-500 text-white';
    if (riskScore >= 60) return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };
  
  const getEmoji = (riskScore: number) => {
    if (riskScore >= 90) return '🔴';
    if (riskScore >= 60) return '🟡';
    return '🟢';
  };
  
  return (
    <Badge className={`${getColorClass(risk)} font-mono text-xs`}>
      {getEmoji(risk)} {risk}%
    </Badge>
  );
}

// Missing Fields Popover Component
function MissingFieldsPopover({ fields }: { fields?: string[] }) {
  if (!fields || fields.length === 0) {
    return <span className="text-muted-foreground text-sm">None</span>;
  }
  
  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">{fields.length} missing</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Missing Fields
          </h4>
          <ul className="space-y-1">
            {fields.map((field, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                {formatFieldName(field)}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Action Buttons Component
function ClaimActions({ claimId, onActionComplete }: { claimId: string; onActionComplete: () => void }) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const handleAction = async (action: string) => {
    setIsLoading(action);
    try {
      const response = await fetch(`/api/claims/${claimId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setIsLoading(null);
    }
  };
  
  return (
    <div className="flex items-center gap-1 justify-end">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => handleAction('review')}
              disabled={isLoading !== null}
            >
              {isLoading === 'review' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Review</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => handleAction('resolve')}
              disabled={isLoading !== null}
            >
              {isLoading === 'resolve' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Resolve</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={() => handleAction('send_back')}
              disabled={isLoading !== null}
            >
              {isLoading === 'send_back' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowLeftRight className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send Back</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => handleAction('mark_fixed')}
              disabled={isLoading !== null}
            >
              {isLoading === 'mark_fixed' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Wrench className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark Fixed</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default function ClaimsIntelligencePage() {
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaimStats();
  }, []);

  const fetchClaimStats = async () => {
    try {
      const response = await fetch('/api/claims/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching claim stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    // Seed sample claims data
    const sampleClaims = [
      { claimNumber: 'CLM-2024-001', patientId: 'PAT-001', amount: 2500, status: 'APPROVED' },
      { claimNumber: 'CLM-2024-002', patientId: 'PAT-002', amount: 1800, status: 'REJECTED', rejectionReason: 'Missing documentation', missingFields: ['diagnosis_code', 'provider_signature'] },
      { claimNumber: 'CLM-2024-003', patientId: 'PAT-003', amount: 3200, status: 'SUBMITTED' },
      { claimNumber: 'CLM-2024-004', patientId: 'PAT-004', amount: 1500, status: 'REJECTED', rejectionReason: 'Invalid procedure code', missingFields: ['procedure_code'] },
      { claimNumber: 'CLM-2024-005', patientId: 'PAT-005', amount: 4200, status: 'APPROVED' },
      { claimNumber: 'CLM-2024-006', patientId: 'PAT-006', amount: 2100, status: 'PENDING_REVIEW' },
      { claimNumber: 'CLM-2024-007', patientId: 'PAT-007', amount: 3800, status: 'REJECTED', rejectionReason: 'Patient not eligible', missingFields: ['eligibility_verification'] },
      { claimNumber: 'CLM-2024-008', patientId: 'PAT-008', amount: 1650, status: 'APPROVED' },
    ];

    for (const claim of sampleClaims) {
      await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...claim,
          branchId: 'default-branch', // In real app, use actual branch ID
        }),
      });
    }

    fetchClaimStats();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-primary" />
              Claims Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor claim rejections and recover lost revenue
            </p>
          </div>
          <Button onClick={handleSeedData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Sample Data
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stats && stats.totalClaims > 0 ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <FileWarning className="h-3 w-3" />
                    Total Claims
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalClaims)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total Value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatSAR(stats.totalAmount)}</div>
                  <p className="text-xs text-muted-foreground">Submitted claims</p>
                </CardContent>
              </Card>

              <Card className={stats.rejectionRate > 15 ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Rejection Rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.rejectionRate > 15 ? 'text-red-600' : ''}`}>
                    {stats.rejectionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    GCC avg: 12% {stats.rejectionRate > 12 && '(Above average)'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-emerald-700">
                    <TrendingUp className="h-3 w-3" />
                    Recoverable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatSAR(stats.recoverableAmount)}
                  </div>
                  <p className="text-xs text-emerald-600">
                    From {stats.rejectedClaims} rejected claims
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                  <CardDescription>Claims by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.statusBreakdown.map((item) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[item.status] || 'bg-gray-100'}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {formatNumber(item._count.status)} claims
                          </span>
                          <span className="font-medium">
                            {formatSAR(item._sum.amount || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Potential */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="text-base">Recovery Potential</CardTitle>
                  <CardDescription>Estimated recoverable revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Rejected Claims</span>
                      <span className="font-medium">{formatNumber(stats.rejectedClaims)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(stats.rejectedClaims / stats.totalClaims) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Recoverable (50%)</span>
                      <span className="font-medium text-emerald-600">
                        {formatSAR(stats.recoverableAmount * 0.5)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: '50%' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on industry average of 50% recovery rate for rejected claims
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Claims Intelligence Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Claims Intelligence Dashboard
                </CardTitle>
                <CardDescription>Comprehensive view of claims requiring attention with risk assessment and missing fields analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claim #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-center">Risk Score</TableHead>
                        <TableHead>Missing Fields</TableHead>
                        <TableHead>Rejection Reason</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentRejected.map((claim) => (
                        <TableRow key={claim.id} className={claim.rejectionRisk && claim.rejectionRisk >= 90 ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                          <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                          <TableCell className="font-semibold">{formatSAR(claim.amount)}</TableCell>
                          <TableCell className="text-center">
                            <RiskBadge risk={claim.rejectionRisk} />
                          </TableCell>
                          <TableCell>
                            <MissingFieldsPopover fields={claim.missingFields} />
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <span className="text-sm text-muted-foreground truncate block" title={claim.rejectionReason}>
                              {claim.rejectionReason || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <ClaimActions claimId={claim.id} onActionComplete={fetchClaimStats} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <FileWarning className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Claims Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start by loading sample data to see how Claims Intelligence helps you monitor rejections and recover revenue.
            </p>
            <Button onClick={handleSeedData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Sample Data
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

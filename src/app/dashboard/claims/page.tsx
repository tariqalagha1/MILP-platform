'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileWarning, TrendingDown, TrendingUp, DollarSign, AlertCircle,
  RefreshCw, Eye, CheckCircle, ArrowLeftRight, Wrench, AlertTriangle,
  Plus, X, Search, Filter,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';
import { toast } from 'sonner';
import { BranchSelector } from '@/components/branch-selector';

interface Claim {
  id: string;
  claimNumber: string;
  amount: number;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  rejectionRisk?: number;
  missingFields?: string[];
  branch?: { name: string };
}

interface ClaimStats {
  totalClaims: number;
  totalAmount: number;
  rejectionRate: number;
  rejectedClaims: number;
  recoverableAmount: number;
  statusBreakdown: Array<{ status: string; _count: { status: number }; _sum: { amount: number } }>;
  recentRejected: Claim[];
}

const STATUS_OPTIONS = ['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PENDING_REVIEW', 'RECOVERED', 'PENDING'];

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  RECOVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

function RiskBadge({ risk }: { risk?: number }) {
  if (risk === undefined || risk === null) return <span className="text-muted-foreground text-sm">—</span>;
  const color = risk >= 90 ? 'bg-red-500 text-white' : risk >= 60 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white';
  const emoji = risk >= 90 ? '🔴' : risk >= 60 ? '🟡' : '🟢';
  return <Badge className={`${color} font-mono text-xs`}>{emoji} {risk}%</Badge>;
}

function MissingFieldsPopover({ fields }: { fields?: string[] }) {
  if (!fields || fields.length === 0) return <span className="text-muted-foreground text-sm">None</span>;
  const fmt = (f: string) => f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="text-xs font-medium">{fields.length} missing</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> Missing Fields
          </h4>
          <ul className="space-y-1">
            {fields.map((f, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{fmt(f)}
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ClaimActions({ claimId, onDone }: { claimId: string; onDone: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const act = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/claims/${claimId}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) { onDone(); toast.success(`Claim ${action.replace('_', ' ')} successfully`); }
      else toast.error('Action failed');
    } catch { toast.error('Network error'); }
    finally { setLoading(null); }
  };

  const btn = (a: string, icon: React.ReactNode, colorClass: string, label: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className={`h-7 px-2 ${colorClass}`}
            onClick={() => act(a)} disabled={loading !== null}>
            {loading === a ? <RefreshCw className="h-3 w-3 animate-spin" /> : icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex items-center gap-1 justify-end">
      {btn('review', <Eye className="h-3 w-3" />, 'text-blue-600 hover:text-blue-700 hover:bg-blue-50', 'Review')}
      {btn('resolve', <CheckCircle className="h-3 w-3" />, 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50', 'Resolve')}
      {btn('send_back', <ArrowLeftRight className="h-3 w-3" />, 'text-purple-600 hover:text-purple-700 hover:bg-purple-50', 'Send Back')}
      {btn('mark_fixed', <Wrench className="h-3 w-3" />, 'text-amber-600 hover:text-amber-700 hover:bg-amber-50', 'Mark Fixed')}
    </div>
  );
}

export default function ClaimsIntelligencePage() {
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');

  // New claim form state
  const [newClaimNumber, setNewClaimNumber] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newStatus, setNewStatus] = useState('SUBMITTED');
  const [newRejectionReason, setNewRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes] = await Promise.all([
        fetch('/api/claims/stats'),
        fetch(`/api/claims?limit=100${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (claimsRes.ok) {
        const { claims } = await claimsRes.json();
        setAllClaims(claims || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredClaims = allClaims.filter(c => {
    if (!searchQuery) return true;
    return c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.rejectionReason || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleAddClaim = async () => {
    if (!newClaimNumber.trim() || !newAmount) {
      toast.error('Claim number and amount are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimNumber: newClaimNumber.trim(),
          amount: parseFloat(newAmount),
          status: newStatus,
          rejectionReason: newRejectionReason || null,
          branchId: 'default-branch',
          patientId: `PAT-${Date.now()}`,
        }),
      });
      if (res.ok) {
        toast.success(`Claim ${newClaimNumber} added`);
        setNewClaimNumber(''); setNewAmount(''); setNewStatus('SUBMITTED'); setNewRejectionReason('');
        setShowAddForm(false);
        fetchData();
      } else {
        toast.error('Failed to add claim');
      }
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileWarning className="h-6 w-6 text-primary" />
              Claims Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">Monitor claim rejections and recover lost revenue</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BranchSelector value={selectedBranch} onChange={setSelectedBranch} />
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddForm ? 'Cancel' : 'Add Claim'}
            </Button>
          </div>
        </div>

        {/* Add Claim Form */}
        {showAddForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Claim Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Claim Number</Label>
                  <Input value={newClaimNumber} onChange={e => setNewClaimNumber(e.target.value)} placeholder="CLM-2024-001" />
                </div>
                <div className="space-y-1">
                  <Label>Amount (SAR)</Label>
                  <Input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="2500" />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PENDING_REVIEW">Pending Review</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Rejection Reason (optional)</Label>
                  <Input value={newRejectionReason} onChange={e => setNewRejectionReason(e.target.value)} placeholder="e.g. Missing auth code" />
                </div>
              </div>
              <Button onClick={handleAddClaim} disabled={submitting}>
                {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {submitting ? 'Adding...' : 'Add Claim'}
              </Button>
            </CardContent>
          </Card>
        )}

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
                    <FileWarning className="h-3 w-3" /> Total Claims
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
                    <DollarSign className="h-3 w-3" /> Total Value
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
                    <TrendingDown className="h-3 w-3" /> Rejection Rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.rejectionRate > 15 ? 'text-red-600' : ''}`}>
                    {stats.rejectionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">GCC avg: 12%{stats.rejectionRate > 12 && ' (Above average)'}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1 text-emerald-700">
                    <TrendingUp className="h-3 w-3" /> Recoverable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">{formatSAR(stats.recoverableAmount)}</div>
                  <p className="text-xs text-emerald-600">From {stats.rejectedClaims} rejected claims</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown + Recovery Potential */}
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
                        <Badge className={statusColors[item.status] || 'bg-gray-100'}>{item.status}</Badge>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{formatNumber(item._count.status)} claims</span>
                          <span className="font-medium">{formatSAR(item._sum.amount || 0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                      <div className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(stats.rejectedClaims / stats.totalClaims) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Recoverable (50%)</span>
                      <span className="font-medium text-emerald-600">{formatSAR(stats.recoverableAmount * 0.5)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Based on industry average of 50% recovery rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Full Claims Table with Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      All Claims ({filteredClaims.length})
                    </CardTitle>
                    <CardDescription>Full claims list with risk scores and action workflow</CardDescription>
                  </div>
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search claims..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 h-9 w-[160px] text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredClaims.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No claims match the current filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Risk Score</TableHead>
                          <TableHead>Missing Fields</TableHead>
                          <TableHead>Rejection Reason</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClaims.map((claim) => (
                          <TableRow key={claim.id} className={claim.rejectionRisk && claim.rejectionRisk >= 90 ? 'bg-red-50 dark:bg-red-950/30' : ''}>
                            <TableCell className="font-medium">{claim.claimNumber}</TableCell>
                            <TableCell className="font-semibold">{formatSAR(claim.amount)}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[claim.status] || 'bg-gray-100 text-xs'}>{claim.status}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <RiskBadge risk={claim.rejectionRisk} />
                            </TableCell>
                            <TableCell>
                              <MissingFieldsPopover fields={claim.missingFields} />
                            </TableCell>
                            <TableCell className="max-w-[180px]">
                              <span className="text-sm text-muted-foreground truncate block" title={claim.rejectionReason}>
                                {claim.rejectionReason || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                              {new Date(claim.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <ClaimActions claimId={claim.id} onDone={fetchData} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <FileWarning className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Claims Data</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Add your first claim manually or import from a CSV file in Settings.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add First Claim
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

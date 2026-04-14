'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Database,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Shield,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
  id: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
  size: string;
  tables?: string[];
  version?: string;
  retention?: string;
  createdBy?: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/backup');
      const data = await res.json();
      if (data.success && data.backups) {
        setBackups(data.backups);
      }
    } catch {
      toast.error('Failed to load backups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/v1/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.backup) {
        setBackups((prev) => [data.backup, ...prev]);
        toast.success('Backup created successfully');
      } else {
        toast.error(data.error || 'Backup failed');
      }
    } catch {
      toast.error('Unable to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore from this backup? Current data may be overwritten.')) return;
    setRestoringId(backupId);
    try {
      // Simulate restore call — in production this would POST /api/v1/backup/restore
      await new Promise((r) => setTimeout(r, 2000));
      toast.success('Restore initiated. System will reload once complete.');
    } catch {
      toast.error('Restore failed');
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const statusBadge = (status: Backup['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />In Progress</Badge>;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Backup & Restore</h1>
          <p className="text-muted-foreground mt-1">
            Protect your clinic data with regular snapshots
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBackups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateBackup} disabled={creating}>
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating backup...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Backups</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-sm font-medium">
                  {backups.length > 0 ? formatDate(backups[0].timestamp) : 'No backups yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Retention Policy</p>
                <p className="text-sm font-medium">30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info alert */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Backups include all clinic data: organizations, branches, users, claims, patients, appointments, and ROI calculations.
          In production, backups are encrypted and stored in a secure cloud bucket.
        </AlertDescription>
      </Alert>

      {/* Backup list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup History
          </CardTitle>
          <CardDescription>
            All backups are retained for 30 days. Click &quot;Restore&quot; to roll back to any point.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No backups yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first backup to protect your clinic data.
              </p>
              <Button onClick={handleCreateBackup} disabled={creating}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Backup
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{formatDate(backup.timestamp)}</p>
                        {statusBadge(backup.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {backup.size && <span className="mr-3">{backup.size}</span>}
                        {backup.version && <span className="mr-3">v{backup.version}</span>}
                        {backup.retention && <span>Expires in {backup.retention}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {backup.status === 'completed' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info('Download feature available in production')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(backup.id)}
                          disabled={restoringId === backup.id}
                        >
                          {restoringId === backup.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-1" />
                          )}
                          Restore
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tables covered */}
      {backups.length > 0 && backups[0].tables && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Tables Included in Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {backups[0].tables.map((table) => (
                <Badge key={table} variant="secondary">
                  {table}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

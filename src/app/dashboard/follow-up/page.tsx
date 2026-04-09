'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';

interface PatientStats {
  totalPatients: number;
  overduePatients: number;
  highRiskPatients: number;
  noShowRate: number;
  recentAppointments: Array<{
    id: string;
    patientId: string;
    patient: {
      externalId: string;
      noShowRisk?: number;
    };
    scheduledAt: string;
    status: string;
    value: number;
    noShowRisk?: number;
  }>;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-yellow-100 text-yellow-800',
};

export default function PatientFollowUpPage() {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatientStats();
  }, []);

  const fetchPatientStats = async () => {
    try {
      const response = await fetch('/api/patients/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    // Seed sample patients
    const samplePatients = [
      { externalId: 'PAT-001', noShowCount: 0, nextDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
      { externalId: 'PAT-002', noShowCount: 2, noShowRisk: 65, nextDueAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { externalId: 'PAT-003', noShowCount: 1, noShowRisk: 35, nextDueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
      { externalId: 'PAT-004', noShowCount: 0, nextDueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
      { externalId: 'PAT-005', noShowCount: 3, noShowRisk: 80, nextDueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const createdPatients: any[] = [];
    for (const patient of samplePatients) {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patient,
          branchId: 'default-branch',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        createdPatients.push(data.patient);
      }
    }

    // Seed sample appointments
    const sampleAppointments = [
      { patientId: createdPatients[0]?.id, scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'SCHEDULED', value: 350 },
      { patientId: createdPatients[1]?.id, scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'SCHEDULED', value: 500, noShowRisk: 65 },
      { patientId: createdPatients[2]?.id, scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'COMPLETED', value: 400 },
      { patientId: createdPatients[3]?.id, scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'SCHEDULED', value: 250 },
      { patientId: createdPatients[4]?.id, scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'NO_SHOW', value: 450, noShowRisk: 80 },
    ];

    for (const appt of sampleAppointments) {
      if (appt.patientId) {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...appt,
            branchId: 'default-branch',
          }),
        });
      }
    }

    fetchPatientStats();
  };

  const getRiskBadge = (risk?: number) => {
    if (!risk) return <Badge variant="outline">Unknown</Badge>;
    if (risk >= 70) return <Badge className="bg-red-100 text-red-800">High Risk ({risk}%)</Badge>;
    if (risk >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk ({risk}%)</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk ({risk}%)</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Patient Follow-up
            </h1>
            <p className="text-muted-foreground mt-1">
              Reduce no-shows and improve patient retention
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
        ) : stats && stats.totalPatients > 0 ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Total Patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalPatients)}</div>
                  <p className="text-xs text-muted-foreground">Active patients</p>
                </CardContent>
              </Card>

              <Card className={stats.overduePatients > 0 ? 'border-orange-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Overdue for Visit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.overduePatients > 0 ? 'text-orange-600' : ''}`}>
                    {formatNumber(stats.overduePatients)}
                  </div>
                  <p className="text-xs text-muted-foreground">Need follow-up</p>
                </CardContent>
              </Card>

              <Card className={stats.highRiskPatients > 0 ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    High No-Show Risk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.highRiskPatients > 0 ? 'text-red-600' : ''}`}>
                    {formatNumber(stats.highRiskPatients)}
                  </div>
                  <p className="text-xs text-muted-foreground">Risk &gt; 50%</p>
                </CardContent>
              </Card>

              <Card className={stats.noShowRate > 15 ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    No-Show Rate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.noShowRate > 15 ? 'text-red-600' : ''}`}>
                    {stats.noShowRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    GCC avg: 8.5% {stats.noShowRate > 8.5 && '(Above average)'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Upcoming</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Reminder Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        SMS Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send automated SMS reminders 24h before appointments
                      </p>
                      <Button size="sm" variant="secondary" className="w-full">
                        Configure SMS
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        Email Follow-ups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send email reminders for overdue patients
                      </p>
                      <Button size="sm" variant="secondary" className="w-full">
                        Send Emails
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Confirmations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Track patient confirmations and responses
                      </p>
                      <Button size="sm" variant="secondary" className="w-full">
                        View Status
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Recent Appointments
                    </CardTitle>
                    <CardDescription>Latest patient activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>No-Show Risk</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentAppointments.map((appt) => (
                          <TableRow key={appt.id}>
                            <TableCell className="font-medium">{appt.patient?.externalId}</TableCell>
                            <TableCell>{new Date(appt.scheduledAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[appt.status] || 'bg-gray-100'}>
                                {appt.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{getRiskBadge(appt.noShowRisk || appt.patient?.noShowRisk)}</TableCell>
                            <TableCell className="text-right">{formatSAR(appt.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Scheduled visits requiring reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Appointment reminder workflow coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overdue">
                <Card>
                  <CardHeader>
                    <CardTitle>Overdue Patients</CardTitle>
                    <CardDescription>Patients past their follow-up date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Overdue patient tracking coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Patient Data
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start by loading sample data to see how Patient Follow-up helps you reduce no-shows and improve retention.
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

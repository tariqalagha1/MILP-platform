'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Calendar, AlertTriangle, TrendingUp, RefreshCw,
  Phone, Mail, CheckCircle2, Clock, Plus, X,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  patientId: string;
  patient: { externalId: string; noShowRisk?: number };
  scheduledAt: string;
  status: string;
  value: number;
  noShowRisk?: number;
}

interface Patient {
  id: string;
  externalId: string;
  noShowCount: number;
  noShowRisk?: number;
  nextDueAt?: string;
  lastVisitAt?: string;
}

interface PatientStats {
  totalPatients: number;
  overduePatients: number;
  highRiskPatients: number;
  noShowRate: number;
  recentAppointments: Appointment[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-yellow-100 text-yellow-800',
};

function RiskBadge({ risk }: { risk?: number }) {
  if (!risk) return <Badge variant="outline" className="text-xs">Unknown</Badge>;
  if (risk >= 70) return <Badge className="bg-red-100 text-red-800 text-xs">High ({risk}%)</Badge>;
  if (risk >= 40) return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium ({risk}%)</Badge>;
  return <Badge className="bg-green-100 text-green-800 text-xs">Low ({risk}%)</Badge>;
}

export default function PatientFollowUpPage() {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [upcomingAppts, setUpcomingAppts] = useState<Appointment[]>([]);
  const [overduePatients, setOverduePatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Add patient form
  const [newPatientId, setNewPatientId] = useState('');
  const [newNoShowCount, setNewNoShowCount] = useState('0');
  const [newNextDue, setNewNextDue] = useState('');

  // Add appointment form
  const [showApptForm, setShowApptForm] = useState(false);
  const [apptPatientId, setApptPatientId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptValue, setApptValue] = useState('');
  const [apptStatus, setApptStatus] = useState('SCHEDULED');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, upcomingRes, overdueRes] = await Promise.all([
        fetch('/api/patients/stats'),
        fetch('/api/appointments?upcoming=true&limit=50'),
        fetch('/api/patients?overdue=true&limit=50'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (upcomingRes.ok) {
        const { appointments } = await upcomingRes.json();
        setUpcomingAppts(appointments || []);
      }
      if (overdueRes.ok) {
        const { patients } = await overdueRes.json();
        setOverduePatients(patients || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddPatient = async () => {
    if (!newPatientId.trim()) { toast.error('Patient ID is required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: newPatientId.trim(),
          noShowCount: parseInt(newNoShowCount) || 0,
          nextDueAt: newNextDue ? new Date(newNextDue).toISOString() : null,
          branchId: 'default-branch',
        }),
      });
      if (res.ok) {
        toast.success(`Patient ${newPatientId} added`);
        setNewPatientId(''); setNewNoShowCount('0'); setNewNextDue('');
        setShowAddForm(false); fetchAll();
      } else toast.error('Failed to add patient');
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleAddAppointment = async () => {
    if (!apptPatientId.trim() || !apptDate) { toast.error('Patient ID and date are required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: apptPatientId.trim(),
          scheduledAt: new Date(apptDate).toISOString(),
          status: apptStatus,
          value: parseFloat(apptValue) || 0,
          branchId: 'default-branch',
        }),
      });
      if (res.ok) {
        toast.success('Appointment scheduled');
        setApptPatientId(''); setApptDate(''); setApptValue(''); setApptStatus('SCHEDULED');
        setShowApptForm(false); fetchAll();
      } else toast.error('Failed to schedule appointment');
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  const handleSendReminder = async (patientId: string, channel: 'sms' | 'email') => {
    setSendingReminder(`${patientId}-${channel}`);
    await new Promise(r => setTimeout(r, 800)); // simulate API call
    toast.success(`${channel.toUpperCase()} reminder sent to patient`);
    setSendingReminder(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Patient Follow-up
            </h1>
            <p className="text-muted-foreground mt-1">Reduce no-shows and improve patient retention</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchAll}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button size="sm" onClick={() => { setShowAddForm(!showAddForm); setShowApptForm(false); }}>
              {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {showAddForm ? 'Cancel' : 'Add Patient'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowApptForm(!showApptForm); setShowAddForm(false); }}>
              {showApptForm ? <X className="h-4 w-4 mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
              {showApptForm ? 'Cancel' : 'Schedule Appt'}
            </Button>
          </div>
        </div>

        {/* Add Patient Form */}
        {showAddForm && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Add New Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Patient ID / External ID</Label>
                  <Input value={newPatientId} onChange={e => setNewPatientId(e.target.value)} placeholder="PAT-001" />
                </div>
                <div className="space-y-1">
                  <Label>No-Show Count</Label>
                  <Input type="number" min="0" value={newNoShowCount} onChange={e => setNewNoShowCount(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label>Next Due Date</Label>
                  <Input type="date" value={newNextDue} onChange={e => setNewNextDue(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleAddPatient} disabled={submitting}>
                {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {submitting ? 'Adding...' : 'Add Patient'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Appointment Form */}
        {showApptForm && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Schedule Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Patient ID</Label>
                  <Input value={apptPatientId} onChange={e => setApptPatientId(e.target.value)} placeholder="PAT-001" />
                </div>
                <div className="space-y-1">
                  <Label>Date &amp; Time</Label>
                  <Input type="datetime-local" value={apptDate} onChange={e => setApptDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Value (SAR)</Label>
                  <Input type="number" value={apptValue} onChange={e => setApptValue(e.target.value)} placeholder="350" />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <select value={apptStatus} onChange={e => setApptStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddAppointment} disabled={submitting}>
                {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
                {submitting ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </CardContent>
          </Card>
        )}

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
                  <CardDescription className="flex items-center gap-1"><Users className="h-3 w-3" /> Total Patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalPatients)}</div>
                  <p className="text-xs text-muted-foreground">Active patients</p>
                </CardContent>
              </Card>
              <Card className={stats.overduePatients > 0 ? 'border-orange-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1"><Clock className="h-3 w-3" /> Overdue for Visit</CardDescription>
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
                  <CardDescription className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> High No-Show Risk</CardDescription>
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
                  <CardDescription className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> No-Show Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.noShowRate > 15 ? 'text-red-600' : ''}`}>
                    {stats.noShowRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">GCC avg: 8.5%{stats.noShowRate > 8.5 && ' (Above average)'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppts.length})
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  Overdue ({overduePatients.length})
                </TabsTrigger>
              </TabsList>

              {/* ── Overview Tab ── */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" /> SMS Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Send automated SMS reminders 24h before appointments</p>
                      <Button size="sm" variant="secondary" className="w-full"
                        onClick={() => toast.info('Configure Twilio in Settings → Integrations')}>
                        Configure SMS
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-600" /> Email Follow-ups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Send email reminders for overdue patients</p>
                      <Button size="sm" variant="secondary" className="w-full"
                        onClick={() => { setActiveTab('overdue'); }}>
                        View Overdue List
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Upcoming Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {upcomingAppts.length} appointments scheduled — review high-risk patients
                      </p>
                      <Button size="sm" variant="secondary" className="w-full"
                        onClick={() => setActiveTab('upcoming')}>
                        View Upcoming
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Recent Appointments
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
                            <TableCell><Badge className={`${statusColors[appt.status] || 'bg-gray-100'} text-xs`}>{appt.status}</Badge></TableCell>
                            <TableCell><RiskBadge risk={appt.noShowRisk || appt.patient?.noShowRisk} /></TableCell>
                            <TableCell className="text-right">{formatSAR(appt.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Upcoming Tab ── */}
              <TabsContent value="upcoming">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Scheduled visits — send reminders to reduce no-shows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No upcoming appointments. Schedule one above.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Scheduled</TableHead>
                            <TableHead>No-Show Risk</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">Remind</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingAppts.map((appt) => (
                            <TableRow key={appt.id} className={(appt.noShowRisk || 0) >= 70 ? 'bg-red-50' : ''}>
                              <TableCell className="font-medium">{appt.patient?.externalId || appt.patientId}</TableCell>
                              <TableCell>
                                {new Date(appt.scheduledAt).toLocaleDateString()} &nbsp;
                                <span className="text-muted-foreground text-xs">
                                  {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </TableCell>
                              <TableCell><RiskBadge risk={appt.noShowRisk || appt.patient?.noShowRisk} /></TableCell>
                              <TableCell className="text-right">{formatSAR(appt.value)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:bg-blue-50"
                                    disabled={sendingReminder === `${appt.id}-sms`}
                                    onClick={() => handleSendReminder(appt.id, 'sms')}>
                                    {sendingReminder === `${appt.id}-sms` ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3" />}
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-purple-600 hover:bg-purple-50"
                                    disabled={sendingReminder === `${appt.id}-email`}
                                    onClick={() => handleSendReminder(appt.id, 'email')}>
                                    {sendingReminder === `${appt.id}-email` ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Overdue Tab ── */}
              <TabsContent value="overdue">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" /> Overdue Patients
                    </CardTitle>
                    <CardDescription>Patients past their follow-up date — reach out today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overduePatients.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No overdue patients. All follow-ups are on track.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Days Overdue</TableHead>
                            <TableHead>No-Show History</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overduePatients.map((patient) => {
                            const daysOverdue = patient.nextDueAt
                              ? Math.floor((Date.now() - new Date(patient.nextDueAt).getTime()) / (1000 * 60 * 60 * 24))
                              : 0;
                            return (
                              <TableRow key={patient.id} className={daysOverdue > 14 ? 'bg-orange-50' : ''}>
                                <TableCell className="font-medium">{patient.externalId}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {patient.nextDueAt ? new Date(patient.nextDueAt).toLocaleDateString() : '—'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={daysOverdue > 14 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                                    {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <span className={`text-sm font-medium ${patient.noShowCount >= 2 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                    {patient.noShowCount} no-show{patient.noShowCount !== 1 ? 's' : ''}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 hover:bg-blue-50"
                                      disabled={sendingReminder === `${patient.id}-sms`}
                                      onClick={() => handleSendReminder(patient.id, 'sms')}>
                                      {sendingReminder === `${patient.id}-sms` ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Phone className="h-3 w-3" />}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-purple-600 hover:bg-purple-50"
                                      disabled={sendingReminder === `${patient.id}-email`}
                                      onClick={() => handleSendReminder(patient.id, 'email')}>
                                      {sendingReminder === `${patient.id}-email` ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Patient Data</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Add your first patient manually or import from a CSV file in Settings.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add First Patient
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

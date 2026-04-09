'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react';
import { formatSAR, formatNumber } from '@/lib/roi-calculator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface ReportsData {
  period: number;
  summary: {
    totalRevenue: number;
    lostRevenue: number;
    totalClaimsSubmitted: number;
    totalClaimsApproved: number;
    collectionRate: number;
    patientRetentionRate: number;
  };
  trends: {
    revenue: Array<{
      month: string;
      completed: number;
      noShow: number;
      cancelled: number;
    }>;
    claims: Array<{
      month: string;
      submitted: number;
      approved: number;
      rejected: number;
    }>;
  };
  breakdown: {
    appointments: Record<string, number>;
    claims: Record<string, number>;
  };
  patients: {
    total: number;
    returning: number;
    atRisk: number;
  };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6'];

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/reports?period=${period}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    // Placeholder for export functionality
    alert(`Export to ${format.toUpperCase()} coming soon!`);
  };

  const getAppointmentPieData = () => {
    if (!data) return [];
    return Object.entries(data.breakdown.appointments).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getClaimsPieData = () => {
    if (!data) return [];
    return Object.entries(data.breakdown.claims).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into your clinic's performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value || '30')}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchReports}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total Revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatSAR(data.summary.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Completed appointments</p>
                </CardContent>
              </Card>

              <Card className={data.summary.lostRevenue > 0 ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Lost Revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${data.summary.lostRevenue > 0 ? 'text-red-600' : ''}`}>
                    {formatSAR(data.summary.lostRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">No-shows & cancellations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Claims Collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.collectionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatSAR(data.summary.totalClaimsApproved)} / {formatSAR(data.summary.totalClaimsSubmitted)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Patient Retention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary.patientRetentionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(data.patients.returning)} / {formatNumber(data.patients.total)} patients
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
                <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
                <TabsTrigger value="breakdown">Status Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Revenue Trends
                    </CardTitle>
                    <CardDescription>
                      Revenue breakdown by appointment status over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.trends.revenue}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `SAR ${Number(value) / 1000}K`} />
                          <Tooltip formatter={(value) => formatSAR(Number(value))} />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#10b981" />
                          <Bar dataKey="noShow" name="No-Show" fill="#ef4444" />
                          <Bar dataKey="cancelled" name="Cancelled" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="claims" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Claims Trends
                    </CardTitle>
                    <CardDescription>
                      Claims submission and approval trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trends.claims}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `SAR ${Number(value) / 1000}K`} />
                          <Tooltip formatter={(value) => formatSAR(Number(value))} />
                          <Legend />
                          <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Appointment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={getAppointmentPieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getAppointmentPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Claims Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={getClaimsPieData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {getClaimsPieData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Patient Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Patient Insights
                </CardTitle>
                <CardDescription>
                  Patient retention and risk analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {formatNumber(data.patients.returning)}
                    </div>
                    <p className="text-sm text-green-600">Returning Patients</p>
                    <p className="text-xs text-green-500 mt-1">
                      Patients with no no-shows
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-700">
                      {formatNumber(data.patients.total - data.patients.returning - data.patients.atRisk)}
                    </div>
                    <p className="text-sm text-yellow-600">Regular Patients</p>
                    <p className="text-xs text-yellow-500 mt-1">
                      Occasional no-shows
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {formatNumber(data.patients.atRisk)}
                    </div>
                    <p className="text-sm text-red-600">At-Risk Patients</p>
                    <p className="text-xs text-red-500 mt-1">
                      Multiple no-shows (2+)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Data Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start by adding data through the other modules to generate reports.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Link2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  CheckCircle2,
  Users,
  Upload,
  UserPlus,
  Trash2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface Branch {
  id: number;
  name: string;
  address: string;
  active: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'standard_user' | 'guest';
  status: 'active' | 'invited';
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  standard_user: 'bg-green-100 text-green-800',
  guest: 'bg-gray-100 text-gray-800',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  standard_user: 'Standard User',
  guest: 'Guest',
};

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('organization');

  // Organization settings
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [country, setCountry] = useState('SA');
  const [currency, setCurrency] = useState('SAR');
  const [timezone, setTimezone] = useState('Asia/Riyadh');

  // Branch settings
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: 'Main Branch - Riyadh', address: 'King Fahd Road, Riyadh', active: true },
    { id: 2, name: 'Jeddah Branch', address: 'Al Hamra District, Jeddah', active: true },
    { id: 3, name: 'Dammam Branch', address: 'Al Khobar Road, Dammam', active: false },
  ]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [addingBranch, setAddingBranch] = useState(false);

  // Notification settings
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [reminderHours, setReminderHours] = useState('24');
  const [followUpDays, setFollowUpDays] = useState('7');

  // Integration settings
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [sendgridEnabled, setSendgridEnabled] = useState(false);
  const [sendgridKey, setSendgridKey] = useState('');

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Tariq Alagha', email: 'admin@clinic.sa', role: 'admin', status: 'active' },
    { id: '2', name: 'Dr. Sara Al-Hamdan', email: 'sara@clinic.sa', role: 'manager', status: 'active' },
    { id: '3', name: 'Mohammed Al-Qahtani', email: 'billing@clinic.sa', role: 'standard_user', status: 'active' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'standard_user' | 'guest'>('standard_user');
  const [inviting, setInviting] = useState(false);

  // Data import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'claims' | 'patients' | 'appointments'>('claims');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const { settings } = await res.json();
          setOrgName(settings.orgName || '');
          setOrgEmail(settings.orgEmail || '');
          setOrgPhone(settings.orgPhone || '');
          setCountry(settings.country || 'SA');
          setCurrency(settings.currency || 'SAR');
          setTimezone(settings.timezone || 'Asia/Riyadh');
          setSmsEnabled(settings.smsEnabled ?? true);
          setEmailEnabled(settings.emailEnabled ?? true);
          setReminderHours(settings.reminderHours || '24');
          setFollowUpDays(settings.followUpDays || '7');
          setTwilioEnabled(settings.twilioEnabled ?? false);
          setSendgridEnabled(settings.sendgridEnabled ?? false);
        }
      } catch {
        // silently use defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        orgName, orgEmail, orgPhone, country, currency, timezone,
        smsEnabled, emailEnabled, reminderHours, followUpDays,
        twilioEnabled, sendgridEnabled,
      };
      if (twilioSid) payload.twilioSid = twilioSid;
      if (twilioToken && twilioToken !== '••••••••') payload.twilioToken = twilioToken;
      if (sendgridKey && sendgridKey !== '••••••••') payload.sendgridKey = sendgridKey;

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Network error — settings not saved');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim()) return;
    const newBranch: Branch = {
      id: Date.now(),
      name: newBranchName.trim(),
      address: newBranchAddress.trim() || 'Address not set',
      active: true,
    };
    setBranches([...branches, newBranch]);
    setNewBranchName('');
    setNewBranchAddress('');
    setAddingBranch(false);
    toast.success(`Branch "${newBranch.name}" added`);
  };

  const handleDeleteBranch = (id: number) => {
    setBranches(branches.filter(b => b.id !== id));
    toast.success('Branch removed');
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please enter a name and email');
      return;
    }
    setInviting(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'invited',
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setInviteName('');
    setInviting(false);
    toast.success(`Invitation sent to ${newMember.email}`);
  };

  const handleRemoveMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (member?.role === 'admin') {
      toast.error('Cannot remove the admin account');
      return;
    }
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast.success('Team member removed');
  };

  const handleRoleChange = (id: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, role: newRole } : m));
    toast.success('Role updated');
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    setImporting(true);
    setImportResult(null);

    const text = await importFile.text();
    const lines = text.trim().split('\n').filter(Boolean);
    const dataLines = lines.slice(1); // skip header row

    let success = 0;
    let errors = 0;

    for (const line of dataLines) {
      try {
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        if (importType === 'claims') {
          const [claimNumber, amount, status, rejectionReason] = cols;
          const res = await fetch('/api/claims', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              claimNumber: claimNumber || `CLM-${Date.now()}`,
              amount: parseFloat(amount) || 0,
              status: status || 'SUBMITTED',
              rejectionReason: rejectionReason || null,
              branchId: 'default-branch',
              patientId: `PAT-${Date.now()}`,
            }),
          });
          res.ok ? success++ : errors++;
        } else if (importType === 'patients') {
          const [externalId, noShowCount, nextDueAt] = cols;
          const res = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              externalId: externalId || `PAT-${Date.now()}`,
              noShowCount: parseInt(noShowCount) || 0,
              nextDueAt: nextDueAt ? new Date(nextDueAt).toISOString() : null,
              branchId: 'default-branch',
            }),
          });
          res.ok ? success++ : errors++;
        } else if (importType === 'appointments') {
          const [patientId, scheduledAt, status, value] = cols;
          const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId: patientId || `PAT-${Date.now()}`,
              scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
              status: status || 'SCHEDULED',
              value: parseFloat(value) || 0,
              branchId: 'default-branch',
            }),
          });
          res.ok ? success++ : errors++;
        }
      } catch {
        errors++;
      }
    }

    setImportResult({ success, errors });
    setImporting(false);
    setImportFile(null);

    if (success > 0) {
      toast.success(`Imported ${success} records successfully`);
    }
    if (errors > 0) {
      toast.error(`${errors} records failed to import`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization, team, and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
            <TabsTrigger value="organization">
              <Building2 className="h-4 w-4 mr-1.5" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="branches">
              <MapPin className="h-4 w-4 mr-1.5" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-1.5" />
              Team
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-1.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link2 className="h-4 w-4 mr-1.5" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* ── Organization Tab ── */}
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Details</CardTitle>
                <CardDescription>Basic information about your healthcare organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Enter organization name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">Contact Email</Label>
                    <Input id="orgEmail" type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} placeholder="admin@clinic.sa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone">Contact Phone</Label>
                    <Input id="orgPhone" value={orgPhone} onChange={e => setOrgPhone(e.target.value)} placeholder="+966 XX XXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <select id="country" value={country} onChange={e => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="SA">Saudi Arabia</option>
                      <option value="AE">UAE</option>
                      <option value="QA">Qatar</option>
                      <option value="KW">Kuwait</option>
                      <option value="BH">Bahrain</option>
                      <option value="OM">Oman</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Currency &amp; Locale</CardTitle>
                <CardDescription>Regional settings for calculations and display</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select id="currency" value={currency} onChange={e => setCurrency(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="SAR">SAR — Saudi Riyal</option>
                      <option value="AED">AED — UAE Dirham</option>
                      <option value="QAR">QAR — Qatari Riyal</option>
                      <option value="KWD">KWD — Kuwaiti Dinar</option>
                      <option value="BHD">BHD — Bahraini Dinar</option>
                      <option value="OMR">OMR — Omani Riyal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                      <option value="Asia/Kuwait">Asia/Kuwait (GMT+3)</option>
                      <option value="Asia/Qatar">Asia/Qatar (GMT+3)</option>
                      <option value="Asia/Bahrain">Asia/Bahrain (GMT+3)</option>
                      <option value="Asia/Muscat">Asia/Muscat (GMT+4)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Branches Tab ── */}
          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Branch Locations</CardTitle>
                  <CardDescription>Manage your clinic branches and locations</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setAddingBranch(!addingBranch)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {addingBranch ? 'Cancel' : 'Add Branch'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {addingBranch && (
                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <h4 className="text-sm font-medium">New Branch</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Branch Name</Label>
                        <Input value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="e.g. Medina Branch" />
                      </div>
                      <div className="space-y-1">
                        <Label>Address</Label>
                        <Input value={newBranchAddress} onChange={e => setNewBranchAddress(e.target.value)} placeholder="e.g. Prince Road, Medina" />
                      </div>
                    </div>
                    <Button size="sm" onClick={handleAddBranch} disabled={!newBranchName.trim()}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Add Branch
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  {branches.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${branch.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={branch.active ? 'text-green-700 border-green-300' : 'text-gray-500'}>
                          {branch.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteBranch(branch.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Team Tab ── */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Team Member
                </CardTitle>
                <CardDescription>Add staff to your organization and assign their access level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Sara Al-Hamdan" />
                  </div>
                  <div className="space-y-1">
                    <Label>Email Address</Label>
                    <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="sara@clinic.sa" />
                  </div>
                  <div className="space-y-1">
                    <Label>Role</Label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value as typeof inviteRole)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="manager">Manager — full access, no admin</option>
                      <option value="standard_user">Standard User — view + act on data</option>
                      <option value="guest">Guest — read only</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim() || !inviteName.trim()}>
                  {inviting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  {inviting ? 'Sending Invite...' : 'Send Invitation'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Team Members ({teamMembers.length})
                </CardTitle>
                <CardDescription>Manage access levels and permissions for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === 'invited' && (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-300 text-xs">Invited</Badge>
                        )}
                        <select
                          value={member.role}
                          disabled={member.role === 'admin'}
                          onChange={e => handleRoleChange(member.id, e.target.value as TeamMember['role'])}
                          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="standard_user">Standard User</option>
                          <option value="guest">Guest</option>
                        </select>
                        <Badge className={`text-xs ${ROLE_COLORS[member.role]}`}>
                          {ROLE_LABELS[member.role]}
                        </Badge>
                        {member.role !== 'admin' && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            onClick={() => handleRemoveMember(member.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Reference */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-sm">Role Permissions Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { role: 'Admin', color: 'bg-red-100 text-red-800', perms: 'Full access, manage team, backups, billing' },
                    { role: 'Manager', color: 'bg-blue-100 text-blue-800', perms: 'All modules, reports, settings (no admin)' },
                    { role: 'Standard User', color: 'bg-green-100 text-green-800', perms: 'Claims, follow-up, ROI calculator' },
                    { role: 'Guest', color: 'bg-gray-100 text-gray-800', perms: 'Read-only access to dashboard' },
                  ].map(({ role, color, perms }) => (
                    <div key={role} className="p-3 border rounded-lg">
                      <Badge className={`${color} text-xs mb-2`}>{role}</Badge>
                      <p className="text-muted-foreground">{perms}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications Tab ── */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Channels</CardTitle>
                <CardDescription>Configure how you send reminders to patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Send appointment reminders via SMS</p>
                    </div>
                  </div>
                  <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Send appointment reminders via email</p>
                    </div>
                  </div>
                  <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reminder Schedule</CardTitle>
                <CardDescription>Configure when reminders are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminderHours">Appointment Reminder (hours before)</Label>
                    <Input id="reminderHours" value={reminderHours} onChange={e => setReminderHours(e.target.value)} placeholder="24" />
                    <p className="text-xs text-muted-foreground">Recommended: 24 hours before appointment</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDays">Follow-up Reminder (days after due)</Label>
                    <Input id="followUpDays" value={followUpDays} onChange={e => setFollowUpDays(e.target.value)} placeholder="7" />
                    <p className="text-xs text-muted-foreground">Recommended: 7 days after due date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Integrations Tab ── */}
          <TabsContent value="integrations" className="space-y-4">
            {/* Twilio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMS Provider — Twilio</CardTitle>
                <CardDescription>Connect Twilio to send automated SMS reminders to patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Twilio SMS</p>
                      <p className="text-sm text-muted-foreground">{twilioEnabled ? 'Connected' : 'Not connected'}</p>
                    </div>
                  </div>
                  <Switch checked={twilioEnabled} onCheckedChange={setTwilioEnabled} />
                </div>
                {twilioEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="twilioSid">Account SID</Label>
                      <Input id="twilioSid" value={twilioSid} onChange={e => setTwilioSid(e.target.value)} type="password" placeholder="AC••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilioToken">Auth Token</Label>
                      <Input id="twilioToken" value={twilioToken} onChange={e => setTwilioToken(e.target.value)} type="password" placeholder="Enter auth token" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SendGrid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Provider — SendGrid</CardTitle>
                <CardDescription>Connect SendGrid to send email notifications and follow-ups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium">SendGrid Email</p>
                      <p className="text-sm text-muted-foreground">{sendgridEnabled ? 'Connected' : 'Not connected'}</p>
                    </div>
                  </div>
                  <Switch checked={sendgridEnabled} onCheckedChange={setSendgridEnabled} />
                </div>
                {sendgridEnabled && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="sendgridKey">API Key</Label>
                    <Input id="sendgridKey" value={sendgridKey} onChange={e => setSendgridKey(e.target.value)} type="password" placeholder="SG.••••••••" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Data Import — CSV Upload
                </CardTitle>
                <CardDescription>Import claims, patients, or appointments from a CSV file exported from your existing system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Import Type</Label>
                    <select value={importType} onChange={e => setImportType(e.target.value as typeof importType)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="claims">Claims (claimNumber, amount, status, rejectionReason)</option>
                      <option value="patients">Patients (externalId, noShowCount, nextDueAt)</option>
                      <option value="appointments">Appointments (patientId, scheduledAt, status, value)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>CSV File</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={e => setImportFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* CSV Format Guide */}
                <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Expected CSV format for {importType}:</p>
                  {importType === 'claims' && <code>claimNumber,amount,status,rejectionReason</code>}
                  {importType === 'patients' && <code>externalId,noShowCount,nextDueAt</code>}
                  {importType === 'appointments' && <code>patientId,scheduledAt,status,value</code>}
                  <p className="mt-1">First row is treated as the header and skipped.</p>
                </div>

                <Button onClick={handleImport} disabled={importing || !importFile}>
                  {importing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {importing ? 'Importing...' : 'Import Data'}
                </Button>

                {importResult && (
                  <div className={`p-3 rounded-lg text-sm ${importResult.errors === 0 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>
                    <p className="font-medium">Import Complete</p>
                    <p>{importResult.success} records imported successfully</p>
                    {importResult.errors > 0 && <p>{importResult.errors} records had errors and were skipped</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Billing Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Current Plan: Professional</p>
                  <p className="text-sm text-blue-700">Up to 5 branches · Unlimited patients · Priority support</p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

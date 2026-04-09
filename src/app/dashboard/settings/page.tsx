'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Bell, 
  Link2, 
  CreditCard,
  Users,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Save,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  
  // Organization settings
  const [orgName, setOrgName] = useState('Al Noor Medical Center');
  const [orgEmail, setOrgEmail] = useState('admin@alnoor-clinic.sa');
  const [orgPhone, setOrgPhone] = useState('+966 12 345 6789');
  
  // Branch settings
  const [branches] = useState([
    { id: 1, name: 'Main Branch - Riyadh', address: 'King Fahd Road, Riyadh', active: true },
    { id: 2, name: 'Jeddah Branch', address: 'Al Hamra District, Jeddah', active: true },
    { id: 3, name: 'Dammam Branch', address: 'Al Khobar Road, Dammam', active: false },
  ]);
  
  // Notification settings
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState('24');
  const [followUpDays, setFollowUpDays] = useState('7');
  
  // Integration settings
  const [twilioEnabled, setTwilioEnabled] = useState(false);
  const [sendgridEnabled, setSendgridEnabled] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

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
              Manage your organization and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="organization" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="organization">
              <Building2 className="h-4 w-4 mr-2" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="branches">
              <MapPin className="h-4 w-4 mr-2" />
              Branches
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link2 className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Details</CardTitle>
                <CardDescription>
                  Basic information about your healthcare organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">Contact Email</Label>
                    <Input
                      id="orgEmail"
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      placeholder="admin@clinic.sa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgPhone">Contact Phone</Label>
                    <Input
                      id="orgPhone"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      placeholder="+966 XX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue="SA"
                    >
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
                <CardTitle className="text-base">Currency & Locale</CardTitle>
                <CardDescription>
                  Regional settings for calculations and display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue="SAR"
                    >
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="AED">AED - UAE Dirham</option>
                      <option value="QAR">QAR - Qatari Riyal</option>
                      <option value="KWD">KWD - Kuwaiti Dinar</option>
                      <option value="BHD">BHD - Bahraini Dinar</option>
                      <option value="OMR">OMR - Omani Riyal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue="Asia/Riyadh"
                    >
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

          {/* Branch Management */}
          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Branch Locations</CardTitle>
                  <CardDescription>
                    Manage your clinic branches and locations
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  + Add Branch
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${branch.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Channels</CardTitle>
                <CardDescription>
                  Configure how you send reminders to patients
                </CardDescription>
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
                <CardDescription>
                  Configure when reminders are sent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminderDays">Appointment Reminder (hours before)</Label>
                    <Input
                      id="reminderDays"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                      placeholder="24"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 24 hours before appointment</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followUpDays">Follow-up Reminder (days after due)</Label>
                    <Input
                      id="followUpDays"
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(e.target.value)}
                      placeholder="7"
                    />
                    <p className="text-xs text-muted-foreground">Recommended: 7 days after due date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMS Provider</CardTitle>
                <CardDescription>
                  Connect an SMS provider for appointment reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Twilio</p>
                      <p className="text-sm text-muted-foreground">Send SMS messages via Twilio</p>
                    </div>
                  </div>
                  <Switch checked={twilioEnabled} onCheckedChange={setTwilioEnabled} />
                </div>
                {twilioEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="twilioSid">Account SID</Label>
                      <Input id="twilioSid" type="password" placeholder="Enter your Twilio Account SID" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilioToken">Auth Token</Label>
                      <Input id="twilioToken" type="password" placeholder="Enter your Twilio Auth Token" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Provider</CardTitle>
                <CardDescription>
                  Connect an email provider for notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium">SendGrid</p>
                      <p className="text-sm text-muted-foreground">Send emails via SendGrid</p>
                    </div>
                  </div>
                  <Switch checked={sendgridEnabled} onCheckedChange={setSendgridEnabled} />
                </div>
                {sendgridEnabled && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="sendgridKey">API Key</Label>
                    <Input id="sendgridKey" type="password" placeholder="Enter your SendGrid API Key" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Healthcare Systems</CardTitle>
                <CardDescription>
                  Connect to your existing healthcare management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Hospital Information System</p>
                      <p className="text-sm text-muted-foreground">Connect your HIS for automated data sync</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
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
                  <p className="text-sm text-blue-700">Up to 5 branches • Unlimited patients • Priority support</p>
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

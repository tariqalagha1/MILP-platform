'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  FileWarning, 
  Activity,
  ArrowRight,
  Building2,
  DollarSign,
  BarChart3,
  CheckCircle2,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl">MILP</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">Revenue Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/overview">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/dashboard/roi-calculator">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Globe className="h-4 w-4" />
            Built for GCC Healthcare Markets
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Recover Lost Revenue for Your{' '}
            <span className="text-primary">Healthcare Clinic</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Quantify and recover revenue from no-shows, rejected claims, and patient attrition. 
            Built specifically for Saudi Arabia, UAE, and GCC healthcare providers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/roi-calculator">
              <Button size="lg" className="w-full sm:w-auto">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Your ROI
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard/overview">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary">15-25%</div>
            <p className="text-sm text-muted-foreground">Average revenue recovery</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary">8.5%</div>
            <p className="text-sm text-muted-foreground">GCC no-show average</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary">12%</div>
            <p className="text-sm text-muted-foreground">Claim rejection rate</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary">SAR</div>
            <p className="text-sm text-muted-foreground">Regional currency support</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Complete Revenue Intelligence Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to identify, track, and recover lost revenue across your clinic chain.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ROI Calculator */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-blue-100 w-fit mb-3">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>ROI Calculator</CardTitle>
              <CardDescription>Quantify recoverable revenue in 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> GCC benchmarks</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> SAR currency formatting</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Executive reports</li>
              </ul>
              <Link href="/dashboard/roi-calculator">
                <Button variant="secondary" className="w-full mt-4">Open Calculator</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Claims Intelligence */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-orange-100 w-fit mb-3">
                <FileWarning className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Claims Intelligence</CardTitle>
              <CardDescription>Reduce rejected claims and recover revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Rejection risk scoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Missing field detection</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Recovery workflows</li>
              </ul>
              <Link href="/dashboard/claims">
                <Button variant="secondary" className="w-full mt-4">View Claims</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Patient Follow-up */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-purple-100 w-fit mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Patient Follow-up</CardTitle>
              <CardDescription>Reduce no-shows and improve retention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> No-show prediction</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Appointment reminders</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Overdue alerts</li>
              </ul>
              <Link href="/dashboard/follow-up">
                <Button variant="secondary" className="w-full mt-4">Manage Follow-ups</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Executive Dashboard */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-green-100 w-fit mb-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Executive Dashboard</CardTitle>
              <CardDescription>Financial visibility for management</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Branch ranking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Real-time KPIs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Revenue alerts</li>
              </ul>
              <Link href="/dashboard/overview">
                <Button variant="secondary" className="w-full mt-4">View Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Reports & Analytics */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-teal-100 w-fit mb-3">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>Weekly and monthly insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Revenue trends</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Claims analysis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Export capabilities</li>
              </ul>
              <Link href="/dashboard/reports">
                <Button variant="secondary" className="w-full mt-4">View Reports</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 rounded-xl bg-gray-100 w-fit mb-3">
                <Building2 className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Multi-tenant configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Branch management</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Notification settings</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Integrations</li>
              </ul>
              <Link href="/dashboard/settings">
                <Button variant="secondary" className="w-full mt-4">Configure</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why MILP for GCC Healthcare?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Proven Impact</h3>
            <p className="text-sm text-muted-foreground">
              15-25% average revenue recovery within first 90 days of implementation.
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Built with healthcare data security best practices for GCC regulations.
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">GCC-Native</h3>
            <p className="text-sm text-muted-foreground">
              Designed for Saudi, UAE, Qatar, Kuwait, Bahrain, and Oman healthcare markets.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Choose the plan that fits your organization</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <CardDescription>For single clinics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">SAR 4,000<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 1 Branch</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> ROI Calculator</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Basic Reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Email Support</li>
              </ul>
              <Link href="/dashboard/overview">
                <Button variant="outline" className="w-full mt-6">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle>Growth</CardTitle>
              <CardDescription>For clinic chains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">SAR 10-18K<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Up to 10 Branches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> All Modules</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Branch Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Priority Support</li>
              </ul>
              <Link href="/dashboard/overview">
                <Button className="w-full mt-6">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For hospital groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">SAR 250-700K<span className="text-sm font-normal text-muted-foreground">/year</span></div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unlimited Branches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> HIS Integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Custom Reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Dedicated Support</li>
              </ul>
              <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Recover Lost Revenue?</h2>
          <p className="text-muted-foreground mb-8">
            Start with our ROI Calculator to see how much revenue you could recover in 90 days.
          </p>
          <Link href="/dashboard/roi-calculator">
            <Button size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Your ROI Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-semibold">MILP</span>
            <span className="text-muted-foreground text-sm">Healthcare Revenue Intelligence</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 MILP. Built for GCC Healthcare Markets.
          </p>
        </div>
      </footer>
    </div>
  );
}

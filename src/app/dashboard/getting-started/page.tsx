'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Building2,
  Calculator,
  FileWarning,
  Users,
  UserPlus,
  Database,
  Rocket,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  actionLabel: string;
  href?: string;
  checkKey: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Create your account',
    description: 'Your account is set up and you are logged in. This is already done.',
    icon: CheckCircle2,
    action: 'done',
    actionLabel: 'Completed',
    checkKey: 'account',
  },
  {
    id: 2,
    title: 'Set up your organization',
    description: 'Add your clinic name, contact details, country, and currency. This takes 2 minutes.',
    icon: Building2,
    action: 'link',
    actionLabel: 'Go to Settings',
    href: '/dashboard/settings',
    checkKey: 'organization',
  },
  {
    id: 3,
    title: 'Run the ROI Calculator',
    description: 'Enter 5 numbers about your clinic and see exactly how much revenue you can recover in SAR.',
    icon: Calculator,
    action: 'link',
    actionLabel: 'Open ROI Calculator',
    href: '/dashboard/roi-calculator',
    checkKey: 'roi',
  },
  {
    id: 4,
    title: 'Connect your data',
    description: 'Import your claims, patients, or appointments from a CSV file, or load demo data to explore the platform.',
    icon: Database,
    action: 'seed',
    actionLabel: 'Load Demo Data',
    checkKey: 'data',
  },
  {
    id: 5,
    title: 'Review your claims dashboard',
    description: 'See your claims with rejection risk scores. Fix high-risk claims before they are rejected.',
    icon: FileWarning,
    action: 'link',
    actionLabel: 'Go to Claims',
    href: '/dashboard/claims',
    checkKey: 'claims',
  },
  {
    id: 6,
    title: 'Set up your team',
    description: 'Invite your billing team, front desk staff, and managers. Each person gets access to the right screens only.',
    icon: UserPlus,
    action: 'link',
    actionLabel: 'Manage Team',
    href: '/dashboard/settings',
    checkKey: 'team',
  },
  {
    id: 7,
    title: 'Start recovering revenue',
    description: 'You are live. Review your Executive Dashboard daily and act on the alerts. Recovery starts from day one.',
    icon: Rocket,
    action: 'link',
    actionLabel: 'Go to Dashboard',
    href: '/dashboard/overview',
    checkKey: 'live',
  },
];

const STORAGE_KEY = 'milp_onboarding_progress';

export default function GettingStartedPage() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [seeding, setSeeding] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompleted(JSON.parse(saved));
      } else {
        // Step 1 (account) is always done
        setCompleted({ account: true });
      }
    } catch {
      setCompleted({ account: true });
    }
  }, []);

  const saveProgress = (updates: Record<string, boolean>) => {
    const next = { ...completed, ...updates };
    setCompleted(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const markDone = (key: string) => {
    saveProgress({ [key]: true });
    toast.success('Step marked as complete!');
    // Auto-expand next incomplete step
    const currentStepIndex = STEPS.findIndex(s => s.checkKey === key);
    const nextStep = STEPS.slice(currentStepIndex + 1).find(s => !completed[s.checkKey]);
    if (nextStep) setExpandedStep(nextStep.id);
  };

  const handleSeed = async (key: string) => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        toast.success('Demo data loaded successfully!');
        markDone(key);
      } else {
        toast.error('Failed to load demo data');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSeeding(false);
    }
  };

  const completedCount = STEPS.filter(s => completed[s.checkKey]).length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);
  const allDone = completedCount === STEPS.length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Getting Started
          </h1>
          <p className="text-muted-foreground mt-1">
            Follow these 7 steps to start recovering revenue from day one
          </p>
        </div>

        {/* Progress Bar */}
        <Card className={allDone ? 'border-green-300 bg-green-50' : 'border-primary/20 bg-primary/5'}>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-lg">
                  {allDone ? '🎉 Setup Complete!' : `${completedCount} of ${STEPS.length} steps complete`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {allDone
                    ? 'Your platform is fully configured. Start recovering revenue today.'
                    : `${STEPS.length - completedCount} step${STEPS.length - completedCount !== 1 ? 's' : ''} remaining`}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold ${allDone ? 'text-green-600' : 'text-primary'}`}>
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {allDone && (
              <div className="mt-4 flex justify-end">
                <Link href="/dashboard/overview">
                  <Button>
                    Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isDone = !!completed[step.checkKey];
            const isExpanded = expandedStep === step.id;
            const Icon = step.icon;
            const isFirst = index === 0;

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isDone
                    ? 'border-green-200 bg-green-50/50 opacity-75'
                    : isExpanded
                    ? 'border-primary/40 shadow-sm'
                    : 'hover:border-muted-foreground/30'
                }`}
              >
                {/* Step Header — clickable to expand/collapse */}
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Step indicator */}
                    <div className="flex-shrink-0">
                      {isDone ? (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
                          ${isExpanded ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 bg-muted/20'}`}>
                          <span className={`text-sm font-bold ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`}>
                            {step.id}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isDone ? 'text-green-700 line-through' : ''}`}>
                          {step.title}
                        </p>
                        {isDone && <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>}
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{step.description}</p>
                      )}
                    </div>

                    {/* Expand toggle */}
                    <div className="flex-shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {/* Step Body — expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {step.action === 'done' && (
                        <Badge className="bg-green-100 text-green-700 px-3 py-1">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Already complete
                        </Badge>
                      )}

                      {step.action === 'link' && step.href && (
                        <>
                          <Link href={step.href}>
                            <Button size="sm">
                              {step.actionLabel}
                              <ArrowRight className="h-3.5 w-3.5 ml-2" />
                            </Button>
                          </Link>
                          {!isDone && (
                            <Button size="sm" variant="ghost" onClick={() => markDone(step.checkKey)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Mark as done
                            </Button>
                          )}
                        </>
                      )}

                      {step.action === 'seed' && (
                        <>
                          <Button size="sm" onClick={() => handleSeed(step.checkKey)} disabled={seeding}>
                            {seeding ? (
                              <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
                            ) : (
                              <Database className="h-3.5 w-3.5 mr-2" />
                            )}
                            {seeding ? 'Loading...' : step.actionLabel}
                          </Button>
                          <Link href="/dashboard/settings">
                            <Button size="sm" variant="outline">
                              Import CSV Instead
                            </Button>
                          </Link>
                          {!isDone && (
                            <Button size="sm" variant="ghost" onClick={() => markDone(step.checkKey)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                              Mark as done
                            </Button>
                          )}
                        </>
                      )}

                      {isDone && step.action !== 'done' && (
                        <Button size="sm" variant="ghost" className="text-green-700"
                          onClick={() => {
                            const next = { ...completed };
                            delete next[step.checkKey];
                            setCompleted(next);
                            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
                          }}>
                          Undo
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Help Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Need help?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The full setup takes less than one working day. Each step is independent —
                  you can come back and complete any step in any order. Your progress is saved automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

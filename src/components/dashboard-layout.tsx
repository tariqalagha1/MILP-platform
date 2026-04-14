'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calculator,
  FileWarning,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Activity,
  ChevronDown,
  LogOut,
  User,
  Database,
  Rocket,
  HardDrive,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/dashboard/getting-started',
    icon: Rocket,
    badge: 'New',
  },
  {
    title: 'Overview',
    href: '/dashboard/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'ROI Calculator',
    href: '/dashboard/roi-calculator',
    icon: Calculator,
  },
  {
    title: 'Claims Intelligence',
    href: '/dashboard/claims',
    icon: FileWarning,
  },
  {
    title: 'Patient Follow-up',
    href: '/dashboard/follow-up',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Backup & Restore',
    href: '/dashboard/backup',
    icon: HardDrive,
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    // Load user from localStorage (set during sign-in)
    try {
      const stored = localStorage.getItem('milp_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser({ name: u.name || u.email, email: u.email, role: u.role || 'admin' });
      }
    } catch {
      // fallback to demo defaults
    }
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to seed data:', error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">MILP</span>
        </Link>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={handleSeedData} disabled={seeding}>
            <Database className="h-4 w-4 mr-1" />
            {seeding ? 'Loading...' : 'Demo Data'}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 z-40 lg:z-30 h-screen w-64 border-r bg-background transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b">
              <Activity className="h-7 w-7 text-primary" />
              <div>
                <h1 className="font-bold text-lg">MILP</h1>
                <p className="text-xs text-muted-foreground">Revenue Intelligence</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive && 'bg-primary text-primary-foreground',
                      !isActive && item.disabled && 'text-muted-foreground cursor-not-allowed opacity-50',
                      !isActive && !item.disabled && 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Seed Demo Data Button */}
            <div className="px-3 py-2 border-t hidden lg:block">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleSeedData}
                disabled={seeding}
              >
                <Database className="h-4 w-4 mr-2" />
                {seeding ? 'Loading Demo...' : 'Load Demo Data'}
              </Button>
            </div>

            {/* User Profile */}
            <div className="px-3 py-3 border-t">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{currentUser?.name || 'Demo User'}</p>
                  <p className="text-xs text-muted-foreground">{currentUser?.email || 'admin@clinic.sa'}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showUserMenu && "rotate-180")} />
              </button>
              
              {showUserMenu && (
                <div className="mt-1 px-2 py-1 space-y-1">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                    onClick={() => {
                      localStorage.removeItem('milp_token');
                      localStorage.removeItem('milp_user');
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-3 border-t">
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <p className="font-medium">Healthcare Revenue Platform</p>
                <p className="mt-1">GCC / MENA Markets</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

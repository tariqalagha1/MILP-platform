'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ROICalculatorForm } from '@/components/roi-calculator-form';
import { ROIResults } from '@/components/roi-results';
import { ROIInputs, ROIBreakdown, calculateROI } from '@/lib/roi-calculator';
import { Calculator, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ROICalculatorPage() {
  const [breakdown, setBreakdown] = useState<ROIBreakdown | null>(null);
  const [inputs, setInputs] = useState<ROIInputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async (data: ROIInputs) => {
    setIsCalculating(true);
    
    // Simulate a brief calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = calculateROI(data);
    setBreakdown(result);
    setInputs(data);
    setIsCalculating(false);
  };

  const handleExport = () => {
    if (!breakdown || !inputs) return;
    
    // Open print dialog for PDF export
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              ROI Calculator
            </h1>
            <p className="text-muted-foreground mt-1">
              Calculate recoverable revenue for your clinic in 90 days
            </p>
          </div>
          <div className="flex items-center gap-2">
            {breakdown && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-SA', {
                      style: 'currency',
                      currency: 'SAR',
                      minimumFractionDigits: 0,
                    }).format(breakdown.totalRecoverable90Days)} recoverable
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} className="print:hidden">
                  <Download className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Calculator Form */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            <ROICalculatorForm
              onCalculate={handleCalculate}
              isLoading={isCalculating}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {breakdown ? (
              <ROIResults breakdown={breakdown} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                <TrendingUp className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No calculation yet
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-2 max-w-xs">
                  Enter your clinic metrics on the left to see recoverable revenue estimates
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 print:hidden">
          <h2 className="font-semibold text-lg mb-2">How MILP Recovers Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <h3 className="font-medium text-sm">No-Show Reduction</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automated reminders and no-show prediction reduce missed appointments
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Claims Recovery</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Intelligent rejection analysis helps recover rejected claims
              </p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Patient Retention</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Follow-up workflows improve repeat visit rates
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROIInputs } from '@/lib/roi-calculator';
import { Calculator, RefreshCw } from 'lucide-react';

const roiSchema = z.object({
  monthlyAppointments: z.number().min(1, 'Must be at least 1'),
  avgAppointmentValue: z.number().min(1, 'Must be greater than 0'),
  noShowRate: z.number().min(0).max(100, 'Must be between 0 and 100'),
  rejectedClaimsRate: z.number().min(0).max(100, 'Must be between 0 and 100'),
  avgClaimValue: z.number().min(0, 'Must be 0 or greater'),
  repeatVisitRate: z.number().min(0).max(100, 'Must be between 0 and 100'),
});

interface ROICalculatorFormProps {
  onCalculate: (inputs: ROIInputs) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ROIInputs>;
}

export function ROICalculatorForm({ onCalculate, isLoading, defaultValues }: ROICalculatorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ROIInputs>({
    resolver: zodResolver(roiSchema),
    defaultValues: {
      monthlyAppointments: 500,
      avgAppointmentValue: 350,
      noShowRate: 15,
      rejectedClaimsRate: 12,
      avgClaimValue: 500,
      repeatVisitRate: 40,
      ...defaultValues,
    },
  });

  const onSubmit = (data: ROIInputs) => {
    onCalculate(data);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          ROI Calculator Inputs
        </CardTitle>
        <CardDescription>
          Enter your clinic&apos;s metrics to calculate recoverable revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Monthly Volume Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Monthly Volume
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyAppointments">
                  Monthly Appointments
                </Label>
                <Input
                  id="monthlyAppointments"
                  type="number"
                  placeholder="500"
                  {...register('monthlyAppointments', { valueAsNumber: true })}
                />
                {errors.monthlyAppointments && (
                  <p className="text-sm text-destructive">{errors.monthlyAppointments.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avgAppointmentValue">
                  Avg. Appointment Value (SAR)
                </Label>
                <Input
                  id="avgAppointmentValue"
                  type="number"
                  placeholder="350"
                  {...register('avgAppointmentValue', { valueAsNumber: true })}
                />
                {errors.avgAppointmentValue && (
                  <p className="text-sm text-destructive">{errors.avgAppointmentValue.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Loss Metrics Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Revenue Leakage Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noShowRate">
                  No-Show Rate (%)
                </Label>
                <Input
                  id="noShowRate"
                  type="number"
                  step="0.1"
                  placeholder="15"
                  {...register('noShowRate', { valueAsNumber: true })}
                />
                {errors.noShowRate && (
                  <p className="text-sm text-destructive">{errors.noShowRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  GCC avg: 8.5% (dental: 8.7%, diagnostics: 6.5%)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectedClaimsRate">
                  Claim Rejection Rate (%)
                </Label>
                <Input
                  id="rejectedClaimsRate"
                  type="number"
                  step="0.1"
                  placeholder="12"
                  {...register('rejectedClaimsRate', { valueAsNumber: true })}
                />
                {errors.rejectedClaimsRate && (
                  <p className="text-sm text-destructive">{errors.rejectedClaimsRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  GCC avg: 12% (dental: 12.5%, outpatient: 15.3%)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avgClaimValue">
                  Avg. Claim Value (SAR)
                </Label>
                <Input
                  id="avgClaimValue"
                  type="number"
                  placeholder="500"
                  {...register('avgClaimValue', { valueAsNumber: true })}
                />
                {errors.avgClaimValue && (
                  <p className="text-sm text-destructive">{errors.avgClaimValue.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeatVisitRate">
                  Repeat Visit Rate (%)
                </Label>
                <Input
                  id="repeatVisitRate"
                  type="number"
                  step="0.1"
                  placeholder="40"
                  {...register('repeatVisitRate', { valueAsNumber: true })}
                />
                {errors.repeatVisitRate && (
                  <p className="text-sm text-destructive">{errors.repeatVisitRate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  GCC avg: 44% (dental: 45%, outpatient: 52%)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate ROI
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

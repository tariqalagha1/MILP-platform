'use client';

import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Branch {
  id: string;
  name: string;
}

export const DEMO_BRANCHES: Branch[] = [
  { id: 'all', name: 'All Branches' },
  { id: 'branch-riyadh', name: 'Riyadh – Al Olaya' },
  { id: 'branch-jeddah', name: 'Jeddah – Al Hamra' },
  { id: 'branch-dammam', name: 'Dammam – Al Shati' },
];

interface BranchSelectorProps {
  value: string;
  onChange: (branchId: string) => void;
}

export function BranchSelector({ value, onChange }: BranchSelectorProps) {
  const handleChange = (val: string | null) => {
    if (val) onChange(val);
  };
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {DEMO_BRANCHES.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

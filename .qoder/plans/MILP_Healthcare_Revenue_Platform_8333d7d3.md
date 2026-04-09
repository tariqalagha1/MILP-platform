# MILP Healthcare Revenue Intelligence Platform

## Project Location
`/Users/tariqalagha/Desktop/NemoClaw-main/milp-platform/`

---

## Tech Stack
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk (multi-tenant organization support)
- **UI**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts (for future dashboards)
- **Forms**: React Hook Form + Zod validation

---

## Phase 1: Foundation + ROI Calculator (Days 1-14)

### Task 1: Project Initialization
```
milp-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Task 2: Database Schema (Prisma)
```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        Plan     @default(STARTER)
  branches    Branch[]
  createdAt   DateTime @default(now())
}

model Branch {
  id             String       @id @default(cuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId])
  appointments   Appointment[]
  claims         Claim[]
  roiCalculations ROICalculation[]
}

model ROICalculation {
  id                        String   @id @default(cuid())
  branchId                  String
  branch                    Branch   @relation(fields: [branchId])
  monthlyAppointments       Int
  avgAppointmentValue       Float    // SAR
  noShowRate               Float    // percentage 0-100
  rejectedClaimsRate       Float    // percentage 0-100
  avgClaimValue            Float    // SAR
  repeatVisitRate          Float    // percentage 0-100
  // Calculated outputs
  recoverableRevenue90Days Float
  annualizedSavings        Float
  createdAt               DateTime @default(now())
}

enum Plan { STARTER GROWTH ENTERPRISE }
```

### Task 3: ROI Calculator Logic (Core Business Engine)
```typescript
// src/lib/roi-calculator.ts
interface ROIInputs {
  monthlyAppointments: number;
  avgAppointmentValue: number;    // SAR
  noShowRate: number;              // 0-100
  rejectedClaimsRate: number;      // 0-100
  avgClaimValue: number;           // SAR
  repeatVisitRate: number;         // 0-100
}

interface ROIOutputs {
  // No-show recovery (assuming 40% reduction achievable)
  monthlyNoShowRevenue: number;
  recoveredNoShowRevenue90Days: number;
  
  // Claims recovery (assuming 50% of rejections recoverable)
  monthlyRejectedClaimsRevenue: number;
  recoveredClaimsRevenue90Days: number;
  
  // Repeat visit uplift (assuming 10% improvement)
  additionalRepeatVisits90Days: number;
  additionalRepeatRevenue90Days: number;
  
  // Totals
  totalRecoverable90Days: number;
  annualizedSavings: number;
}
```

### Task 4: ROI Calculator UI Components
- Input form with SAR currency formatting
- Real-time calculation preview
- Results display with SAR formatting
- Branch selector (multi-tenant)
- Save/export calculation option
- Mobile-responsive layout

### Task 5: Dashboard Layout (Shell for Future Modules)
```
Sidebar Navigation:
├── Dashboard (future)
├── ROI Calculator ✓
├── Claims Intelligence (coming soon)
├── Patient Follow-up (coming soon)
├── Reports (future)
└── Settings
```

---

## Phase 2: Claims Intelligence Module (Days 15-30)

### Task 6: Claims Data Model
```prisma
model Claim {
  id              String      @id @default(cuid())
  branchId        String
  branch          Branch      @relation(fields: [branchId])
  claimNumber     String
  patientId       String
  amount          Float
  status          ClaimStatus @default(SUBMITTED)
  rejectionReason String?
  rejectionRisk   Float?      // 0-100 AI score
  submittedAt     DateTime
  resolvedAt      DateTime?
}

enum ClaimStatus { SUBMITTED APPROVED REJECTED PENDING_REVIEW }
```

### Task 7: Claims Dashboard Features
- Rejection risk scoring algorithm
- Missing field detection rules
- Rejection trend charts
- Recovery workflow tracking

---

## Phase 3: Patient Follow-up Intelligence (Days 31-45)

### Task 8: Patient & Appointment Models
```prisma
model Patient {
  id           String        @id @default(cuid())
  branchId     String
  appointments Appointment[]
  noShowCount  Int           @default(0)
  lastVisitAt  DateTime?
}

model Appointment {
  id           String       @id @default(cuid())
  patientId    String
  patient      Patient      @relation(fields: [patientId])
  branchId     String
  branch       Branch       @relation(fields: [branchId])
  scheduledAt  DateTime
  status       ApptStatus   @default(SCHEDULED)
  value        Float
  reminderSent Boolean      @default(false)
}
```

### Task 9: No-Show Prediction & Reminders
- No-show risk scoring
- Overdue patient alerts
- Reminder workflow setup

---

## Phase 4: Executive Dashboard (Days 46-60)

### Task 10: KPI Dashboard
- No-show % by branch/doctor
- Claim rejection % trends
- Revenue leakage SAR totals
- Branch ranking comparison
- Doctor performance cards

---

## Immediate Next Steps

1. Initialize Next.js project with `npx create-next-app@latest`
2. Install dependencies (Prisma, Clerk, shadcn/ui, Recharts)
3. Set up PostgreSQL database (local or Supabase/Neon)
4. Configure Clerk authentication
5. Build ROI Calculator as first working feature

---

## Key Design Principles

1. **SAR-first formatting** - All currency displays in Saudi Riyals
2. **Multi-tenant by default** - Organization isolation from day one
3. **Mobile-responsive** - Clinic managers often use phones
4. **Export-ready** - PDF/image export for executive reports
5. **Modular architecture** - Each module can be developed independently
# MILP — Medical Intelligence & Leakage Prevention Platform
## Business Paper — v1.0

**Prepared by:** Tariq Alagha, Founder  
**Classification:** Confidential — Investor / Partner Use  
**Date:** April 2026

---

## EXECUTIVE SUMMARY

Healthcare providers across the GCC lose between 15% and 30% of billable revenue annually to
three preventable causes: insurance claim rejections, patient no-shows, and missed follow-up
appointments. Despite operating modern clinic management systems, most providers lack the
intelligence layer required to detect, measure, and recover this lost revenue in real time.

MILP — Medical Intelligence & Leakage Prevention — is a cloud-based Revenue Intelligence SaaS
Platform purpose-built for GCC and MENA healthcare providers. It connects to existing clinic
workflows and delivers a single, actionable dashboard that quantifies recoverable revenue,
flags rejection-risk claims before submission, and automates patient follow-up reminders.

The platform is designed for a single commercial outcome: provable SAR return within 14 to 60
days of deployment.

**Current status:** Platform v0.1.0 is fully built, production-hardened, and code-complete.
Deployment infrastructure is pending final provisioning.

---

## 1. THE PROBLEM

### 1.1 Revenue Leakage in GCC Healthcare

The GCC healthcare sector is one of the fastest-growing in the world. Saudi Arabia alone
targets SAR 490 billion in healthcare investment as part of Vision 2030. Yet a structural
inefficiency persists across the sector: providers are losing significant billable revenue
through processes they can neither measure nor act on systematically.

The three primary leakage vectors are:

**Claims Rejection Leakage**
- Average claims rejection rate in GCC: 8–15% of submitted claims
- Rejected claims that are never resubmitted: 30–40%
- Revenue lost per rejected claim left unresolved: SAR 800–3,500
- Root cause: missing authorization codes, incorrect procedure codes, timing errors

**No-Show Revenue Loss**
- Average no-show rate in GCC outpatient clinics: 8.5%
- Revenue impact per no-show: SAR 200–1,200 depending on specialty
- No-show slots that go unfilled: 60–70%
- Root cause: no automated predictive reminder or rebooking workflow

**Follow-up Attrition**
- Patients requiring follow-up who are not contacted within 30 days: 40–55%
- Revenue lost from lapsed patient relationships: compounding annually
- Root cause: manual follow-up workflows that fail at scale

### 1.2 The Technology Gap

Existing clinic management systems (Nphies, Nabidh, Oracle Health, iCare) provide billing
records and appointment logs. They do not provide:

- Real-time revenue leakage quantification
- Predictive rejection risk scoring before claim submission
- Automated no-show risk detection and intervention
- Multi-branch consolidated revenue intelligence

Clinic administrators and medical directors are making revenue recovery decisions based on
monthly reports, not real-time intelligence. By the time a rejection is reviewed, the appeal
window has often closed.

---

## 2. THE SOLUTION

### 2.1 Product Overview

MILP is a multi-tenant SaaS platform that sits above existing clinic management systems as an
intelligence and workflow layer. It does not replace PMS or EMR systems — it reads from them
and provides the revenue recovery actions they cannot.

The platform consists of five integrated modules:

**Module 1: ROI Calculator**
The entry point for every new customer. A clinic administrator inputs five metrics:
- Monthly appointment volume
- Average appointment value (SAR)
- Current no-show rate (%)
- Current claims rejection rate (%)
- Repeat visit rate (%)

The engine instantly outputs:
- Total recoverable revenue in the next 90 days (SAR)
- Annualized savings projection (SAR)
- Leakage breakdown by source
- Recovery opportunity breakdown
- Executive summary with actionable recommendations

This module is the commercial hook: it turns a sales conversation into a quantified business
case before a contract is signed.

**Module 2: Claims Intelligence**
Real-time claims monitoring with predictive rejection risk scoring.

- All submitted claims displayed with rejection risk score (0–100)
- Color-coded risk badges: High (red), Medium (yellow), Low (green)
- Missing field detection: flags which fields are absent before submission
- One-click workflow actions: Review, Resolve, Send Back, Mark Fixed
- Claim status tracking across the full lifecycle

**Module 3: Patient Follow-up Intelligence**
Automated patient retention and no-show prevention.

- Patient no-show risk scoring based on appointment history
- Automated follow-up scheduling for lapsed patients
- Reminder workflow integration (Twilio SMS, SendGrid email)
- Appointment status tracking: Scheduled, Completed, No-Show, Cancelled, Rescheduled

**Module 4: Executive Dashboard**
Consolidated revenue performance across all branches.

- Real-time KPIs: Total revenue, claims value, appointments, recovery rate
- Revenue leakage trend charts
- Multi-branch performance comparison
- Export-ready PDF/image reports for board-level presentations

**Module 5: Reports & Analytics**
Deep analytics for revenue cycle management.

- Revenue trend analysis by time period
- Payer performance breakdown (insurance provider analysis)
- Denial reason root-cause analytics
- Branch-level performance benchmarking

### 2.2 Key Product Principles

**SAR-First:** All calculations, dashboards, and reports display in Saudi Riyals with GCC
healthcare benchmarks built into the logic.

**ROI-Led, Not Feature-Led:** Every module is designed around a specific, measurable revenue
outcome. Features exist only in service of financial recovery.

**Multi-Tenant by Architecture:** Each clinic chain, hospital group, or independent clinic
operates as an isolated organization with branch-level granularity.

**Action-Oriented:** The platform does not produce reports for filing. Every insight is paired
with a recommended action and a workflow to execute it.

---

## 3. MARKET OPPORTUNITY

### 3.1 Target Market

**Primary:** Saudi Arabia, UAE, Kuwait — private healthcare sector
**Secondary:** Bahrain, Oman, Qatar, Jordan, Egypt

**Target Customer Segments:**

| Segment | Size | Monthly Revenue at Risk | MILP Plan |
|---------|------|------------------------|-----------|
| Single-branch clinics | 12,000+ in KSA | SAR 15,000–80,000 | Starter |
| Clinic chains (2–10 branches) | 800+ in GCC | SAR 150,000–500,000 | Growth |
| Hospital outpatient groups | 200+ in GCC | SAR 1M–5M+ | Enterprise |
| Diagnostic centers | 400+ in GCC | SAR 80,000–300,000 | Growth |
| Dental chains | 1,200+ in GCC | SAR 50,000–200,000 | Growth |

**Total Addressable Market (TAM):** ~USD 2.4 billion (GCC healthcare IT)
**Serviceable Addressable Market (SAM):** ~USD 380 million (revenue cycle management segment)
**Serviceable Obtainable Market (SOM, Year 3):** ~USD 12 million

### 3.2 Market Tailwinds

- Saudi Vision 2030 healthcare privatization driving technology adoption
- Nphies (Saudi unified claims platform) mandating digital submissions — increasing rejection
  rates during transition and creating urgent demand for claims intelligence
- UAE NABIDH compliance requirements accelerating digitization
- Post-COVID shift to value-based care models in GCC
- Healthcare operator consolidation: single-clinic operators acquiring branches and needing
  multi-site intelligence tools

---

## 4. BUSINESS MODEL

### 4.1 Pricing

MILP operates on a monthly SaaS subscription model with three tiers:

| Plan | Target | Price (SAR/month) | Key Limits |
|------|--------|-------------------|------------|
| **Starter** | Single clinic | 4,000 | 1 branch, 2 users, core modules |
| **Growth** | Clinic chains | 10,000–18,000 | 2–10 branches, 10 users, all modules |
| **Enterprise** | Hospital groups | Custom (250k–700k/year) | Unlimited branches, API access, dedicated support |

### 4.2 Revenue Mechanics

- **Monthly Recurring Revenue (MRR):** Primary revenue driver
- **Annual contracts:** 10% discount, improves cash flow predictability
- **Implementation fee:** One-time SAR 5,000–15,000 for onboarding and configuration
- **Professional services:** Custom reporting and integration work at SAR 500/hour

### 4.3 Unit Economics (Modeled)

| Metric | Starter | Growth |
|--------|---------|--------|
| Monthly contract value | SAR 4,000 | SAR 14,000 |
| Annual contract value | SAR 48,000 | SAR 168,000 |
| Customer LTV (3-year) | SAR 144,000 | SAR 504,000 |
| Target CAC | SAR 12,000 | SAR 35,000 |
| LTV:CAC ratio | 12x | 14x |
| Gross margin (target) | 82% | 82% |

### 4.4 Payback Period

A Growth-tier clinic chain recovering 15% additional revenue on a SAR 300,000/month revenue
base generates SAR 45,000/month in recovered revenue — paying back the MILP subscription
in under 10 days. This is the core commercial narrative.

---

## 5. COMPETITIVE LANDSCAPE

### 5.1 Competitive Matrix

| Competitor | Category | Strength | MILP Advantage |
|-----------|----------|----------|----------------|
| Oracle Health (Cerner) | Enterprise EMR | Market presence | Not GCC-specific; no revenue intelligence layer |
| iCare | GCC PMS | Local deployment | No AI/ML rejection prediction; no executive dashboards |
| Nphies Portal | Claims submission | Government mandate | Submission only; no intelligence or workflow |
| Nabidh (UAE) | Health data exchange | UAE coverage | Compliance tool, not revenue intelligence |
| Generic BI Tools (Power BI, Tableau) | Analytics | Flexibility | Requires custom build; no healthcare-specific logic |

### 5.2 Defensible Moats

1. **GCC Healthcare Domain Logic:** Benchmark data, Nphies/NABIDH compliance logic, SAR
   currency handling, Arabic-ready architecture — built in from day one, not retrofitted.

2. **Speed to Value:** ROI Calculator produces a business case in 60 seconds. No 6-month
   implementation cycle.

3. **Workflow Integration:** MILP acts on data, not just reports. Claims action buttons,
   patient reminder workflows, and branch benchmarks are embedded in the product.

4. **Data Network Effects:** As more GCC clinics use MILP, rejection pattern data improves
   risk scoring accuracy across the network.

---

## 6. TECHNOLOGY

### 6.1 Platform Architecture

MILP is built on a modern, cloud-native stack selected for performance, security, and
developer velocity:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 16 (App Router) | SSR/SSG performance, SEO for landing pages |
| Language | TypeScript | Type safety for healthcare-grade data handling |
| Database | PostgreSQL + Prisma ORM | Relational integrity for multi-tenant healthcare data |
| Authentication | Clerk | Multi-tenant org support, RBAC, MFA out of the box |
| UI Components | shadcn/ui + Tailwind CSS | Consistent, accessible, responsive design system |
| Charts | Recharts | Lightweight, customizable revenue visualization |
| Rate Limiting | Upstash Redis | Distributed, serverless-safe API throttling |
| Error Monitoring | Sentry | Real-time production error tracking and alerting |
| Hosting | Vercel | Edge-optimized, zero-config Next.js deployment |
| Forms | React Hook Form + Zod | Type-safe validation on clinical data inputs |

### 6.2 Security Architecture

Healthcare data requires healthcare-grade security controls. MILP implements:

- **Authentication:** Clerk-managed JWT sessions with token refresh and logout invalidation
- **Authorization:** Role-Based Access Control (RBAC) — admin, manager, standard_user, guest
- **Multi-tenancy:** Hard organization isolation at the database level; no cross-tenant data leakage possible
- **Input validation:** Zod schema validation on all API endpoints
- **Rate limiting:** Redis-backed distributed rate limiting — prevents API abuse and credential stuffing
- **Secrets management:** Environment variable separation; no credentials in source code
- **Audit trail:** Claim status changes tracked with timestamps and user attribution

### 6.3 Platform Status

**v0.1.0 — Production Hardened**

| Component | Status |
|-----------|--------|
| Application code | Complete |
| All 28 API routes | Implemented and tested |
| TypeScript build | Passing |
| Database migration | Ready for production deploy |
| Rollback SQL | Written and tested |
| Environment template | Documented |
| Release checklist | Prepared |
| GitHub repository | Pushed (tariqalagha1/MILP-platform) |

---

## 7. GO-TO-MARKET STRATEGY

### 7.1 Phase 1 — Anchor Customers (Months 1–3)

Target: 3–5 mid-size clinic chains in Riyadh or Jeddah as design partners.

- Free or heavily discounted onboarding in exchange for case study rights
- Direct founder-led sales through existing healthcare network contacts
- ROI Calculator as the primary lead conversion tool — demonstrate value before contract

### 7.2 Phase 2 — Channel Expansion (Months 4–9)

- Healthcare IT consultant partnerships (VAR / reseller channel)
- Nphies-registered billing companies as distribution partners
- Attendance and demo presence at Arab Health, Saudi Health exhibition

### 7.3 Phase 3 — Regional Scale (Months 10–24)

- UAE market entry targeting NABIDH-compliant operators
- Enterprise tier push to hospital outpatient groups
- Arabic-language interface full localization
- API integration partnerships with leading GCC PMS vendors

### 7.4 Marketing Channels

- **Content:** Revenue leakage benchmarks, GCC-specific rejection data — drives inbound
- **LinkedIn:** Targeting C-suite healthcare operators, CFOs, Revenue Cycle Managers
- **Direct outreach:** Warm introductions through healthcare founder networks
- **ROI Calculator as lead magnet:** Free tool generates personalized leakage report
- **Events:** Arab Health, Saudi Health, HIMSS Middle East

---

## 8. FINANCIAL PROJECTIONS

### 8.1 Three-Year Revenue Model

| Year | Customers | Avg MRR/Customer | Total ARR | Growth |
|------|-----------|-----------------|-----------|--------|
| Year 1 | 15 | SAR 8,000 | SAR 1.44M | — |
| Year 2 | 55 | SAR 10,000 | SAR 6.6M | 358% |
| Year 3 | 140 | SAR 12,500 | SAR 21M | 218% |

### 8.2 Operating Cost Model (Year 1)

| Category | SAR/Year |
|----------|----------|
| Infrastructure (hosting, services) | 120,000 |
| Personnel (2 FTE engineers) | 600,000 |
| Sales & marketing | 300,000 |
| Operations & legal | 100,000 |
| **Total OpEx** | **1,120,000** |

**Year 1 net position at 15 customers:** SAR 320,000 gross profit before team scaling.

### 8.3 Funding Requirement

**Seed Round Target:** USD 750,000 (SAR ~2.8M)

| Use of Funds | Allocation |
|-------------|-----------|
| Product engineering (2 senior engineers, 12 months) | 40% |
| Sales & BD (1 enterprise sales hire + marketing) | 30% |
| Infrastructure & operations | 15% |
| Legal, compliance, IP protection | 10% |
| Reserve | 5% |

**Milestone target with seed capital:** 30 paying customers by month 12, SAR 3M ARR run rate.

---

## 9. TEAM

### 9.1 Founder

**Tariq Alagha — Founder & CEO**

Domain expertise in GCC healthcare operations and technology. Led platform architecture,
product design, and full-stack engineering for MILP v0.1.0. Deep understanding of GCC
claims workflows, Nphies ecosystem, and clinic chain operational challenges.

### 9.2 Hiring Plan (Post-Seed)

| Role | Timeline | Priority |
|------|----------|----------|
| Senior Full-Stack Engineer | Month 1 | Critical |
| Enterprise Sales Manager (KSA) | Month 2 | Critical |
| Healthcare Customer Success Manager | Month 3 | High |
| Data Engineer (ML/AI pipeline) | Month 6 | Medium |
| UAE Business Development | Month 9 | Medium |

---

## 10. RISKS AND MITIGATIONS

| Risk | Severity | Mitigation |
|------|----------|------------|
| PMS integration complexity | High | Start with CSV import / manual data entry; build integrations post-revenue |
| Clinic IT adoption resistance | Medium | ROI Calculator creates pull demand; value is visible before login |
| Regulatory: patient data compliance | High | Nphies compliance architecture built in; no PHI stored — only aggregate financial metrics |
| Competition from large EMR vendors | Medium | Speed and focus advantage; enterprise vendors move slowly in feature segments |
| Sales cycle length | Medium | ROI Calculator shortens cycle from 6 months to 2–4 weeks |
| FX / SAR pricing sensitivity | Low | SAR-denominated pricing removes FX risk for GCC customers |

---

## 11. TRACTION & VALIDATION

### 11.1 Product Validation

- Platform v0.1.0 fully built and production-hardened
- 28 API routes implemented and tested
- Demo data seeded with realistic GCC healthcare scenarios
- Build passing; release checklist complete

### 11.2 Market Validation Signals

- Saudi Vision 2030 mandates: healthcare digitization is a government priority, not optional
- Nphies go-live (2021–2024) created a surge in claims rejection rates — the exact pain MILP solves
- Multiple GCC clinic operators have confirmed the no-show and claims rejection metrics used
  in MILP's ROI benchmarks from direct operational conversations

### 11.3 Next Milestones

| Milestone | Target Date |
|-----------|-------------|
| Production deployment live | Within 30 days |
| First paid pilot customer | 45 days |
| 3 paying anchor customers | 90 days |
| Seed round close | 120 days |

---

## 12. CONCLUSION

The GCC healthcare sector has a measurable, quantifiable, and urgent revenue leakage problem.
Existing tools do not solve it. MILP is purpose-built to solve exactly this problem, for
exactly this market, at exactly the right moment — as Nphies adoption accelerates, as clinic
chains scale, and as healthcare CFOs are being asked to prove financial performance to their
boards.

The platform is built. The market is validated. The commercial model is clear.

MILP is seeking strategic partners, pilot customers, and seed investors who want to participate
in the foundational infrastructure layer of GCC healthcare revenue intelligence.

---

## APPENDIX A — PLATFORM MODULES SUMMARY

| Module | Core Function | Key Output |
|--------|--------------|------------|
| ROI Calculator | Quantify leakage and recovery potential | SAR recovery projection |
| Claims Intelligence | Risk-score and action submitted claims | Rejection prevention + recovery |
| Patient Follow-up | Predict and prevent no-shows | Appointment recovery + retention |
| Executive Dashboard | Multi-branch consolidated KPIs | Board-ready performance view |
| Reports & Analytics | Deep revenue cycle analytics | Root cause + trend intelligence |

## APPENDIX B — TECHNICAL STACK SUMMARY

```
Application:  Next.js 16 + TypeScript
Database:     PostgreSQL + Prisma ORM
Auth:         Clerk (RBAC, multi-tenant)
UI:           shadcn/ui + Tailwind CSS v4
Charts:       Recharts
Infra:        Vercel + Supabase + Upstash Redis
Monitoring:   Sentry
Version:      v0.1.0 — production ready
Repository:   github.com/tariqalagha1/MILP-platform
```

## APPENDIX C — CONTACT

**Tariq Alagha**
Founder, MILP
GitHub: github.com/tariqalagha1/MILP-platform

---

*This document is confidential and intended solely for the recipient. All financial projections
are forward-looking estimates based on market research and operational modeling. Actual results
may differ.*

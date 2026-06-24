# IMPOSIFY — Product Requirements Document (PRD)

**Version:** 1.0.0
**Status:** Draft — For Review
**Classification:** Confidential
**Document Owner:** Product Management
**Last Updated:** June 2025

---

## TABLE OF CONTENTS

```
1.  Executive Summary
2.  Product Vision
3.  Mission Statement
4.  Market Analysis
5.  Competitor Analysis
6.  Problem Statement
7.  Business Objectives
8.  Product Objectives
9.  Success Metrics
10. User Personas
11. User Journey Maps
12. Functional Requirements
13. Non-Functional Requirements
14. User Stories
15. Acceptance Criteria
16. MVP Definition
17. Future Roadmap
18. Monetization Strategy
19. Risks and Assumptions
20. Product KPIs
21. Scalability Considerations
22. Accessibility Requirements
23. Internationalization Requirements
24. Appendix
```

---

## 1. EXECUTIVE SUMMARY

### 1.1 Document Purpose

This Product Requirements Document (PRD) defines the complete specification for **Imposify** — an intelligent, web-based PDF Imposition and Print Optimization Platform. This document serves as the authoritative reference for product, engineering, design, and business stakeholders throughout the product lifecycle.

### 1.2 Product Summary

Imposify is a cloud-native SaaS platform that transforms how students, professionals, educational institutions, coaching centers, and print shops prepare documents for printing. The platform automatically rearranges PDF pages into mathematically optimized print layouts — reducing paper consumption, cutting printing costs, eliminating configuration complexity, and enabling high-quality duplex, booklet, and n-up print outputs with zero technical knowledge required from end users.

### 1.3 Business Opportunity

The global commercial printing market is valued at approximately **$411 billion (2024)** with educational printing representing a significant vertical segment. In developing markets, particularly South Asia (India, Bangladesh, Nepal, Pakistan), millions of students print study materials every academic year. A browser-based print optimization tool targeting this underserved segment represents a compelling **freemium-to-premium conversion opportunity** with strong network effects through institutional adoption.

### 1.4 Strategic Position

Imposify is positioned as the **"Canva for Print Optimization"** — powerful enough for professional xerox operators, yet simple enough for first-year college students. The platform differentiates itself through intelligent layout recommendations, education-specific presets, and real-time cost savings visualization.

### 1.5 Key Metrics Targets (12 Months Post-Launch)

| Metric | Target |
|---|---|
| Registered Users | 50,000 |
| Monthly Active Users (MAU) | 15,000 |
| PDFs Processed | 500,000 |
| Paid Subscribers | 2,500 |
| Monthly Recurring Revenue (MRR) | $12,500 |
| Net Promoter Score (NPS) | ≥ 45 |

### 1.6 Investment Ask Context

This document supports a **Seed-stage fundraising narrative** for Imposify, demonstrating product-market fit evidence, technical feasibility, scalable architecture, and a defensible monetization model targeting an underpenetrated vertical in the global EdTech and PrintTech landscape.

---

## 2. PRODUCT VISION

### 2.1 Vision Statement

> **"To make intelligent printing accessible to every student, educator, and institution on the planet — eliminating paper waste, reducing costs, and empowering people to print smarter, not harder."**

### 2.2 Vision Elaboration

Imposify envisions a world where:

- **A student in Kolkata** never overpays for printing notes because the system automatically generates the optimal 9-up duplex layout
- **A coaching center in Delhi** processes 500 student handout PDFs in batch mode before every semester
- **A xerox shop in Lagos** uses Imposify as their primary document preparation tool, saving clients 40% on printing costs
- **A professor in Manila** creates perfectly formatted booklets for exam papers in under 60 seconds
- **A library in São Paulo** offers Imposify as a self-service kiosk tool for patrons

The platform evolves from a PDF utility into a **print intelligence layer** that understands document context, user behavior, and institutional patterns to deliver proactive optimization recommendations.

### 2.3 Three-Year Vision Arc

```
Year 1 (2025): Establish product-market fit
               → Core imposition engine
               → Student & individual user base
               → Freemium model validation

Year 2 (2026): Institutional penetration
               → B2B API offering
               → Coaching center & college partnerships
               → White-label product launch

Year 3 (2027): Platform ecosystem
               → AI-driven print intelligence
               → Print partner network integration
               → Global expansion to 15+ countries
```

---

## 3. MISSION STATEMENT

### 3.1 Mission

> **"Imposify exists to democratize intelligent document printing — making sophisticated print optimization tools accessible, affordable, and effortless for students, educators, and print professionals worldwide."**

### 3.2 Core Values

| Value | Definition |
|---|---|
| **Simplicity** | Complex algorithms, simple experience |
| **Accessibility** | Powerful tools for everyone, not just experts |
| **Sustainability** | Reduce paper waste through intelligent optimization |
| **Reliability** | Every generated PDF must be print-perfect |
| **Transparency** | Users always know what Imposify is doing and why |

### 3.3 Brand Promise

Every PDF processed through Imposify will be **cheaper to print, easier to read, and faster to generate** than anything the user could produce manually.

---

## 4. MARKET ANALYSIS

### 4.1 Total Addressable Market (TAM)

#### Global PDF and Document Management Market

| Segment | Market Size (2024) | CAGR |
|---|---|---|
| Global PDF Software Market | $2.8 Billion | 14.2% |
| Educational Printing Market | $67 Billion | 6.1% |
| Commercial Print Services | $411 Billion | 2.8% |
| Document Management Software | $7.2 Billion | 16.9% |

**TAM Estimate for Print Optimization SaaS:** ~$850 Million globally

#### India-Specific Market (Primary Target Market)

| Data Point | Value |
|---|---|
| Higher Education Enrollment | 43 Million students |
| Coaching Center Students | 12 Million+ |
| Engineering/Medical exam aspirants | 3.5 Million annually |
| Average annual printing spend per student | ₹3,000–₹8,000 |
| Xerox/Print shops in India | 500,000+ |
| Digital-first students (smartphones) | 78% |

**Indian SAM Estimate:** ~$120 Million annually in print optimization tooling

### 4.2 Serviceable Addressable Market (SAM)

**Target:** Students, coaching centers, educational institutions, and print shops in India, Bangladesh, and Southeast Asia who actively print study materials and are digitally literate enough to use web-based tools.

**SAM Estimate:** ~$45 Million (Year 1–2 focus)

### 4.3 Serviceable Obtainable Market (SOM)

**Realistic 3-year capture:** ~$3–5 Million in ARR through freemium conversion, institutional licensing, and API access fees.

### 4.4 Market Drivers

```
+--------------------------------------------------+
|              MARKET DRIVERS                      |
|                                                  |
|  📚 Rising PDF-based educational content         |
|  💸 Student budget sensitivity                   |
|  🌍 Growing internet penetration in South Asia   |
|  📱 Mobile-first generation demanding web tools  |
|  🌿 Institutional sustainability mandates        |
|  ☁️  Cloud adoption in educational institutions  |
|  📈 GATE/UPSC/JEE coaching industry growth       |
+--------------------------------------------------+
```

### 4.5 Market Trends

1. **Remote Learning Residual Effect:** Post-COVID, students have accumulated massive digital study material libraries that they periodically need to print
2. **Environmental Consciousness:** Institutional paper reduction targets drive demand for waste-reducing print tools
3. **API Economy Growth:** Print shops are increasingly looking for software integrations
4. **EdTech Monetization Shift:** Students are increasingly willing to pay for productivity tools that deliver demonstrable ROI
5. **Micro-SaaS Acceptance:** Users in tier-2 and tier-3 cities are becoming comfortable with subscription software

### 4.6 Market Segmentation

#### By User Type

| Segment | Size | Willingness to Pay | Priority |
|---|---|---|---|
| Individual Students | 43M (India) | Low-Medium | High (volume) |
| Coaching Centers | 15,000+ institutes | High | High (revenue) |
| College Libraries | 1,500+ | Medium-High | Medium |
| Xerox/Print Shops | 500,000+ | Medium | High (daily use) |
| Corporate Offices | Large | High | Low (MVP) |
| Individual Professionals | Medium | High | Medium |

#### By Geography (Phase 1)

```
Priority 1: India (West Bengal, Delhi, Maharashtra, UP, Tamil Nadu)
Priority 2: Bangladesh (Dhaka, Chittagong)
Priority 3: Nepal, Sri Lanka
Priority 4: Southeast Asia (Philippines, Indonesia)
Priority 5: MENA, Africa (Year 2+)
```

---

## 5. COMPETITOR ANALYSIS

### 5.1 Competitive Landscape Overview

```
                    HIGH CAPABILITY
                          │
                          │  ● Adobe Acrobat Pro
                          │
     EDUCATION      ────────────────     ENTERPRISE
     FOCUSED              │              FOCUSED
                          │  ● Quite Imposing
         ● Imposify       │
         (Target)         │  ● Montax Imposer
                          │
                          │  ● imposition.online
                          │
                    LOW CAPABILITY
```

### 5.2 Direct Competitor Analysis

#### 5.2.1 Adobe Acrobat Pro DC

| Attribute | Details |
|---|---|
| **Pricing** | $19.99/month (Individual) |
| **Strengths** | Industry standard, comprehensive features, trusted brand |
| **Weaknesses** | Expensive, complex UI, desktop-heavy, overkill for students |
| **Market Position** | Enterprise/Professional |
| **Imposify Advantage** | 80% cheaper, purpose-built for print optimization, no learning curve |

#### 5.2.2 Quite Imposing (Adobe Plugin)

| Attribute | Details |
|---|---|
| **Pricing** | $295 one-time |
| **Strengths** | Professional-grade imposition, widely used in print industry |
| **Weaknesses** | Requires Adobe Acrobat, desktop only, high cost, non-intuitive |
| **Market Position** | Professional Print Industry |
| **Imposify Advantage** | Web-based, no dependencies, student pricing, simpler UX |

#### 5.2.3 imposition.online

| Attribute | Details |
|---|---|
| **Pricing** | Free (basic) |
| **Strengths** | Free, web-based, functional |
| **Weaknesses** | No presets, poor UX, no accounts, no history, no AI features |
| **Market Position** | Utility tool |
| **Imposify Advantage** | Saved presets, user accounts, AI recommendations, preview, cost estimation |

#### 5.2.4 PDF24 / ILovePDF

| Attribute | Details |
|---|---|
| **Pricing** | Free / $6/month |
| **Strengths** | Multi-tool PDF platform, established user base |
| **Weaknesses** | Generic, no imposition specialization, basic n-up only |
| **Market Position** | General PDF tooling |
| **Imposify Advantage** | Deep imposition specialization, education presets, cost calculator |

#### 5.2.5 Booklet Creator (macOS)

| Attribute | Details |
|---|---|
| **Pricing** | $9.99 one-time |
| **Strengths** | Clean UX, good booklet mode |
| **Weaknesses** | macOS only, single layout type, no cloud, no presets |
| **Market Position** | Consumer macOS |
| **Imposify Advantage** | Cross-platform web, multiple layouts, institutional features |

### 5.3 Competitive Advantage Matrix

| Feature | Imposify | Adobe | imposition.online | ILovePDF | Quite Imposing |
|---|---|---|---|---|---|
| Web-based | ✅ | ❌ | ✅ | ✅ | ❌ |
| Student Pricing | ✅ | ❌ | ✅ | ✅ | ❌ |
| Education Presets | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI Recommendations | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cost Estimator | ✅ | ❌ | ❌ | ❌ | ❌ |
| Saved History | ✅ | ✅ | ❌ | ❌ | ✅ |
| Batch Processing | ✅ | ✅ | ❌ | ✅ | ✅ |
| Booklet Mode | ✅ | ✅ | ✅ | ❌ | ✅ |
| 9-Up Layout | ✅ | ✅ | ✅ | ❌ | ✅ |
| Preset Manager | ✅ | ❌ | ❌ | ❌ | ❌ |

### 5.4 Competitive Positioning Statement

> *"Unlike general-purpose PDF tools that treat print optimization as an afterthought, Imposify is purpose-built for the print-optimization workflow — combining professional-grade imposition algorithms with education-specific intelligence, at a price point accessible to every student."*

### 5.5 Barriers to Entry (Moats)

1. **Educational Preset Library:** Curated, community-validated presets for GATE, MAKAUT, JEE, UPSC, etc.
2. **Imposition Algorithm Quality:** Mathematically verified page ordering with visual proof
3. **User Processing History:** Lock-in through institutional memory
4. **Network Effects:** Shared presets between users in the same institution
5. **API Partnerships:** Integration with print shop POS systems

---

## 6. PROBLEM STATEMENT

### 6.1 Primary Problem

Students and educational institutions face a **systematic inefficiency** in preparing PDFs for cost-effective printing. The gap between downloading a study material and having a printer-ready, economically optimized file requires either expensive software knowledge or manual page rearrangement — both unacceptable for the target user base.

### 6.2 Problem Decomposition

#### Problem 1: Financial — High Printing Costs

```
Scenario: A student prints 200-page notes for GATE preparation

Without Imposify:
- 200 pages × ₹2/page (single-sided) = ₹400
- Or manual 2-up attempt with incorrect margins = ₹220 + errors

With Imposify (9-up duplex optimized):
- 200 pages → 23 sheets (200 ÷ 9 ≈ 23 sheets, duplex)
- 23 sheets × ₹2/side × 2 sides = ₹92
- Savings: ₹308 (77% reduction per print job)
```

#### Problem 2: Technical — Incorrect Page Ordering

Manual duplex page reordering for booklet printing requires understanding **printer imposition mathematics**. For a 20-page booklet:

```
Incorrect (what users attempt):
Front: [1, 2, 3, 4, 5]   → Pages don't align when folded
Back:  [6, 7, 8, 9, 10]

Correct (imposition formula):
Front: [20, 1, 2, 19] on sheet 1
       [18, 3, 4, 17] on sheet 2
       [16, 5, 6, 15] on sheet 3
Back:  Correspondingly calculated

Result: When folded and stapled → Pages 1, 2, 3...20 in correct order
```

**99% of students cannot perform this calculation manually.**

#### Problem 3: Operational — Time Waste in Print Shops

Xerox shop operators spend **15–20 minutes per customer** manually configuring printer settings for duplex, n-up, and booklet jobs. Imposify reduces this to **under 60 seconds**.

#### Problem 4: Environmental — Paper Waste

A student printing the same 200-page notes without optimization uses **200 sheets**. Optimized 9-up duplex printing uses **23 sheets** — an **88.5% reduction** in paper consumption.

#### Problem 5: Experience — Poor Print Quality from Manual Attempts

Incorrect margin settings, misaligned pages, and wrong scaling from manual print dialog configurations result in **unreadable notes** — forcing students to reprint, doubling both cost and waste.

### 6.3 Problem Validation Evidence

| Evidence Type | Data |
|---|---|
| Student survey (informal) | 84% of students said they print notes suboptimally due to lack of tools |
| Print shop interviews | Operators report 30%+ of customers need help configuring duplex settings |
| Reddit/Quora searches | 10,000+ monthly searches for "print PDF notes 2 per page", "booklet print PDF" |
| Google Trends | "PDF print optimization" — steady upward trend since 2020 |
| Academic literature | Studies show 40-60% of academic printing is single-sided when duplex is available |

### 6.4 Problem Statement Summary

> **"Students and print professionals lack an accessible, intelligent, and reliable tool to transform standard PDFs into optimized print layouts — resulting in excessive printing costs, paper waste, poor print quality, and significant time loss."**

---

## 7. BUSINESS OBJECTIVES

### 7.1 Short-Term Business Objectives (0–12 Months)

| ID | Objective | Target | Timeline |
|---|---|---|---|
| BO-01 | Achieve product-market fit | NPS ≥ 40, retention > 40% M1 | Month 6 |
| BO-02 | Build initial user base | 50,000 registered users | Month 12 |
| BO-03 | Validate freemium model | 5% free-to-paid conversion | Month 12 |
| BO-04 | Establish brand in student community | Top 3 organic rank for key terms | Month 10 |
| BO-05 | Generate initial revenue | MRR ≥ $12,500 | Month 12 |
| BO-06 | Secure institutional pilot customers | 5 coaching centers or colleges | Month 9 |

### 7.2 Medium-Term Business Objectives (12–24 Months)

| ID | Objective | Target | Timeline |
|---|---|---|---|
| BO-07 | Scale to institutional B2B | 50+ institutional accounts | Month 24 |
| BO-08 | Launch API product | 10 API integrations | Month 20 |
| BO-09 | Expand geography | 3 countries | Month 24 |
| BO-10 | Raise Seed/Series A funding | $500K–$2M | Month 18 |
| BO-11 | Build partner network | 100+ print shop partners | Month 24 |
| BO-12 | Achieve operational breakeven | Revenue ≥ Costs | Month 20 |

### 7.3 Long-Term Business Objectives (24–36 Months)

| ID | Objective | Target | Timeline |
|---|---|---|---|
| BO-13 | Global platform presence | 10+ countries | Month 36 |
| BO-14 | Launch white-label product | 5 white-label clients | Month 30 |
| BO-15 | Build AI print intelligence engine | Patentable algorithm | Month 32 |
| BO-16 | Achieve $5M ARR | — | Month 36 |

---

## 8. PRODUCT OBJECTIVES

### 8.1 Core Product Objectives

| ID | Objective | Metric | Priority |
|---|---|---|---|
| PO-01 | Deliver accurate PDF imposition for all supported layouts | 100% correct page ordering | P0 |
| PO-02 | Enable PDF upload-to-download in under 30 seconds | Processing time < 30s for PDFs < 50MB | P0 |
| PO-03 | Provide intuitive UX requiring zero training | Task completion without instructions > 85% | P0 |
| PO-04 | Support all major PDF standards and versions | PDF 1.4 through PDF 2.0 compatibility | P0 |
| PO-05 | Deliver print cost savings visualization | Savings calculator accuracy ≥ 95% | P1 |
| PO-06 | Enable preset creation and management | Full CRUD preset operations | P1 |
| PO-07 | Provide real-time PDF preview before download | Preview renders within 5 seconds | P1 |
| PO-08 | Support batch PDF processing | Up to 10 files per batch (Pro plan) | P2 |
| PO-09 | Deliver AI-powered layout recommendations | Recommendation accepted rate > 60% | P2 |
| PO-10 | Enable secure cloud storage of processed files | Files retained per plan specification | P2 |

### 8.2 Technical Product Objectives

| ID | Objective | Target |
|---|---|---|
| TPO-01 | System uptime | 99.5% SLA |
| TPO-02 | PDF processing accuracy | Zero page ordering errors |
| TPO-03 | Concurrent user support | 500+ simultaneous processing jobs |
| TPO-04 | Data security | GDPR compliant, files encrypted at rest |
| TPO-05 | Mobile responsiveness | Full functionality on 375px+ screens |
| TPO-06 | API response time | < 200ms for non-processing endpoints |

### 8.3 User Experience Objectives

| ID | Objective | Target |
|---|---|---|
| UXO-01 | Time to first successful PDF download | < 3 minutes for new users |
| UXO-02 | Error recovery | All errors handled with clear, actionable messages |
| UXO-03 | Accessibility compliance | WCAG 2.1 AA |
| UXO-04 | Onboarding completion rate | > 70% |
| UXO-05 | Feature discoverability | Core features found without help: > 80% users |

---

## 9. SUCCESS METRICS

### 9.1 North Star Metric

> **"Number of optimized PDF pages successfully generated per month"**

This metric captures both user growth (more users → more PDFs) and engagement depth (power users process more pages) while directly representing value delivered.

### 9.2 Metric Framework (AARRR Model)

#### 9.2.1 Acquisition

| Metric | Definition | Target (Month 12) |
|---|---|---|
| Monthly New Registrations | New accounts created per month | 8,000 |
| CAC (Customer Acquisition Cost) | Total marketing spend ÷ new paid users | < $8 |
| Organic Traffic | Monthly website visitors via search | 40,000 |
| Viral Coefficient | Avg. referrals per active user | ≥ 0.3 |
| Sign-up Conversion Rate | Visitors who register | ≥ 12% |

#### 9.2.2 Activation

| Metric | Definition | Target |
|---|---|---|
| Time to First PDF Processed | From registration to first download | < 5 minutes |
| Activation Rate | Users who process a PDF within 24h of signup | ≥ 65% |
| Onboarding Completion | Users completing the onboarding flow | ≥ 70% |
| First-Session Success Rate | Users who successfully download a PDF | ≥ 80% |

#### 9.2.3 Retention

| Metric | Definition | Target |
|---|---|---|
| Day-7 Retention | Users active on Day 7 post-signup | ≥ 35% |
| Day-30 Retention | Users active in Month 1 | ≥ 20% |
| Monthly Active Users (MAU) | Unique users processing at least 1 PDF | 15,000 |
| PDFs per Active User / Month | Engagement depth | ≥ 4 |
| Preset Creation Rate | Users who create ≥ 1 preset | ≥ 25% |

#### 9.2.4 Revenue

| Metric | Definition | Target (Month 12) |
|---|---|---|
| MRR | Monthly Recurring Revenue | $12,500 |
| ARPU | Average Revenue Per User | $5.00 |
| Free-to-Paid Conversion | % free users upgrading | ≥ 5% |
| Churn Rate | Monthly paid user cancellations | ≤ 5% |
| LTV (Lifetime Value) | Avg. revenue per paid user lifetime | ≥ $45 |
| LTV:CAC Ratio | — | ≥ 3:1 |

#### 9.2.5 Referral

| Metric | Definition | Target |
|---|---|---|
| NPS Score | Net Promoter Score | ≥ 45 |
| Referral Rate | % users who refer ≥ 1 person | ≥ 8% |
| Organic Word-of-Mouth | % signups from referral | ≥ 30% |

### 9.3 Product Quality Metrics

| Metric | Target |
|---|---|
| PDF Processing Success Rate | ≥ 99.5% |
| Average Processing Time (50MB PDF) | < 30 seconds |
| P99 Processing Time | < 90 seconds |
| Bug Report Rate | < 0.1% of processed PDFs |
| Support Ticket Rate | < 2% of MAU per month |
| CSAT Score | ≥ 4.2 / 5.0 |

---

## 10. USER PERSONAS

### 10.1 Persona 1 — "Struggling Student" (Primary)

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA 1: ARJUN SHARMA                                        │
│  "The Budget-Conscious Engineering Student"                     │
├─────────────────────────────────────────────────────────────────┤
│  Age: 21    |  Location: Kolkata, West Bengal                   │
│  Education: B.Tech (3rd Year, MAKAUT)                           │
│  Income: Student — ₹2,000/month pocket money                    │
│  Tech Proficiency: Medium                                       │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  Arjun is a third-year ECE student preparing for both          │
│  semester exams and GATE simultaneously. He downloads           │
│  PDF notes from Telegram groups and faculty portals             │
│  regularly. Each semester, he prints 1,000–1,500 pages         │
│  of notes at the local xerox shop.                              │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Reduce monthly printing bill                                 │
│  • Organize notes efficiently for revision                      │
│  • Avoid carrying heavy stacks of paper                         │
│  • Print before exams quickly and reliably                      │
├─────────────────────────────────────────────────────────────────┤
│  FRUSTRATIONS                                                   │
│  • Spends ₹600–800/month on printing (too expensive)           │
│  • Printed wrong-order booklets and had to reprint             │
│  • Doesn't know how to use printer duplex settings             │
│  • Xerox shops charge extra for "formatting"                    │
│  • Adobe Acrobat is expensive and complicated                   │
├─────────────────────────────────────────────────────────────────┤
│  BEHAVIORS                                                      │
│  • Accesses internet primarily on smartphone                    │
│  • Uses WhatsApp, Telegram for academic sharing                 │
│  • Price-sensitive but will pay for proven value               │
│  • Discovers tools through college friends/WhatsApp groups     │
│  • Studies in groups — shared tool usage is common             │
├─────────────────────────────────────────────────────────────────┤
│  IMPOSIFY USE CASE                                              │
│  → Uploads GATE 2024 notes PDF (300 pages)                     │
│  → Selects "GATE Notes Mode" preset                            │
│  → Downloads 9-up duplex optimized PDF                         │
│  → Takes to xerox shop: 300 pages → 34 sheets                 │
│  → Saves ₹466 on this print job alone                         │
├─────────────────────────────────────────────────────────────────┤
│  QUOTE: "If it saves me ₹400 every time I print, I'll use     │
│  it every week. I just need it to work without confusion."     │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Persona 2 — "Coaching Center Operator" (High Revenue)

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA 2: PRIYA MEHTA                                         │
│  "The Coaching Institute Manager"                               │
├─────────────────────────────────────────────────────────────────┤
│  Age: 35    |  Location: Patna, Bihar                           │
│  Role: Academic Operations Manager, Target Coaching            │
│  Institute size: 800 students enrolled                          │
│  Tech Proficiency: Medium-High                                  │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  Priya manages academic material distribution for a            │
│  mid-sized IIT-JEE coaching institute. Every month,            │
│  she coordinates printing of handouts, test papers,            │
│  and module PDFs for 800 students across 12 batches.           │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Reduce material printing budget by 30%+                     │
│  • Standardize print formats across all batches                │
│  • Process multiple PDFs quickly before class schedules        │
│  • Maintain quality while reducing paper usage                 │
│  • Simplify workflow for junior staff                          │
├─────────────────────────────────────────────────────────────────┤
│  FRUSTRATIONS                                                   │
│  • Printing costs ₹40,000–60,000/month                        │
│  • Different staff format documents inconsistently            │
│  • No standard tool for batch print preparation               │
│  • Adobe licenses too expensive for all staff PCs             │
│  • Manual formatting takes 2-3 hours per batch of PDFs        │
├─────────────────────────────────────────────────────────────────┤
│  IMPOSIFY USE CASE                                              │
│  → Creates "JEE Notes" institutional preset                    │
│  → Batch uploads 15 module PDFs                               │
│  → All processed in 5 minutes with consistent formatting      │
│  → Downloads and sends to print vendor directly               │
│  → Saves ₹18,000/month in paper costs                        │
│  → Saves 3 hours/week in staff time                          │
├─────────────────────────────────────────────────────────────────┤
│  WILLINGNESS TO PAY: ₹2,000–₹5,000/month for team plan       │
│  QUOTE: "If this saves me ₹15,000 a month, a ₹3,000          │
│  subscription is an obvious decision."                         │
└─────────────────────────────────────────────────────────────────┘
```

### 10.3 Persona 3 — "Xerox Shop Owner" (Volume Partner)

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA 3: RAMESH KUMAR                                        │
│  "The Digital-Savvy Print Entrepreneur"                         │
├─────────────────────────────────────────────────────────────────┤
│  Age: 42    |  Location: Delhi University North Campus          │
│  Role: Owner, Ramesh Digital Print & Xerox                     │
│  Daily Volume: 3,000–5,000 pages/day                           │
│  Tech Proficiency: Low-Medium                                   │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  Ramesh has run a xerox shop near a major university for       │
│  12 years. His peak seasons are exam time and semester         │
│  start. He serves 80–150 students per day. Students            │
│  frequently ask for "4 on 1" or "booklet print" but he        │
│  struggles to configure jobs correctly every time.             │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Process student print jobs faster                           │
│  • Reduce configuration errors and reprints                    │
│  • Offer value-added services (imposition) for premium price  │
│  • Build reputation as "smart print shop"                      │
├─────────────────────────────────────────────────────────────────┤
│  IMPOSIFY USE CASE                                              │
│  → Student brings USB with PDF                                 │
│  → Ramesh uploads to Imposify on shop PC                      │
│  → Selects student's preferred layout in 30 seconds           │
│  → Downloads print-ready PDF and sends to printer             │
│  → Charges student ₹5 premium for "smart print" service       │
│  → Handles 30+ such jobs/day = extra ₹4,500/month revenue    │
├─────────────────────────────────────────────────────────────────┤
│  WILLINGNESS TO PAY: ₹500–₹1,500/month (shop plan)           │
│  QUOTE: "Earlier I had to tell students I can't do booklet    │
│  print. Now it's my most popular service."                     │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Persona 4 — "Academic Professional" (Premium User)

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA 4: DR. ANANYA ROY                                      │
│  "The Research-Oriented Educator"                               │
├─────────────────────────────────────────────────────────────────┤
│  Age: 38    |  Location: Chennai, Tamil Nadu                    │
│  Role: Assistant Professor, Anna University                    │
│  Tech Proficiency: High                                         │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  Dr. Roy regularly creates handouts, lecture notes, and        │
│  exam papers for her 200+ students. She also publishes         │
│  academic papers and needs to create formatted print copies    │
│  for conferences. She values precision and professional        │
│  output quality.                                               │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Create professional booklets for lectures                   │
│  • Watermark exam papers with institution branding             │
│  • Add page numbers to multi-section handouts                  │
│  • Save processed files for reuse each semester                │
├─────────────────────────────────────────────────────────────────┤
│  IMPOSIFY USE CASE                                              │
│  → Uploads 40-page exam paper PDF                             │
│  → Applies institution watermark and page numbering           │
│  → Generates booklet-mode imposed PDF                         │
│  → Saves as "Exam Paper Preset" for reuse                    │
│  → Processes 3 subject exam papers in 5 minutes              │
├─────────────────────────────────────────────────────────────────┤
│  WILLINGNESS TO PAY: $15–$25/month (Professional plan)        │
│  QUOTE: "I need precision. If it handles watermarks and        │
│  booklet mode reliably, it replaces three separate tools."    │
└─────────────────────────────────────────────────────────────────┘
```

### 10.5 Persona 5 — "System Administrator" (Institutional Buyer)

```
┌─────────────────────────────────────────────────────────────────┐
│  PERSONA 5: VIKRAM NAIR                                         │
│  "The IT Procurement Decision Maker"                            │
├─────────────────────────────────────────────────────────────────┤
│  Age: 45    |  Location: Kochi, Kerala                          │
│  Role: Head of IT, Government Engineering College              │
│  Tech Proficiency: Very High                                    │
├─────────────────────────────────────────────────────────────────┤
│  BACKGROUND                                                     │
│  Vikram oversees technology procurement for a 5,000-student   │
│  engineering college. He evaluates software based on           │
│  security, compliance, uptime, and ROI. He approves the       │
│  annual print infrastructure budget of ₹8 lakhs.              │
├─────────────────────────────────────────────────────────────────┤
│  GOALS                                                          │
│  • Reduce institutional print budget                           │
│  • Standardize print software across departments               │
│  • Ensure data security for exam papers                        │
│  • Single-sign-on and user management capability              │
│  • Audit logs for compliance                                   │
├─────────────────────────────────────────────────────────────────┤
│  IMPOSIFY USE CASE                                              │
│  → Evaluates Imposify Enterprise plan                         │
│  → Reviews security documentation and compliance certs        │
│  → Runs pilot with Computer Science department (100 users)    │
│  → Deploys college-wide with SSO integration                  │
│  → Manages 500 user accounts through admin dashboard          │
├─────────────────────────────────────────────────────────────────┤
│  WILLINGNESS TO PAY: ₹50,000–₹1,50,000/year (Enterprise)     │
│  QUOTE: "Show me the security audit, the uptime SLA, and      │
│  the ROI calculation. Then we can talk deployment."           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. USER JOURNEY MAPS

### 11.1 Arjun's Journey — First-Time Student User

```
STAGE:        Discovery → Registration → First Use → Habit → Advocacy

┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY                                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Actions:    Hears about Imposify from WhatsApp study group                      │
│             Clicks shared link, lands on homepage                               │
│             Reads "Save 80% on printing" headline                               │
│                                                                                 │
│ Thoughts:   "This sounds too good to be true"                                  │
│             "Is it free? Will it work for my GATE notes?"                      │
│                                                                                 │
│ Emotions:   😐 Curious but skeptical                                           │
│                                                                                 │
│ Touchpoints: WhatsApp → Landing Page → Hero Demo Video                         │
│                                                                                 │
│ Opportunities: Show instant social proof (X pages saved today)                 │
│                Offer "Try without signup" for first PDF                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: REGISTRATION                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Actions:    Clicks "Start Free" button                                          │
│             Registers with Google account (1-click)                            │
│             Skips optional onboarding details                                   │
│                                                                                 │
│ Thoughts:   "Hope this doesn't spam me"                                        │
│             "Quick, the Google signup is easy"                                 │
│                                                                                 │
│ Emotions:   🙂 Cautiously optimistic                                           │
│                                                                                 │
│ Touchpoints: Sign-up Page → Email Verification → Dashboard                    │
│                                                                                 │
│ Friction Points: Email verification step (consider skipping for Google auth)  │
│ Opportunities: Show "You can process 5 PDFs free every month" immediately     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: FIRST USE (KEY MOMENT)                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Actions:    Sees clean upload interface immediately                             │
│             Drags and drops GATE Notes PDF (150 pages)                         │
│             Selects "GATE Notes Mode" preset                                   │
│             Sees live cost comparison: "₹300 → ₹68 estimated savings"         │
│             Clicks "Generate Imposed PDF"                                       │
│             Processing spinner runs for 18 seconds                             │
│             Downloads PDF, previews on phone                                   │
│             Takes to xerox shop — pages print correctly                        │
│                                                                                 │
│ Thoughts:   "Wait, it actually worked perfectly"                               │
│             "I saved ₹232 on this one job"                                    │
│                                                                                 │
│ Emotions:   😮 Surprised → 😃 Delighted → 🤩 Converted                       │
│                                                                                 │
│ AHA MOMENT: When he sees the actual cost savings in rupees before downloading │
│                                                                                 │
│ Opportunities: Immediate celebration animation on download                     │
│                "Share how much you saved" social sharing widget                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: HABIT FORMATION                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Actions:    Returns 3x in first week for different subject PDFs                │
│             Creates custom "Arjun's Exam Notes" preset                        │
│             Hits 5 PDF/month free limit                                        │
│             Sees upgrade prompt with savings history: "You've saved ₹1,450"  │
│             Upgrades to Student Plan (₹99/month)                               │
│                                                                                 │
│ Emotions:   😊 Satisfied → 💡 Sees value → 💳 Willingness to pay             │
│                                                                                 │
│ Opportunities: Savings milestone notifications ("You've saved ₹1,000!")       │
│                "Invite friends, get 1 free month" referral trigger             │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: ADVOCACY                                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Actions:    Shares Imposify in class WhatsApp group                            │
│             Invites 3 friends → Gets 1 month free                             │
│             Writes review on college tech blog                                 │
│             Recommends to xerox shop owner                                     │
│                                                                                 │
│ Emotions:   🌟 Pride (discovered a valuable tool)                              │
│             🤝 Contributing to friend group's savings                          │
│                                                                                 │
│ Opportunities: Share-to-save mechanics                                         │
│                Community showcase: "Users like Arjun have saved 5 lakh pages" │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Priya's Journey — Institutional Buyer

```
STAGE: Problem Awareness → Evaluation → Trial → Procurement → Expansion

Discovery → Googles "batch PDF print formatter for coaching center"
          → Finds Imposify through blog post or LinkedIn ad
          → Downloads case study: "How XYZ Coaching saved ₹2L/year"

Evaluation → Creates free account, tests with 3 module PDFs
           → Invites 1 staff member to test batch processing
           → Calculates ROI: "₹18,000/month savings vs ₹3,000/month plan"

Purchase   → Requests custom invoice for institutional billing
           → Signs up for 6-month Team Plan

Expansion  → Adds 5 more staff members
           → Creates 8 institutional presets
           → Requests API access for integration with their LMS

Advocacy   → Refers to 2 partner coaching institutes
```

### 11.3 Critical Path (Minimum Journey for Value Delivery)

```
Upload PDF (< 30 sec) → Select Preset (< 15 sec) → Generate (< 30 sec) → Download → Print ✅
Total: Under 2 minutes from intent to printer-ready file
```

---

## 12. FUNCTIONAL REQUIREMENTS

### 12.1 Module 1: Authentication and User Management

#### FR-AUTH-001: User Registration

| Attribute | Specification |
|---|---|
| **Requirement** | Users shall be able to create an account using email/password or OAuth |
| **OAuth Providers** | Google, GitHub |
| **Email Validation** | RFC 5322 compliant, verified via confirmation email |
| **Password Policy** | Minimum 8 characters, 1 uppercase, 1 number, 1 special character |
| **Duplicate Prevention** | System prevents duplicate email registration |
| **Priority** | P0 — MVP |

#### FR-AUTH-002: User Login

| Attribute | Specification |
|---|---|
| **Requirement** | Users shall log in via email/password or OAuth SSO |
| **Session Management** | JWT tokens, 7-day refresh token expiry |
| **Remember Me** | Optional persistent session (30 days) |
| **Failed Attempts** | Account lockout after 5 consecutive failures (15-minute lock) |
| **MFA** | Optional TOTP-based two-factor authentication |
| **Priority** | P0 — MVP |

#### FR-AUTH-003: Password Management

| Attribute | Specification |
|---|---|
| **Reset Flow** | Email-based password reset link (valid 1 hour) |
| **Change Password** | Requires current password confirmation |
| **Security** | bcrypt hashing with salt (cost factor 12) |
| **Priority** | P0 — MVP |

#### FR-AUTH-004: User Profile Management

| Attribute | Specification |
|---|---|
| **Editable Fields** | Name, email, profile photo, institution name, preferred presets |
| **Account Deletion** | GDPR-compliant account and data deletion within 30 days |
| **Export Data** | User can download their processing history as CSV |
| **Priority** | P1 |

---

### 12.2 Module 2: PDF Upload and Management

#### FR-UPLOAD-001: File Upload

| Attribute | Specification |
|---|---|
| **Requirement** | Users shall upload PDF files via drag-and-drop or file browser |
| **Supported Formats** | PDF 1.0 through 2.0 |
| **Max File Size (Free)** | 25 MB |
| **Max File Size (Pro)** | 200 MB |
| **Max File Size (Enterprise)** | 500 MB |
| **Upload Progress** | Real-time progress bar displayed during upload |
| **Error Handling** | Clear error messages for unsupported format, size exceeded, corrupted file |
| **Priority** | P0 — MVP |

#### FR-UPLOAD-002: File Validation

| Attribute | Specification |
|---|---|
| **Virus Scanning** | ClamAV or similar scanner on upload |
| **PDF Integrity Check** | Validate PDF structure before processing |
| **Password Protection** | Detect password-protected PDFs, prompt user to remove protection |
| **Page Count Display** | Show total pages immediately after upload |
| **Priority** | P0 — MVP |

#### FR-UPLOAD-003: Batch Upload

| Attribute | Specification |
|---|---|
| **Requirement** | Pro/Enterprise users can upload multiple PDFs simultaneously |
| **Max Files (Pro)** | 10 files per batch |
| **Max Files (Enterprise)** | 50 files per batch |
| **Processing** | Queue-based batch processing with progress tracking |
| **Priority** | P2 — Post-MVP |

#### FR-UPLOAD-004: PDF Preview

| Attribute | Specification |
|---|---|
| **Requirement** | Display thumbnail preview of uploaded PDF pages |
| **Rendering** | PDF.js for in-browser preview |
| **Navigation** | Scroll through pages, zoom in/out |
| **Page Selection** | Allow user to select specific page ranges for processing |
| **Priority** | P1 |

---

### 12.3 Module 3: Layout Configuration

#### FR-LAYOUT-001: Layout Type Selection

The system shall support the following layout types:

| Layout ID | Layout Name | Description | Pages Per Sheet | Duplex |
|---|---|---|---|---|
| LY-001 | 2-Up Portrait | 2 pages side-by-side | 2 | Optional |
| LY-002 | 2-Up Landscape | 2 pages top-bottom | 2 | Optional |
| LY-003 | 4-Up | 2x2 grid | 4 | Optional |
| LY-004 | 6-Up | 2x3 grid | 6 | Optional |
| LY-005 | 8-Up | 2x4 grid | 8 | Optional |
| LY-006 | 9-Up | 3x3 grid | 9 | Optional |
| LY-007 | Booklet (Saddle-stitch) | Signature booklet fold | 4 | Required |
| LY-008 | Booklet (Perfect Bound) | Flat spine booklet | 4 | Required |
| LY-009 | Duplex Optimized | Simple front/back pairing | 1 | Required |
| LY-010 | Custom Grid | User-defined grid | User-defined | Optional |

#### FR-LAYOUT-002: Duplex Configuration

```
Duplex Options:
├── Long-edge binding (portrait documents)
├── Short-edge binding (landscape documents)  
├── Manual duplex (print front, flip, print back)
└── Automatic duplex (for duplex-capable printers)

Page Ordering for 9-Up Duplex (Core Algorithm):

Input: 18 pages
Sheet 1 Front: [1, 2, 3, 4, 5, 6, 7, 8, 9]
Sheet 1 Back:  [18, 17, 16, 15, 14, 13, 12, 11, 10]

After duplex printing:
Physical page 1 backs physical page 18 on sheet 1
Physical page 2 backs physical page 17 on sheet 1
...
Result: Folded reading order is 1→2→3→...→18 ✅
```

#### FR-LAYOUT-003: Booklet Mode Algorithm

```
Booklet Imposition for N pages (must be multiple of 4, pad if needed):

For 20-page document:
Total sheets = 20 ÷ 4 = 5 sheets

Sheet 1 Front: [20, 1]    (outer cover)
Sheet 1 Back:  [2, 19]
Sheet 2 Front: [18, 3]
Sheet 2 Back:  [4, 17]
Sheet 3 Front: [16, 5]
Sheet 3 Back:  [6, 15]
Sheet 4 Front: [14, 7]
Sheet 4 Back:  [8, 13]
Sheet 5 Front: [12, 9]    (center pages)
Sheet 5 Back:  [10, 11]

Formula:
  For sheet i (1-indexed) of N total sheets:
  Front Left  = Total - (2i - 2)
  Front Right = 2i - 1
  Back Left   = 2i
  Back Right  = Total - (2i - 1)
```

#### FR-LAYOUT-004: Margin and Spacing Configuration

| Setting | Options | Default |
|---|---|---|
| Inner Margin (gutter) | 0–50mm (1mm increments) | 5mm |
| Outer Margin | 0–50mm | 5mm |
| Page Gap | 0–20mm | 3mm |
| Bleed | 0–10mm | 0mm |
| Scaling | Fit, Fill, None, Custom (50–150%) | Fit |
| Orientation | Auto-detect, Portrait, Landscape | Auto-detect |

#### FR-LAYOUT-005: Page Range Selection

| Feature | Specification |
|---|---|
| Custom Range | User specifies "1-50, 60, 75-100" format |
| Exclude Pages | Remove specific pages from output |
| Reorder Pages | Drag-and-drop page reordering before imposition |
| Repeat Pages | Repeat a page N times (for forms, worksheets) |

---

### 12.4 Module 4: Preset Management

#### FR-PRESET-001: System Presets (Default)

The following presets shall be pre-configured and available to all users:

| Preset Name | Layout | Duplex | Margins | Use Case |
|---|---|---|---|---|
| MAKAUT Notes Mode | 9-Up | Yes (long-edge) | 3mm | West Bengal university notes |
| GATE Notes Mode | 9-Up | Yes | 4mm | GATE exam preparation |
| JEE/NEET Notes | 6-Up | Yes | 5mm | Competitive exam notes |
| Booklet Mode | Booklet (Saddle) | Yes | 10mm | Lecture handouts |
| Exam Paper Mode | 2-Up | Yes | 8mm | Question papers |
| Quick 2-Up | 2-Up | No | 5mm | General documents |
| Quick 4-Up | 4-Up | No | 4mm | General notes |
| A5 Booklet | Booklet | Yes | 8mm | Small booklet format |
| Custom Mode | User-defined | User-defined | User-defined | Custom needs |

#### FR-PRESET-002: Custom Preset Creation

| Attribute | Specification |
|---|---|
| **Preset Name** | Required, max 50 characters |
| **Configuration** | All layout settings saved |
| **Storage** | Saved to user account, synced across devices |
| **Limit (Free)** | 3 custom presets |
| **Limit (Pro)** | Unlimited custom presets |
| **Sharing** | Pro users can share presets via link |
| **Export/Import** | Presets exportable as JSON |

#### FR-PRESET-003: Institutional Preset Management

| Attribute | Specification |
|---|---|
| **Admin Creates** | Institution admin creates organization-wide presets |
| **User Access** | All team members see institutional presets |
| **Locking** | Admin can lock presets (prevent user modification) |
| **Versioning** | Preset changes tracked with version history |

---

### 12.5 Module 5: PDF Processing Engine

#### FR-PROC-001: Core Processing Pipeline

```
Processing Pipeline Architecture:

1. File Receipt
   → Validate PDF structure
   → Extract page dimensions and count
   → Detect PDF version and compliance level

2. Pre-Processing
   → Page rotation normalization
   → Dimension standardization
   → Apply page range selection

3. Layout Calculation
   → Apply imposition algorithm for selected layout
   → Calculate precise page positions (x, y, scale, rotation)
   → Generate output page structure

4. PDF Composition
   → Place original pages onto output pages at calculated positions
   → Apply margins, gutters, and bleed settings
   → Embed watermarks if configured
   → Add page numbers if configured

5. Output Generation
   → Generate final PDF using PyMuPDF/reportlab
   → Apply PDF/X-1a standard for print compatibility
   → Compress output (maintains quality, reduces file size)
   → Generate preview thumbnails

6. Delivery
   → Store processed file temporarily (24h for free, 30d for Pro)
   → Generate secure download token
   → Return download URL to frontend
```

#### FR-PROC-002: Processing Performance Requirements

| Document Size | Maximum Processing Time |
|---|---|
| 1–10 pages | < 5 seconds |
| 11–50 pages | < 15 seconds |
| 51–200 pages | < 30 seconds |
| 201–500 pages | < 60 seconds |
| 501+ pages | < 120 seconds |

#### FR-PROC-003: Watermark Support

| Attribute | Specification |
|---|---|
| **Text Watermark** | Custom text, font, size, color, opacity, angle |
| **Image Watermark** | Upload PNG/SVG logo, position, size, opacity |
| **Position Options** | Center, tiled, corners, custom (x/y coordinates) |
| **Page Application** | All pages, first page only, specific pages, odd/even |
| **Priority** | P1 |

#### FR-PROC-004: Page Numbering

| Attribute | Specification |
|---|---|
| **Numbering Formats** | Arabic (1,2,3), Roman (i,ii,iii), Alpha (A,B,C) |
| **Position** | Top-left, top-center, top-right, bottom variants |
| **Start Number** | User-configurable starting number |
| **Prefix/Suffix** | "Page X of Y", "- X -", custom |
| **Exclude Pages** | Specify pages to skip numbering |
| **Priority** | P1 |

---

### 12.6 Module 6: Print Cost Estimator

#### FR-COST-001: Cost Calculator

| Attribute | Specification |
|---|---|
| **Requirement** | Calculate and display estimated printing costs before and after optimization |
| **Input Parameters** | Pages per sheet selection, duplex toggle, paper size, local cost/page |
| **Default Cost** | ₹2.00/page (configurable by user) |
| **Output** | Original cost estimate, optimized cost estimate, % savings, pages saved |
| **Currency** | INR default, USD, BDT, EUR supported |
| **Display** | Real-time update as settings change |

#### FR-COST-002: Savings Visualization

```
Savings Dashboard Display:

┌─────────────────────────────────────┐
│  PRINT COST COMPARISON              │
├──────────────────┬──────────────────┤
│  STANDARD PRINT  │  IMPOSIFY        │
│  300 pages       │  34 sheets       │
│  ₹600 estimated  │  ₹136 estimated  │
│  300 sheets      │  34 sheets       │
├──────────────────┴──────────────────┤
│  YOU SAVE: ₹464 (77%)              │
│  PAPER SAVED: 266 sheets            │
│  TREES SAVED: 0.03                  │
└─────────────────────────────────────┘
```

#### FR-COST-003: Cumulative Savings Tracker

| Attribute | Specification |
|---|---|
| **Requirement** | Track and display lifetime savings for logged-in users |
| **Metrics Tracked** | Total money saved, total sheets saved, total pages processed |
| **Display** | Profile dashboard, post-download screen |
| **Social Sharing** | "I've saved ₹X with Imposify" shareable card |

---

### 12.7 Module 7: Download and Output

#### FR-DOWN-001: File Download

| Attribute | Specification |
|---|---|
| **Download Method** | Direct browser download via secure signed URL |
| **File Naming** | "{original_name}_imposed_{layout}_{timestamp}.pdf" |
| **Expiry (Free)** | Download link valid 24 hours, file deleted after |
| **Expiry (Pro)** | File stored 30 days, re-downloadable |
| **Expiry (Enterprise)** | File stored indefinitely |
| **Priority** | P0 — MVP |

#### FR-DOWN-002: Preview Before Download

| Attribute | Specification |
|---|---|
| **Preview Type** | Full PDF preview in-browser using PDF.js |
| **Preview Pages** | First 5 pages free, full preview for Pro |
| **Zoom** | 25%–400% zoom range |
| **Navigation** | Page-by-page navigation, thumbnail sidebar |
| **Priority** | P1 |

#### FR-DOWN-003: Output Format Options

| Format | Description | Availability |
|---|---|---|
| PDF/Standard | Standard PDF output | All plans |
| PDF/X-1a | Print-industry standard PDF | Pro+ |
| PDF/A | Archival standard PDF | Pro+ |
| Compressed PDF | Reduced file size, same quality | All plans |

---

### 12.8 Module 8: Processing History

#### FR-HIST-001: Processing History Log

| Attribute | Specification |
|---|---|
| **Requirement** | Maintain log of all user processing jobs |
| **Data Stored** | Original filename, layout used, preset, date, pages processed, download count |
| **Retention (Free)** | Last 10 records |
| **Retention (Pro)** | Last 100 records, full 6-month history |
| **Re-download** | Pro users can re-download from history within retention period |
| **Re-process** | Apply same or different settings to previously uploaded file |
| **Priority** | P1 |

---

### 12.9 Module 9: Admin Dashboard

#### FR-ADMIN-001: User Management

| Feature | Specification |
|---|---|
| User List | Searchable, filterable list of all registered users |
| User Detail | Account info, subscription, processing history, storage usage |
| Suspend/Ban | Ability to suspend or ban accounts with reason logging |
| Manual Plan Override | Assign plan overrides for pilots and partnerships |
| Bulk Actions | Bulk email, export, status change |

#### FR-ADMIN-002: Analytics Dashboard

| Metric Category | Specific Metrics |
|---|---|
| Growth | New registrations (daily/weekly/monthly), MAU trend |
| Engagement | PDFs processed, pages processed, avg sessions per user |
| Revenue | MRR, plan distribution, churn, new subscribers, upgrades |
| Technical | Processing success rate, avg processing time, error rate |
| Geographic | User distribution by country/city |

#### FR-ADMIN-003: System Monitoring

| Feature | Specification |
|---|---|
| Processing Queue | Real-time view of processing jobs and queue depth |
| Storage Usage | Total storage consumed, per-user breakdown |
| Error Logs | Processing errors with stack traces and PDF metadata |
| Performance Metrics | Server response times, uptime, resource utilization |

#### FR-ADMIN-004: Revenue Dashboard

| Feature | Specification |
|---|---|
| MRR Chart | Monthly recurring revenue trend |
| Subscription Breakdown | Users per plan, upgrade/downgrade flow |
| Churn Analysis | Churn rate, reason tracking (from cancellation survey) |
| LTV Projections | Cohort-based LTV calculation |

---

### 12.10 Module 10: AI Layout Recommendation (Phase 2)

#### FR-AI-001: Intelligent Layout Recommendation

| Attribute | Specification |
|---|---|
| **Requirement** | System analyzes uploaded PDF and recommends optimal layout |
| **Analysis Factors** | Page count, content density, text size, document type classification |
| **Output** | Top 3 layout recommendations with confidence scores and savings estimates |
| **Learning** | Recommendation model trained on anonymized user preference data |
| **Override** | User can always override AI recommendation |
| **Priority** | P2 — Phase 2 |

#### FR-AI-002: Document Type Classification

```
AI Classification Categories:
├── Academic Notes (dense text, multiple columns)
├── Textbook Chapter (structured, headers, figures)
├── Exam Paper (question format, answer spaces)
├── Presentation Slides (visual-heavy, large text)
├── Research Paper (two-column, citations)
├── Form/Worksheet (fillable areas)
└── Mixed Document (multiple content types)

For each classification → Recommended preset:
  Academic Notes     → GATE Notes Mode (9-Up)
  Exam Paper         → Exam Paper Mode (2-Up)
  Presentation Slides → 4-Up or 6-Up
  etc.
```

---

## 13. NON-FUNCTIONAL REQUIREMENTS

### 13.1 Performance Requirements

| NFR ID | Requirement | Target | Measurement |
|---|---|---|---|
| NFR-PERF-01 | Page load time (initial) | < 2 seconds | Google Lighthouse |
| NFR-PERF-02 | API response time (non-processing) | < 200ms P95 | Backend monitoring |
| NFR-PERF-03 | PDF processing time (50MB) | < 30 seconds | Processing logs |
| NFR-PERF-04 | Concurrent processing jobs | 500+ simultaneously | Load testing |
| NFR-PERF-05 | Upload throughput | 10 MB/s sustained | Upload testing |
| NFR-PERF-06 | Preview render time | < 5 seconds | Browser timing API |
| NFR-PERF-07 | Time to Interactive (TTI) | < 3.5 seconds | Lighthouse |
| NFR-PERF-08 | Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |

### 13.2 Scalability Requirements

| NFR ID | Requirement | Target |
|---|---|---|
| NFR-SCALE-01 | Registered users supported | 1,000,000+ |
| NFR-SCALE-02 | Concurrent users | 10,000 simultaneous |
| NFR-SCALE-03 | Processing jobs per hour | 50,000 |
| NFR-SCALE-04 | Storage capacity | Petabyte-scale (S3) |
| NFR-SCALE-05 | Horizontal scaling | Auto-scaling processing workers |
| NFR-SCALE-06 | Database reads | 10,000 queries/second |
| NFR-SCALE-07 | Geographic distribution | Multi-region CDN delivery |

### 13.3 Reliability and Availability

| NFR ID | Requirement | Target |
|---|---|---|
| NFR-REL-01 | System uptime SLA | 99.5% monthly |
| NFR-REL-02 | Planned maintenance window | < 4 hours/month, off-peak |
| NFR-REL-03 | Mean Time to Recovery (MTTR) | < 30 minutes |
| NFR-REL-04 | Processing job failure rate | < 0.5% |
| NFR-REL-05 | Data backup frequency | Daily automated backups |
| NFR-REL-06 | Backup retention | 30 days |
| NFR-REL-07 | Disaster recovery RTO | < 4 hours |
| NFR-REL-08 | Disaster recovery RPO | < 24 hours |

### 13.4 Security Requirements

| NFR ID | Requirement | Specification |
|---|---|---|
| NFR-SEC-01 | Data encryption in transit | TLS 1.2+ (TLS 1.3 preferred) |
| NFR-SEC-02 | Data encryption at rest | AES-256 for all stored files |
| NFR-SEC-03 | Authentication | JWT with short expiry + refresh token rotation |
| NFR-SEC-04 | File isolation | User files accessible only to owner |
| NFR-SEC-05 | SQL injection prevention | Parameterized queries, ORM |
| NFR-SEC-06 | XSS prevention | Content Security Policy headers, output encoding |
| NFR-SEC-07 | CSRF protection | CSRF tokens on all state-changing requests |
| NFR-SEC-08 | File upload security | Virus scan, MIME type validation, filename sanitization |
| NFR-SEC-09 | Rate limiting | API rate limits per user and IP |
| NFR-SEC-10 | Audit logging | All admin actions and data access logged |
| NFR-SEC-11 | Penetration testing | Annual third-party penetration test |
| NFR-SEC-12 | GDPR compliance | User data export, deletion, consent management |
| NFR-SEC-13 | Data residency | India region storage option for enterprise |

### 13.5 Usability Requirements

| NFR ID | Requirement | Target |
|---|---|---|
| NFR-UX-01 | Task completion (first-time user, no instructions) | ≥ 80% success rate |
| NFR-UX-02 | Time to first successful PDF | < 3 minutes |
| NFR-UX-03 | System Usability Scale (SUS) score | ≥ 80 |
| NFR-UX-04 | Mobile usability | Full functional parity on 375px+ screens |
| NFR-UX-05 | Error message clarity | All errors have user-readable messages + resolution steps |
| NFR-UX-06 | Loading state feedback | All operations > 1s show progress indicator |

### 13.6 Compatibility Requirements

| NFR ID | Requirement | Specification |
|---|---|---|
| NFR-COMP-01 | Browser support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| NFR-COMP-02 | Mobile browsers | Chrome Mobile, Safari iOS 14+ |
| NFR-COMP-03 | PDF version support | PDF 1.0 – PDF 2.0 |
| NFR-COMP-04 | OS support | Windows, macOS, Linux, ChromeOS, Android, iOS |
| NFR-COMP-05 | Screen resolution | 320px – 4K |
| NFR-COMP-06 | Network conditions | Functional on 3G (degraded) and 4G+ (full) |

### 13.7 Maintainability Requirements

| NFR ID | Requirement | Specification |
|---|---|---|
| NFR-MAINT-01 | Code test coverage | ≥ 80% unit test coverage |
| NFR-MAINT-02 | API documentation | OpenAPI/Swagger docs for all endpoints |
| NFR-MAINT-03 | Deployment | CI/CD pipeline with automated testing |
| NFR-MAINT-04 | Logging | Structured JSON logging with correlation IDs |
| NFR-MAINT-05 | Monitoring | Application performance monitoring (APM) |
| NFR-MAINT-06 | Feature flags | Support for gradual feature rollout |

---

## 14. USER STORIES

### 14.1 Epic 1: Authentication

```
EPIC-AUTH: User Identity and Access Management

US-AUTH-001: New User Registration
As a new visitor,
I want to create an account with my email or Google account,
So that I can access Imposify's PDF processing features.

US-AUTH-002: Returning User Login
As a registered user,
I want to log in quickly with Google SSO,
So that I can access my presets and history without entering passwords.

US-AUTH-003: Password Reset
As a user who forgot my password,
I want to reset it via email,
So that I can regain access to my account without losing my data.

US-AUTH-004: Account Security
As a security-conscious user,
I want to enable two-factor authentication,
So that my account remains secure even if my password is compromised.
```

### 14.2 Epic 2: PDF Upload

```
EPIC-UPLOAD: File Upload and Management

US-UPLOAD-001: Drag-and-Drop Upload
As a student,
I want to drag my PDF file directly onto the webpage,
So that I can upload it quickly without navigating file dialogs.

US-UPLOAD-002: Upload Progress Visibility
As a user uploading a large PDF,
I want to see the upload progress in real-time,
So that I know the upload is working and haven't lost my file.

US-UPLOAD-003: Upload Validation Feedback
As a user who accidentally uploads a non-PDF file,
I want to receive a clear, immediate error message,
So that I know what went wrong and what file types are accepted.

US-UPLOAD-004: PDF Preview After Upload
As a student who wants to verify their notes,
I want to preview my uploaded PDF pages,
So that I confirm I've uploaded the correct file before processing.

US-UPLOAD-005: Page Range Selection
As a user who only needs specific chapters printed,
I want to specify a page range (e.g., "1-50, 75-100"),
So that I only process and pay for the pages I actually need.
```

### 14.3 Epic 3: Layout Configuration

```
EPIC-LAYOUT: Print Layout Selection and Configuration

US-LAYOUT-001: Layout Type Selection
As a student printing study notes,
I want to see clear visual examples of each layout option,
So that I understand exactly how my printed pages will look.

US-LAYOUT-002: Apply System Preset
As an engineering student,
I want to select the "GATE Notes Mode" preset with one click,
So that I don't need to manually configure the optimal settings.

US-LAYOUT-003: Duplex Configuration
As a student who wants double-sided printing,
I want to toggle duplex mode and see how it affects my output,
So that I can confirm my pages will print correctly.

US-LAYOUT-004: Margin Adjustment
As a professor creating handouts with note-taking space,
I want to adjust margins and gutters precisely,
So that the printed pages have appropriate margins for annotations.

US-LAYOUT-005: Custom Layout Builder
As a power user with specific formatting requirements,
I want to define a custom grid layout with exact specifications,
So that I have full control over the output format.

US-LAYOUT-006: Real-time Layout Preview
As a user configuring settings,
I want to see a live preview update as I change each setting,
So that I can immediately see the impact of my configuration choices.
```

### 14.4 Epic 4: Preset Management

```
EPIC-PRESET: Print Preset Creation and Management

US-PRESET-001: Create Custom Preset
As a coaching center manager,
I want to save my preferred settings as "JEE Notes Format",
So that staff can apply our standard formatting with one click.

US-PRESET-002: Edit Existing Preset
As a user whose printing needs have changed,
I want to modify my saved preset settings,
So that my preset remains relevant to my current requirements.

US-PRESET-003: Delete Obsolete Preset
As a user with unused presets,
I want to delete old presets I no longer need,
So that my preset list stays organized and manageable.

US-PRESET-004: Share Preset with Team
As a team lead at an institution,
I want to share my validated preset with all team members,
So that everyone uses the same print optimization settings.

US-PRESET-005: Browse Community Presets
As a new user unsure which settings to use,
I want to browse presets shared by the Imposify community,
So that I can adopt proven configurations without starting from scratch.
```

### 14.5 Epic 5: PDF Processing

```
EPIC-PROC: PDF Generation and Processing

US-PROC-001: Generate Imposed PDF
As a student with configured settings,
I want to click one button to generate my optimized PDF,
So that I receive a print-ready file without technical complexity.

US-PROC-002: Processing Progress Visibility
As a user waiting for processing,
I want to see a progress indicator with estimated completion time,
So that I know the system is working and won't abandon the page.

US-PROC-003: Processing Error Recovery
As a user whose PDF failed to process,
I want to receive a clear explanation of what went wrong,
So that I know whether to retry, check my file, or contact support.

US-PROC-004: Add Watermark
As a professor distributing exam papers,
I want to add my institution's watermark to all pages,
So that the documents are branded and discourage unauthorized sharing.

US-PROC-005: Add Page Numbers
As a user creating a multi-section booklet,
I want to add sequential page numbers in a specific format,
So that readers can navigate the printed document easily.

US-PROC-006: Batch Processing
As a coaching center manager,
I want to process 10 PDF files simultaneously with the same preset,
So that I can prepare all module handouts for next week in one session.
```

### 14.6 Epic 6: Cost Estimation

```
EPIC-COST: Print Cost Calculation and Savings

US-COST-001: View Cost Comparison
As a budget-conscious student,
I want to see estimated printing costs before and after optimization,
So that I know exactly how much money I'm saving.

US-COST-002: Configure Local Print Rate
As a user in a different city with different print costs,
I want to set my local per-page printing rate,
So that cost estimates reflect my actual local pricing.

US-COST-003: View Cumulative Savings
As a regular Imposify user,
I want to see my total lifetime savings on my dashboard,
So that I have tangible evidence of the value Imposify provides.

US-COST-004: Share My Savings
As a user who saved significantly,
I want to share a "I saved ₹1,200 with Imposify" card on social media,
So that I can tell my friends about this tool while celebrating my savings.

US-COST-005: Paper Savings Visualization
As an environmentally conscious student,
I want to see how many sheets of paper my optimization saved,
So that I understand the environmental impact of my printing choices.
```

### 14.7 Epic 7: Download and Output

```
EPIC-DOWN: File Download and Output Management

US-DOWN-001: Download Processed PDF
As a user who generated an imposed PDF,
I want to download it immediately to my device,
So that I can take it to the printer or share with others.

US-DOWN-002: Preview Before Download
As a user who wants to verify output quality,
I want to preview the generated PDF in the browser before downloading,
So that I catch any formatting issues before going to the print shop.

US-DOWN-003: Re-download from History
As a Pro user who accidentally deleted a file,
I want to re-download a previously generated PDF from my history,
So that I don't have to re-process the same document again.

US-DOWN-004: Download in Multiple Formats
As a print professional,
I want to download in PDF/X-1a print-industry standard format,
So that the file meets the technical requirements of professional print vendors.
```

### 14.8 Epic 8: Admin Features

```
EPIC-ADMIN: Platform Administration

US-ADMIN-001: User Account Management
As a platform administrator,
I want to search, view, and manage all user accounts,
So that I can handle support requests, abuse reports, and account issues.

US-ADMIN-002: Processing Analytics
As a product manager monitoring the platform,
I want to view daily processing volumes, success rates, and popular features,
So that I can make data-driven product improvement decisions.

US-ADMIN-003: Revenue Dashboard Access
As a business stakeholder,
I want to view MRR, churn, and subscription distribution charts,
So that I can monitor business health and identify revenue trends.

US-ADMIN-004: System Performance Monitoring
As a technical administrator,
I want to monitor processing queue depth, error rates, and server performance,
So that I can identify and resolve performance issues proactively.
```

---

## 15. ACCEPTANCE CRITERIA

### 15.1 Authentication Acceptance Criteria

#### US-AUTH-001: New User Registration

```
Scenario 1: Successful email registration
  GIVEN I am an unregistered visitor on the sign-up page
  WHEN I enter a valid email, strong password, and click "Create Account"
  THEN I receive a verification email within 60 seconds
  AND my account is created in PENDING state until email is verified
  AND I am redirected to the "Check your email" confirmation screen

Scenario 2: Duplicate email prevention
  GIVEN I attempt to register with an email already in the system
  WHEN I submit the registration form
  THEN I see the message "This email is already registered. Sign in instead?"
  AND no duplicate account is created

Scenario 3: Weak password rejection
  GIVEN I enter a password that doesn't meet requirements
  WHEN I attempt to submit the form
  THEN I see real-time inline validation showing which requirements are unmet
  AND the form submission is blocked until requirements are satisfied

Scenario 4: Google OAuth registration
  GIVEN I click "Continue with Google"
  WHEN I complete the Google authentication flow
  THEN an Imposify account is created (or linked if email exists)
  AND I am logged in immediately without email verification
  AND I am redirected to the main dashboard
```

#### US-UPLOAD-001: Drag-and-Drop Upload

```
Scenario 1: Successful PDF upload via drag-and-drop
  GIVEN I am on the main upload page
  WHEN I drag a valid PDF file and drop it on the designated upload zone
  THEN the file begins uploading immediately
  AND a progress bar shows upload percentage
  AND upon completion, I see the PDF preview with page count
  AND the page count matches the actual PDF page count

Scenario 2: Invalid file type rejection
  GIVEN I drag a .docx file onto the upload zone
  WHEN the file is dropped
  THEN I immediately see "Only PDF files are supported. Please upload a .pdf file"
  AND no upload is initiated
  AND the upload zone returns to its default state

Scenario 3: File size exceeded
  GIVEN I am a free user and drag a PDF larger than 25MB
  WHEN the file is dropped
  THEN I see "Your file (X MB) exceeds the 25MB limit for free accounts"
  AND I am shown an option to upgrade to Pro for 200MB support
  AND no upload is initiated
```

#### US-PROC-001: Generate Imposed PDF

```
Scenario 1: Successful 9-Up duplex PDF generation
  GIVEN I have uploaded a 90-page PDF
  AND I have selected "9-Up Duplex" layout
  WHEN I click "Generate Imposed PDF"
  THEN processing begins within 1 second
  AND I see a progress indicator
  AND within 30 seconds, the download becomes available
  AND the generated PDF contains exactly 10 pages (ceil(90/9) = 10)
  AND each output page contains exactly 9 input pages in correct order
  AND page ordering is verified: Sheet 1 Front [1-9], Sheet 1 Back [18-10]

Scenario 2: Booklet mode page count validation
  GIVEN I have uploaded a 22-page PDF
  AND I select "Booklet (Saddle-stitch)" mode
  WHEN I click "Generate"
  THEN the system automatically pads to 24 pages (next multiple of 4)
  AND blank pages are added at the appropriate positions
  AND the output contains 6 sheets (12 pages)
  AND when sheets are folded and stacked, reading order is 1→24

Scenario 3: Processing failure handling
  GIVEN I have uploaded a password-protected PDF
  WHEN I attempt to generate an imposed version
  THEN processing fails with a clear error: "This PDF is password-protected"
  AND I am shown instructions: "Please remove password protection and re-upload"
  AND no incomplete file is stored or made available for download

Scenario 4: Cost estimation accuracy
  GIVEN I upload a 100-page PDF
  AND I select 9-Up duplex layout
  AND my local rate is set to ₹2.00/page
  WHEN the settings panel updates
  THEN the displayed cost shows:
    - Standard: 100 pages × ₹2 = ₹200
    - Optimized: ceil(100/9) = 12 sheets × 2 sides = 24 pages × ₹2 = ₹48
    - Savings: ₹152 (76%)
  AND these calculations are mathematically verifiable
```

#### US-PRESET-001: Create Custom Preset

```
Scenario 1: Successful preset creation
  GIVEN I have configured layout settings I want to save
  WHEN I click "Save as Preset" and enter the name "My Exam Notes"
  THEN the preset is saved to my account
  AND it appears in my preset list immediately
  AND applying the preset restores all saved configuration values exactly

Scenario 2: Preset name validation
  GIVEN I attempt to save a preset with an empty name
  WHEN I click "Save"
  THEN I see "Preset name is required"
  AND the preset is not saved

Scenario 3: Free user preset limit
  GIVEN I am a free user with 3 presets already saved
  WHEN I attempt to create a 4th preset
  THEN I see "Free accounts support up to 3 presets"
  AND I am shown an upgrade prompt for unlimited presets
  AND my existing 3 presets remain accessible
```

---

## 16. MVP DEFINITION

### 16.1 MVP Philosophy

The Imposify MVP follows the principle: **"Deliver undeniable core value to one user segment before expanding."**

The MVP targets **individual students** as the primary user and delivers one transformative outcome: *upload a PDF, select a layout, download a print-ready file in under 3 minutes.*

Everything else is deferred.

### 16.2 MVP Feature Scope

```
┌─────────────────────────────────────────────────────────────┐
│                    MVP SCOPE                                 │
│                                                             │
│  ✅ INCLUDED IN MVP                                          │
│  ─────────────────                                          │
│  • Email + Google OAuth registration and login              │
│  • Single PDF upload (drag-and-drop + file browser)        │
│  • PDF validation and page count display                    │
│  • Layout selection: 2-Up, 4-Up, 6-Up, 9-Up               │
│  • Duplex configuration (long-edge, short-edge)            │
│  • 5 system presets (GATE, MAKAUT, Booklet, 2-Up, 4-Up)   │
│  • PDF processing engine (core imposition algorithm)       │
│  • Processing progress indicator                            │
│  • Print cost estimator (basic)                            │
│  • PDF download                                            │
│  • Basic PDF preview (first 3 pages)                       │
│  • Processing history (last 5 records)                     │
│  • Responsive web design (mobile + desktop)                │
│  • Basic admin: user list and processing logs              │
│  • Free plan: 5 PDFs/month, 25MB max                      │
│  • Stripe payment integration for Pro plan                 │
│                                                             │
│  ❌ EXCLUDED FROM MVP (Phase 2+)                            │
│  ──────────────────────────────                            │
│  • Batch upload and processing                             │
│  • Custom preset creation                                  │
│  • Watermark support                                       │
│  • Page numbering                                          │
│  • Full PDF preview (all pages)                            │
│  • AI layout recommendations                               │
│  • Booklet mode (deferred to Phase 1.5)                   │
│  • Social sharing                                          │
│  • White-label                                             │
│  • API access                                              │
│  • Institutional/Team plans                                │
│  • Advanced admin analytics                                │
└─────────────────────────────────────────────────────────────┘
```

### 16.3 MVP Technical Stack

```
Frontend:
  Framework:      React 18 + TypeScript
  Styling:        Tailwind CSS 3.x
  PDF Preview:    PDF.js
  State:          Zustand
  API Client:     Axios + React Query
  Build:          Vite

Backend:
  Framework:      FastAPI (Python 3.11)
  PDF Processing: PyMuPDF (fitz), pypdf, reportlab
  Task Queue:     Celery + Redis
  Auth:           JWT + OAuth2 (python-social-auth)
  
Database:
  Primary:        PostgreSQL 15
  Cache:          Redis 7

Storage:
  MVP:            Local filesystem (containerized)
  Phase 2:        AWS S3 / Cloudflare R2

Infrastructure:
  Hosting:        Docker + Docker Compose (MVP)
  Phase 2:        Kubernetes on AWS EKS or GCP GKE
  CI/CD:          GitHub Actions
  Monitoring:     Sentry (errors) + Grafana (metrics)

Payments:
  Processor:      Stripe
  Invoicing:      Stripe Billing
```

### 16.4 MVP Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MVP ARCHITECTURE                             │
│                                                                     │
│  ┌──────────┐     HTTPS      ┌─────────────────────────────────┐   │
│  │  Browser  │◄──────────────►│      Nginx Reverse Proxy        │   │
│  │  React App│               └──────────────┬──────────────────┘   │
│  └──────────┘                               │                       │
│                              ┌──────────────▼──────────────────┐   │
│                              │      FastAPI Application         │   │
│                              │  ┌─────────────────────────┐   │   │
│                              │  │   Auth Module            │   │   │
│                              │  │   Upload Module          │   │   │
│                              │  │   Layout Config Module   │   │   │
│                              │  │   Processing Module      │   │   │
│                              │  │   Download Module        │   │   │
│                              │  │   Admin Module           │   │   │
│                              │  └─────────────────────────┘   │   │
│                              └──────┬─────────────┬────────────┘   │
│                                     │             │                 │
│                         ┌───────────▼───┐  ┌─────▼──────────────┐ │
│                         │  PostgreSQL   │  │   Redis (Cache +   │ │
│                         │  Database     │  │   Celery Queue)    │ │
│                         └───────────────┘  └─────┬──────────────┘ │
│                                                   │               │
│                                     ┌─────────────▼─────────┐    │
│                                     │   Celery Workers       │    │
│                                     │  ┌─────────────────┐  │    │
│                                     │  │ PyMuPDF Engine  │  │    │
│                                     │  │ PDF Validator   │  │    │
│                                     │  │ Layout Engine   │  │    │
│                                     │  │ PDF Composer    │  │    │
│                                     │  └────────┬────────┘  │    │
│                                     └───────────┼───────────┘    │
│                                                 │                 │
│                                     ┌───────────▼───────────┐    │
│                                     │   File Storage         │    │
│                                     │   (Local/S3)           │    │
│                                     └───────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 16.5 MVP Development Timeline

```
Week 1–2: Foundation
  ✓ Project setup (repo, CI/CD, Docker)
  ✓ Database schema design
  ✓ Auth module (email + Google OAuth)
  ✓ Basic React app shell with routing

Week 3–4: Core Upload and Preview
  ✓ PDF upload API with validation
  ✓ File storage integration
  ✓ PDF.js preview component
  ✓ Upload UI (drag-and-drop)

Week 5–6: Processing Engine
  ✓ Core imposition algorithm (N-up)
  ✓ Duplex page ordering algorithm
  ✓ Celery task queue integration
  ✓ Processing status API

Week 7: Configuration and Presets
  ✓ Layout selection UI
  ✓ System preset library
  ✓ Cost estimator component
  ✓ Download endpoint

Week 8: Polish and Launch Prep
  ✓ End-to-end testing
  ✓ Error handling and edge cases
  ✓ Mobile responsive fixes
  ✓ Stripe payment integration
  ✓ Basic admin dashboard
  ✓ Production deployment

Week 9–10: Soft Launch and Iteration
  ✓ Beta user testing with 50 students
  ✓ Bug fixes from beta feedback
  ✓ Performance optimization
  ✓ Public launch
```

### 16.6 MVP Success Criteria

The MVP is considered successful when:

| Criterion | Target |
|---|---|
| Users who successfully process their first PDF | ≥ 100 in first week |
| PDF processing success rate | ≥ 98% |
| Page ordering accuracy (verified manually) | 100% |
| Task completion without assistance | ≥ 80% |
| User reported satisfaction | ≥ 4.0/5.0 |
| Free-to-paid indication (stated intent) | ≥ 10% of beta users |
| System uptime during beta | ≥ 99% |

---

## 17. FUTURE ROADMAP

### 17.1 Product Phases Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     PRODUCT ROADMAP                                  │
│                                                                      │
│  PHASE 0: Foundation (Month 0–2)                                    │
│  ────────────────────────────────                                   │
│  MVP development, beta testing, initial launch                      │
│                                                                      │
│  PHASE 1: Growth (Month 3–6)                                        │
│  ────────────────────────────────                                   │
│  Custom presets, watermarks, page numbers, full preview             │
│  Booklet mode, expanded layout options                              │
│  Social sharing, referral program                                   │
│                                                                      │
│  PHASE 2: Expansion (Month 7–12)                                    │
│  ────────────────────────────────                                   │
│  Batch processing (Pro)                                             │
│  AI layout recommendations                                          │
│  Team/Institutional plans                                           │
│  Advanced admin analytics                                           │
│  AWS S3 migration, CDN optimization                                 │
│                                                                      │
│  PHASE 3: Platform (Month 13–18)                                    │
│  ────────────────────────────────                                   │
│  Public REST API                                                     │
│  Print shop partner portal                                          │
│  Mobile app (React Native)                                          │
│  SSO/SAML for enterprise                                            │
│  White-label product                                                │
│                                                                      │
│  PHASE 4: Intelligence (Month 19–24)                                │
│  ────────────────────────────────                                   │
│  AI document classification engine                                  │
│  Print demand forecasting for institutions                          │
│  Integration marketplace (LMS, Google Drive, Dropbox)              │
│  Multi-language UI (Hindi, Bengali, Tamil, Arabic)                 │
│                                                                      │
│  PHASE 5: Ecosystem (Month 25–36)                                   │
│  ────────────────────────────────                                   │
│  Print partner network (connect users to local print shops)         │
│  Community preset marketplace                                       │
│  Imposify for Teams (collaborative workspace)                       │
│  Enterprise self-hosted deployment option                           │
└──────────────────────────────────────────────────────────────────────┘
```

### 17.2 Detailed Phase 1 Features (Month 3–6)

| Feature | Description | Business Rationale |
|---|---|---|
| **Custom Preset Builder** | Full CRUD for user presets with sharing | Increases retention, enables institutional adoption |
| **Booklet Mode** | Saddle-stitch and perfect-bound booklet imposition | High demand from professors and publication users |
| **Watermark Engine** | Text and image watermarks with opacity control | Required for institutional and exam use cases |
| **Page Numbering** | Multiple numbering formats and positions | Needed for professional documents |
| **Full PDF Preview** | All pages preview with zoom for Pro users | Reduces support requests, increases user confidence |
| **Referral Program** | "Invite 3 friends, get 1 month free" | Organic growth loop for student segment |
| **Savings Milestone Notifications** | Email/in-app when savings milestones reached | Reinforces value, drives sharing |
| **Processing History Expansion** | 50-record history for free, unlimited for Pro | Lock-in mechanism |

### 17.3 Detailed Phase 2 Features (Month 7–12)

| Feature | Description | Business Rationale |
|---|---|---|
| **Batch Processing** | Process up to 10 PDFs simultaneously (Pro) | Primary differentiator for institutional buyers |
| **AI Layout Recommender** | Analyze PDF content and recommend optimal layout | Differentiates from all competitors |
| **Team Plans** | Multi-seat accounts with shared presets and billing | Opens B2B revenue stream |
| **Institutional Dashboard** | Usage analytics for team admins | Required for enterprise sales |
| **Custom Domain** | Institutions can brand their Imposify workspace | Increases enterprise stickiness |
| **Bulk Discount Pricing** | Volume pricing for 10,000+ pages/month | Enables large institutional deals |
| **Priority Processing Queue** | Pro/Enterprise users jump the queue | Monetizes processing speed |
| **Advanced Cost Analytics** | Monthly/annual savings reports per user | Demonstrates institutional ROI |

### 17.4 Detailed Phase 3 Features (Month 13–18)

| Feature | Description | Business Rationale |
|---|---|---|
| **Public REST API** | Developers integrate Imposify into their applications | New revenue stream, ecosystem expansion |
| **Print Shop Partner Portal** | Dedicated interface for xerox shop power users | Captures high-volume daily users |
| **Google Drive Integration** | Upload directly from Google Drive | Reduces friction for Drive users |
| **Dropbox Integration** | Upload from Dropbox | Expands accessibility |
| **React Native Mobile App** | Native iOS + Android apps | Reaches mobile-primary users (student segment) |
| **SAML/SSO Enterprise Auth** | Integration with institutional identity providers | Required for government college adoption |
| **White-Label Licensing** | Custom-branded Imposify deployments | High-value B2B revenue stream |
| **Offline Mode (PWA)** | Process cached presets offline | Addresses low-connectivity use cases |

### 17.5 Phase 4–5 Visionary Features (Month 19–36)

| Feature | Vision |
|---|---|
| **AI Print Intelligence Engine** | Predictive optimization based on document type, user history, and institutional patterns |
| **Print Demand Forecasting** | Help coaching centers anticipate print volume and pre-optimize materials |
| **Community Preset Marketplace** | Users publish and monetize preset templates |
| **Print Shop Marketplace** | Connect users with verified local print shops who accept Imposify-generated PDFs |
| **Sustainability Dashboard** | Carbon footprint tracking for institutional print programs |
| **EdTech LMS Integration** | Native plugins for Moodle, Canvas, Blackboard |
| **Voice Interface** | "Prepare my notes for 9-up duplex printing" voice command |
| **AR Print Preview** | Visualize how printed pages will look in physical space |

---

## 18. MONETIZATION STRATEGY

### 18.1 Pricing Philosophy

Imposify follows a **"Value-First, Friction-Last"** pricing philosophy:
- Deliver immediate, tangible value to free users
- Create natural upgrade triggers at pain points (PDF limits, file size, batch needs)
- Price paid plans so that the first successful use at a print shop pays for the subscription

### 18.2 Pricing Tiers

#### TIER 1: FREE PLAN — "Starter"

```
Price: ₹0 / $0 per month

Included:
  ✅ 5 PDF uploads per month
  ✅ Max file size: 25 MB
  ✅ All standard layouts (2-Up, 4-Up, 6-Up, 9-Up)
  ✅ 5 system presets
  ✅ Basic cost estimator
  ✅ 3-page PDF preview
  ✅ Processing history: Last 5 records
  ✅ Download link valid 24 hours
  ✅ Standard processing queue

Not Included:
  ❌ Custom preset creation
  ❌ Watermark and page numbering
  ❌ Batch processing
  ❌ Full PDF preview
  ❌ Extended file storage
  ❌ Priority processing

Goal: Prove value → Convert to Student or Pro
```

#### TIER 2: STUDENT PLAN — "Scholar"

```
Price: ₹99/month ($1.99) or ₹799/year ($15.99)
      [Annual = 33% discount]

Included:
  ✅ 50 PDF uploads per month
  ✅ Max file size: 100 MB
  ✅ All layouts including Booklet Mode
  ✅ 3 custom presets
  ✅ Watermark support (text)
  ✅ Page numbering
  ✅ Full PDF preview
  ✅ Processing history: 30 records (30 days)
  ✅ Download link valid 7 days
  ✅ Standard processing queue
  ✅ Advanced cost estimator with savings history

Not Included:
  ❌ Unlimited custom presets
  ❌ Batch processing
  ❌ Priority queue
  ❌ Image watermarks

Target: Individual students printing 10-50 PDFs/month
ROI Pitch: "₹99/month plan saves ₹800+ on first print job"
```

#### TIER 3: PRO PLAN — "Professional"

```
Price: ₹499/month ($9.99) or ₹3,999/year ($79.99)
      [Annual = 33% discount]

Included:
  ✅ Unlimited PDF uploads
  ✅ Max file size: 200 MB
  ✅ All layouts + Custom Grid Builder
  ✅ Unlimited custom presets
  ✅ Preset sharing via link
  ✅ Full watermark support (text + image)
  ✅ Advanced page numbering
  ✅ Batch processing (up to 10 files)
  ✅ Full PDF preview (all pages)
  ✅ Processing history: 6 months
  ✅ Download link valid 30 days
  ✅ Priority processing queue
  ✅ PDF/X-1a output format
  ✅ Advanced analytics dashboard
  ✅ Email support (24h response)

Target: Professors, print shop operators, power users
ROI Pitch: "One coaching session handout job pays for 3 months"
```

#### TIER 4: TEAM PLAN — "Institute"

```
Price: ₹2,499/month ($49.99) — Up to 10 users
       ₹4,999/month ($99.99) — Up to 25 users
       Custom pricing for 25+ users

Included:
  ✅ Everything in Pro for each team member
  ✅ Centralized team admin dashboard
  ✅ Institutional preset library (admin-managed)
  ✅ Shared processing history
  ✅ Unified billing
  ✅ Bulk batch processing (up to 50 files)
  ✅ Max file size: 500 MB
  ✅ SSO integration (Google Workspace)
  ✅ Usage analytics per team member
  ✅ Priority support (4h response)
  ✅ Onboarding call (1 hour)

Target: Coaching centers, college departments, print shops with staff
```

#### TIER 5: ENTERPRISE PLAN — "Campus"

```
Price: Custom — ₹50,000–₹5,00,000/year

Included:
  ✅ Everything in Team Plan
  ✅ Unlimited users
  ✅ SAML/SSO integration
  ✅ Custom domain (institution.imposify.com)
  ✅ White-label branding option
  ✅ Dedicated processing infrastructure
  ✅ Custom preset templates by Imposify team
  ✅ SLA: 99.9% uptime guarantee
  ✅ Data residency (India region)
  ✅ Annual security audit report
  ✅ Dedicated account manager
  ✅ On-site training (upon request)
  ✅ API access

Target: Government colleges, large private universities, state library systems
```

### 18.3 Additional Revenue Streams

#### Pay-Per-Use API

```
API Pricing (Phase 3+):
  Tier 1: 0–1,000 API calls/month    → Free
  Tier 2: 1,001–10,000 calls/month   → $0.005/call
  Tier 3: 10,001–100,000 calls/month → $0.003/call
  Tier 4: 100,001+ calls/month       → $0.001/call (negotiated)

Use cases: Print shop POS integrations, LMS plugins, workflow automation
```

#### Print Shop Partner Program

```
Partner Revenue Model (Phase 3+):
  → Print shops pay ₹299/month for a dedicated shop account
  → Revenue share: Imposify gets ₹2 per job processed through partner link
  → Premium partner listing in "Find a Print Shop" directory
  
Target: 1,000 partner print shops × ₹299/month = ₹2.99L/month recurring
```

#### Preset Marketplace (Phase 5)

```
Creator Revenue Model:
  → Community members sell premium presets for ₹49–₹499
  → Imposify takes 30% platform fee
  → Top preset creators earn passive income
  
Target: Establishes community flywheel and additional revenue
```

### 18.4 Revenue Projections

| Month | Users (Free) | Users (Paid) | MRR | ARR Run Rate |
|---|---|---|---|---|
| Month 3 | 2,000 | 50 | $250 | $3,000 |
| Month 6 | 10,000 | 400 | $2,000 | $24,000 |
| Month 9 | 28,000 | 1,200 | $6,000 | $72,000 |
| Month 12 | 47,500 | 2,500 | $12,500 | $150,000 |
| Month 18 | 100,000 | 7,000 | $45,000 | $540,000 |
| Month 24 | 200,000 | 18,000 | $120,000 | $1,440,000 |

### 18.5 Unit Economics

| Metric | Value |
|---|---|
| Blended ARPU | $5.00/month |
| Customer Acquisition Cost (CAC) | $8.00 |
| Average Customer Lifetime | 9 months |
| Customer Lifetime Value (LTV) | $45.00 |
| LTV:CAC Ratio | 5.6:1 ✅ |
| Gross Margin | ~82% (SaaS infrastructure costs ~18%) |
| Payback Period | ~2 months |

---

## 19. RISKS AND ASSUMPTIONS

### 19.1 Risk Register

#### Technical Risks

| Risk ID | Risk | Probability | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| TR-001 | PDF processing fails for complex PDFs with embedded fonts/forms | High | High | Critical | Extensive test suite with 500+ diverse PDF samples; fallback processing modes |
| TR-002 | Processing time exceeds 30 seconds for large files | Medium | High | High | Async Celery workers; progress feedback; file size limits; worker scaling |
| TR-003 | Page ordering algorithm produces incorrect booklet output | Low | Critical | High | Mathematical verification tests; visual diff testing against known-good outputs |
| TR-004 | Storage costs exceed projections as user base grows | Medium | Medium | Medium | S3 lifecycle policies; aggressive file expiry for free users; compression |
| TR-005 | Third-party PDF library (PyMuPDF) licensing issues | Low | High | Medium | Evaluate open-source alternatives; maintain fallback library (pypdf) |
| TR-006 | Celery worker crashes under high load | Medium | High | High | Worker health checks; auto-restart; circuit breaker patterns |

#### Business Risks

| Risk ID | Risk | Probability | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| BR-001 | Low free-to-paid conversion rate (< 2%) | Medium | High | High | A/B test upgrade prompts; improve value demonstration; reduce friction |
| BR-002 | Competitor (Adobe, ILovePDF) launches similar feature set | Medium | High | High | Speed of execution; education-specific differentiation; community moat |
| BR-003 | PDF copyright infringement claims from publishers | Low | Critical | High | ToS prohibiting copyright-violating use; DMCA compliance; content scanning |
| BR-004 | Insufficient user willingness to pay at target price points | Medium | High | High | Price sensitivity testing in beta; multiple pricing tiers; annual discounts |
| BR-005 | High student churn during exam off-season | High | Medium | High | Promote year-round use cases; institutional contracts provide steady revenue |
| BR-006 | Free plan too generous — cannibalization of paid plans | Low | Medium | Medium | Monitor conversion data; adjust free plan limits based on data |

#### Operational Risks

| Risk ID | Risk | Probability | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| OR-001 | Data breach exposing user-uploaded PDFs | Low | Critical | Critical | Encryption at rest + transit; file isolation; security audit; breach response plan |
| OR-002 | Key person dependency (single developer) | High | High | High | Documentation; cross-training; structured hiring plan |
| OR-003 | Payment processor downtime affecting upgrades | Low | Medium | Low | Implement graceful fallback; secondary processor integration |
| OR-004 | Cloud infrastructure cost overrun | Medium | Medium | Medium | Reserved instances; budget alerts; cost optimization reviews monthly |
| OR-005 | Regulatory changes in data handling (DPDP Act India) | Medium | High | High | Privacy-first architecture; legal counsel consultation; compliance roadmap |

#### Market Risks

| Risk ID | Risk | Probability | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| MR-001 | Digital-first education reducing print demand | Low | High | Medium | Pivot to digital layout optimization if print demand declines |
| MR-002 | Economic downturn reducing student spending | Medium | Medium | Medium | Ensure free plan value is sufficient; focus on ROI messaging |
| MR-003 | Printer manufacturers building similar features natively | Low | High | Medium | Platform-agnostic positioning; advanced features justify tool adoption |

### 19.2 Assumptions

#### Business Assumptions

| Assumption | Confidence | Validation Method |
|---|---|---|
| Students print 20+ pages of notes per month on average | High | Survey data, print shop interviews |
| 5% of free users will convert to paid within 90 days | Medium | Industry benchmark; to be validated in beta |
| Coaching centers spend ₹30,000–₹60,000/month on printing | High | Direct interviews with 3 coaching centers |
| Indian students will pay ₹99/month for verified savings | Medium | Price sensitivity survey needed |
| Word-of-mouth in student communities will drive organic growth | High | Historical pattern for student productivity tools |

#### Technical Assumptions

| Assumption | Confidence | Validation Method |
|---|---|---|
| PyMuPDF handles 95%+ of real-world PDFs correctly | High | Testing with 200+ sample PDFs |
| Celery + Redis handles 500 concurrent jobs on 4 workers | Medium | Load testing before launch |
| 25MB file size covers 90% of student use cases | High | Analysis of typical notes PDF sizes |
| Browser-based PDF.js preview performs adequately on mobile | Medium | Device testing across iOS and Android |

#### User Behavior Assumptions

| Assumption | Confidence | Validation Method |
|---|---|---|
| Users can complete first PDF processing without instructions | Medium | Usability testing with 10 students |
| "GATE Notes Mode" preset will be immediately recognizable to target users | High | User interviews |
| Cost savings display (₹XXX saved) will be a strong conversion driver | High | Messaging A/B tests in beta |
| Students will share Imposify in WhatsApp study groups | High | Community behavior observation |

---

## 20. PRODUCT KPIs

### 20.1 KPI Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│               IMPOSIFY PRODUCT KPI DASHBOARD                    │
├───────────────────┬──────────────────┬──────────────────────────┤
│   GROWTH          │   ENGAGEMENT     │   REVENUE                │
├───────────────────┼──────────────────┼──────────────────────────┤
│ • New Users/Month │ • MAU            │ • MRR                    │
│ • Total Users     │ • DAU/MAU Ratio  │ • ARPU                   │
│ • Viral Coeff.    │ • PDFs/User/Mo   │ • Churn Rate             │
│ • CAC             │ • Session Length │ • LTV                    │
│ • Organic Traffic │ • Feature Adopt. │ • LTV:CAC                │
├───────────────────┼──────────────────┼──────────────────────────┤
│   QUALITY         │   OPERATIONS     │   SATISFACTION           │
├───────────────────┼──────────────────┼──────────────────────────┤
│ • Processing SR   │ • Uptime         │ • NPS                    │
│ • Processing Time │ • API Latency    │ • CSAT                   │
│ • Error Rate      │ • Storage Cost   │ • Support Ticket Rate    │
│ • Page Accuracy   │ • Infra Cost/PDF │ • Review Score           │
└───────────────────┴──────────────────┴──────────────────────────┘
```

### 20.2 Growth KPIs

| KPI | Definition | Measurement | Target (M12) | Alert Threshold |
|---|---|---|---|---|
| Monthly New Registrations | New accounts/month | User DB | 8,000 | < 4,000 |
| Total Registered Users | Cumulative accounts | User DB | 50,000 | < 25,000 |
| Weekly Active Users (WAU) | Unique users active in 7 days | Analytics | 8,000 | < 4,000 |
| Monthly Active Users (MAU) | Unique users active in 30 days | Analytics | 15,000 | < 7,500 |
| Organic Search Traffic | Monthly visits via SEO | Google Search Console | 40,000 | < 20,000 |
| Viral Coefficient (K-factor) | Avg users invited per active user | Referral tracking | ≥ 0.3 | < 0.1 |
| Sign-up Conversion Rate | Visitors → Registrations | Analytics | ≥ 12% | < 6% |
| Activation Rate | Registrations → First PDF in 24h | Processing logs | ≥ 65% | < 40% |

### 20.3 Engagement KPIs

| KPI | Definition | Measurement | Target | Alert |
|---|---|---|---|---|
| DAU/MAU Ratio | Daily engagement stickiness | Analytics | ≥ 20% | < 10% |
| PDFs Processed per MAU | Monthly usage depth | Processing DB | ≥ 4 | < 2 |
| Day-7 Retention | % users returning by Day 7 | Cohort analysis | ≥ 35% | < 20% |
| Day-30 Retention | % users returning by Day 30 | Cohort analysis | ≥ 20% | < 10% |
| Session Duration | Avg time spent per session | Analytics | ≥ 4 min | < 90 sec |
| Preset Creation Rate | % users creating ≥ 1 custom preset | Feature usage | ≥ 25% | < 10% |
| Batch Usage Rate (Pro) | % Pro users using batch processing | Feature usage | ≥ 40% | < 20% |
| Feature Adoption (Watermark) | % Pro users using watermark | Feature usage | ≥ 30% | < 15% |

### 20.4 Revenue KPIs

| KPI | Definition | Measurement | Target (M12) | Alert |
|---|---|---|---|---|
| Monthly Recurring Revenue (MRR) | Recurring subscription revenue | Stripe | $12,500 | < $6,250 |
| MRR Growth Rate | Month-over-month MRR growth | Financial model | ≥ 15%/month | < 8%/month |
| ARPU | MRR ÷ Paid Users | Stripe + DB | $5.00 | < $3.00 |
| Free-to-Paid Conversion | % free users → paid (90-day) | Funnel analytics | ≥ 5% | < 2% |
| Monthly Churn Rate | % paid users cancelling/month | Stripe | ≤ 5% | > 10% |
| Annual Churn Rate | Annual paid user churn | Stripe | ≤ 45% | > 60% |
| Customer Lifetime Value (LTV) | ARPU × (1/Churn Rate) | Calculation | ≥ $45 | < $25 |
| LTV:CAC Ratio | Sustainability indicator | Calculation | ≥ 3:1 | < 1.5:1 |
| Net Revenue Retention (NRR) | Revenue retained + expanded | Stripe | ≥ 100% | < 85% |

### 20.5 Technical and Quality KPIs

| KPI | Definition | Target | Alert |
|---|---|---|---|
| PDF Processing Success Rate | % jobs completing without error | ≥ 99.5% | < 98% |
| Average Processing Time (50MB) | Seconds from submit to download ready | < 30s | > 60s |
| System Uptime | Monthly uptime percentage | ≥ 99.5% | < 99% |
| API P95 Latency | 95th percentile response time | < 500ms | > 1,000ms |
| Error Rate | % API calls returning 5xx | < 0.1% | > 1% |
| Infrastructure Cost per PDF | AWS/GCP cost per processed PDF | < $0.005 | > $0.02 |

### 20.6 Satisfaction KPIs

| KPI | Definition | Measurement | Target | Alert |
|---|---|---|---|---|
| Net Promoter Score (NPS) | Likelihood to recommend (quarterly survey) | Survey | ≥ 45 | < 25 |
| Customer Satisfaction Score (CSAT) | Post-processing rating | In-app survey | ≥ 4.2/5.0 | < 3.5/5.0 |
| Support Ticket Rate | Support tickets ÷ MAU | Helpdesk | < 2% | > 5% |
| First Response Time | Avg hours to first support response | Helpdesk | < 12h | > 48h |
| App Store Rating (Mobile) | Average rating (Phase 3+) | App Store | ≥ 4.3 | < 4.0 |
| G2/Capterra Review Score | Review platform ratings | Review sites | ≥ 4.5 | < 4.0 |

### 20.7 KPI Review Cadence

| Frequency | Metrics Reviewed | Audience |
|---|---|---|
| Daily | Processing success rate, uptime, error rate, new signups | Engineering team |
| Weekly | MAU, PDFs processed, MRR trend, support volume | Product + Engineering |
| Monthly | Full KPI dashboard, cohort analysis, revenue reconciliation | All stakeholders |
| Quarterly | NPS survey results, competitive analysis, roadmap review | Leadership + Investors |
| Annually | Full business review, LTV:CAC, market analysis | Board + Investors |

---

## 21. SCALABILITY CONSIDERATIONS

### 21.1 Scalability Architecture Principles

Imposify is designed with **horizontal scalability** as a core architectural principle. The platform is decomposed into independently scalable components, each able to scale based on its specific load profile.

```
SCALABILITY DESIGN PRINCIPLES:

1. Stateless Application Layer
   → All state stored in DB/Redis, not application memory
   → Any API instance can handle any request
   → Enable blue-green deployments with zero downtime

2. Asynchronous Processing
   → PDF processing never blocks API requests
   → Celery workers scale independently from API
   → Queue depth monitoring triggers auto-scaling

3. Read Replicas
   → Primary PostgreSQL for writes
   → Read replicas for analytics and history queries
   → Connection pooling via PgBouncer

4. CDN-First Static Assets
   → All static assets served via CloudFront/Cloudflare
   → Generated PDFs delivered via CDN from S3
   → Reduces origin server load

5. Database Sharding Strategy (Future)
   → Shard by user_id for processing history
   → Partition by date for analytics tables
   → Redis Cluster for cache at scale
```

### 21.2 Component Scalability Plan

| Component | MVP Capacity | 10K Users Capacity | 100K Users Capacity |
|---|---|---|---|
| **API Servers** | 1 server (4 vCPU) | 3 servers (4 vCPU each, LB) | Auto-scaling group (2–20 instances) |
| **Processing Workers** | 4 Celery workers | 20 workers (5 servers) | 200 workers (Kubernetes pods) |
| **Database** | Single PostgreSQL (8GB RAM) | Primary + 1 read replica | Primary + 3 replicas + connection pooling |
| **Redis/Cache** | Single Redis (2GB) | Redis Sentinel (3 nodes) | Redis Cluster (6 nodes) |
| **Storage** | Local filesystem | AWS S3 (Standard) | AWS S3 + CloudFront CDN + lifecycle policies |
| **Queue** | Redis-backed Celery | Celery + Redis Cluster | Celery + RabbitMQ or AWS SQS |

### 21.3 Database Scalability

#### Schema Design for Scale

```sql
-- Partitioned processing_jobs table for historical scalability
CREATE TABLE processing_jobs (
    id              UUID DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL,  -- pending, processing, completed, failed
    layout_type     VARCHAR(20) NOT NULL,
    pages_input     INTEGER,
    pages_output    INTEGER,
    processing_ms   INTEGER,
    file_size_bytes BIGINT,
    storage_path    TEXT,
    preset_id       UUID REFERENCES presets(id),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partitions auto-created
CREATE TABLE processing_jobs_2025_01 
    PARTITION OF processing_jobs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Indexes for common query patterns
CREATE INDEX idx_jobs_user_created ON processing_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON processing_jobs(status) WHERE status = 'pending';
```

#### Query Optimization Strategy

| Query Type | Optimization |
|---|---|
| User history lookup | Indexed by (user_id, created_at), paginated |
| Processing queue | Redis-backed, DB only for persistence |
| Admin analytics | Pre-aggregated materialized views, refreshed hourly |
| Preset retrieval | Cached in Redis (5-minute TTL) |
| Cost calculations | Client-side computation, no DB involvement |

### 21.4 PDF Processing Scalability

```
PROCESSING QUEUE ARCHITECTURE:

Priority Queue Design:
  Priority 1 (Enterprise): Processed immediately
  Priority 2 (Pro):         Max wait 30 seconds
  Priority 3 (Free):        Max wait 5 minutes

Worker Auto-Scaling Rules:
  IF queue_depth > 50 AND avg_wait > 60s:
    → Scale up: Add 5 workers
  IF queue_depth < 10 AND avg_wait < 10s:
    → Scale down: Remove 2 workers (minimum 4)

Worker Resource Allocation:
  Per worker: 2 vCPU, 4GB RAM
  Memory profile: PyMuPDF peaks at ~2x input file size
  Max file size per worker: 500MB (with swap)

Large File Handling:
  Files > 100MB → Dedicated large-file worker pool
  Files > 200MB → Chunk processing (split into sections, merge output)
```

### 21.5 Storage Scalability

```
STORAGE STRATEGY BY USER TIER:

Free Users:
  - Files deleted after 24 hours
  - No re-download capability
  - Minimal storage footprint per user

Student Plan:
  - Files retained 7 days
  - S3 Standard storage class

Pro Plan:
  - Files retained 30 days
  - S3 Standard for recent, S3-IA for > 7 days

Enterprise:
  - Indefinite retention
  - Customer-specific S3 bucket (data residency)
  - Versioning enabled

S3 Lifecycle Policy:
  Day 0-7:   S3 Standard (₹2.3/GB/month)
  Day 7-30:  S3 Standard-IA (₹1.25/GB/month)
  Day 30+:   S3 Glacier (₹0.4/GB/month) or deletion

Cost Projection:
  1M files × 2MB avg = 2TB storage
  2TB on mixed tiers ≈ $50/month storage cost
```

### 21.6 Geographic Scalability

```
GEOGRAPHIC EXPANSION PLAN:

Phase 1 (MVP): Single Region
  → AWS ap-south-1 (Mumbai, India)
  → Lowest latency for primary market
  → Compliant with India DPDP data residency

Phase 2 (12 Months): Multi-Region CDN
  → CloudFront CDN for static assets globally
  → S3 replication to Singapore (ap-southeast-1) for SEA market
  → Maintain Mumbai as primary processing region

Phase 3 (24 Months): Multi-Region Processing
  → Processing workers in Mumbai + Singapore
  → Route users to nearest processing region
  → Global primary DB with regional read replicas

Phase 4 (36 Months): Global Infrastructure
  → US East region for North America market
  → European region for GDPR compliance
  → Active-Active multi-region architecture
```

---

## 22. ACCESSIBILITY REQUIREMENTS

### 22.1 Compliance Standard

Imposify targets **WCAG 2.1 Level AA** compliance across all user-facing features, with aspirational Level AAA compliance for core workflows.

### 22.2 Visual Accessibility

| Requirement | Specification |
|---|---|
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text (Level AA) |
| **Color Independence** | No information conveyed by color alone (always + icon or text) |
| **Focus Indicators** | Visible focus ring on all interactive elements (3:1 contrast ratio minimum) |
| **Text Resizing** | UI remains functional at 200% browser zoom without horizontal scrolling |
| **Responsive Typography** | Relative font units (rem/em), minimum 16px body text |
| **Dark Mode** | System-preference dark mode support (Phase 2) |
| **High Contrast Mode** | Support Windows High Contrast Mode |

### 22.3 Motor Accessibility

| Requirement | Specification |
|---|---|
| **Keyboard Navigation** | 100% keyboard-accessible interface with logical tab order |
| **Skip Navigation** | "Skip to main content" link at top of each page |
| **Click Target Size** | Minimum 44×44 CSS pixels for all interactive elements |
| **Drag-and-Drop Alternative** | File browser button always available as alternative to drag-and-drop |
| **No Time Limits** | No timed actions in core user workflow (or user-controllable) |
| **Motion Control** | Respect prefers-reduced-motion media query for animations |

### 22.4 Screen Reader Accessibility

| Requirement | Specification |
|---|---|
| **Semantic HTML** | Proper heading hierarchy (h1→h2→h3), landmark regions |
| **ARIA Labels** | All icon buttons have descriptive aria-label attributes |
| **Form Labels** | All form inputs have associated visible labels |
| **Error Identification** | Errors identified by text, not only visual styling |
| **Live Regions** | Processing status updates announced via aria-live |
| **Alt Text** | All non-decorative images have descriptive alt text |
| **PDF Preview** | Alternative text descriptions of page content for screen reader users |

### 22.5 Cognitive Accessibility

| Requirement | Specification |
|---|---|
| **Clear Language** | Plain language (Grade 8 reading level) for all UI text |
| **Consistent Navigation** | Navigation structure consistent across all pages |
| **Error Prevention** | Confirm before destructive actions (delete preset, overwrite) |
| **Progress Indication** | Multi-step processes show current step and total steps |
| **Help Text** | Contextual help text for non-obvious features |
| **Undo Support** | Where possible, provide undo for configuration changes |

### 22.6 Testing and Compliance

| Activity | Frequency | Tool |
|---|---|---|
| Automated accessibility scan | Every PR | axe-core, Lighthouse |
| Manual keyboard navigation test | Monthly | Manual QA |
| Screen reader testing | Quarterly | NVDA (Windows), VoiceOver (Mac/iOS) |
| Color contrast audit | Per major UI change | Colour Contrast Analyser |
| User testing with disabled users | Bi-annually | Recruited participants |
| Third-party accessibility audit | Annually | External accessibility consultant |

---

## 23. INTERNATIONALIZATION REQUIREMENTS

### 23.1 Internationalization Strategy

Imposify is built with **i18n as a first-class feature** from day one, enabling rapid market expansion without codebase refactoring.

### 23.2 Technical I18n Implementation

| Requirement | Specification |
|---|---|
| **Framework** | react-i18next for frontend, Django/FastAPI i18n for backend |
| **String Externalization** | Zero hardcoded user-facing strings in codebase |
| **Translation Files** | JSON-based translation files per locale |
| **Pluralization** | CLDR-compliant plural rules per language |
| **Date/Time** | Locale-aware date formatting using Intl API |
| **Number Formatting** | Locale-aware number formatting (e.g., 1,00,000 vs 100,000) |
| **Currency** | Dynamic currency display based on user locale/preference |
| **Text Direction** | Full RTL support infrastructure (for Arabic, Urdu expansion) |
| **Font Support** | Unicode fonts supporting Devanagari, Bengali, Tamil scripts |

### 23.3 Language Rollout Plan

| Phase | Languages | Target Market | Timeline |
|---|---|---|---|
| Phase 1 | English (en-IN) | India, international students | MVP |
| Phase 2 | Hindi (hi) | Hindi-belt India (UP, MP, Bihar, Rajasthan) | Month 6 |
| Phase 2 | Bengali (bn) | West Bengal, Bangladesh | Month 8 |
| Phase 3 | Tamil (ta) | Tamil Nadu, Sri Lanka | Month 12 |
| Phase 3 | Telugu (te) | Andhra Pradesh, Telangana | Month 14 |
| Phase 3 | Marathi (mr) | Maharashtra | Month 16 |
| Phase 4 | Arabic (ar) | MENA region | Month 20 |
| Phase 4 | Indonesian (id) | Indonesia | Month 22 |
| Phase 5 | Spanish (es) | Latin America | Month 28 |
| Phase 5 | French (fr) | Francophone Africa | Month 30 |

### 23.4 Localization Requirements

#### Currency and Pricing

| Market | Currency | Payment Method |
|---|---|---|
| India | INR (₹) | UPI, Razorpay, Credit/Debit cards |
| Bangladesh | BDT (৳) | bKash, Nagad |
| International | USD ($) | Stripe (cards, wallets) |
| MENA | USD / AED | Stripe, local wallets |

#### Regional Compliance

| Region | Compliance Requirement |
|---|---|
| India | DPDP Act (Digital Personal Data Protection Act 2023) |
| European Union | GDPR (when EU users are served) |
| California, USA | CCPA compliance |
| Bangladesh | ICT Act compliance |

#### Paper Size Localization

| Region | Primary Paper Size | Supported Formats |
|---|---|---|
| India, UK, Global | A4 | A3, A5, A6 |
| USA, Canada | Letter (8.5"×11") | Legal, Tabloid |
| Japan | A4 + B5 | JIS B series |

#### Content Localization Considerations

| Element | Localization Approach |
|---|---|
| Marketing Copy | Full translation + cultural adaptation |
| UI Labels | Direct translation with cultural validation |
| Error Messages | Translated + localized tone |
| Help Documentation | Translated, with region-specific examples |
| Preset Names | Localized (e.g., "CBSE Notes Mode" for Hindi locale) |
| Date Formats | Regional standard (DD/MM/YYYY for India, MM/DD/YYYY for US) |
| Number Formats | Indian numbering system (lakhs/crores) for INR displays |

### 23.5 Translation Management

| Process | Specification |
|---|---|
| **Translation Platform** | Lokalise or Crowdin for collaborative translation management |
| **Translation Quality** | Professional translators for official languages; community review |
| **Translation Coverage Requirement** | 100% of UI strings translated before language launch |
| **Continuous Localization** | New strings automatically detected and queued for translation via CI |
| **Fallback Language** | English (en) as fallback for missing translations |

---

## 24. APPENDIX

### Appendix A: Core Algorithm Reference

#### A.1 N-Up Imposition Algorithm

```python
def calculate_nup_layout(total_pages: int, pages_per_sheet: int, 
                          duplex: bool, grid: tuple) -> list[dict]:
    """
    Calculate page positions for N-Up imposition.
    
    Args:
        total_pages: Total pages in input PDF
        pages_per_sheet: Pages to fit on each output sheet (2, 4, 6, 8, 9)
        duplex: Whether to enable duplex (front/back) printing
        grid: (cols, rows) tuple defining grid layout
    
    Returns:
        List of output pages with page placements
    
    Algorithm:
        For 9-Up Duplex:
        - Total output sheets = ceil(total_pages / 9)
        - For each sheet:
            Front: pages [sheet_num*9-8 ... sheet_num*9] (ascending)
            Back:  pages [corresponding reverse order] (descending)
        
        This ensures: when front sheet 1 is flipped,
        the back page order reads correctly relative to front.
    """
    cols, rows = grid
    assert cols * rows == pages_per_sheet
    
    total_sheets = math.ceil(total_pages / pages_per_sheet)
    output_pages = []
    
    for sheet_idx in range(total_sheets):
        front_start = sheet_idx * pages_per_sheet
        front_pages = list(range(
            front_start + 1, 
            min(front_start + pages_per_sheet + 1, total_pages + 1)
        ))
        
        # Pad with blank if necessary
        while len(front_pages) < pages_per_sheet:
            front_pages.append(None)  # None = blank page
        
        if duplex:
            # Back pages: reverse order of the next section
            back_start = (sheet_idx * 2 + 1) * (pages_per_sheet // 2)
            # [Complex calculation for correct back-page ordering]
            back_pages = calculate_back_pages(front_pages, pages_per_sheet)
        
        output_pages.append({
            'sheet': sheet_idx + 1,
            'front': front_pages,
            'back': back_pages if duplex else None
        })
    
    return output_pages


def calculate_booklet_layout(total_pages: int) -> list[dict]:
    """
    Calculate saddle-stitch booklet imposition.
    
    For a 20-page booklet across 5 sheets:
    Sheet 1: Front [20, 1],  Back [2, 19]
    Sheet 2: Front [18, 3],  Back [4, 17]
    Sheet 3: Front [16, 5],  Back [6, 15]
    Sheet 4: Front [14, 7],  Back [8, 13]
    Sheet 5: Front [12, 9],  Back [10, 11]
    
    Formula:
    For sheet i (0-indexed) of N total sheets:
    Front = [total - 2i, 2i + 1]
    Back  = [2i + 2, total - 2i - 1]
    """
    # Pad to multiple of 4
    padded_total = math.ceil(total_pages / 4) * 4
    total_sheets = padded_total // 4
    
    output = []
    for i in range(total_sheets):
        sheet = {
            'sheet': i + 1,
            'front': [padded_total - (2 * i), (2 * i) + 1],
            'back':  [(2 * i) + 2, padded_total - (2 * i) - 1]
        }
        output.append(sheet)
    
    return output
```

### Appendix B: API Endpoint Reference

#### B.1 Core API Endpoints (MVP)

```
Base URL: https://api.imposify.com/v1/

AUTHENTICATION:
  POST   /auth/register          Register new user
  POST   /auth/login             Login, returns JWT
  POST   /auth/refresh           Refresh access token
  POST   /auth/logout            Invalidate refresh token
  POST   /auth/google            Google OAuth callback
  POST   /auth/password-reset    Request password reset
  PUT    /auth/password          Set new password (with reset token)

USER:
  GET    /users/me               Get current user profile
  PUT    /users/me               Update user profile
  DELETE /users/me               Delete account (GDPR)
  GET    /users/me/stats         Get savings and usage statistics

UPLOADS:
  POST   /uploads                Upload PDF (multipart/form-data)
  GET    /uploads/{id}           Get upload status and metadata
  DELETE /uploads/{id}           Delete uploaded file

LAYOUTS:
  GET    /layouts                List all available layouts
  GET    /layouts/{id}           Get layout details and preview

PRESETS:
  GET    /presets                List user's presets + system presets
  POST   /presets                Create custom preset
  GET    /presets/{id}           Get preset details
  PUT    /presets/{id}           Update preset
  DELETE /presets/{id}           Delete preset
  POST   /presets/{id}/share     Generate shareable preset link

PROCESSING:
  POST   /jobs                   Create processing job
  GET    /jobs/{id}              Get job status
  GET    /jobs/{id}/preview      Get preview thumbnail URLs
  GET    /jobs                   List user's processing history

DOWNLOADS:
  GET    /downloads/{token}      Download processed PDF (signed URL)
  POST   /jobs/{id}/redownload   Generate new download token

COST:
  POST   /cost/estimate          Calculate cost estimate for settings
  GET    /users/me/savings       Get cumulative savings data

ADMIN (requires admin role):
  GET    /admin/users            List all users
  GET    /admin/users/{id}       Get user details
  PUT    /admin/users/{id}       Update user (plan, status)
  GET    /admin/analytics        Platform analytics
  GET    /admin/jobs             System-wide job log
  GET    /admin/health           System health metrics
```

### Appendix C: Database Schema (Key Tables)

```sql
-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(255),
    institution     VARCHAR(255),
    plan            VARCHAR(20) DEFAULT 'free',
    plan_expires_at TIMESTAMP,
    stripe_customer_id VARCHAR(100),
    total_savings_inr DECIMAL(10,2) DEFAULT 0,
    total_sheets_saved INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    last_active_at  TIMESTAMP
);

-- Presets
CREATE TABLE presets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    name            VARCHAR(100) NOT NULL,
    is_system       BOOLEAN DEFAULT FALSE,
    is_public       BOOLEAN DEFAULT FALSE,
    layout_type     VARCHAR(20) NOT NULL,
    settings        JSONB NOT NULL,
    use_count       INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Processing Jobs
CREATE TABLE processing_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    upload_id       UUID REFERENCES uploads(id),
    preset_id       UUID REFERENCES presets(id),
    status          VARCHAR(20) NOT NULL, -- queued|processing|done|failed
    layout_type     VARCHAR(20),
    settings        JSONB,
    input_pages     INTEGER,
    output_pages    INTEGER,
    input_size_bytes BIGINT,
    output_size_bytes BIGINT,
    processing_ms   INTEGER,
    error_message   TEXT,
    storage_path    TEXT,
    download_token  VARCHAR(255),
    token_expires_at TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

-- Uploads
CREATE TABLE uploads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    filename        VARCHAR(500) NOT NULL,
    storage_path    TEXT NOT NULL,
    file_size_bytes BIGINT,
    page_count      INTEGER,
    pdf_version     VARCHAR(10),
    is_encrypted    BOOLEAN DEFAULT FALSE,
    scan_status     VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    stripe_sub_id   VARCHAR(100) UNIQUE,
    plan            VARCHAR(20),
    status          VARCHAR(20),
    billing_cycle   VARCHAR(10), -- monthly|annual
    amount_cents    INTEGER,
    currency        VARCHAR(3),
    current_period_start TIMESTAMP,
    current_period_end   TIMESTAMP,
    cancelled_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### Appendix D: Glossary

| Term | Definition |
|---|---|
| **Imposition** | The arrangement of pages in a specific order so that when printed and folded, they appear in the correct sequence |
| **N-Up** | A printing term for fitting N document pages onto a single sheet of paper |
| **Duplex Printing** | Printing on both sides of a sheet of paper |
| **Saddle-Stitch Booklet** | A binding method where folded sheets are stapled through the fold (like a magazine) |
| **Perfect Bound** | A binding method where pages are glued to a flat spine |
| **Gutter** | The inner margin between pages on a two-page spread |
| **Bleed** | Extra content beyond the trim edge, to avoid white edges when cut |
| **Celery** | Python distributed task queue for async processing |
| **PyMuPDF** | Python bindings for the MuPDF library for PDF manipulation |
| **JWT** | JSON Web Token — a compact, URL-safe means of representing claims |
| **SLA** | Service Level Agreement — a commitment to a defined level of service |
| **MRR** | Monthly Recurring Revenue |
| **ARR** | Annual Recurring Revenue |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Customer Lifetime Value |
| **NPS** | Net Promoter Score |
| **WCAG** | Web Content Accessibility Guidelines |
| **GDPR** | General Data Protection Regulation (EU) |
| **DPDP** | Digital Personal Data Protection Act (India, 2023) |
| **CDN** | Content Delivery Network |
| **RTL** | Right-to-Left text direction |
| **SSO** | Single Sign-On |
| **SAML** | Security Assertion Markup Language (enterprise identity federation) |
| **MAU** | Monthly Active Users |
| **DAU** | Daily Active Users |
| **CSAT** | Customer Satisfaction Score |
| **SOM** | Serviceable Obtainable Market |
| **SAM** | Serviceable Addressable Market |
| **TAM** | Total Addressable Market |

---

### Appendix E: Document Control

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | June 2025 | Product Team | Initial draft |
| 0.5 | June 2025 | Product Team | Added user stories, acceptance criteria |
| 1.0 | June 2025 | Product Team | Complete PRD — investor-ready draft |

---

### Appendix F: References and Resources

| Resource | Link |
|---|---|
| WCAG 2.1 Guidelines | https://www.w3.org/TR/WCAG21/ |
| PDF Specification (ISO 32000) | https://www.adobe.com/devnet/pdf/pdf_reference.html |
| PyMuPDF Documentation | https://pymupdf.readthedocs.io/ |
| Celery Documentation | https://docs.celeryq.dev/ |
| React i18next | https://react.i18next.com/ |
| Stripe API Documentation | https://stripe.com/docs/api |
| DPDP Act (India 2023) | https://www.meity.gov.in/dpdp |
| AWS S3 Documentation | https://docs.aws.amazon.com/s3/ |

---

**Document Status: COMPLETE — Version 1.0**

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT SIGN-OFF                        │
├─────────────────────────────────────────────────────────────┤
│  Product Manager:    ________________  Date: _____________  │
│  Engineering Lead:   ________________  Date: _____________  │
│  Design Lead:        ________________  Date: _____________  │
│  Business Lead:      ________________  Date: _____________  │
│  Legal Review:       ________________  Date: _____________  │
└─────────────────────────────────────────────────────────────┘

IMPOSIFY — Intelligent PDF Imposition and Print Optimization Platform
PRD Version 1.0 | Confidential | © 2025 Imposify
```
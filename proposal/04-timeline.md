# Timeline

**RFP #MC-2026-0417 — Inventory Dashboard Modernization**
Submitted by: Accenture
Date: April 28, 2026

---

We propose a **four-week delivery plan** for the required scope (R1–R4), with an optional two-week extension for the desired items (D1–D3) if elected. Assuming contract execution by May 19, 2026, delivery of required scope is targeted for June 13, 2026.

---

## Phase 1 — Onboarding & Audit (Week 1, May 19–23)

| Activity | Output |
|---|---|
| Repository access and environment setup | Running dev environment confirmed |
| Architecture review (R4) | Draft `architecture.html` shared with Meridian IT for review |
| Reports module audit (R1) | Defect log shared with Meridian — scope confirmed before fixes begin |
| Restocking data model review (R2) | Confirmed: existing data is sufficient; no scope change needed |

**Milestone: Defect log and architecture draft approved by Meridian IT.**

---

## Phase 2 — Core Delivery (Weeks 2–3, May 26–June 6)

| Activity | Output |
|---|---|
| Reports remediation — filter wiring (R1) | Filters operational |
| Reports remediation — i18n + pattern normalization (R1) | All locale keys present, Composition API consistent |
| Restocking backend endpoint (R2) | `GET /api/restocking` live, tested |
| Restocking frontend view (R2) | `Restocking.vue` live, budget input + ranked table working |
| Playwright test suite — first flows (R3) | Dashboard, Inventory, Orders covered |

**Milestone: R1 and R2 functional in dev environment. First test runs passing.**

---

## Phase 3 — Hardening & Handoff (Week 4, June 9–13)

| Activity | Output |
|---|---|
| Playwright test suite — remaining flows (R3) | Reports and Restocking flows covered; full suite passing |
| Architecture documentation — final revision (R4) | `architecture.html` finalized, incorporating IT feedback |
| Defect retest | All R1 issues verified closed |
| Handoff session with Meridian IT | Walkthrough of test suite, architecture doc, and deployment notes |

**Milestone: All R1–R4 deliverables accepted. IT sign-off on test suite.**

---

## Optional Phase — D1–D3 (Weeks 5–6, June 16–27)

Contingent on Meridian electing the optional scope by June 6. Requires design direction approval (D1) and translation materials (D2) to be provided by June 13.

| Week | Activity |
|---|---|
| Week 5 | UI modernization (D1): design token refresh, component styling |
| Week 5 | i18n extension (D2): `ja` locale across all remaining views |
| Week 6 | Dark mode (D3): CSS custom properties + toggle component |
| Week 6 | Optional scope testing + final handoff |

---

## Summary

| Phase | Dates | Key milestone |
|---|---|---|
| Phase 1 — Onboarding & Audit | May 19–23 | Defect log approved |
| Phase 2 — Core Delivery | May 26–June 6 | R1 + R2 functional |
| Phase 3 — Hardening & Handoff | June 9–13 | R1–R4 accepted by IT |
| Optional — D1–D3 | June 16–27 | If elected by June 6 |

We do not pad timelines. If Phase 2 runs ahead of schedule, Phase 3 begins early. Meridian will be updated weekly with a written status note — no status meetings required unless requested.

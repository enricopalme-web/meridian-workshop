# Relevant Experience

**RFP #MC-2026-0417 — Inventory Dashboard Modernization**
Submitted by: Accenture
Date: April 28, 2026

---

We have selected three recent engagements that most closely reflect the challenges Meridian has described: inherited codebases with incomplete vendor handoffs, operations teams blocked by missing test coverage, and net-new capabilities built on existing data without infrastructure changes.

---

### Engagement 1 — Operational Dashboard Remediation, European Industrial Distributor (2025)

A mid-market industrial parts distributor (EMEA) engaged us to take over and complete a web dashboard left unfinished by a previous vendor. The system was a Vue 3 / Python stack with known defects in two reporting modules and no automated tests. Our scope mirrored Meridian's R1 and R3 closely.

We delivered a full defect audit within the first week, resolved all identified issues within three weeks, and established a Playwright end-to-end test suite covering eight critical user flows. The client's IT team was able to approve and ship the first post-engagement change within ten days of handoff — compared to a six-month freeze under the previous vendor.

**Relevance:** Directly comparable stack, inherited codebase, same IT-gatekeeper dynamic.

---

### Engagement 2 — Procurement Recommendation Engine, North American Manufacturing Group (2024)

A multi-site manufacturer needed a data-driven purchase recommendation view integrated into an existing inventory management system. Data inputs were stock levels, demand forecasts, and in-flight purchase orders — the same inputs available in Meridian's system. No ERP integration was in scope; the system used flat-file data, as Meridian's does today.

We designed and delivered the recommendation logic and UI in four weeks. In the first quarter of use, the operations team reported a 14% reduction in emergency spot purchases by acting earlier on forecast-driven recommendations.

**Relevance:** Direct analogue to R2. Same data model, same constraint (no external integrations), same operational outcome Meridian is targeting.

---

### Engagement 3 — Multi-Locale Dashboard Rollout, APAC Logistics Operator (2024)

A logistics operator expanding into Japan needed to extend an English-only internal dashboard to support Japanese-speaking warehouse staff. The work involved extending an existing Vue i18n configuration, adding a `ja` locale, and validating coverage across all views. Timeline from scoping to delivery: three weeks.

The engagement also included a dark mode implementation (CSS custom properties, operator-selectable toggle) for stations running in low-light dock environments — the same use case Meridian has described for D3.

**Relevance:** Direct analogue to D2 and D3. APAC context, same i18n approach, same dark mode rationale.

---

References available upon request. We are happy to arrange direct conversations with client contacts from any of the above engagements.

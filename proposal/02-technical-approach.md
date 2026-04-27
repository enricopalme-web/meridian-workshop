# Technical Approach

**RFP #MC-2026-0417 — Inventory Dashboard Modernization**
Submitted by: Accenture
Date: April 28, 2026

---

## Overview

We have reviewed the full source code and the previous vendor's handoff notes. The system is a Vue 3 frontend communicating with a Python FastAPI backend, with data served from JSON files in memory. There is no database layer. The architecture is well-structured — views are cleanly separated, API boundaries are clearly defined, and the filter system is consistently designed across most modules. This is not a system that needs to be rebuilt. It needs to be completed, stabilized, and extended.

Our approach is **additive**: we do not propose structural changes to the existing architecture. Every item in this engagement — including the new Restocking capability — can be delivered within the current stack without a database migration, a framework change, or a rebuild of existing views.

The sections below describe how we will address each requirement in §3 of the RFP.

---

## R1 — Reports Module Remediation

The Reports module is the highest-priority item in Meridian's list, and the one with the most direct operational impact. Our team's initial review of the source confirms that the view is incomplete: the four filter dimensions (Time Period, Warehouse, Category, Order Status) are not fully wired to the backend endpoints (`/api/reports/quarterly` and `/api/reports/monthly-trends`), and several internationalization keys present in other views are absent here.

Our remediation approach:

1. **Structured audit.** We will produce a defect log documenting every identified issue against the eight categories Meridian has flagged, plus any additional issues found during audit. This log will be shared with Meridian IT before work begins so that scope is agreed.

2. **Filter remediation.** Each filter dimension will be connected to the appropriate API query parameter, with reactive state management consistent with the Composition API patterns used in the rest of the application. We will not patch individual filters in isolation — we will align the Reports view to the same data-flow pattern used in `Inventory.vue` and `Orders.vue`, which are working correctly.

3. **i18n gap closure.** Missing locale keys will be identified and added to the translation files. We will validate coverage against all three warehouse locales in scope.

4. **Data pattern normalization.** Any remaining Options API usage in the Reports view will be migrated to Composition API, consistent with the rest of the codebase.

**Deliverable:** Resolved defect log + updated source. All fixes will be covered by the automated test suite delivered under R3.

---

## R2 — Restocking Recommendations

This is the net-new capability Meridian's operations team has requested. The goal is a view that answers a practical question: *given current stock levels, projected demand, and a budget ceiling, what should we order, and in what order of priority?*

**Data inputs available in the existing system:**
- `inventory.json` — current stock by SKU, warehouse, and category
- `demand_forecasts.json` — projected demand by SKU
- `purchase_orders.json` — purchase orders already in flight (to avoid double-ordering)

No external ERP integration is required or in scope. The data needed to produce meaningful recommendations exists in the current system.

**Backend:** We will add a new endpoint, `GET /api/restocking`, accepting `budget` and `warehouse` as query parameters. The logic will:
- Identify SKUs where projected demand exceeds current stock minus committed purchase orders
- Calculate a recommended order quantity to cover the gap
- Rank recommendations by criticality (largest gap relative to demand, weighted by category)
- Filter the ranked list to fit within the supplied budget ceiling
- Return a structured response suitable for display and export

**Frontend:** A new `Restocking.vue` view, registered as a route in Vue Router, will provide:
- A budget ceiling input field (operator-defined, not hardcoded)
- A warehouse selector (consistent with the filter pattern in other views)
- A ranked recommendation table showing SKU, current stock, projected demand, recommended order quantity, and estimated cost
- An export option for the operations team

**Assumption:** Demand forecast data and purchase order data in the existing JSON files are sufficient inputs. If Meridian wishes to connect to an external procurement or ERP system in the future, the API boundary we are establishing makes that straightforward to add.

**Deliverable:** Working Restocking view + new backend endpoint, covered by Playwright tests under R3.

---

## R3 — Automated Browser Testing

The absence of automated test coverage is the single change that will have the greatest ongoing impact on Meridian's ability to operate and evolve the system. IT's reluctance to approve changes is a rational response to having no safety net. R3 is not a nice-to-have — it is the prerequisite that makes all future work sustainable.

We will use **Playwright** for end-to-end browser testing. Playwright tests run against the live application in a real browser, which means they validate the full stack — Vue components, API calls, FastAPI logic, and data rendering — in a single pass.

**Critical flows to be covered:**

| Flow | What it validates |
|---|---|
| Dashboard load | Summary KPIs render correctly across warehouses |
| Inventory — filter by warehouse | Filter applies, table updates, no console errors |
| Inventory — filter by category | Same as above for category dimension |
| Orders — filter by status and month | Both filter dimensions work in combination |
| Reports — quarterly view | Filter wiring fixed under R1 is exercised |
| Reports — monthly trends | Same |
| Restocking — recommendation generation | Budget input → ranked table renders with correct data |

Tests will be structured for CI execution (the test runner can be invoked with a single command against a running dev server) and documented with setup instructions suitable for Meridian IT to run independently.

**Deliverable:** Playwright test suite in the `tests/` directory. Documentation for IT covering installation, execution, and expected output.

---

## R4 — Architecture Documentation

We will deliver a self-contained HTML document (`architecture.html`) providing:

- **Component map:** Vue views → API client (`api.js`) → FastAPI routes → in-memory data layer (JSON files), with data flow direction annotated
- **Filter system explanation:** How the four filter dimensions (Time Period, Warehouse, Category, Order Status) flow from UI state through query parameters to backend filtering logic
- **View inventory:** What each of the seven views does, what data it consumes, and which API endpoints it calls
- **Deployment topology:** Current-state runtime (dev server on port 3000, FastAPI on port 8001) and notes on what would be required for production deployment
- **Known limitations:** No database persistence, no authentication layer, single-instance deployment assumed

The audience is Meridian IT, not a future vendor. The document will be written for people who need to operate and support the system, not for people who need to extend it.

**Deliverable:** `proposal/architecture.html` — self-contained, no external dependencies, viewable in any browser.

---

## D1–D3 — Optional Phase

The following items are proposed as a separate optional phase, scoped and priced independently from the required work. They will not be started until R1–R4 are delivered and accepted.

**D1 — UI Modernization.** We will refresh the visual design by updating design tokens (colors, typography, spacing, component sizing) in a shared stylesheet. No structural changes to Vue components. The result will be a more contemporary visual style while preserving all existing functionality. We will present two design direction options for Meridian to choose from before implementation begins.

**D2 — Internationalization.** We will extend the Vue i18n locale configuration to cover all remaining views that currently display English-only text. We will add a Japanese (`ja`) locale targeted at the Tokyo team. Assumption: Meridian will either provide Japanese translations or approve a machine-translated draft that we prepare.

**D3 — Dark Mode.** We will implement an operator-selectable dark theme using CSS custom properties, with a toggle component accessible from the application header. To manage risk, dark mode will be prototyped on an isolated branch before being merged to the main codebase — this is a standard practice that ensures the existing light theme is never inadvertently broken during development.

---

## Assumptions

The following assumptions are embedded in this technical approach. We ask Meridian to review them and flag any disagreements before contract execution.

1. **No database migration.** The engagement operates on the existing JSON-backed in-memory data layer. A migration to a relational database is not in scope.
2. **No external integrations.** The Restocking feature will use data already present in the system. ERP, procurement platform, or supplier API integrations are out of scope.
3. **Dev environment access.** We will be given access to the source repository and will work in the existing development environment (Node + Python + uv).
4. **i18n translations (D2).** If D2 is elected, Meridian will provide or approve Japanese translations within five business days of our request.
5. **"Critical flows" (R3).** We have defined critical flows in the table above. If Meridian IT has additional flows they consider mandatory, those should be communicated before work begins.
6. **Design direction (D1).** If D1 is elected, Meridian will nominate a stakeholder to approve design direction within two business days of our options presentation.

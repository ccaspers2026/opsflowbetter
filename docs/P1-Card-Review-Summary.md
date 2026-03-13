# Phase 1 Card Review Summary
**Session Date:** March 12, 2026
**Version:** v0.90.2
**PQ Tasks:** T-106 through T-112

---

## Core Principles Established

1. **Idea to Market in 10 days** — every card serves speed. No unnecessary manual data entry.
2. **Automation first, user confirmation always** — automate as much as possible, user reviews and approves.
3. **Niche market targeting** — core business model. Cards must support niche discovery and validation.
4. **AI Assist pattern** — app builds detailed prompt (JSON) from prior card data, user copies to AI, AI returns JSON response, user pastes back into card, reviews, edits, confirms.
5. **P1 is hypothesis through validation** — starts with assumptions, ends with data-backed GO/NO-GO.
6. **P1 feeds P2** — everything captured in P1 must be sufficient for P2 to begin design work.
7. **Models/variants defined in P1, built in P2** — by P1 end, you know what you're making and how many flavors.
8. **Tool evaluation before wiring** — before adding any external service, evaluate alternatives and pricing. Services page tracks tools.
9. **Estimated vs actual costs** — P1.5 works with estimates. P2.3 produces actual COGS. Income math re-validates after P2.3.

---

## Card Definitions

### P1.1 — Product Idea (The Spark)
**Purpose:** Capture the hypothesis. Is this worth looking into?
**Weight:** Lightweight, fast. Minutes, not hours.

**Fields:**
- Product Idea — user types the spark (what is it)
- Problem it might solve — user's best guess
- Why you — user's capability (printer fleet, materials, interest)
- Assumed Customer — who user thinks buys it, auto-note: *"Validated in P1.2 Market Research"*

**Data sources:**
- Mostly user-driven
- "Why you" could flow from Workshop (printer fleet, materials available)
- AI Assist cleans up language, light polish only

**Key insight:** This card is the user's card, not AI's card. AI's heavy lifting starts at P1.2.

---

### P1.2 — Market Research (Prove the Market)
**Purpose:** Validate the market exists in your niche. Prove demand, size the opportunity.

**Fields:**
- Search Terms & Volume — monthly search data (Keyword Keg / Helium 10)
- Market Size — competitor count, total niche revenue
- Price Range — low to high across current offerings
- Customer Complaints — what buyers hate about current options
- Market Share Opportunity — what % you could realistically capture
- Platforms — Amazon, Etsy, wherever the niche lives

**Data sources:**
- External services: Helium 10, Keyword Keg, Amazon data
- Automate when tools wired; screenshot/paste as bridge until then
- Heavy AI Assist — user feeds raw tool data, AI structures and analyzes (JSON in/out)

**Data flows forward:**
- Customer complaints → P1.3 (competitive gaps) and eventually P2.1 (design requirements)
- Price range → P1.5 (income math)
- Market share estimate → P1.4 (viability scoring)
- Validates or corrects P1.1 Assumed Customer

**Notes:**
- Before wiring any tool, evaluate alternatives and pricing
- Tools are addable/removable as P2M builds out

---

### P1.3 — Competitive Analysis (Find the Gap)
**Purpose:** Know who you're up against and where the opening is.
**Core principle:** What are competitors doing wrong that you can do right?

**Fields:**
- Top Competitors — 3-5 listings with name, price, rating, review count (from P1.2, refined here)
- Strengths — what they do well (market bar to meet)
- Weaknesses — buyer complaints (from P1.2, deepened here)
- Gap Analysis — where's the opening for your product
- Your Positioning — how you fill that gap
- Product Line Definition — models, variants, tiers emerge here from market gaps and user capabilities

**Handles two scenarios:**
- **Scenario A — Competitors exist:** Standard competitive analysis, strengths/weaknesses/gaps
- **Scenario B — No direct competitors:** Analyze adjacent/substitute products. Customer complaints about workarounds and substitutes define what your product needs to solve. Ask: why doesn't this exist? No demand, or nobody thought of it?

**Data sources:**
- Same market data services as P1.2
- AI Assist structures comparison and identifies gaps (JSON in/out)

**Data flows forward:**
- Gap analysis → P1.4 (scoring)
- Customer complaints + gap → P2.1 (design requirements)
- Product Line Definition → P1.5 (per-model math) and P2 (branching per model)
- By end of P1.3, you know what you're making — how many models, what variants

**Key insight:** Models/variants come from real discovery — personal experience (arthritis → EasyLift), design iteration (The Crown looked like a crown), competitive gaps (PinchGrip — nothing low-profile existed). P1.3 is where they crystallize.

---

### P1.4 — Niche Viability Score (Score It)
**Purpose:** Turn gut feeling + data into an objective score. GO or NO-GO before spending time on income math.

**Fields:**
- 6 Scoring Factors — each rated 1-5 with rationale (factors subject to refinement)
  - Market Demand
  - Competition Gap
  - Margin Potential
  - Differentiation
  - Production Fit
  - Scalability
- Total Score — auto-calculated, threshold 18/30
- Pass/Fail — auto-determined
- Confidence Notes — which scores are data-backed vs estimates

**Critical requirement:** Each factor shows the evidence trail — the source data it pulled from P1.2/P1.3/Workshop alongside the score. User reads the evidence, agrees or adjusts. Scorecard with receipts.

**Data sources:**
- Market Demand ← P1.2 search volume, market size
- Competition Gap ← P1.3 gap analysis
- Margin ← P1.2 price range vs production costs (Workshop/Materials Catalog)
- Differentiation ← P1.3 positioning
- Production Fit ← Workshop (printer fleet, materials, capacity)
- Scalability ← Workshop fleet size, expansion potential
- AI Assist pulls from prior cards, scores with rationale (JSON in/out)
- User confirms or adjusts each score

**Data flows forward:**
- Score + rationale → G1 gate decision
- Scoring factors created by RIP Claude — starting point, can be refined as we use it

---

### P1.5 — Income Target Math (Check the Money)
**Purpose:** Work backward from income goal. Can you make enough money making this thing with your production setup?

**Structure:**
- **Sub-card per model/variant** — one card per unique cost profile (model + color/material combo)
  - Example: EasyLift Black, EasyLift GITD, The Crown Black = 3 separate sub-cards
- **Summary card** — rolls up all sub-cards into product line income target math
- Single-model products = one card, no sub-cards needed

**Sub-card fields (per model/variant):**
- Target Price — informed by P1.2/P1.3 market positioning
- Estimated COGS (not actual — actual comes from P2.3):
  - Filament cost — from Materials Catalog (material type × estimated weight)
  - Machine time — from Workshop (hourly rate × estimated print time)
  - Hardware/BOM items — from Materials Catalog (estimated quantity × unit cost)
  - Packaging — from Materials Catalog
  - Assembly labor — estimated if applicable
- Estimated Net Profit Per Unit
- Units Needed / Month and / Day — auto-calculated from income target
- Estimated Print Time
- Printer Capacity — from Workshop fleet data

**Summary card fields:**
- Income Target — per product line, user sets it
- Scenario ranges — not one fixed forecast; does the math work across reasonable scenarios?
- Fleet Capacity Check — total printers needed vs available
- Verdict — FEASIBLE / NOT FEASIBLE

**Important distinction:**
- P1.5 = **estimated COGS** (pre-design, working with rough numbers)
- P2.3 = **actual COGS** (post-design, locked specs, exact weights and times)
- After P2.3, income math re-validates with real numbers
- G2 gate should verify: does the locked design still hit the income target?

**Data sources:**
- Filament/hardware/packaging costs ← Materials Catalog (new page — see below)
- Machine hourly rate ← Workshop
- Fleet capacity ← Workshop
- Price positioning ← P1.2/P1.3
- Mostly math — app could compute natively once inputs populated
- AI Assist role: pull numbers, structure calculation, flag assumptions (JSON in/out)

---

### G1 — GO / NO-GO Gate (The Decision)
**Status:** Not yet reviewed — next up

---

## New Page Required: Materials Catalog

**What it is:** Single source of truth for everything that goes into a product.

**Why:** Currently filament data lives in Workshop, hardware doesn't exist anywhere. P1.5 income math and P2.3 BOM both need consistent material/cost data from one place.

**Structure:** Simple CRUD table, line items (not cards). Easy entry, add/edit/remove.

**Fields per item:**
- Item Name — PETG-HF Black, M3x5 Heat Insert, Poly Bag Small, etc.
- Category — Filament, Hardware, Packaging, Consumable
- Unit of Measure — grams, each, roll, bag
- Unit Cost — $0.01299/g, $0.03/each, $0.05/each
- Supplier — Amazon, Fastenal, local source
- Notes — any relevant detail

**Three-layer architecture:**
1. **Materials Catalog** (build now) — defines what's available and what it costs
2. **BOM per product** (P2.3) — picks from catalog, defines quantities per unit
3. **Inventory** (future) — tracks quantities on hand, reorder points, stock levels

**Action:** Pull filament data out of Workshop, move to Materials Catalog as starting content. Workshop keeps fleet info, overhead, labor.

---

## Data Flow Architecture

```
Workshop (fleet, rates, labor)
        ↓
Materials Catalog (filaments, hardware, packaging, consumables + costs)
        ↓
P1.1 (spark + assumptions)
  → P1.2 (market validation via external tools)
    → P1.3 (competitive gaps + product line definition)
      → P1.4 (viability scoring with evidence trail)
        → P1.5 (estimated income math, per model/variant sub-cards)
          → G1 (GO / NO-GO)
            → P2.1 (design brief — receives requirements from all of P1)
                    ↑ P1.2 price point → COGS ceiling → design constraint
              → P2.2 (prototype & iterate)
                → P2.3 (lock settings + actual BOM/COGS → re-validate income math)
                  → G2 (design lock — verify income target still works)
```

---

## AI Assist Pattern (All Cards)

1. User clicks AI Assist on a card
2. App auto-builds a detailed prompt pulling data from prior cards + Workshop + Materials Catalog (all JSON)
3. Prompt is specific and detailed — learned lesson: vague prompts produce vague results
4. User copies prompt, pastes to AI
5. AI returns structured JSON with analysis/scores/calculations
6. User pastes JSON back into card
7. Card populates, user reviews, edits if needed
8. Confirm, mark GREEN

---

## Price Point as Design Constraint

Market research (P1.2/P1.3) doesn't just validate demand — it sets the retail price target. That works backward through supply chain math to establish a COGS ceiling. When P2.1 Design begins, that ceiling is a constraint: "I can't use expensive hardware or long print times because I need to stay under $X COGS to hit my price point." Data flow: P1.2 price range → P1.5 estimated COGS ceiling → P2.1 design constraint.

---

## External Tools / Automation Notes

- Before wiring any tool, evaluate alternatives and pricing
- Current tools on Services page: Helium 10, Keyword Keg, remove.bg, Onshape (CAD — NOT Fusion 360), Amazon Seller Central
- Tools are addable/removable as P2M builds out
- Goal: maximum automation, minimum manual data entry
- Bridge until tools wired: user runs external tool, screenshots/pastes data, AI analyzes

### Tool Access & Business Model

- **Free path always available** — manual entry + AI Assist copy/paste works without any paid tools
- **Connected tools are optional add-ons** — users who want automation can wire up services
- **Future subscription model consideration** — if P2M is offered to customers:
  - Basic tier: manual + AI Assist (no connected tools)
  - Premium tier: connected tool integrations (Helium 10, Keyword Keg, etc.)
  - Tool access capability itself could be a pricing lever
- Architecture must support both paths — never require a paid tool for core functionality

---

## Next Steps

1. **G1 Gate review** — complete the P1 card-by-card review
2. **Commit this summary** to repo
3. **Create backlog items** for:
   - Materials Catalog page (new page to build)
   - Move filament data from Workshop to Materials Catalog
   - P1 card UI rebuild (editable fields, AI Assist buttons, data flow wiring)
   - P1.5 sub-card architecture (addable cards per model/variant)
4. **Update Flow diagram** if card definitions changed materially
5. **Begin rebuilding P1 card content** for 45 RPM Adaptor using new definitions

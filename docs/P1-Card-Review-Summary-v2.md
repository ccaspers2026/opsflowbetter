# Phase 1 Card Review Summary — v2
**Session Date:** March 13, 2026
**Version:** v0.90.2
**PQ Tasks:** T-106 through T-112

---

## Core Principles Established

1. **Idea to Market in 10 days** — every card serves speed. No unnecessary manual data entry.
2. **Automation first, user confirmation always** — automate as much as possible, user reviews and approves.
3. **Niche market targeting** — core business model. Cards must support niche discovery and validation.
4. **AI Assist pattern** — app builds detailed prompt (JSON) from prior card data, user copies to AI, AI returns JSON response, user pastes back into card, reviews, edits, confirms. Prompts must be detailed and specific — vague prompts produce vague results.
5. **P1 is hypothesis through validation** — starts with assumptions, ends with data-backed GO/NO-GO.
6. **P1 feeds P2** — everything captured in P1 must be sufficient for P2 to begin design work.
7. **Models/variants defined in P1, built in P2** — by P1 end, you know what you're making and how many flavors.
8. **Tool evaluation before wiring** — before adding any external service, evaluate alternatives and pricing. Services page tracks tools.
9. **Estimated vs actual costs** — P1.5 works with estimates. P2.3 produces actual COGS. Income math re-validates after P2.3.
10. **Price point as design constraint** — P1.2 market research sets the retail price target, which works backward to a COGS ceiling that constrains P2.1 design decisions.
11. **Free path always available** — core functionality never requires a paid tool. Connected tools are optional upgrades.

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

**Key insight:** This card is the user's card, not AI's card. AI's heavy lifting starts at P1.2. P1.1 is the hypothesis — not perfect, not proven, just enough to justify looking further.

---

### P1.2 — Market Research (Prove the Market)
**Purpose:** Validate the market exists in your niche. Prove demand, size the opportunity. Also establishes the price point target that becomes a design constraint in P2.

**Fields:**
- Search Terms & Volume — monthly search data (Keyword Keg / Helium 10)
- Market Size — competitor count, total niche revenue
- Price Range — low to high across current offerings (this becomes the COGS ceiling driver)
- Customer Complaints — what buyers hate about current options
- Market Share Opportunity — what % you could realistically capture
- Platforms — Amazon, Etsy, wherever the niche lives

**Data sources:**
- External services: Helium 10, Keyword Keg, Amazon data
- Automate when tools wired; screenshot/paste as bridge until then
- Heavy AI Assist — user feeds raw tool data, AI structures and analyzes (JSON in/out)

**Data flows forward:**
- Customer complaints → P1.3 (competitive gaps) and eventually P2.1 (design requirements)
- Price range → P1.5 (income math) and P2.1 (COGS ceiling = design constraint)
- Market share estimate → P1.4 (viability scoring)
- Validates or corrects P1.1 Assumed Customer
- Helps drive model/variant decisions in P1.3

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

**Adjacent/substitute analysis:** Even when no direct competitor exists, there are almost always substitutes people use instead. Complaints about those substitutes serve the same role as competitor weaknesses — they define design requirements and feed P2.1.

**Data sources:**
- Same market data services as P1.2
- AI Assist structures comparison and identifies gaps (JSON in/out)

**Data flows forward:**
- Gap analysis → P1.4 (scoring)
- Customer complaints + gap → P2.1 (design requirements)
- Product Line Definition → P1.5 (per-model math) and P2 (branching per model)
- By end of P1.3, you know what you're making — how many models, what variants

**Key insight:** Models/variants come from real discovery — personal experience (arthritis → EasyLift), design iteration (The Crown looked like a crown), competitive gaps (PinchGrip — nothing low-profile existed). P1.3 is where they crystallize. Market research helps define what's needed up front.

---

### P1.3b — Customer Validation (Optional — Quick Pulse)
**Purpose:** Get a signal from real potential customers before scoring viability. Not blocking — can run in parallel with P1.4.

**Fields:**
- Product concept summary — auto-populated from P1.1/P1.3
- Suggested communities/platforms — AI Assist generates based on target customer
- Draft post — AI Assist writes, user edits voice/tone
- Response summary — user pastes feedback, AI Assist analyzes sentiment and key themes (JSON)
- Validation signal — Positive / Mixed / Negative with evidence

**Three-tier approach (user chooses):**
- **Free:** AI Assist identifies communities (subreddits, forums, Facebook groups, Discord servers) + drafts post. User posts and collects feedback.
- **Low cost ($50-150):** Micro-survey platforms (PickFu, Pollfish, SurveyMonkey Audience). AI Assist builds the survey targeting criteria. Platform handles respondent sourcing. Results in 24-48 hours.
- **Higher cost:** Market research firm or validated service handles end to end. More reliable than random Fiverr freelancers — look for companies that specialize in product concept validation.

**AI Assist role:**
- Recommends which tier fits based on product and budget
- Suggests specific communities/platforms for free path (e.g., "for vinyl accessory, try r/vinyl, r/turntables, Steve Hoffman Forums")
- Drafts natural-sounding posts that don't scream "market research"
- Analyzes responses and extracts key themes
- Could recommend specific validation services based on product category

**Finding reliable help:** Fiverr is hit or miss for this kind of work. AI Assist could recommend validated services or companies that specialize in quick product concept testing, rather than taking pot shots on freelancer platforms.

**Data flows forward:**
- Validation signal strengthens or challenges P1.4 scoring (Market Demand, Differentiation factors)
- Customer quotes/feedback can inform P2.1 design requirements
- Optional — pipeline proceeds without it, but results improve G1 confidence

---

### P1.4 — Niche Viability Score (Score It)
**Purpose:** Turn gut feeling + data into an objective score. GO or NO-GO before spending time on income math.

**Fields:**
- 6 Scoring Factors — each rated 1-5 with rationale (factors subject to refinement as we use them)
  - Market Demand
  - Competition Gap
  - Margin Potential
  - Differentiation
  - Production Fit
  - Scalability
- Total Score — auto-calculated, threshold 18/30
- Pass/Fail — auto-determined
- Confidence Notes — which scores are data-backed vs estimates

**Critical requirement: Scorecard with receipts.** Each factor shows the source data pulled from P1.2/P1.3/Workshop alongside the score. User reads the evidence trail, agrees or adjusts. The score alone means nothing without the "why."

Example: "Competition Gap: 5/5 — Only 3 direct competitors, highest rated has fit complaints (Frienda, 776 reviews, 38% mention poor fit), no 3D printed option exists. Source: P1.3."

**Data sources:**
- Market Demand ← P1.2 search volume, market size
- Competition Gap ← P1.3 gap analysis
- Margin ← P1.2 price range vs production costs (Workshop/Materials Catalog)
- Differentiation ← P1.3 positioning
- Production Fit ← Workshop (printer fleet, materials, capacity)
- Scalability ← Workshop fleet size, expansion potential
- Customer validation (if available) ← P1.3b
- AI Assist pulls from prior cards, scores with rationale (JSON in/out)
- User confirms or adjusts each score

**Data flows forward:**
- Score + rationale → G1 gate decision
- Scoring factors created by RIP Claude — starting point, to be refined through use

---

### P1.5 — Income Target Math (Check the Money)
**Purpose:** Work backward from income goal. Can you make enough money making this thing with your production setup?

**Important:** At P1.5, you haven't designed anything yet. These are ESTIMATED costs — rough numbers to see if the economics are in the ballpark. Actual COGS comes from P2.3 after design and prototyping.

**Structure:**
- **Sub-card per model/variant** — one card per unique cost profile (model + color/material combo)
  - Example: EasyLift Black, EasyLift GITD, The Crown Black = 3 separate sub-cards
  - Each model/color/material combo gets its own card because costs differ (GITD filament ≠ standard filament, hardware adds cost, etc.)
- **Summary card** — rolls up all sub-cards into product line income target math
- Single-model products = one card, no sub-cards needed
- Sub-cards are addable as models/variants emerge from P1.3

**Sub-card fields (per model/variant):**
- Target Price — informed by P1.2/P1.3 market positioning
- Estimated COGS:
  - Filament cost — from Materials Catalog (material type × estimated weight)
  - Machine time — from Workshop (hourly rate × estimated print time)
  - Hardware/BOM items — from Materials Catalog (estimated quantity × unit cost)
  - Packaging — from Materials Catalog
  - Assembly labor — estimated if applicable (e.g., heat inserts for RC Plane Hanger)
- Estimated Net Profit Per Unit
- Units Needed / Month and / Day — auto-calculated from income target
- Estimated Print Time
- Printer Capacity — from Workshop fleet data

**Summary card fields:**
- Income Target — per product line, user sets it (each product line must stand on its own)
- Scenario ranges — not one fixed forecast; does the math work across reasonable scenarios?
- Fleet Capacity Check — total printers needed vs available
- Verdict — FEASIBLE / NOT FEASIBLE

**Cost Model (Four-Pillar framework from Product Plan):**
The cost model is a shared calculation engine, not a single card. It gets used at multiple points:
- P1.5 runs it with estimates
- P2.3 runs it with actuals
- Supply chain pricing (your cost → distributor → wholesale → retail) runs after P2.3 locks COGS
- Margin structure defined once (40% distributor, 40% wholesale, 50% retail keystone), reused everywhere
- Amazon FBA fees, referral fees calculated at listing/channel setup stage

**Data sources:**
- Filament/hardware/packaging costs ← Materials Catalog
- Machine hourly rate ← Workshop
- Fleet capacity ← Workshop
- Price positioning ← P1.2/P1.3
- Mostly math — app could compute natively once inputs populated
- AI Assist role: pull numbers, structure calculation, flag assumptions (JSON in/out)

---

### G1 — GO / NO-GO Gate (The Decision)
**Purpose:** Binary decision point. Everything from P1.1 through P1.5 rolls up here. The gate doesn't generate new data — it summarizes what you've proven and asks: is there a clear path forward?

**Gate Criteria (auto-populated from prior cards):**
- Viability Score ≥ 18/30 — from P1.4
- Income math feasible — from P1.5 (at least one realistic scenario works)
- Production capacity available — from P1.5 + Workshop fleet data
- Competition gap exists — from P1.3
- Product is producible with your setup — from Workshop capabilities
- Customer validation signal (if available) — from P1.3b

**Additional context displayed:**
- Estimated vs actual distinction — "these numbers are estimates, actual COGS confirmed in P2.3"
- Product line definition summary — how many models/variants going into P2
- Price point target that becomes P2's COGS ceiling
- Evidence trail for each criterion (carried from P1.4 scorecard)

**Decision options:**
- **GO** — proceed to Phase 2 with defined product line. All P1 data flows forward.
- **NO-GO** — archive the idea. Data preserved for future reference.
- **CONDITIONAL GO** — proceed but flag specific risks (borderline scores, mixed validation, estimates with low confidence). Not everything is clean yes/no.

**Who decides:** The user. Gate presents the evidence, user makes the call. AI does not decide GO/NO-GO.

**What flows forward to P2 on GO:**
- Product concept and positioning (P1.1, P1.3)
- Market data and customer complaints → become design requirements (P1.2, P1.3)
- Product line definition → P2 branches per model/variant (P1.3)
- Price point ceiling → COGS constraint for design (P1.2, P1.5)
- Viability scores and evidence → reference during design tradeoffs (P1.4)
- Estimated COGS baseline → compare against actual after P2.3 (P1.5)
- Materials Catalog → available materials for design

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
  → P1.2 (market validation + price point discovery)
    → P1.3 (competitive gaps + product line definition)
      → P1.3b [optional] (customer validation — quick pulse)
        → P1.4 (viability scoring with evidence trail)
          → P1.5 (estimated income math, sub-card per model/variant)
            → G1 (GO / NO-GO / CONDITIONAL GO)
              → P2.1 (design brief — receives ALL of P1)
                      ↑ P1.2 price point → COGS ceiling → design constraint
                      ↑ P1.3 complaints + gaps → design requirements
                      ↑ P1.3 product line definition → P2 branching
                → P2.2 (prototype & iterate)
                  → P2.3 (lock settings + actual BOM/COGS → re-validate income math)
                    → G2 (design lock — verify income target still works with actual costs)
```

---

## Cost Model Lifecycle

Cost calculations happen at three points, each with increasing accuracy:

1. **P1.5 — Estimated COGS:** Pre-design. Rough numbers based on "a product like this probably costs $X." Enough to check if economics are in the ballpark. Uses Materials Catalog prices × estimated quantities.

2. **P2.3 — Actual COGS:** Post-design, post-prototype. Exact material weight, exact print time, exact hardware count. Real numbers from locked design. Income math re-validates here.

3. **Supply Chain Pricing:** After P2.3 locks COGS. Four-Pillar model runs: Your Cost → Distributor (40% margin) → Wholesale (40% margin) → Retail SRP (50% keystone). Plus channel-specific fees (Amazon FBA referral fees, shipping, etc.).

G2 Gate verifies: does the locked design with actual COGS still hit the income target set in P1.5?

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

**Key:** The app is the prompt builder and data aggregator. AI is the analyst. User is the decision maker and bridge.

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

## Industry Research Findings

**Standard product development timeline:** 12-24 months for physical products across 7-8 stages.

**Where P2M aligns with best practices:**
- Pipeline hits all standard stages — idea, research, analysis, scoring, financials, design, prototype, BOM, gates
- Niche market focus is well-supported by industry guidance
- Gate-based decision points are industry standard

**Where P2M is differentiated — potentially groundbreaking:**
1. **Speed target (days, not months):** 3D printing collapses manufacturing timelines, but nobody is packaging the entire business process (research through launch) into a structured pipeline tool that matches that speed.
2. **AI Assist embedded in every card with structured JSON data flow:** Enterprise tools (Brandwatch, Crayon, Quantilope) do pieces of this at high cost. Nobody integrates AI assistance directly into each stage of a product pipeline with structured data flowing between stages — especially at small manufacturer scale.
3. **Tiered tool architecture:** Free manual path + optional connected tools + potential subscription model. This positioning doesn't exist in the 3D printing small manufacturer space.

**Consideration from research: Customer validation.** Added as P1.3b optional step based on industry best practice and confirmed by Mike's independent recommendation.

**Note:** Etsy tightened policies June 2025 — 3D prints must come from original designs. No STL downloads or remixes. Relevant for platform/channel strategy.

---

## Real-World Context: How Products Actually Develop

From the 45 RPM Adaptor experience:
- **EasyLift** — born from personal experience (arthritis, hard to pinch things)
- **The Crown** — emerged from building a cheaper version that happened to look like a crown
- **PinchGrip** — filled a gap nobody else covered (low-profile, easy to grab, teenagers could use it)
- **3 models** — each serves a different customer need, not a planned tier strategy from day one
- **All research** — RIP Claude did from his own research + user-provided Helium 10/Xray screenshots
- **Product Plan v1.28** — comprehensive but built with hindsight on already-designed models

Lesson: The pipeline needs to support organic discovery. Models and variants emerge through the process, not from a template.

---

## Next Steps

1. **Commit this summary** to repo
2. **Create backlog items** for:
   - Materials Catalog page (new page to build)
   - Move filament data from Workshop to Materials Catalog
   - P1 card UI rebuild (editable fields, AI Assist buttons, data flow wiring)
   - P1.5 sub-card architecture (addable cards per model/variant)
   - P1.3b customer validation card (optional step)
   - Cost Model calculation engine (shared across P1.5, P2.3, supply chain pricing)
   - Update Flow diagram with new card definitions
3. **Begin rebuilding P1 card content** for 45 RPM Adaptor using new definitions
4. **Review P2 cards** with same rigor (P2.1 receives everything from P1 — verify it can)

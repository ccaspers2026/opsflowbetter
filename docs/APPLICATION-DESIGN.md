# OpsFlowBetter — Application Design Document
**Living document — updated as the project evolves**
**Last updated:** March 14, 2026 — v0.98.0

---

## 1. What Is OpsFlowBetter?

OpsFlowBetter is a browser-based suite of tools for managing a 3D printing product pipeline — taking a product idea from concept to market. The flagship module is **P2M (Product to Market)**, which guides a maker through research, validation, design, prototyping, production, and launch.

**Owner:** Christian Caspers, Caspers Creations LLC
**Domain:** opsflowbetter.com (hosted on GitHub Pages)
**Tech stack:** Vanilla HTML/CSS/JS, localStorage + Cloudflare KV for persistence, no frameworks

### The Vision

A small 3D printing shop owner has an idea for a product. They open P2M and within **10 days** (target timeline, to be refined through use), they go from idea to a live Amazon listing with inventory ready to ship. Every step is guided, data flows between stages automatically, and AI assists wherever it can — but the human always makes the decisions.

### Who Is This For?

Initially: Christian's own shop (Caspers Creations). Future: potentially offered as a subscription product to other small manufacturers and 3D printing entrepreneurs.

### Key Products Being Tracked
- **45 RPM Vinyl Record Adaptor** — 3-model product line (PinchGrip, The Crown, EasyLift). First product stress-testing every pipeline phase.
- **RC Plane Wall Hanger** — Second product pass. Multi-component assembly with hardware (nut plates, heat inserts, bolts).

---

## 2. The AI/Human Collaboration Model

This project is built by a human/AI team. The AI is not a tool that runs in the background — it is an active collaborator with defined responsibilities, communication protocols, and shared workspace.

### The Partnership

**Christian (Human)** — Product owner, business strategist, maker. Provides ideas, makes all final decisions, handles physical operations (printing, shipping, sourcing). Deploys code. Tests on live site. Defines priorities.

**Claude (AI)** — Developer, analyst, researcher. Writes all code, manages data migrations, analyzes markets, structures information, builds prompts. Proposes solutions. Never ships without human approval.

### Communication Protocol: The Priority Queue (PQ)

The PQ on the Tasks page is the shared workspace — not a task list for the human, but a **two-way communication dashboard**. Status badges ARE the conversation:

| Status | Who Sets It | What It Means |
|--------|------------|---------------|
| New | System | Task created, not started |
| Discussing | Claude | Active discussion/planning |
| In Progress | Claude | Claude is coding |
| Deployed | Christian | Code is pushed and live — signal for Claude to proceed |
| Testing | Claude | Self-testing in progress |
| Rework | Claude | Fix needed — Claude sets this BEFORE fixing (communication for the observer) |
| Done | Claude | ONLY after Christian confirms Testing Complete |

**Key insight:** PQ badges replace chat messages for status communication. Christian clicks Deployed instead of typing "DEPLOY COMPLETE." Claude reads the PQ and picks up. Minimal narration, maximum signal.

### Development Workflow

```
0. Claude reads WFD FIRST — check action queue, open discussions, story state. Then read Tester feedback.
0.5 Discussion → Christian says GO → Claude builds plan WITH embedded workflow actions
1. Claude makes code changes (first action: set PQ item to In Progress via migration)
2. Claude updates: version (all pages), changelog, tester sections, migrations
3. Christian says COMMIT → Claude queues commit via OpsFlow action queue on WFD
3.5 Claude asks: "Checkpoint deploy or tasks complete?"
4. Claude shows DEPLOY POPUP → User commits, pushes, deploys → clicks "Done ✓" on WFD action banner
5a. If CHECKPOINT → Claude runs OpsFlow.setVersion, verifies deploy. Resume from step 1.
5b. If TASKS COMPLETE → Claude runs OpsFlow.setVersion, then self-tests on live site
** EVERY COMMIT: Claude updates .claude-workflow.md AND APPLICATION-DESIGN.md **
6. If FAILs exist → REWORK LOOP
7. Once all items PASS → User clicks PASS/FAIL buttons + "Complete Testing"
8. Claude processes: triages feedback → Backlog, clears feedback via migration
9. Claude delivers LESSONS LEARNED summary
10. Claude reviews PQ: set completed items to Done
11. Repeat from step 0
```

### Workflow Dashboard (WFD) — v0.93.0+

The WFD (`workflow.html`) is the live command center for the dev cycle. It visualizes the entire flow as an interactive story diagram with clickable LED nodes.

**Components:**
- **Story Diagram**: SVG flowchart with LED nodes (red → yellow → green). Nodes: Start, Scan, Coding (trunk) → fork to Commit Ready, Committed, Pushed, Deployed, Verify (checkpoint/completion branch). Click nodes to cycle status.
- **Action Queue**: Banner system for queuing commit messages. Claude queues via `opsflow_action_queue` KV key. Christian clicks "Copy Commit Msg" then "Done ✓". The `action.detail` field contains the FULL commit message (title + TYPE lines). `action.message` is just the banner headline.
- **Discussion System**: Numbered discussion threads stored in `opsflow_discussions` KV key. Created via "+ Discussion" button. Used for async communication between Claude and Christian.
- **Priority Queue**: Mirrors Tasks page PQ with status badges.

**Layout**: Multi-row SVG with continuation markers (numbered circles ①②③) at row boundaries. Asymmetric cubic Bezier curves for fork/merge paths. Constants: NODE_R=14, NODE_SPACING=100, ROW_HEIGHT=180, MAX_ROW_WIDTH=1080.

**Future — Action Balls (Discussion #16)**: Event-driven workflow steps on the WFD trunk. Each ball = action point with owner (Claude/Christian), LED color, trigger, and attached instructions in KV. Goal: replace the workflow doc with visual, compaction-proof workflow steps. 17 balls identified and in backlog.

### The Rules

- **Claude does NOT start coding until Christian says GO.** Discussion is free. Premature execution is expensive.
- **Claude does NOT commit.** Christian reviews and pushes all code.
- **Claude does NOT decide GO/NO-GO on products.** Claude presents evidence, Christian decides.
- **Claude sets Rework BEFORE fixing** — it's communication for the observer.
- **Deployed means "your turn"** — Claude reads PQ and proceeds without requiring chat.

### AI Assist Within the Product

Beyond the development workflow, AI assistance is embedded directly into the P2M pipeline as a user feature:

1. User clicks AI Assist on a card
2. App auto-builds a detailed prompt pulling data from prior cards + Workshop + Materials Catalog (all JSON)
3. Prompt is specific and detailed — vague prompts produce vague results
4. User copies prompt, pastes to external AI (Claude, ChatGPT, etc.)
5. AI returns structured JSON with analysis/scores/calculations
6. User pastes JSON back into card
7. Card populates, user reviews, edits if needed
8. Confirm, mark GREEN

**The app is the prompt builder and data aggregator. AI is the analyst. User is the decision maker and bridge.**

### AI Assist Prompt Development Protocol

Before coding ANY AI Assist feature, the prompt must be tested by hand first:
1. Write draft prompt
2. Test manually in at least 2 LLMs
3. Evaluate output: format, accuracy, length, consistency across models
4. Iterate until output is stable
5. Lock the prompt format
6. THEN code the integration

---

## 3. Pipeline Architecture

### Phase Overview

The P2M pipeline has 7 phases with gates between them. Each phase contains numbered steps (cards) and ends with a GO/NO-GO gate.

```
Phase 1: Discovery & Validation
  P1.1 → P1.2 → P1.3 → [P1.3b optional] → P1.4 → P1.5 → G1

Phase 2: Design & Engineering
  P2.1 → P2.2 → P2.3 → G2

Phase 3-7: (To be defined as we reach them)
  Production, Listing, Launch, Operations, Scale
```

### Data Flow Architecture

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
                      ↑ P1.3 product line definition → P2 branching per model
                → P2.2 (prototype & iterate)
                  → P2.3 (lock settings + actual BOM/COGS → re-validate income math)
                    → G2 (design lock — verify income target still works with actual costs)
```

### Core Principles

1. **Idea to Market in 10 days** — every card serves speed
2. **Automation first, user confirmation always**
3. **Niche market targeting** — core business model
4. **P1 is hypothesis through validation** — starts with assumptions, ends with data
5. **P1 feeds P2** — everything captured must be sufficient for design to begin
6. **Models/variants defined in P1, built in P2** — by G1, you know what you're making
7. **Estimated vs actual costs** — P1.5 estimates, P2.3 actuals, income math re-validates
8. **Price point as design constraint** — market research sets COGS ceiling for design
9. **Free path always available** — core functionality never requires a paid tool
10. **Tool evaluation before wiring** — evaluate alternatives and pricing first

---

## 4. Phase 1 Card Definitions

### P1.1 — Product Idea (The Spark)

**Purpose:** Capture the hypothesis. Is this worth looking into?

**Weight:** Lightweight, fast. Minutes, not hours. This is NOT the finished product definition — it's the justification to look further.

**Fields:**

| Field | Who Provides | Notes |
|-------|-------------|-------|
| Product Idea | User | Free text — what is it |
| Problem it might solve | User | Best guess at this stage |
| Why you | User + Workshop data | Your capability (printer fleet, materials, interest) |
| Assumed Customer | User | Auto-note: *"Validated in P1.2 Market Research"* |

**AI Assist:** Light — cleans up language, polishes the concept statement. This is the user's card.

**Flows forward:** Hypothesis for P1.2 to validate. "Why you" informs production feasibility questions later.

---

### P1.2 — Market Research (Prove the Market)

**Purpose:** Validate the market exists in your niche. Prove demand, size the opportunity. Establishes the price point target that becomes a design constraint in P2.

**Fields:**

| Field | Data Source | Notes |
|-------|-----------|-------|
| Search Terms & Volume | Keyword Keg / Helium 10 | Monthly search data |
| Market Size | Helium 10 Xray | Competitor count, total niche revenue |
| Price Range | Competitor landscape | Becomes COGS ceiling driver for P2.1 |
| Customer Complaints | Review analysis | Feeds P1.3 gaps and P2.1 design requirements |
| Market Share Opportunity | AI analysis | What % you could capture — key motivator |
| Platforms | User + AI | Amazon, Etsy, wherever the niche lives |

**AI Assist:** Heavy — user feeds raw tool data (Helium 10 screenshots, Keyword Keg exports), AI structures and analyzes. JSON in/out.

**Flows forward:** Price range → P1.5 income math + P2.1 COGS ceiling. Complaints → P1.3 + P2.1. Market share → P1.4. Validates P1.1 assumed customer.

---

### P1.3 — Competitive Analysis (Find the Gap)

**Purpose:** Know who you're up against and where the opening is.

**Core principle:** What are competitors doing wrong that you can do right?

**Fields:**

| Field | Data Source | Notes |
|-------|-----------|-------|
| Top Competitors | P1.2 data, refined | 3-5 listings with name, price, rating, review count |
| Strengths | AI analysis | Market bar to meet |
| Weaknesses | P1.2 complaints, deepened | What buyers hate |
| Gap Analysis | AI analysis | Where's the opening |
| Your Positioning | AI + user | How you fill the gap |
| Product Line Definition | User + AI | Models, variants, tiers crystallize here |

**Two scenarios:**
- **Competitors exist:** Standard competitive analysis
- **No direct competitors:** Analyze adjacent/substitute products. Complaints about workarounds define design requirements. Ask: why doesn't this exist?

**AI Assist:** Heavy — structures comparison, identifies gaps from raw data. JSON in/out.

**Flows forward:** Gap → P1.4 scoring. Complaints + gap → P2.1 design requirements. Product line → P1.5 per-model math + P2 branching. **By end of P1.3, you know what you're making.**

**Key insight:** Models/variants come from real discovery — personal experience, design iteration, competitive gaps — not from a template. Market research helps define what's needed.

---

### P1.3b — Customer Validation (Optional — Quick Pulse)

**Purpose:** Get a signal from real potential customers before scoring viability. Not blocking — can run in parallel with P1.4.

**Three-tier approach (user chooses):**

| Tier | Method | Cost | Speed |
|------|--------|------|-------|
| Free | AI suggests communities + drafts post, user posts | $0 | Days (organic responses) |
| Low | Micro-survey (PickFu, Pollfish) — AI builds targeting criteria | $50-150 | 24-48 hours |
| Higher | Market research firm handles end to end | Varies | 1-5 days |

**Fields:**
- Product concept summary — auto-populated from P1.1/P1.3
- Suggested communities/platforms — AI generates based on target customer
- Draft post — AI writes, user edits voice/tone
- Response summary — user pastes feedback, AI analyzes sentiment (JSON)
- Validation signal — Positive / Mixed / Negative with evidence

**AI Assist:** Recommends tier, identifies communities, drafts posts, analyzes responses. For hiring help: recommends validated services over random Fiverr freelancers.

**Flows forward:** Strengthens or challenges P1.4 scoring. Customer quotes can inform P2.1 design.

---

### P1.4 — Niche Viability Score (Score It)

**Purpose:** Turn gut feeling + data into an objective score. GO or NO-GO before spending time on income math.

**Fields:**

| Factor | Source | Rating |
|--------|--------|--------|
| Market Demand | P1.2 search volume, market size | 1-5 |
| Competition Gap | P1.3 gap analysis | 1-5 |
| Margin Potential | P1.2 price range vs production costs | 1-5 |
| Differentiation | P1.3 positioning | 1-5 |
| Production Fit | Workshop capabilities | 1-5 |
| Scalability | Workshop fleet, expansion potential | 1-5 |

**Threshold:** 18/30 minimum to proceed. Factors subject to refinement through use.

**Critical requirement: Scorecard with receipts.** Each factor shows source data alongside the score. Example: *"Competition Gap: 5/5 — Only 3 direct competitors, highest rated has fit complaints (38% mention poor fit), no 3D printed option exists. Source: P1.3."*

**Confidence flags:** Mark which scores are data-backed vs estimates (e.g., "Production Fit: 4/5 — estimated, TBD Phase 2").

**AI Assist:** Pulls data from prior cards, scores with rationale, presents evidence trail. User reviews and adjusts any score. JSON in/out.

**Flows forward:** Score + rationale → G1 gate decision.

---

### P1.5 — Income Target Math (Check the Money)

**Purpose:** Work backward from income goal. Can this product line hit your target with your production setup?

**Important:** At P1.5, you haven't designed anything yet. These are ESTIMATED costs. Actual COGS comes from P2.3.

**Structure:**
- **Sub-card per model/variant** — one card per unique cost profile (model + color/material = unique card)
  - EasyLift Black ≠ EasyLift GITD (different filament cost)
  - RC Plane Hanger has hardware costs (heat inserts, bolts) that the adaptor doesn't
- **Summary card** — rolls up all sub-cards
- Single-model products = one card, no complexity

**Sub-card fields:**

| Field | Source | Notes |
|-------|--------|-------|
| Target Price | P1.2/P1.3 positioning | Market-driven |
| Est. Filament Cost | Materials Catalog | Material type × estimated weight |
| Est. Machine Time | Workshop | Hourly rate × estimated print time |
| Est. Hardware | Materials Catalog | Quantity × unit cost (if applicable) |
| Est. Packaging | Materials Catalog | Per unit |
| Est. Assembly Labor | User estimate | If applicable (heat inserts, etc.) |
| Est. Net Profit/Unit | Calculated | Price minus all costs minus fees |
| Units Needed/Month | Calculated | Income target ÷ net profit |
| Units Needed/Day | Calculated | Monthly ÷ working days |

**Summary card fields:**
- Income Target — per product line, user sets (each line must stand on its own)
- Scenario ranges — does the math work across reasonable scenarios?
- Fleet Capacity Check — total printers needed vs available
- Verdict — FEASIBLE / NOT FEASIBLE

**AI Assist:** Pull numbers from prior cards + Workshop + Materials Catalog, structure calculation, flag assumptions. Mostly math — app could compute natively once inputs populated.

**Flows forward:** Estimated COGS baseline → compare against P2.3 actuals. Fleet requirements → production planning.

---

### G1 — GO / NO-GO Gate (The Decision)

**Purpose:** Binary decision point. Summarizes everything from P1.1 through P1.5. Doesn't generate new data.

**Gate criteria (auto-populated):**
- Viability Score ≥ 18/30 — from P1.4
- Income math feasible — from P1.5
- Production capacity available — from P1.5 + Workshop
- Competition gap exists — from P1.3
- Product is producible — from Workshop
- Customer validation signal (if done) — from P1.3b

**Additional context displayed:**
- "These are estimates — actual COGS confirmed in P2.3"
- Product line summary — models/variants going into P2
- Price point target → P2's COGS ceiling
- Evidence trail from P1.4 scorecard

**Decision options:**
- **GO** — proceed to Phase 2. All P1 data flows forward.
- **NO-GO** — archive. Data preserved for future reference.
- **CONDITIONAL GO** — proceed with flagged risks (borderline scores, mixed validation, low-confidence estimates)

**Who decides:** The user. Always. AI presents evidence, user makes the call.

**What flows to P2 on GO:**
- Product concept and positioning (P1.1, P1.3)
- Customer complaints → design requirements (P1.2, P1.3)
- Product line definition → P2 branches per model/variant (P1.3)
- Price point ceiling → COGS constraint (P1.2, P1.5)
- Viability scores → reference during design tradeoffs (P1.4)
- Estimated COGS baseline → compare against P2.3 actuals (P1.5)

---

## 5. Phase 2 Card Definitions

### P2.1 — Design Brief / CAD Spec (Make It Real)

**Purpose:** Turn P1 research into a buildable spec. Either guide your own CAD work or produce a brief clear enough to hand to a contractor. This is where P1 hypotheses become physical requirements.

**Structure:** Sub-card per model (P2.1.A EasyLift, P2.1.B The Crown, P2.1.C PinchGrip).

**What auto-populates from P1 on entry:**
- Design requirements extracted from P1.3 (customer complaints → "must" specs)
- COGS ceiling from P1.5 ("your production cost must stay under $X")
- Product line definition from P1.3 (one sub-card per model)
- Available materials from Materials Catalog
- Production capabilities from Workshop (printer specs, build volumes)

**Design Approach Fork:** User selects DIY or Contractor. Changes what's shown.

**Fields per model sub-card:**

| Field | Source | Notes |
|-------|--------|-------|
| Design Approach | User selects | DIY or Contractor |
| Design Requirements | Auto from P1.3 | Customer complaints → "must" specs |
| COGS Ceiling | Auto from P1.5 | Design cost constraint |
| Physical Constraints | User + P1 | Dimensions, tolerances, interfaces |
| Material Selection | Materials Catalog | Constrained by COGS ceiling |
| Hardware Required | Materials Catalog | Heat inserts, bolts, etc. (if applicable) |
| Compliance Check | AI Assist | Material safety, Amazon rules, consumer regs — check BEFORE designing |
| CAD Software | Services page | Onshape (NOT Fusion 360) |
| Design Files | User | Location, format, version |
| Print Orientation | User | Affects cost, quality, strength |
| Support Required | User | Adds cost and post-processing |

**Contractor path adds:**
- Design brief document (AI Assist generates from requirements)
- Handoff format requirements (STEP, STL, source files)
- Revision allowance / process
- Budget (constrained by COGS ceiling)

**Compliance Check:** Check BEFORE designing. Amazon category rules, material safety (food contact? children's product?), consumer regs. May kill or redirect a design before wasting time modeling. AI Assist researches requirements based on product category.

**Multi-material / Multi-part:** Products may use multiple materials + purchased hardware. Spec captures per-part materials and assembly method. RC Plane Hanger = printed parts + heat inserts + bolts + nut plates.

**AI Assist:** Generate design requirements brief from P1 data. Research compliance. Draft contractor brief. Suggest materials within COGS ceiling. JSON in/out.

**Flows forward:** Design files → P2.2. Material selections → P2.2, P2.3. Physical constraints → P2.2 QC criteria. Compliance → G2.

---

### P2.2 — Prototype & Iterate (Print, Test, Fix)

**Purpose:** Print the design, test it against QC criteria, find what's wrong, fix it, repeat. This is where estimates become reality — actual print times, actual material weights, actual fit and finish.

**Structure:** Sub-card per model. Each model iterates independently — one might pass on v2, another might take v5.

**QC Criteria Definition (define BEFORE first print):**

| QC Field | Notes |
|----------|-------|
| Dimensional Tolerance | How far off is acceptable? |
| Fit Test Criteria | What constitutes "fits"? (adaptor on spindle, hanger holds plane) |
| Cosmetic Standard | What surface defects are acceptable? |
| Functional Test | What must the product DO to pass? |
| Load/Stress Test | If applicable: advertised spec + safety margin (e.g., "10 lb rated, test to 12.5 lb = 125%") |
| Reject Criteria | Explicit list — what's a NO |

**Iteration Log (addable rows — not limited to 3):**

| Field | Source | Notes |
|-------|--------|-------|
| Prototype Version | Auto-increments | v1, v2, v3... |
| Changes Made | User | What was modified |
| Print Settings Used | From P2.1 / slicer | Settings for this iteration |
| Actual Print Time | User logs | Real data, replaces P1.5 estimates |
| Actual Material Weight | User logs | Real data, replaces P1.5 estimates |
| Hardware Fit Test | User logs | If applicable |
| Assembly Test | User logs | Multi-part fits? Glue holds? |
| Functional Test | User logs | Does it DO what it's supposed to? |
| Visual/Cosmetic Check | User logs | Surface finish, layer lines |
| Result | User | PASS or FAIL with notes |

**Two levels of iteration tracking:**
- **Major iterations** — full documentation row: changed the design, different material, new hardware, significant settings change. Full test results logged.
- **Minor tweaks** — lightweight quick note: adjusted infill 2%, reprinted. Just a note and result.
- Real-world example: RC Plane Hanger went through ~100 iterations. Tracking every one with full rows would be impractical. The card must support organic, real-world iteration without becoming a bottleneck.
- **Critical requirement:** The FINAL iteration's actual print time, weight, and test results MUST be fully documented — P2.3 and G2 depend on it.

**Iteration loop:** Print → Test against QC → PASS or FAIL → if FAIL, revise CAD (back to P2.1) → reprint → test again. Loop until ALL QC criteria pass.

**Scrap Tracking (R&D phase):**
- Failed prints during prototyping = R&D scrap cost (not per-unit production cost)
- User can log scrap weight (weigh the bucket) as total prototyping waste
- Useful for understanding total investment in developing a product
- Separate from production scrap rate (tracked in P2.3 / Phase 3)

**AI Assist:** Help define QC criteria (including load/stress test specs with safety margins). Analyze iteration log — spot patterns. Compare actual times/weights vs P1.5 estimates — flag significant differences. JSON in/out.

**Flows forward:** Actual print time + weight → P2.3. QC criteria → P2.3 production checklist + G2. Iteration history → lessons learned. R&D scrap → total product development cost.

**Flows BACK:** Actual data may change P1.4 Production Fit score. G2 checks this.

**Key insight:** This card produces the REAL numbers. Don't let documentation overhead slow down iteration — capture what matters, skip what doesn't.

---

### P2.3 — Lock Settings + BOM (Freeze It)

**Purpose:** Freeze everything so every production unit is identical. Lock slicer profiles, compile complete BOM, calculate actual COGS, and re-validate income math with real numbers.

**Structure:** Sub-card per model.

**Slicer Profile (locked — extensible with addable line items):**

| Field | Source |
|-------|--------|
| Slicer Software | User (Bambu Studio, PrusaSlicer, OrcaSlicer, Cura, etc.) |
| Layer Height | From P2.2 final iteration |
| Infill % / Pattern | From P2.2 |
| Wall Count | From P2.2 |
| Top/Bottom Layers | From P2.2 |
| Print Speed | From P2.2 |
| Nozzle / Bed Temp | From P2.2 |
| Support Type | From P2.2 |
| Profile Name | User saves in slicer |
| *(+ Add Custom Setting)* | User adds field name + value — different slicers have different settings |

**Note:** Slicer profile fields are CRUD — user can add, edit, remove settings as needed. Standard fields are pre-populated but the list is extensible for slicer-specific settings not in the default list.

**Confirmed Production Numbers:**

| Field | Source |
|-------|--------|
| Confirmed Print Time | P2.2 final iteration (actual) |
| Confirmed Material Weight | P2.2 final iteration (actual) |
| Plate Capacity | User / slicer |
| Batch Print Time | Calculated (full plate) |

**Bill of Materials (picks from Materials Catalog):**

| Component | Source | Qty/Unit | Unit Cost | Extended |
|-----------|--------|----------|-----------|----------|
| (filament) | Materials Catalog | Xg | $/g | $ |
| (hardware) | Materials Catalog | X ea | $/ea | $ |
| (packaging) | Materials Catalog | X ea | $/ea | $ |
| **TOTAL COGS** | | | | **$X.XX** |

**Actual COGS Calculation:**

| Field | Notes |
|-------|-------|
| Material Cost | Sum of BOM material lines |
| Machine Time Cost | Confirmed print time × Workshop hourly rate |
| Hardware Cost | Sum of BOM hardware lines |
| Packaging Cost | Sum of BOM packaging lines |
| Assembly Labor | User estimate if applicable |
| Scrap/Waste Factor | Estimated % (start ~5%, adjust with real production data). Multiplier on material cost. |
| **Actual COGS** | **The real number (includes waste factor)** |

**Scrap/Waste Factor:** Production prints fail — bed adhesion, layer shifts, filament tangles. Estimate a scrap rate here (e.g., 5%), applied as a multiplier on material cost. Phase 3 tracks actual scrap (user weighs scrap bucket periodically), and the rate adjusts over time. Materials Catalog could eventually track waste rate per material type — PETG-HF may fail differently than PLA.

**Income Math Re-validation (P1.5 estimates vs P2.3 actuals):**

| Field | P1.5 Estimate | P2.3 Actual | Delta |
|-------|--------------|-------------|-------|
| COGS per unit | $X.XX | $X.XX | ±$ |
| Print time | X min | X min | ±min |
| Net profit/unit | $X.XX | $X.XX | ±$ |
| Still feasible? | YES/NO | YES/NO | |

**Planning Notes (Forward-looking):** Capture ideas while fresh:
- Packaging ideas → Phase 4
- Photography angles → Phase 5
- Listing talking points → Phase 5

**AI Assist:** Auto-build BOM from Materials Catalog. Calculate COGS. Run income math re-validation. Flag deltas that threaten feasibility. JSON in/out.

**Flows forward:** Locked profiles → production. Complete BOM → production costing. Actual COGS → supply chain pricing + G2. QC criteria → production checklist. Planning notes → P4, P5.

**Key rule:** Changes after design lock require a formal version bump and re-testing. No scope creep.

---

### G2 — DESIGN LOCK Gate (Freeze + Validate)

**Purpose:** Confirm design is production-ready AND economics still work with real numbers. Double duty: design checkpoint + financial re-validation.

**Gate Criteria (auto-populated):**

| Criterion | Source | Check |
|-----------|--------|-------|
| Design finalized | P2.1 | CAD files locked, versioned |
| All models pass QC | P2.2 | Every model passed all criteria |
| Slicer profiles locked | P2.3 | Named profiles saved |
| BOM complete | P2.3 | All components listed with costs |
| Actual COGS calculated | P2.3 | Real numbers, not estimates |
| Income math still works | P2.3 re-validation | P1.5 estimates vs actuals |
| Viability score holds | P1.4 revisited | Production Fit updated with real data, total still ≥ 18/30 |
| Compliance checked | P2.1 | Material safety, Amazon rules |
| QC criteria documented | P2.2 | Production checklist ready |

**P1 Feedback Loop:** Revisit P1.4 with real data:
- Production Fit score — now based on actual print time, complexity, assembly
- Margin score — now based on actual COGS vs market price
- If total dropped below 18/30 → NO-GO or CONDITIONAL GO

**Decision options:**
- **GO** — proceed to Phase 3. Design frozen, economics work.
- **NO-GO** — something doesn't work. Gate should identify WHERE the problem is and route back:
  - COGS too high → back to P2.1 (redesign to reduce cost — eliminate hardware, simplify geometry, shorter print)
  - Material costs → review Materials Catalog (cheaper alternatives that still meet QC)
  - Pricing doesn't work → revisit P1.2/P1.3 (can market bear higher price?)
  - Margins too thin → accept lower margins if volume compensates, or shelve specific model
  - One model fails, others pass → shelve that model, proceed with the viable ones
- **CONDITIONAL GO** — proceed with flagged risks.

**Who decides:** The user. Always. Gate tells you where the problem is, not just that there is one.

**What flows to Phase 3 on GO:**
- Locked design files (P2.1)
- Locked slicer profiles (P2.3)
- Complete BOM with actual costs (P2.3)
- QC criteria and production checklist (P2.2)
- Actual COGS and validated income math (P2.3)
- Compliance clearance (P2.1)
- Planning notes for packaging, photography, listings (P2.3)

---

## 6. Cost Model Lifecycle

Cost calculations happen at three points with increasing accuracy:

### P1.5 — Estimated COGS
Pre-design. Rough numbers: "a product like this probably costs $X." Uses Materials Catalog prices × estimated quantities. Enough to check if economics are in the ballpark.

### P2.3 — Actual COGS
Post-design, post-prototype. Exact material weight, print time, hardware count from locked design. Income math re-validates here.

### Supply Chain Pricing
After P2.3 locks COGS. Four-Pillar cost model:

| Tier | Margin | Calculation |
|------|--------|------------|
| Your Cost (COGS) | — | Base from P2.3 |
| Distributor | 40% | Your Cost ÷ 0.60 |
| Wholesale | 40% | Distributor ÷ 0.60 |
| Retail SRP | 50% keystone | Wholesale ÷ 0.50 |

Plus channel-specific fees (Amazon FBA referral, shipping, etc.) calculated at listing/channel setup stage.

The cost model is a **shared calculation engine** — defined once, used by P1.5 (estimates), P2.3 (actuals), and channel pricing. Margin structure is configurable.

---

## 7. Supporting Infrastructure

### Materials Catalog (New Page — To Be Built)

**What:** Single source of truth for everything that goes into a product.

**Structure:** Simple CRUD table, line items (not cards). Easy entry.

| Field | Example |
|-------|---------|
| Item Name | PETG-HF Black, M3x5 Heat Insert, Poly Bag Small |
| Category | Filament, Hardware, Packaging, Consumable |
| Unit of Measure | grams, each, roll, bag |
| Unit Cost | $0.01299/g, $0.03/each, $0.05/each |
| Supplier | Amazon, Fastenal, local source |
| Notes | Any relevant detail |

**Three-layer architecture:**
1. **Materials Catalog** (build now) — what's available, what it costs
2. **BOM per product** (P2.3) — picks from catalog, defines quantities per unit
3. **Inventory** (future) — quantities on hand, reorder points, stock levels

**Action:** Pull filament data from Workshop → Materials Catalog. Workshop keeps fleet, overhead, labor.

### Workshop

Defines your production environment — printer fleet, machine hourly rates, maintenance, labor, overhead. Does NOT hold material costs (those move to Materials Catalog). Feeds P1.4 (production fit, scalability) and P1.5 (machine rates, fleet capacity).

### Services & Integrations

Tracks external tools with costs, renewal dates, and status. Current services: Helium 10, Keyword Keg, remove.bg, Onshape, Amazon Seller Central, Cloudflare, Monday.com, Calendly, Hover.com.

**Tool evaluation rule:** Before wiring any tool, evaluate alternatives and pricing. Tools are addable/removable as the platform evolves.

---

## 8. External Tools & Business Model

### Tool Access Tiers

Architecture must support all paths — never require a paid tool for core functionality.

| Tier | What's Included |
|------|----------------|
| Free (always available) | Manual entry + AI Assist copy/paste. Core pipeline fully functional. |
| Connected tools (optional) | Wired integrations (Helium 10, Keyword Keg, etc.) for automation. |
| Premium (future subscription) | Connected tool capability + advanced features. Pricing lever. |

### Future Subscription Model

If P2M is offered to customers:
- Basic tier: manual + AI Assist (no connected tools)
- Premium tier: connected tool integrations
- Tool access capability itself could be a pricing tier differentiator
- Each tool integration evaluated for alternatives and pricing before adding

---

## 9. Pages in the Suite

All P2M pages live at `opsflowbetter.com/p2m/`:

| Page | File | Purpose |
|------|------|---------|
| Pipeline | index.html | Phase-based product pipeline with cards |
| Media Pipeline | media-center.html | Image upload, BG removal, gallery |
| Workshop | workshop.html | Fleet, rates, labor, overhead |
| Services | services.html | External tools tracking |
| Admin Hub | admin.html | Single entry point to admin tools |
| Diagrams | diagrams.html | Flow diagrams, architecture visuals |
| Workflow | workflow.html | **Workflow Dashboard (WFD)** — live dev cycle visualization (T-119, v0.93.0+) |
| Changelog | changelog.html | Version history |
| Tasks | tasks.html | PQ + Backlog — the shared AI/Human dashboard |
| Feedback | feedback.html | Standalone feedback form |
| Tester | tester.html | Self-test checklist |
| Materials Catalog | TBD | New page — materials, hardware, packaging costs |

Plus **LaunchPad** at root (`launchpad.html`) — hub with shortcuts and admin mode.

**Nav structure:** User pages in top nav (Pipeline, Media Pipeline, Workshop, Services). ADMIN link leads to admin.html hub. Admin tool pages (Tasks, Changelog, Tester, Feedback, Workflow, Diagrams) have breadcrumbs back to Admin.

---

## 10. Technical Architecture

### Data Storage
- **localStorage** for all client-side state (cache layer)
- **Cloudflare KV** as source of truth (synced via opsflow-sync.js)
- `OpsFlow.set()` writes to both localStorage and KV
- `OpsFlow.getLocal()` for sync hot paths, `OpsFlow.get()` for async with freshness check
- Auto-backup on page unload, auto-restore if localStorage empty

### Key localStorage Keys

| Key | Purpose |
|-----|---------|
| `opsflow_tasks_v2` | PQ + Backlog + Completed items |
| `p2m_pipeline_state` | Pipeline products, checklists, gate signatures |
| `workshopState_v2` | Workshop card data |
| `opsflow_services` | Services & Integrations data |
| `opsflow_version` | Suite version (synced to KV) |
| `opsflow_changelog` | Changelog entries |
| `opsflow_action_queue` | WFD action queue — single object {id, type, message, detail, status, created} |
| `opsflow_workflow_state` | WFD story diagram state — node statuses, active story |
| `opsflow_discussions` | WFD discussion threads — array of numbered discussions |
| `opsflow_tester_config` | Tester sections config — seeded per version via migration |
| `opsflow_tasks_migrations` | Migration tracking — array of migration keys already run |

### Version Management
- Version bumped on all pages via `OpsFlow.setVersion()`
- Commit format: `vX.XX.X T-### description`
- localStorage-only changes do NOT require version bumps

### Hosting
- GitHub Pages at opsflowbetter.com
- Cloudflare for DNS, CDN, R2 storage, Workers (KV API)
- Worker API: `api.opsflowbetter.com/kv/:key`

---

## 11. Industry Context & Differentiation

### Standard Product Development
Physical products typically take 12-24 months across 7-8 stages. Standard frameworks (Shopify, Asana, Monday.com) are designed for generic product companies with overseas manufacturing.

### Where P2M Is Differentiated

1. **Speed target (days, not months):** 3D printing collapses manufacturing timelines. P2M packages the entire business process to match — nobody else structures research-through-launch into a guided pipeline at this speed.

2. **AI Assist in every card with structured data flow:** Enterprise tools (Brandwatch, Crayon, Quantilope) do pieces at high cost. P2M integrates AI assistance directly into each pipeline stage with JSON data flowing between cards — at small manufacturer scale and cost.

3. **Tiered tool architecture:** Free manual path + optional connected tools + potential subscription model. This positioning doesn't exist in the 3D printing small manufacturer space.

### Etsy Policy Note (June 2025)
3D prints must come from original designs. STL downloads and remixes don't qualify. Relevant for platform/channel strategy.

---

## 12. Real-World Product Development Context

### How Products Actually Develop

From the 45 RPM Adaptor experience:
- **EasyLift** — born from personal experience (arthritis, hard to pinch things)
- **The Crown** — emerged from building a cheaper version that happened to look like a crown
- **PinchGrip** — filled a gap nobody covered (low-profile, easy to grab for teenagers)
- Models weren't planned as tiers from day one — they emerged through discovery and iteration

**Lesson:** The pipeline must support organic discovery. Models and variants emerge through the process, not from a template.

### The Source Document

The Product Plan (v1.28) for the 45 RPM Adaptor was largely AI-generated by a previous Claude session, fed by Christian's Helium 10/Xray screenshots and product knowledge. It contains detailed cost models, competitor analysis, Amazon FBA strategy, and production planning — but was built with hindsight on already-designed models. The pipeline rebuild ensures data flows correctly for a first-time-through experience.

---

## 13. Backlog & Roadmap

### Immediate (WFD Action Balls — Discussion #16)
- [ ] Implement WFD Action Balls framework — event-driven workflow steps on WFD trunk
- [ ] Update Docs ball (HIGH PRIORITY) — ensures docs stay current after every commit
- [ ] Queue Commit ball — enforces correct commit message format in action queue
- [ ] 17 total balls identified (12 Claude, 4 Christian, 1 Decision) — all in Tasks backlog

### Near-Term (P1 Card Rebuild + Infrastructure)
- [ ] Rebuild P1 card UI — editable fields, AI Assist buttons, data flow wiring
- [ ] P1.5 sub-card architecture — addable cards per model/variant
- [ ] P1.3b customer validation card — optional step
- [ ] Begin card-by-card content rebuild for 45 RPM Adaptor
- [ ] Materials Catalog page — CRUD table for materials, hardware, packaging
- [ ] Move filament data from Workshop to Materials Catalog
- [ ] Cost Model calculation engine — shared across P1.5, P2.3, pricing

### Medium-Term (P2 and Beyond)
- [ ] P2 card definitions — same rigor as P1 review
- [ ] Wire Workshop data bridge (currently reads wrong localStorage key)
- [ ] Template Builder — Suite-wide template definitions with field schemas
- [ ] Forms Builder — dynamic form generation from templates
- [ ] Connected tool integrations (evaluate and wire one at a time)

### Future
- [ ] Inventory page — tracks quantities, reorder points
- [ ] Subscription model architecture — tiered tool access
- [ ] Multi-product support — run multiple product lines through the pipeline
- [ ] Security layer — Admin visibility controls
- [ ] Equipment Page — centralized equipment registry (depends on Template Builder)

---

## Document History

| Date | Version | What Changed |
|------|---------|-------------|
| March 13, 2026 | v1.0 | Initial creation. P1 card definitions, AI/Human model, data flow, cost lifecycle, industry research. Consolidated from P1 Card Review sessions. |
| March 13, 2026 | v1.1 | P2 card definitions complete (P2.1, P2.2, P2.3, G2). DIY/Contractor fork in P2.1, QC criteria in P2.2, BOM + income math re-validation in P2.3, P1 feedback loop in G2. New backlog items added (T-113 through T-118). |
| March 13, 2026 | v1.2 | P2 refinements: Load/stress testing with safety margins in QC. Two-level iteration tracking (major/minor — real-world: 100+ iterations on RC Plane Hanger). Scrap/waste factor in P2.3 COGS + R&D scrap tracking in P2.2. Extensible slicer profile (addable custom settings). G2 NO-GO routes to specific problem area. |
| March 14, 2026 | v1.3 | Updated to v0.97.2. Added Workflow Dashboard (WFD) system: story diagram, action queue, discussion system. Updated Development Workflow to reflect WFD-centric flow (action queue replaces chat-based commit messages). Added 5 new localStorage keys. Added workflow.html to Pages. Updated Backlog with 17 WFD Action Balls (Discussion #16). Added WFD Action Balls as immediate priority. |
| March 14, 2026 | v1.4 | Updated to v0.98.0. T-122 fix: Priority LED normalization — defensive mapping in all render/sort/cycle paths. |

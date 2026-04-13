# RomeLife.xyz QA Pipeline

Autonomous QA and design-review pipeline for the RomeLife.xyz turn-based strategy game. Runs 9 Claude Opus 4.6 sub-agents in dependency order, producing a structured evidence bundle with prioritized findings and patch proposals.

## Prerequisites

- **bun** (≥ 1.0) — runtime for the orchestrator
- **claude** CLI — Claude Code CLI tool, on PATH, authenticated
- **Node.js** (≥ 18) — for Playwright and Next.js dev server
- **Playwright** — installed in `game/` (`cd game && npx playwright install chromium`)

## Install

```bash
# From repo root
cd game && npm install          # game dependencies
npx playwright install chromium # browser for captures
```

No additional install is needed for the pipeline itself — agent definitions are plain markdown and the orchestrator is a single TypeScript file.

## Run

```bash
# From repo root
bun run .claude/pipeline/run.ts
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--seed <N>` | `42` | Seed value recorded in manifest (note: game uses `Math.random()` — not seeded at engine level) |
| `--commit <hash>` | auto-detected | Override git commit hash for artifact naming |

### Examples

```bash
# Default run
bun run .claude/pipeline/run.ts

# Specific seed and commit
bun run .claude/pipeline/run.ts --seed 7 --commit abc1234

# Smoke test: just Stage 1 (verify agent setup works)
# Run the cartographer alone:
claude -a .claude/agents/game-flow-cartographer.md \
  -p 'OUTPUT_DIR="./pipeline-runs/smoke-test" REPO_ROOT="." GAME_ROOT="./game" COMMIT="test" SEED="42" Execute your full procedure.' \
  --output-format text --max-turns 30
```

## Pipeline Stages

```
Stage 1: Game Flow Cartographer
    ↓ (game-flow-map.json)
Stage 2: Capture Engineer  ← starts dev server
    ↓ (screenshots/, timing-log.jsonl)
Stage 3: 4 Critics in parallel
    ├── Asset & Animation Critic
    ├── Systems & Balance Critic
    ├── Interaction & Responsiveness Critic
    └── Readability & Accessibility Critic
    ↓ (*-critique.md, *-scores.json)
Stage 4: Synthesizer
    ↓ (synthesis-backlog.json)
Stage 5: Patch Proposer
    ↓ (patches/*.patch.md)
Stage 6: Final Validator → PASS / RETRY(1) / FAIL
    ↓
    EXPLANATION.md
```

**Dependency rules:**
- Stage 2 requires Stage 1 output (game flow map for navigation targets)
- Stage 3 requires Stage 1 + Stage 2 (but critics degrade gracefully if captures are missing)
- Stage 4 requires ≥ 2 of 4 critiques from Stage 3
- Stage 5 requires Stage 4 synthesis
- Stage 6 requires all prior artifacts; has veto power and exactly one retry

## Bundle Location

Output lands in:

```
pipeline-runs/<ISO-timestamp>_<commit>_seed<N>/
├── pipeline-meta.json              # Run metadata
├── manifest.jsonl                  # One JSON line per agent invocation
├── game-flow-map.md                # Stage 1: game state inventory
├── game-flow-map.json              # Stage 1: machine-readable flow
├── captures/
│   ├── screenshots/                # Stage 2: PNG per game state
│   ├── timing-log.jsonl            # Stage 2: interaction latencies
│   ├── animation-inventory.md      # Stage 2: observed animations
│   ├── manifest.json               # Stage 2: capture metadata
│   └── capture-script.spec.ts      # Stage 2: Playwright script used
├── asset-animation-critique.md     # Stage 3
├── asset-animation-scores.json     # Stage 3
├── systems-balance-critique.md     # Stage 3
├── systems-balance-scores.json     # Stage 3
├── interaction-critique.md         # Stage 3
├── interaction-scores.json         # Stage 3
├── readability-accessibility-critique.md  # Stage 3
├── readability-accessibility-scores.json  # Stage 3
├── synthesis-report.md             # Stage 4
├── synthesis-backlog.json          # Stage 4
├── patches/
│   ├── SYN-001.patch.md            # Stage 5: one per fix proposal
│   └── patch-manifest.json         # Stage 5: patch index
├── validation-report.json          # Stage 6
└── EXPLANATION.md                  # Stage 6: final human-readable report
```

## Reading EXPLANATION.md

The `EXPLANATION.md` file is the primary deliverable. It contains:

1. **Executive Summary** — 3-5 sentence overview of quality findings
2. **Key Findings** — critical and high-priority issues with file references
3. **Score Summary** — numeric scores across 4 quality domains
4. **Top 10 Recommended Fixes** — actionable items with patch availability
5. **Artifacts Index** — what each file in the bundle contains
6. **Confidence & Caveats** — what the pipeline could not measure and why
7. **Verdict** — PASS, RETRY, or FAIL with rationale

Start here. Drill into individual critique files only if you need deeper evidence for a specific finding.

## Extending the Roster

### Adding a new agent

1. Create `.claude/agents/<slug>.md` with YAML frontmatter:
   ```yaml
   ---
   name: <slug>
   description: Use this agent to <when-to-invoke description>
   model: claude-opus-4-6
   tools:
     - Read
     - Glob
     - Grep
     - Bash
     - Write
   ---
   ```

2. System prompt must open with: `You are a **<design role>** and a **<2D-engine role>**.`

3. Define explicit inputs (upstream artifact paths) and outputs (artifact paths + schemas).

4. Include evidence rules and failure protocol sections.

5. Add the invocation to `run.ts`:
   - Add a new `stageN()` function
   - Place it in the correct dependency position in `main()`
   - Update Stage 3 parallel array if it's a critic

### Removing an agent

1. Delete the `.claude/agents/<slug>.md` file.
2. Remove its invocation from `run.ts`.
3. Update the synthesizer's input list if it was a critic.
4. Update the validator's artifact checklist.

### Modifying rubrics

Each critic agent has conditional rubric sections gated by the art-style flag in `recon.md`. The current game uses **Illustrative UI** rubrics. If the game's art style changes:

1. Update `recon.md` art-style classification
2. Each critic's prompt contains art-style conditional blocks — modify the active rubric set
3. Pixel-art rubrics (subpixel drift, integer scaling, palette leaks) are documented in the agent prompts but currently inactive

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `claude: command not found` | Install Claude Code CLI and ensure it's on PATH |
| Agent times out (10min) | Increase `timeout` in `execSync` call in `run.ts` |
| Dev server won't start | Run `cd game && npm install` first; check port 3000 is free |
| Playwright not installed | Run `cd game && npx playwright install chromium` |
| Captures fail but critics pass | Expected — critics degrade to code-only analysis |
| Validator returns FAIL | Read `validation-report.json` for specific evidence gaps |
| All critics fail | Check that Stage 1 produced `game-flow-map.json` — critics depend on it |

## Architecture Notes

- **Orchestrator neutrality**: `run.ts` contains zero design judgment. It routes artifacts between agents. If it contains an if-statement about quality, it's a bug.
- **Dual-role agents**: Every agent has both a design role and a technical role. This is enforced by convention — the opening line of each agent prompt names both roles.
- **Evidence trail**: Every claim in every critique must cite a file path, line number, screenshot filename, or timing log entry. The Final Validator audits this.
- **Single retry**: The Validator can trigger exactly one retry of a single agent. After that, the result is final.
- **No auto-apply**: Patch proposals are written as markdown diffs. They are never applied to the codebase automatically.

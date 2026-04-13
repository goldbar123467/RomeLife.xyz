#!/usr/bin/env bun
/**
 * RomeLife.xyz QA Pipeline Orchestrator
 *
 * This orchestrator is a deterministic router. It spawns sub-agents in
 * dependency order, passes artifact paths between them, and writes the
 * final manifest. It contains ZERO design judgment or critique logic.
 *
 * Usage:
 *   bun run .claude/pipeline/run.ts [--seed <N>] [--commit <hash>]
 *
 * Requires: Claude Code CLI (`claude`) on PATH.
 */

import { execSync, spawn, type ChildProcess } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const SEED = getArg("--seed") ?? "42";
const COMMIT_ARG = getArg("--commit");

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const REPO_ROOT = resolve(import.meta.dir, "../..");
const GAME_ROOT = join(REPO_ROOT, "game");
const AGENTS_DIR = join(REPO_ROOT, ".claude", "agents");

// Resolve commit
function getCommit(): string {
  if (COMMIT_ARG) return COMMIT_ARG;
  try {
    return execSync("git rev-parse --short HEAD", { cwd: REPO_ROOT })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const COMMIT = getCommit();
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const RUN_DIR = join(
  REPO_ROOT,
  "pipeline-runs",
  `${TIMESTAMP}_${COMMIT}_seed${SEED}`
);

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

interface ManifestEntry {
  agent: string;
  stage: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: "success" | "error" | "skipped";
  outputDir: string;
  error?: string;
}

const manifest: ManifestEntry[] = [];

function log(msg: string): void {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function writeManifest(): void {
  const path = join(RUN_DIR, "manifest.jsonl");
  const content = manifest.map((e) => JSON.stringify(e)).join("\n") + "\n";
  writeFileSync(path, content, "utf-8");
}

// ---------------------------------------------------------------------------
// Agent invocation
// ---------------------------------------------------------------------------

/**
 * Invoke a Claude Code sub-agent by name.
 * Uses `claude` CLI with the agent file and a prompt containing the output dir.
 */
async function invokeAgent(
  agentSlug: string,
  stage: number,
  extraContext: string = ""
): Promise<ManifestEntry> {
  const agentFile = join(AGENTS_DIR, `${agentSlug}.md`);
  if (!existsSync(agentFile)) {
    const entry: ManifestEntry = {
      agent: agentSlug,
      stage,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      status: "error",
      outputDir: RUN_DIR,
      error: `Agent file not found: ${agentFile}`,
    };
    manifest.push(entry);
    writeManifest();
    return entry;
  }

  const prompt = [
    `OUTPUT_DIR="${RUN_DIR}"`,
    `REPO_ROOT="${REPO_ROOT}"`,
    `GAME_ROOT="${GAME_ROOT}"`,
    `COMMIT="${COMMIT}"`,
    `SEED="${SEED}"`,
    "",
    `Execute your full procedure. Write all outputs to the OUTPUT_DIR above.`,
    "",
    extraContext,
  ].join("\n");

  log(`[Stage ${stage}] Starting agent: ${agentSlug}`);
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  try {
    // Invoke claude CLI with the agent
    const result = execSync(
      `claude -a "${agentFile}" -p ${JSON.stringify(prompt)} --output-format text --max-turns 30`,
      {
        cwd: REPO_ROOT,
        timeout: 600_000, // 10 minutes per agent
        maxBuffer: 10 * 1024 * 1024, // 10MB output buffer
        encoding: "utf-8",
        env: { ...process.env, OUTPUT_DIR: RUN_DIR },
      }
    );

    const durationMs = Date.now() - startMs;
    const finishedAt = new Date().toISOString();

    log(
      `[Stage ${stage}] Agent ${agentSlug} completed in ${(durationMs / 1000).toFixed(1)}s`
    );

    const entry: ManifestEntry = {
      agent: agentSlug,
      stage,
      startedAt,
      finishedAt,
      durationMs,
      status: "success",
      outputDir: RUN_DIR,
    };
    manifest.push(entry);
    writeManifest();
    return entry;
  } catch (err: any) {
    const durationMs = Date.now() - startMs;
    const finishedAt = new Date().toISOString();

    log(`[Stage ${stage}] Agent ${agentSlug} FAILED: ${err.message}`);

    const entry: ManifestEntry = {
      agent: agentSlug,
      stage,
      startedAt,
      finishedAt,
      durationMs,
      status: "error",
      outputDir: RUN_DIR,
      error: err.message?.slice(0, 500),
    };
    manifest.push(entry);
    writeManifest();
    return entry;
  }
}

// ---------------------------------------------------------------------------
// Dev server management
// ---------------------------------------------------------------------------

let devServerProcess: ChildProcess | null = null;

async function startDevServer(): Promise<void> {
  log("Starting dev server...");

  // Check if already running
  try {
    const res = execSync("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", {
      timeout: 5000,
      encoding: "utf-8",
    });
    if (res.trim() === "200") {
      log("Dev server already running on port 3000");
      return;
    }
  } catch {
    // Not running, start it
  }

  devServerProcess = spawn("npx", ["next", "dev", "-p", "3000"], {
    cwd: GAME_ROOT,
    stdio: "pipe",
    detached: true,
  });

  // Wait for server to be ready
  const maxWait = 60_000;
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      execSync("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000", {
        timeout: 3000,
      });
      log("Dev server ready on port 3000");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  log("WARNING: Dev server may not be ready after 60s timeout");
}

function stopDevServer(): void {
  if (devServerProcess) {
    log("Stopping dev server...");
    try {
      // Kill the process group
      process.kill(-devServerProcess.pid!, "SIGTERM");
    } catch {
      try {
        devServerProcess.kill("SIGTERM");
      } catch {
        // Already dead
      }
    }
    devServerProcess = null;
  }
}

// ---------------------------------------------------------------------------
// Pipeline stages
// ---------------------------------------------------------------------------

/**
 * Stage 1: Game Flow Cartographer
 * No dependencies — runs first.
 */
async function stage1(): Promise<ManifestEntry> {
  return invokeAgent("game-flow-cartographer", 1);
}

/**
 * Stage 2: Capture Engineer
 * Depends on: Stage 1 (game-flow-map.json)
 * Requires: dev server running
 */
async function stage2(): Promise<ManifestEntry> {
  await startDevServer();
  return invokeAgent(
    "capture-engineer",
    2,
    "The dev server should be running on http://localhost:3000. " +
      "Use the game flow map at $OUTPUT_DIR/game-flow-map.json for navigation targets."
  );
}

/**
 * Stage 3: Critics (parallel)
 * Depends on: Stage 1 (game-flow-map), Stage 2 (captures)
 * Asset/Animation, Systems/Balance, Interaction, Readability/Accessibility
 */
async function stage3(): Promise<ManifestEntry[]> {
  const critics = [
    "asset-animation-critic",
    "systems-balance-critic",
    "interaction-responsiveness-critic",
    "readability-accessibility-critic",
  ];

  log("[Stage 3] Running 4 critics in parallel...");

  const results = await Promise.all(
    critics.map((slug) => invokeAgent(slug, 3))
  );

  return results;
}

/**
 * Stage 4: Synthesizer
 * Depends on: Stage 3 (all critiques)
 */
async function stage4(): Promise<ManifestEntry> {
  return invokeAgent(
    "synthesizer",
    4,
    "All 4 critiques should be available in $OUTPUT_DIR/. " +
      "Read all *-critique.md and *-scores.json files."
  );
}

/**
 * Stage 5: Patch Proposer
 * Depends on: Stage 4 (synthesis backlog)
 */
async function stage5(): Promise<ManifestEntry> {
  return invokeAgent(
    "patch-proposer",
    5,
    "The synthesis backlog is at $OUTPUT_DIR/synthesis-backlog.json. " +
      "The synthesis report is at $OUTPUT_DIR/synthesis-report.md."
  );
}

/**
 * Stage 6: Final Validator
 * Depends on: all previous stages
 */
async function stage6(): Promise<ManifestEntry> {
  return invokeAgent(
    "final-validator",
    6,
    "All pipeline artifacts should be in $OUTPUT_DIR/. " +
      "This is your first validation pass (retry budget: 1)."
  );
}

/**
 * Handle validator retry
 */
async function handleRetry(
  validationResult: ManifestEntry
): Promise<ManifestEntry> {
  const reportPath = join(RUN_DIR, "validation-report.json");
  if (!existsSync(reportPath)) {
    log("No validation report found — cannot determine retry target");
    return validationResult;
  }

  try {
    const report = JSON.parse(readFileSync(reportPath, "utf-8"));

    if (report.verdict === "RETRY" && report.retryTarget) {
      const target = report.retryTarget;
      log(`Validator requested RETRY of agent: ${target}`);

      // Re-run the targeted agent
      const retryResult = await invokeAgent(target, 7);

      if (retryResult.status === "error") {
        log(`Retry of ${target} also failed — proceeding to final validation`);
      }

      // Re-run validator (this is the final pass — no more retries)
      return invokeAgent(
        "final-validator",
        8,
        "All pipeline artifacts should be in $OUTPUT_DIR/. " +
          "This is your SECOND validation pass. You MUST NOT trigger another retry. " +
          "Decide PASS or FAIL."
      );
    }

    return validationResult;
  } catch {
    log("Failed to parse validation report — skipping retry");
    return validationResult;
  }
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  log("=".repeat(60));
  log("RomeLife.xyz QA Pipeline");
  log(`Commit: ${COMMIT}`);
  log(`Seed: ${SEED}`);
  log(`Output: ${RUN_DIR}`);
  log("=".repeat(60));

  // Create output directory structure
  mkdirSync(RUN_DIR, { recursive: true });
  mkdirSync(join(RUN_DIR, "captures", "screenshots"), { recursive: true });
  mkdirSync(join(RUN_DIR, "patches"), { recursive: true });

  // Write pipeline metadata
  writeFileSync(
    join(RUN_DIR, "pipeline-meta.json"),
    JSON.stringify(
      {
        commit: COMMIT,
        seed: SEED,
        timestamp: new Date().toISOString(),
        repoRoot: REPO_ROOT,
        gameRoot: GAME_ROOT,
        agentsDir: AGENTS_DIR,
      },
      null,
      2
    )
  );

  try {
    // Stage 1: Map game flow
    const s1 = await stage1();
    if (s1.status === "error") {
      log("CRITICAL: Game flow mapping failed — pipeline cannot continue");
      writeManifest();
      process.exit(1);
    }

    // Stage 2: Capture screenshots and timing
    const s2 = await stage2();
    // Captures are best-effort — critics can fall back to code-only analysis
    if (s2.status === "error") {
      log("WARNING: Capture phase failed — critics will use code-only analysis");
    }

    // Stage 3: Run 4 critics in parallel
    const s3results = await stage3();
    const criticFailures = s3results.filter((r) => r.status === "error");
    if (criticFailures.length >= 3) {
      log(
        `CRITICAL: ${criticFailures.length}/4 critics failed — insufficient data for synthesis`
      );
      writeManifest();
      process.exit(1);
    }
    if (criticFailures.length > 0) {
      log(
        `WARNING: ${criticFailures.length}/4 critics failed — synthesis will have gaps`
      );
    }

    // Stage 4: Synthesize findings
    const s4 = await stage4();
    if (s4.status === "error") {
      log("CRITICAL: Synthesis failed — pipeline cannot produce backlog");
      writeManifest();
      process.exit(1);
    }

    // Stage 5: Propose patches
    const s5 = await stage5();
    // Patches are best-effort — validator can still pass without them
    if (s5.status === "error") {
      log("WARNING: Patch proposer failed — validator will note the gap");
    }

    // Stage 6: Final validation
    let s6 = await stage6();

    // Handle retry if validator requests one
    if (s6.status === "success") {
      s6 = await handleRetry(s6);
    }

    // Stop dev server
    stopDevServer();

    // Final summary
    log("=".repeat(60));
    log("Pipeline complete");
    log(`Output directory: ${RUN_DIR}`);

    const successCount = manifest.filter((e) => e.status === "success").length;
    const errorCount = manifest.filter((e) => e.status === "error").length;
    log(`Agents run: ${manifest.length} (${successCount} success, ${errorCount} error)`);

    // Check final verdict
    const reportPath = join(RUN_DIR, "validation-report.json");
    if (existsSync(reportPath)) {
      try {
        const report = JSON.parse(readFileSync(reportPath, "utf-8"));
        log(`Final verdict: ${report.verdict}`);
        if (report.verdict === "FAIL") {
          process.exit(2);
        }
      } catch {
        log("Could not parse final validation report");
      }
    }

    // Check for EXPLANATION.md
    const explanationPath = join(RUN_DIR, "EXPLANATION.md");
    if (existsSync(explanationPath)) {
      log(`EXPLANATION.md written to: ${explanationPath}`);
    } else {
      log("WARNING: EXPLANATION.md was not generated");
    }

    log("=".repeat(60));
  } catch (err: any) {
    log(`FATAL: ${err.message}`);
    stopDevServer();
    writeManifest();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  stopDevServer();
  process.exit(1);
});

import chalk from "chalk";
import { createHash } from "crypto";

const GATEWAY = process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

const TYPE_COLORS: Record<string, string> = {
  fact: "blue",
  observation: "green",
  inference: "magenta",
  commitment: "yellow",
};

const TRUTH_LABELS: Record<number, string> = {
  1: chalk.green("True"),
  0: chalk.yellow("Unknown"),
  [-1]: chalk.red("False"),
};

export async function listMemory(opts: { limit?: string; type?: string }) {
  const limit = opts.limit || "20";
  const params = new URLSearchParams({ limit });
  if (opts.type) params.set("type", opts.type);

  try {
    const res = await fetch(`${GATEWAY}/memory?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json() as {
      entries?: Record<string, unknown>[];
      chain_valid?: boolean;
      total?: number;
    };
    const entries = data.entries || [];

    const chainStatus = data.chain_valid === false
      ? chalk.red("⚠ Chain compromised!")
      : chalk.green("✓ Chain intact");

    console.log(`\n  Memory Chain ${chainStatus} — ${data.total ?? entries.length} entries\n`);

    for (const entry of entries as Record<string, unknown>[]) {
      const type = String(entry.type || "observation");
      const color = TYPE_COLORS[type] || "white";
      const truth = TRUTH_LABELS[entry.truth_state as number] || chalk.gray("?");
      const hash = String(entry.hash || "").slice(0, 12);
      const agent = entry.agent ? chalk.cyan(String(entry.agent)) : "";
      const ts = entry.timestamp
        ? new Date(String(entry.timestamp)).toLocaleString()
        : "";

      console.log(
        `  ${chalk[color as keyof typeof chalk](`[${type}]`)} ${truth}  ${chalk.gray(hash)}…  ${agent}`
      );
      console.log(`    ${String(entry.content).slice(0, 100)}${String(entry.content).length > 100 ? "…" : ""}`);
      console.log(chalk.gray(`    ${ts}\n`));
    }
  } catch {
    console.error(chalk.red("  ✗ Gateway unreachable: " + GATEWAY));
  }
}

export async function addMemory(
  content: string,
  opts: { type?: string; truth?: string }
) {
  const type = opts.type || "observation";
  const truth_state = parseInt(opts.truth || "0", 10);
  const timestamp = new Date().toISOString();

  // Compute hash locally for display
  const localHash = createHash("sha256")
    .update(`GENESIS:${content}:${Date.now()}`)
    .digest("hex")
    .slice(0, 16);

  try {
    const res = await fetch(`${GATEWAY}/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type, truth_state, timestamp }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json() as { hash?: string };
      const hash = (data.hash || localHash).slice(0, 16);
      console.log(chalk.green(`  ✓ Memory stored [${type}] ${chalk.gray(hash + "…")}`));
    } else {
      console.error(chalk.red(`  ✗ Failed: HTTP ${res.status}`));
    }
  } catch {
    // Store locally if gateway offline
    console.log(chalk.yellow(`  ⚠ Gateway offline — would store: [${type}] ${chalk.gray(localHash + "…")}`));
    console.log(chalk.gray(`    "${content.slice(0, 60)}${content.length > 60 ? "…" : ""}"`));
  }
}

export async function verifyChain() {
  console.log(chalk.cyan("  Verifying PS-SHA∞ chain integrity..."));

  try {
    const res = await fetch(`${GATEWAY}/memory/verify`, {
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const data = await res.json() as {
        valid?: boolean;
        total?: number;
        checked?: number;
        first_invalid?: string;
      };

      if (data.valid) {
        console.log(chalk.green(`  ✓ Chain intact — ${data.checked || data.total} entries verified`));
      } else {
        console.log(chalk.red(`  ✗ Chain compromised!`));
        if (data.first_invalid) {
          console.log(chalk.red(`    First invalid entry: ${data.first_invalid}`));
        }
      }
    } else {
      console.error(chalk.red(`  ✗ Verification failed: HTTP ${res.status}`));
    }
  } catch {
    console.error(chalk.red("  ✗ Gateway unreachable"));
  }
}

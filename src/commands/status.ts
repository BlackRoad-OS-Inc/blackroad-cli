import chalk from "chalk";

const GATEWAY_URL = process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

export async function showStatus() {
  console.log(
    chalk.bold("\n  BlackRoad OS — System Status\n") +
    "  " + "─".repeat(36)
  );

  // Gateway
  process.stdout.write("  Gateway       ");
  try {
    const res = await fetch(`${GATEWAY_URL}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json() as Record<string, unknown>;
    if (res.ok) {
      console.log(chalk.green("● Online") + chalk.gray(`  ${GATEWAY_URL}`));
      if (data.version) console.log(chalk.gray(`               v${data.version}`));
    } else {
      console.log(chalk.yellow("● Degraded") + chalk.gray(`  HTTP ${res.status}`));
    }
  } catch {
    console.log(chalk.red("● Offline") + chalk.gray(`  ${GATEWAY_URL}`));
    console.log(chalk.gray("               Start: BLACKROAD_GATEWAY_URL=... br-gateway start"));
  }

  // Agents
  process.stdout.write("  Agents        ");
  try {
    const res = await fetch(`${GATEWAY_URL}/agents`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json() as { agents?: unknown[] };
    const count = data.agents?.length ?? 0;
    const online = Array.isArray(data.agents)
      ? data.agents.filter((a: Record<string, unknown>) => a.status === "online").length
      : 0;
    console.log(chalk.green(`${online} online`) + chalk.gray(` / ${count} total`));
  } catch {
    console.log(chalk.gray("(gateway offline)"));
  }

  // Memory
  process.stdout.write("  Memory chain  ");
  try {
    const res = await fetch(`${GATEWAY_URL}/memory?limit=1`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json() as { total?: number; chain_valid?: boolean };
    const valid = data.chain_valid ?? true;
    const total = data.total ?? 0;
    const indicator = valid ? chalk.green("✓ intact") : chalk.red("✗ compromised");
    console.log(indicator + chalk.gray(`  ${total.toLocaleString()} entries`));
  } catch {
    console.log(chalk.gray("(gateway offline)"));
  }

  // Tasks
  process.stdout.write("  Task queue    ");
  try {
    const res = await fetch(`${GATEWAY_URL}/tasks?status=available`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json() as { tasks?: unknown[] };
    const available = data.tasks?.length ?? 0;
    console.log(
      available > 0
        ? chalk.yellow(`${available} available`)
        : chalk.gray("empty")
    );
  } catch {
    console.log(chalk.gray("(gateway offline)"));
  }

  console.log("");
}

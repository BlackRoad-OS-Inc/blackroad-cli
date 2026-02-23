import chalk from "chalk";

const GATEWAY = process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

const AGENT_COLORS: Record<string, string> = {
  LUCIDIA: "red",
  ALICE: "green",
  OCTAVIA: "magenta",
  PRISM: "yellow",
  ECHO: "blue",
  CIPHER: "gray",
};

function colorAgent(name: string): string {
  const color = AGENT_COLORS[name.toUpperCase()];
  return color ? chalk[color as keyof typeof chalk](name) as string : chalk.white(name);
}

function statusDot(status: string): string {
  const dots: Record<string, string> = {
    online: chalk.green("●"),
    busy: chalk.yellow("●"),
    idle: chalk.blue("●"),
    offline: chalk.gray("●"),
  };
  return dots[status] || chalk.gray("●");
}

export async function listAgents(opts: { status?: string; json?: boolean }) {
  try {
    const url = opts.status
      ? `${GATEWAY}/agents?status=${opts.status}`
      : `${GATEWAY}/agents`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as { agents?: Record<string, unknown>[] };
    const agents = data.agents || [];

    if (opts.json) {
      console.log(JSON.stringify(agents, null, 2));
      return;
    }

    if (agents.length === 0) {
      console.log(chalk.gray("  No agents found."));
      return;
    }

    console.log("");
    console.log(`  ${chalk.bold("Name")}          ${chalk.bold("Status")}   ${chalk.bold("Capabilities")}`);
    console.log("  " + "─".repeat(60));

    for (const agent of agents as Record<string, unknown>[]) {
      const name = String(agent.name || "");
      const status = String(agent.status || "offline");
      const caps = ((agent.capabilities as string[]) || []).slice(0, 3).join(", ");
      const tasks = agent.tasks_completed ? chalk.gray(` (${agent.tasks_completed} tasks)`) : "";

      console.log(
        `  ${colorAgent(name).padEnd(14)} ${statusDot(status)} ${status.padEnd(8)} ${chalk.gray(caps)}${tasks}`
      );
    }
    console.log("");
  } catch {
    console.error(chalk.red("  ✗ Could not reach gateway: " + GATEWAY));
    console.log(chalk.gray("  Set BLACKROAD_GATEWAY_URL or start the gateway."));
  }
}

export async function pingAgent(agentId: string) {
  console.log(chalk.cyan(`  Pinging ${agentId}...`));
  try {
    const start = Date.now();
    const res = await fetch(`${GATEWAY}/agents/${agentId}/ping`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - start;
    
    if (res.ok) {
      console.log(chalk.green(`  ● ${agentId} responded in ${ms}ms`));
    } else {
      console.log(chalk.yellow(`  ⚠ ${agentId} → HTTP ${res.status}`));
    }
  } catch {
    console.log(chalk.red(`  ✗ ${agentId} is offline or unreachable`));
  }
}

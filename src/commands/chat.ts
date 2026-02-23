import chalk from "chalk";
import * as readline from "readline";

const GATEWAY = process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

const AGENT_COLORS: Record<string, chalk.Chalk> = {
  LUCIDIA: chalk.red,
  ALICE: chalk.green,
  OCTAVIA: chalk.magenta,
  PRISM: chalk.yellow,
  ECHO: chalk.blue,
  CIPHER: chalk.gray,
};

const AGENT_LIST = ["LUCIDIA", "ALICE", "OCTAVIA", "PRISM", "ECHO", "CIPHER"];

export async function startChat(
  agent: string | undefined,
  opts: { model?: string }
) {
  const agentName = agent ? agent.toUpperCase() : null;
  const model = opts.model || "qwen2.5:7b";
  const agentColor = agentName
    ? AGENT_COLORS[agentName] || chalk.cyan
    : chalk.cyan;

  // Header
  console.log("");
  console.log(chalk.bold("  BlackRoad OS — Chat"));
  console.log(
    agentName
      ? `  Agent: ${agentColor(agentName)} | Model: ${chalk.gray(model)}`
      : `  Model: ${chalk.gray(model)} | Available agents: ${AGENT_LIST.map(a => AGENT_COLORS[a]?.(a) || a).join(", ")}`
  );
  console.log(chalk.gray("  Type 'exit' to quit. '/agent ALICE' to switch agent.\n"));

  const messages: { role: string; content: string }[] = [];
  let currentAgent = agentName;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const ask = () =>
    new Promise<string>((resolve) => {
      const agentPrompt = currentAgent ? agentColor(`${currentAgent}> `) : chalk.cyan("> ");
      process.stdout.write("  " + agentPrompt);
      rl.once("line", resolve);
    });

  while (true) {
    const input = (await ask()).trim();

    if (!input) continue;
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log(chalk.gray("\n  Goodbye.\n"));
      rl.close();
      break;
    }

    // Switch agent command
    if (input.startsWith("/agent ")) {
      const newAgent = input.slice(7).trim().toUpperCase();
      if (AGENT_LIST.includes(newAgent)) {
        currentAgent = newAgent;
        console.log(chalk.gray(`  → Switched to ${AGENT_COLORS[newAgent]?.(newAgent)}\n`));
      } else {
        console.log(chalk.gray(`  Available: ${AGENT_LIST.join(", ")}\n`));
      }
      continue;
    }

    messages.push({ role: "user", content: input });

    try {
      const res = await fetch(`${GATEWAY}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          agent: currentAgent,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        const data = await res.json() as {
          message?: { content?: string };
          response?: string;
        };
        const content =
          data.message?.content || data.response || "(no response)";

        const label = currentAgent
          ? AGENT_COLORS[currentAgent]?.(`  ${currentAgent}: `) || `  ${currentAgent}: `
          : "  ";

        console.log(label + content);
        console.log("");

        messages.push({ role: "assistant", content });
      } else {
        console.log(
          chalk.red("  ✗ Error: HTTP " + res.status) +
          chalk.gray(" — Is the gateway running?")
        );
      }
    } catch {
      console.log(chalk.red("  ✗ Gateway offline."));
      console.log(chalk.gray("  Start: cd blackroad-core && ./scripts/start-gateway.sh\n"));
    }
  }
}

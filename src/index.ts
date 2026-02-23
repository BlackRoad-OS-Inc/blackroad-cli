#!/usr/bin/env node
/**
 * @blackroad/cli — BlackRoad OS Command Line Interface
 */
import { Command } from "commander";
import { version } from "../package.json";

const program = new Command();

program
  .name("br")
  .description("BlackRoad OS CLI — AI agents, fleet management, and dev tools")
  .version(version);

// br agents
program
  .command("agents")
  .description("Manage AI agents")
  .option("-t, --type <type>", "Filter by type (reasoning|worker|security|memory)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { AgentClient } = await import("../lib/agents.js");
    const client = new AgentClient();
    const agents = await client.list({ type: opts.type });
    if (opts.json) {
      console.log(JSON.stringify(agents, null, 2));
    } else {
      console.log("\n🤖 BlackRoad Agents");
      console.log("─".repeat(50));
      for (const a of agents) {
        const status = a.status === "active" ? "\x1b[32m●\x1b[0m" : "\x1b[31m●\x1b[0m";
        console.log(`  ${status} ${a.name.padEnd(12)} [${a.type}]  ${a.capabilities.join(", ")}`);
      }
    }
  });

// br fleet
program
  .command("fleet")
  .description("Raspberry Pi fleet management")
  .addCommand(new Command("status").description("Fleet status").action(async () => {
    const { execSync } = await import("child_process");
    try { execSync("br pi status", { stdio: "inherit" }); }
    catch { console.log("Run: br pi status"); }
  }));

// br memory
program
  .command("memory")
  .description("PS-SHA∞ memory operations")
  .option("-s, --search <query>", "Search memory")
  .option("-r, --remember <text>", "Store a memory")
  .option("--recent", "Show recent memories")
  .action(async (opts) => {
    const { MemoryStore } = await import("../lib/memory.js");
    const store = new MemoryStore();
    if (opts.remember) {
      const m = store.remember(opts.remember);
      console.log(`✓ Stored [${m.hash.slice(0,8)}] ${opts.remember}`);
    } else if (opts.search) {
      const results = store.search(opts.search);
      results.forEach(r => console.log(`  [${r.hash.slice(0,8)}] ${r.content}`));
    } else if (opts.recent) {
      store.recent(10).forEach(r => console.log(`  [${r.hash.slice(0,8)}] ${r.content}`));
    } else {
      console.log(`Memory chain: ${store.length} entries, head: ${store.headHash}`);
    }
  });

// br generate
program
  .command("generate <prompt>")
  .description("Generate text with local Ollama")
  .option("-m, --model <model>", "Model name", "qwen2.5:3b")
  .action(async (prompt, opts) => {
    const gateway = process.env.BLACKROAD_GATEWAY_URL ?? "http://127.0.0.1:8787";
    try {
      const resp = await fetch(`${gateway}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: opts.model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json() as any;
      console.log(data?.choices?.[0]?.message?.content ?? "No response");
    } catch {
      console.error("Gateway not running. Start with: cd blackroad-core && npm start");
    }
  });

program.parse();

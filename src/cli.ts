#!/usr/bin/env node
/**
 * blackroad-cli — Command line interface for BlackRoad OS
 *
 * Usage: blackroad <command> [options]
 *   Or:  br <command> [options]  (shell alias)
 */

import { Command } from "commander";

const pkg = require("../package.json");

const program = new Command();

program
  .name("blackroad")
  .description("BlackRoad OS CLI — Your AI. Your Hardware. Your Rules.")
  .version(pkg.version);

// ── agents ──────────────────────────────────────────────────────────────────

const agents = program
  .command("agents")
  .alias("a")
  .description("Manage the agent fleet");

agents
  .command("list")
  .alias("ls")
  .description("List all agents")
  .option("-s, --status <status>", "Filter by status (online|offline|busy)")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { listAgents } = await import("./commands/agents");
    await listAgents(opts);
  });

agents
  .command("ping <agent-id>")
  .description("Ping an agent")
  .action(async (agentId) => {
    const { pingAgent } = await import("./commands/agents");
    await pingAgent(agentId);
  });

// ── tasks ───────────────────────────────────────────────────────────────────

const tasks = program
  .command("tasks")
  .alias("t")
  .description("Interact with the task marketplace");

tasks
  .command("list")
  .alias("ls")
  .description("List available tasks")
  .option("-s, --status <status>", "Filter by status")
  .option("-p, --priority <priority>", "Filter by priority")
  .action(async (opts) => {
    const { listTasks } = await import("./commands/tasks");
    await listTasks(opts);
  });

tasks
  .command("create")
  .description("Post a new task")
  .requiredOption("-t, --title <title>", "Task title")
  .requiredOption("-d, --description <desc>", "Task description")
  .option("-p, --priority <priority>", "Priority (low|medium|high|critical)", "medium")
  .option("-s, --skills <skills>", "Comma-separated skill requirements")
  .action(async (opts) => {
    const { createTask } = await import("./commands/tasks");
    await createTask(opts);
  });

tasks
  .command("claim <task-id>")
  .description("Claim a task")
  .action(async (taskId) => {
    const { claimTask } = await import("./commands/tasks");
    await claimTask(taskId);
  });

// ── memory ──────────────────────────────────────────────────────────────────

const memory = program
  .command("memory")
  .alias("m")
  .description("Interact with the PS-SHA∞ memory chain");

memory
  .command("list")
  .alias("ls")
  .description("List recent memory entries")
  .option("-n, --limit <n>", "Number of entries", "20")
  .option("--type <type>", "Filter by type (fact|observation|inference|commitment)")
  .action(async (opts) => {
    const { listMemory } = await import("./commands/memory");
    await listMemory(opts);
  });

memory
  .command("add <content>")
  .description("Add a memory entry")
  .option("-t, --type <type>", "Memory type", "observation")
  .option("--truth <state>", "Truth state (1=true, 0=unknown, -1=false)", "0")
  .action(async (content, opts) => {
    const { addMemory } = await import("./commands/memory");
    await addMemory(content, opts);
  });

memory
  .command("verify")
  .description("Verify chain integrity")
  .action(async () => {
    const { verifyChain } = await import("./commands/memory");
    await verifyChain();
  });

// ── chat ────────────────────────────────────────────────────────────────────

program
  .command("chat [agent]")
  .description("Start interactive chat (optionally with a named agent)")
  .option("-m, --model <model>", "Model to use", "qwen2.5:7b")
  .action(async (agent, opts) => {
    const { startChat } = await import("./commands/chat");
    await startChat(agent, opts);
  });

// ── status ──────────────────────────────────────────────────────────────────

program
  .command("status")
  .description("Show gateway and fleet status")
  .action(async () => {
    const { showStatus } = await import("./commands/status");
    await showStatus();
  });

program.parse();

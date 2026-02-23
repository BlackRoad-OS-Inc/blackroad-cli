import chalk from "chalk";

const GATEWAY = process.env.BLACKROAD_GATEWAY_URL || "http://127.0.0.1:8787";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "red",
  high: "yellow",
  medium: "cyan",
  low: "gray",
};

const STATUS_COLORS: Record<string, string> = {
  available: "green",
  claimed: "yellow",
  in_progress: "blue",
  completed: "gray",
  cancelled: "red",
};

export async function listTasks(opts: { status?: string; priority?: string }) {
  try {
    const params = new URLSearchParams();
    if (opts.status) params.set("status", opts.status);
    if (opts.priority) params.set("priority", opts.priority);
    
    const url = `${GATEWAY}/tasks${params.toString() ? "?" + params : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as { tasks?: Record<string, unknown>[] };
    const tasks = data.tasks || [];

    if (tasks.length === 0) {
      console.log(chalk.gray("  No tasks found."));
      return;
    }

    console.log("");
    for (const task of tasks as Record<string, unknown>[]) {
      const pColor = PRIORITY_COLORS[String(task.priority)] || "white";
      const sColor = STATUS_COLORS[String(task.status)] || "white";
      const skills = ((task.skills as string[]) || []).join(", ");

      console.log(
        `  ${chalk[pColor as keyof typeof chalk](`[${task.priority}]`)} ` +
        `${chalk.bold(String(task.title))} ` +
        `${chalk[sColor as keyof typeof chalk](`[${task.status}]`)}`
      );
      console.log(`    ${chalk.gray(String(task.description).slice(0, 80))}${String(task.description).length > 80 ? "…" : ""}`);
      if (skills) console.log(`    ${chalk.gray("Skills:")} ${chalk.cyan(skills)}`);
      console.log(`    ${chalk.gray("Posted by:")} ${String(task.posted_by || "unknown")}  ${chalk.gray("ID:")} ${chalk.gray(String(task.id))}`);
      console.log("");
    }
  } catch {
    console.error(chalk.red("  ✗ Could not reach gateway: " + GATEWAY));
  }
}

export async function createTask(opts: {
  title: string;
  description: string;
  priority: string;
  skills?: string;
}) {
  const payload = {
    title: opts.title,
    description: opts.description,
    priority: opts.priority,
    skills: opts.skills ? opts.skills.split(",").map((s: string) => s.trim()) : [],
  };

  try {
    const res = await fetch(`${GATEWAY}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    
    if (res.ok) {
      const data = await res.json() as { id?: string };
      console.log(chalk.green(`  ✓ Task created: ${data.id}`));
    } else {
      console.error(chalk.red(`  ✗ Failed: HTTP ${res.status}`));
    }
  } catch {
    console.error(chalk.red("  ✗ Gateway unreachable"));
  }
}

export async function claimTask(taskId: string) {
  try {
    const res = await fetch(`${GATEWAY}/tasks/${taskId}/claim`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
    });
    
    if (res.ok) {
      const data = await res.json() as { assigned_to?: string };
      console.log(chalk.green(`  ✓ Task ${taskId} claimed by ${data.assigned_to || "you"}`));
    } else if (res.status === 409) {
      console.log(chalk.yellow(`  ⚠ Task ${taskId} already claimed`));
    } else {
      console.error(chalk.red(`  ✗ Failed: HTTP ${res.status}`));
    }
  } catch {
    console.error(chalk.red("  ✗ Gateway unreachable"));
  }
}

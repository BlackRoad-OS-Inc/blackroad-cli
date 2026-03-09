import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const API = process.env.BLACKROAD_API || 'https://api.blackroad.io';

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

const agents = new Command('agents').description('Manage BlackRoad agents');

agents.command('list').alias('ls').description('List all registered agents')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const spinner = ora('Fetching agents...').start();
    try {
      const data = await fetchJSON('/agents');
      spinner.stop();
      if (opts.json) { console.log(JSON.stringify(data, null, 2)); return; }
      if (!data.length) { console.log(chalk.yellow('No agents registered')); return; }
      const statusIcon = { online: '🟢', offline: '⚫', busy: '🟡' };
      for (const a of data) {
        console.log(`${statusIcon[a.status] || '❓'} ${chalk.bold(a.name)} (${chalk.dim(a.id)}) — ${a.role}`);
        console.log(`  Capabilities: ${a.capabilities.join(', ')}`);
      }
    } catch (err) { spinner.fail(err.message); }
  });

agents.command('status <id>').description('Get agent status')
  .action(async (id) => {
    try {
      const agent = await fetchJSON(`/agents/${id}`);
      console.log(chalk.bold(agent.name));
      console.log(`Status: ${agent.status}\nRole: ${agent.role}`);
      console.log(`Capabilities: ${agent.capabilities.join(', ')}`);
      console.log(`Last heartbeat: ${new Date(agent.lastHeartbeat).toLocaleString()}`);
    } catch (err) { console.error(chalk.red(err.message)); }
  });

agents.command('health').description('Check agent registry health')
  .action(async () => {
    const spinner = ora('Checking health...').start();
    try {
      const h = await fetchJSON('/health');
      spinner.succeed(`Registry: ${h.status} | Agents: ${h.agents} | Online: ${h.online}`);
    } catch (err) { spinner.fail(`Registry unreachable: ${err.message}`); }
  });

export { agents };

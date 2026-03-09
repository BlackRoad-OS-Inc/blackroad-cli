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

const gateway = new Command('gateway').alias('gw').description('Manage the BlackRoad gateway');

gateway.command('health').description('Check gateway health')
  .action(async () => {
    const spinner = ora('Checking gateway...').start();
    try {
      const h = await fetchJSON('/health');
      spinner.succeed(`Gateway: ${chalk.green(h.status)} | Uptime: ${h.uptime}s | Node: ${h.node} | Mem: ${h.memory?.used}MB`);
    } catch (err) { spinner.fail(`Gateway unreachable: ${err.message}`); }
  });

gateway.command('ready').description('Check provider readiness')
  .action(async () => {
    const spinner = ora('Checking providers...').start();
    try {
      const r = await fetchJSON('/ready');
      spinner.stop();
      console.log(`Status: ${r.status === 'ready' ? chalk.green(r.status) : chalk.yellow(r.status)}`);
      for (const [name, status] of Object.entries(r.providers)) {
        const icon = status === 'ready' ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${icon} ${name}: ${status}`);
      }
    } catch (err) { spinner.fail(err.message); }
  });

gateway.command('chat <provider> <message>').description('Send a chat message')
  .option('-t, --token <token>', 'Auth token')
  .action(async (provider, message, opts) => {
    const spinner = ora(`Routing to ${provider}...`).start();
    try {
      const headers = {};
      if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
      const res = await fetchJSON(`/v1/${provider}/chat`, {
        method: 'POST', headers,
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
      });
      spinner.stop();
      console.log(chalk.dim(`[${res.provider}/${res.model}]`));
      console.log(res.message.content);
    } catch (err) { spinner.fail(err.message); }
  });

export { gateway };

// Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const GRAD = ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'];
const API_BASE = process.env.BLACKROAD_API || 'https://api.blackroad.io';

async function fetchAgents() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(`${API_BASE}/v1/agents`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return (await resp.json()).agents || [];
  } catch {
    return discoverLocalAgents();
  }
}

function discoverLocalAgents() {
  return [
    { id: 'alice', name: 'Alice', type: 'gateway', status: 'unknown', capabilities: ['dns', 'postgresql', 'qdrant', 'redis'], node: '192.168.4.49' },
    { id: 'cecilia', name: 'Cecilia', type: 'inference', status: 'unknown', capabilities: ['ollama', 'minio', 'hailo-8'], node: '192.168.4.96' },
    { id: 'octavia', name: 'Octavia', type: 'devops', status: 'unknown', capabilities: ['gitea', 'nats', 'workers', 'hailo-8'], node: '192.168.4.101' },
    { id: 'aria', name: 'Aria', type: 'compute', status: 'unknown', capabilities: ['wireguard', 'compute'], node: '192.168.4.98' },
    { id: 'lucidia', name: 'Lucidia', type: 'apps', status: 'unknown', capabilities: ['powerdns', 'ollama', 'ci-runner', '530-apps'], node: '192.168.4.38' },
    { id: 'gematria', name: 'Gematria', type: 'edge', status: 'unknown', capabilities: ['caddy', 'ollama', 'powerdns-ns1'], node: 'DO-nyc3' },
    { id: 'anastasia', name: 'Anastasia', type: 'backup', status: 'unknown', capabilities: ['backup', 'dr'], node: 'DO-nyc1' },
    { id: 'lucidia-core', name: 'Lucidia Core', type: 'reasoning', status: 'unknown', capabilities: ['reasoning', 'strategy', 'philosophy'] },
    { id: 'prism', name: 'Prism', type: 'analytics', status: 'unknown', capabilities: ['analysis', 'patterns', 'reporting'] },
    { id: 'echo', name: 'Echo', type: 'memory', status: 'unknown', capabilities: ['recall', 'storage', 'context'] },
    { id: 'cipher', name: 'Cipher', type: 'security', status: 'unknown', capabilities: ['security', 'encryption', 'audit'] },
  ];
}

export async function agentsCommand(options) {
  const spinner = ora('Discovering agents...').start();
  const agents = await fetchAgents();
  spinner.stop();

  if (options.json) {
    console.log(JSON.stringify(agents, null, 2));
    return;
  }

  console.log();
  console.log(chalk.hex(GRAD[0]).bold('  BlackRoad Agent Fleet'));
  console.log(chalk.gray(`  ${agents.length} agents discovered`));
  console.log();

  const table = new Table({
    head: ['', 'Agent', 'Type', 'Status', 'Capabilities'].map(h => chalk.gray(h)),
    style: { head: [], border: ['gray'] },
  });

  const typeColors = {
    reasoning: '#CC00AA', worker: '#00D4FF', devops: '#4488FF', analytics: '#FF6B2B',
    memory: '#FF2255', security: '#8844FF', gateway: '#00D4FF', inference: '#CC00AA',
    compute: '#FF6B2B', apps: '#4488FF', edge: '#FF2255', backup: '#8844FF',
  };

  for (const agent of agents) {
    const statusIcon = agent.status === 'active' ? chalk.green('●')
      : agent.status === 'idle' ? chalk.yellow('○')
      : chalk.gray('◌');
    const color = typeColors[agent.type] || '#737373';
    const caps = (agent.capabilities || []).join(', ');

    table.push([
      statusIcon,
      chalk.white.bold(agent.name || agent.id),
      chalk.hex(color)(agent.type),
      agent.status,
      chalk.gray(caps.slice(0, 40)),
    ]);
  }

  console.log(table.toString());

  if (options.wake) {
    const spinner2 = ora(`Waking agent ${options.wake}...`).start();
    try {
      const resp = await fetch(`${API_BASE}/v1/agents/${options.wake}/wake`, { method: 'POST' });
      if (resp.ok) spinner2.succeed(chalk.green(`${options.wake} is now active`));
      else spinner2.fail(chalk.red(`Failed to wake ${options.wake}`));
    } catch (e) {
      spinner2.fail(chalk.red(e.message));
    }
  }

  console.log();
}

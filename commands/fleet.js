// Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const GRAD = ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'];

const FLEET = [
  { name: 'Alice', ip: '192.168.4.49', role: 'Gateway / DNS / PostgreSQL / Qdrant / Redis',
    ports: [80, 443, 5432, 6333, 6379, 53], hailo: false, os: 'Pi 5 (Bookworm)' },
  { name: 'Cecilia', ip: '192.168.4.96', role: 'Inference / MinIO / PostgreSQL / InfluxDB',
    ports: [11434, 9000, 5432, 8086, 5001], hailo: true, os: 'Pi 5 (Bookworm)' },
  { name: 'Octavia', ip: '192.168.4.101', role: 'Gitea / Workers / NATS / Docker / PaaS',
    ports: [3100, 4222, 3500], hailo: true, os: 'Pi 5 (Bookworm)' },
  { name: 'Aria', ip: '192.168.4.98', role: 'Compute / WireGuard Hub',
    ports: [51820], hailo: false, os: 'Pi 5 (Bookworm)' },
  { name: 'Lucidia', ip: '192.168.4.38', role: 'Apps / PowerDNS / Ollama / CI Runners',
    ports: [80, 443, 11434, 8053], hailo: false, os: 'Pi 5 (Bullseye)' },
  { name: 'Gematria', ip: 'DO (nyc3)', role: 'Caddy TLS Edge / Ollama / PowerDNS (ns1)',
    ports: [80, 443, 11434], hailo: false, os: 'Ubuntu 22.04' },
  { name: 'Anastasia', ip: 'DO (nyc1)', role: 'Backup / DR',
    ports: [22], hailo: false, os: 'Ubuntu 22.04' },
];

async function pingNode(ip) {
  if (ip.startsWith('DO')) return { reachable: null, latency: null };
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(`http://${ip}`, { signal: controller.signal }).catch(() => {});
    clearTimeout(timeout);
    return { reachable: true, latency: Date.now() - start };
  } catch {
    return { reachable: false, latency: null };
  }
}

export async function fleetCommand(options) {
  console.log();
  console.log(chalk.hex(GRAD[0]).bold('  BlackRoad Fleet Status'));
  console.log(chalk.gray('  5 Raspberry Pi 5s + 2 DigitalOcean droplets'));
  console.log(chalk.gray('  52 TOPS (2x Hailo-8) · WireGuard mesh · Tor .onion services'));
  console.log();

  if (options.json) {
    console.log(JSON.stringify(FLEET, null, 2));
    return;
  }

  const spinner = ora('Pinging fleet nodes...').start();

  const pings = await Promise.all(FLEET.map(async (node) => {
    const ping = await pingNode(node.ip);
    return { ...node, ...ping };
  }));

  spinner.stop();

  const table = new Table({
    head: ['', 'Node', 'IP', 'Role', 'Hailo', 'OS'].map(h => chalk.gray(h)),
    style: { head: [], border: ['gray'] },
    colWidths: [3, 12, 18, 44, 7, 18],
  });

  for (const node of pings) {
    const status = node.reachable === true ? chalk.green('●')
      : node.reachable === false ? chalk.red('●')
      : chalk.gray('○');

    const hailoStr = node.hailo ? chalk.hex('#00D4FF')('26T') : chalk.gray('—');

    table.push([
      status,
      chalk.white.bold(node.name),
      chalk.gray(node.ip),
      chalk.gray(node.role.slice(0, 42)),
      hailoStr,
      chalk.gray(node.os),
    ]);
  }

  console.log(table.toString());

  // Summary
  const online = pings.filter(n => n.reachable === true).length;
  const offline = pings.filter(n => n.reachable === false).length;
  const cloud = pings.filter(n => n.reachable === null).length;

  console.log();
  console.log(chalk.gray(`  ${chalk.green(online)} online · ${chalk.red(offline)} offline · ${chalk.gray(cloud)} cloud`));

  if (options.ssh) {
    console.log();
    console.log(chalk.hex(GRAD[2]).bold('  SSH Access:'));
    for (const node of FLEET) {
      if (!node.ip.startsWith('DO')) {
        const user = ['Alice', 'Octavia'].includes(node.name) ? 'pi' : 'blackroad';
        console.log(chalk.gray(`    ssh ${user}@${node.ip}  # ${node.name}`));
      }
    }
  }

  console.log();
}

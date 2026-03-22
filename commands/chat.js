// Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.
import chalk from 'chalk';
import readline from 'readline';

const GRAD = ['#FF6B2B', '#FF2255', '#CC00AA', '#8844FF', '#4488FF', '#00D4FF'];
const API_BASE = process.env.BLACKROAD_API || 'https://api.blackroad.io';
const ROUNDTRIP = process.env.BLACKROAD_CHAT || 'https://roundtrip.blackroad.io';

// Try multiple inference backends in order
const INFERENCE_CHAIN = [
  { name: 'Cecilia (local)', url: 'http://192.168.4.96:11434/api/chat', type: 'ollama' },
  { name: 'Lucidia (local)', url: 'http://192.168.4.38:11434/api/chat', type: 'ollama' },
  { name: 'Gematria (edge)', url: 'http://gematria:11434/api/chat', type: 'ollama' },
  { name: 'RoundTrip', url: `${ROUNDTRIP}/api/chat`, type: 'roundtrip' },
  { name: 'BlackRoad API', url: `${API_BASE}/v1/chat`, type: 'api' },
];

async function sendMessage(message, agent = 'lucidia', model = 'qwen2.5:7b') {
  for (const backend of INFERENCE_CHAIN) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let resp;
      if (backend.type === 'ollama') {
        resp = await fetch(backend.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: message }], stream: false }),
          signal: controller.signal,
        });
      } else if (backend.type === 'roundtrip') {
        resp = await fetch(backend.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent, message, channel: 'general' }),
          signal: controller.signal,
        });
      } else {
        resp = await fetch(backend.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, agent, model }),
          signal: controller.signal,
        });
      }

      clearTimeout(timeout);

      if (resp.ok) {
        const data = await resp.json();
        const text = data.message?.content || data.response || data.reply || data.text || JSON.stringify(data);
        return { text, backend: backend.name };
      }
    } catch {
      continue;
    }
  }
  return { text: 'All inference backends unreachable. Check fleet with: br fleet', backend: 'none' };
}

export async function chatCommand(message, options) {
  const agent = options.agent || 'lucidia';
  const model = options.model || 'qwen2.5:7b';

  // Single message mode
  if (message) {
    const spinner = chalk.gray('  thinking...');
    process.stdout.write(spinner);
    const { text, backend } = await sendMessage(message, agent, model);
    process.stdout.write('\r' + ' '.repeat(spinner.length) + '\r');
    console.log();
    console.log(chalk.hex(GRAD[3]).bold(`  ${agent.toUpperCase()}`));
    console.log(chalk.white(`  ${text}`));
    console.log(chalk.gray(`\n  via ${backend} · model: ${model}`));
    console.log();
    return;
  }

  // Interactive REPL mode
  console.log();
  console.log(chalk.hex(GRAD[0]).bold('  BlackRoad Chat'));
  console.log(chalk.gray(`  Agent: ${agent} · Model: ${model}`));
  console.log(chalk.gray('  Type your message. Ctrl+C to exit.\n'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.hex(GRAD[4])('  > '),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }
    if (input === '/quit' || input === '/exit') { rl.close(); return; }
    if (input === '/agents') {
      console.log(chalk.gray('  Available: lucidia, alice, octavia, prism, echo, cipher'));
      rl.prompt(); return;
    }
    if (input.startsWith('/agent ')) {
      const newAgent = input.slice(7).trim();
      options.agent = newAgent;
      console.log(chalk.gray(`  Switched to ${newAgent}`));
      rl.prompt(); return;
    }

    process.stdout.write(chalk.gray('  thinking...'));
    const currentAgent = options.agent || agent;
    const { text, backend } = await sendMessage(input, currentAgent, model);
    process.stdout.write('\r                    \r');
    console.log(chalk.hex(GRAD[3]).bold(`  ${currentAgent.toUpperCase()}: `) + chalk.white(text));
    console.log(chalk.gray(`  [${backend}]`));
    console.log();
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(chalk.gray('\n  Session ended.\n'));
    process.exit(0);
  });
}

// Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

const API_BASE = process.env.BLACKROAD_API || 'https://api.blackroad.io';
const SEARCH_BASE = process.env.BLACKROAD_SEARCH || 'https://search.blackroad.io';

async function searchAPI(query, options = {}) {
  const params = new URLSearchParams({ q: query, limit: String(options.limit || 20) });
  if (options.type) params.set('type', options.type);

  try {
    // Try the dedicated search service first
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`${SEARCH_BASE}/api/search?${params}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) return await resp.json();
  } catch {
    // Fallback to API search
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`${API_BASE}/v1/search?${params}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) return await resp.json();
  } catch {
    // Fallback to local search
  }

  return localSearch(query);
}

function localSearch(query) {
  // Search local codex, memory, scripts
  const { execSync } = await import('child_process');
  const results = [];

  try {
    const codexOut = execSync(
      `bash ~/blackroad-operator/scripts/memory/memory-codex.sh search "${query}" 2>/dev/null`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const lines = codexOut.split('\n').filter(l => l.trim() && !l.startsWith('['));
    for (const line of lines.slice(0, 10)) {
      results.push({ type: 'codex', title: line.trim(), score: 0.8 });
    }
  } catch {}

  try {
    const tilOut = execSync(
      `bash ~/blackroad-operator/scripts/memory/memory-til-broadcast.sh search "${query}" 2>/dev/null`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const lines = tilOut.split('\n').filter(l => l.trim() && !l.startsWith('['));
    for (const line of lines.slice(0, 10)) {
      results.push({ type: 'til', title: line.trim(), score: 0.7 });
    }
  } catch {}

  return { results, total: results.length, query };
}

export async function searchCommand(query, options) {
  if (!query) {
    console.log(chalk.yellow('\n  Usage: br search <query>\n'));
    console.log(chalk.gray('  Search across repos, codex, memory, agents, and docs'));
    console.log(chalk.gray('  Options:'));
    console.log(chalk.gray('    -t, --type <type>   Filter: repo, codex, til, agent, doc'));
    console.log(chalk.gray('    -n, --limit <n>     Max results (default: 20)'));
    console.log(chalk.gray('    -j, --json          Output as JSON\n'));
    return;
  }

  const spinner = ora(`Searching for "${query}"...`).start();
  const data = await searchAPI(query, { type: options.type, limit: options.limit });
  spinner.stop();

  const results = data.results || [];

  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log(chalk.yellow(`\n  No results for "${query}"\n`));
    return;
  }

  console.log();
  console.log(chalk.hex('#FF6B2B').bold(`  ${results.length} results for "${query}"`));
  console.log();

  const typeColors = {
    repo: '#4488FF',
    codex: '#CC00AA',
    til: '#00D4FF',
    agent: '#FF2255',
    doc: '#8844FF',
    script: '#FF6B2B',
    website: '#00D4FF',
    memory: '#FF2255',
  };

  for (const r of results) {
    const color = typeColors[r.type] || '#737373';
    const badge = chalk.hex(color).bold(`[${(r.type || 'result').toUpperCase()}]`);
    const title = chalk.white(r.title || r.name || 'untitled');
    const score = r.score ? chalk.gray(` (${Math.round(r.score * 100)}%)`) : '';
    const desc = r.description ? chalk.gray(`  ${r.description.slice(0, 80)}`) : '';
    const url = r.url ? chalk.gray.underline(`  ${r.url}`) : '';

    console.log(`  ${badge} ${title}${score}`);
    if (desc) console.log(desc);
    if (url) console.log(url);
    console.log();
  }
}

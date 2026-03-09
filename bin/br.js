#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { createRequire } from 'module';

import { statusCommand } from '../commands/status.js';
import { deployCommand } from '../commands/deploy.js';
import { logsCommand } from '../commands/logs.js';
import { healthCommand } from '../commands/health.js';
import { servicesCommand } from '../commands/services.js';
import { openCommand } from '../commands/open.js';
import { emojiCommand } from '../commands/emoji.js';
import { notifyCommand } from '../commands/notify.js';
import { quizCommand } from '../commands/quiz.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

process.on('uncaughtException', (err) => {
  console.error(chalk.red(`\n  Fatal error: ${err.message}\n`));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  console.error(chalk.red(`\n  Unhandled error: ${msg}\n`));
  process.exit(1);
});

const program = new Command();

// ASCII art banner
const banner = `
${chalk.hex('#FF6B00')('██████╗ ')}${chalk.hex('#FF0066')('██╗      █████╗  ██████╗██╗  ██╗')}
${chalk.hex('#FF6B00')('██╔══██╗')}${chalk.hex('#FF0066')('██║     ██╔══██╗██╔════╝██║ ██╔╝')}
${chalk.hex('#FF6B00')('██████╔╝')}${chalk.hex('#FF0066')('██║     ███████║██║     █████╔╝ ')}
${chalk.hex('#FF6B00')('██╔══██╗')}${chalk.hex('#FF0066')('██║     ██╔══██║██║     ██╔═██╗ ')}
${chalk.hex('#FF6B00')('██████╔╝')}${chalk.hex('#FF0066')('███████╗██║  ██║╚██████╗██║  ██╗')}
${chalk.hex('#FF6B00')('╚═════╝ ')}${chalk.hex('#FF0066')('╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝')}
${chalk.gray('        R O A D   O S')}
`;

program
  .name('br')
  .description('BlackRoad OS CLI - Manage your services, deployments, and agents')
  .version(version);

// Status command
program
  .command('status')
  .alias('s')
  .description('Check status of all BlackRoad services')
  .option('-j, --json', 'Output as JSON')
  .option('-w, --watch', 'Watch mode - refresh every 30 seconds')
  .action(statusCommand);

// Deploy command
program
  .command('deploy [service]')
  .alias('d')
  .description('Deploy a service to Railway')
  .option('-a, --all', 'Deploy all services')
  .option('--detach', 'Run deployment in background')
  .action(deployCommand);

// Logs command
program
  .command('logs [service]')
  .alias('l')
  .description('View logs for a service')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .action(logsCommand);

// Health command
program
  .command('health')
  .alias('h')
  .description('Run health check on all services')
  .option('--heal', 'Attempt to auto-heal unhealthy services')
  .action(healthCommand);

// Services command
program
  .command('services')
  .alias('svc')
  .description('List all BlackRoad services and their URLs')
  .option('-c, --category <category>', 'Filter by category (core, web, infra)')
  .action(servicesCommand);

// Open command
program
  .command('open <target>')
  .alias('o')
  .description('Open a service, dashboard, or docs in browser')
  .action(openCommand);

// Emoji translator command
program
  .command('emoji [text]')
  .alias('e')
  .description('🗣️  Translate text to emoji or enter interactive mode')
  .option('-i, --interactive', 'Interactive translation mode')
  .option('-p, --phrases', 'Show emoji phrase library')
  .option('-s, --search <term>', 'Search emoji dictionary')
  .option('-r, --random', 'Generate random emoji sentences')
  .action(emojiCommand);

// Notify command
program
  .command('notify [message]')
  .alias('n')
  .description('🔔 Emoji-based notifications and log prefixes')
  .option('-d, --demo <type>', 'Demo notification type (deploy, build, test, health, git, server)')
  .option('-l, --log <level>', 'Log a message with emoji prefix')
  .option('--prefixes', 'Show all available log prefixes')
  .action((message, options) => notifyCommand({ ...options, message }));

// Quiz command
program
  .command('quiz')
  .alias('q')
  .description('🎮 Play emoji language games and quizzes')
  .option('-r, --rounds <n>', 'Number of quiz rounds', '5')
  .option('-t, --type <type>', 'Quiz type (translate, decode, complete, grammar, mixed)', 'mixed')
  .option('-f, --flashcards', 'Flashcard mode')
  .option('-b, --builder', 'Sentence builder game')
  .option('-c, --count <n>', 'Number of flashcards', '10')
  .action(quizCommand);

// Show banner when run without arguments
if (process.argv.length <= 2) {
  console.log(banner);
  console.log(boxen(
    `${chalk.bold('Quick Commands:')}\n\n` +
    `  ${chalk.cyan('br status')}     Check all services\n` +
    `  ${chalk.cyan('br deploy')}     Deploy a service\n` +
    `  ${chalk.cyan('br health')}     Run health checks\n` +
    `  ${chalk.cyan('br emoji')}      🗣️  Translate to emoji\n` +
    `  ${chalk.cyan('br quiz')}       🎮 Emoji language games\n` +
    `  ${chalk.cyan('br notify')}     🔔 Emoji notifications\n\n` +
    `${chalk.gray('Run')} ${chalk.cyan('br --help')} ${chalk.gray('for all commands')}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: '#FF6B00'
    }
  ));
} else {
  program.parse();
}

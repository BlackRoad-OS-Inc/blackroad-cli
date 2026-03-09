import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { getRailwayServices, getServiceBySlug } from '../lib/services.js';

async function deployService(service, detach = false) {
  return new Promise((resolve, reject) => {
    const args = ['up', '--service', service.slug];
    if (detach) args.push('--detach');

    const proc = spawn('railway', args, {
      stdio: detach ? 'pipe' : 'inherit',
      cwd: process.cwd()
    });

    if (detach) {
      let output = '';
      proc.stdout?.on('data', (data) => output += data);
      proc.stderr?.on('data', (data) => output += data);

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`Deploy failed with code ${code}`));
        }
      });
    } else {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          reject(new Error(`Deploy failed with code ${code}`));
        }
      });
    }
  });
}

export async function deployCommand(serviceName, options) {
  const railwayServices = getRailwayServices();

  // Deploy all services
  if (options.all) {
    console.log(chalk.hex('#FF6B00').bold('\n  🚀 Deploying all Railway services... 📦\n'));

    for (const service of railwayServices) {
      const spinner = ora(`📤 Deploying ${service.name}...`).start();
      try {
        await deployService(service, true);
        spinner.succeed(chalk.green(`✅ ${service.name} shipped!`));
      } catch (e) {
        spinner.fail(chalk.red(`💥 ${service.name} failed: ${e.message}`));
      }
    }
    return;
  }

  // Interactive service selection
  if (!serviceName) {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select a service to deploy:',
        choices: railwayServices.map(s => ({
          name: `${s.name} (${s.url})`,
          value: s.slug
        }))
      }
    ]);
    serviceName = selected;
  }

  const service = getServiceBySlug(serviceName);

  if (!service) {
    console.log(chalk.red(`\n  🤷 Service "${serviceName}" not found.\n`));
    console.log(chalk.gray('  📋 Available services:'));
    railwayServices.forEach(s => {
      console.log(chalk.gray(`    🔹 ${s.slug}`));
    });
    return;
  }

  if (!service.railway) {
    console.log(chalk.yellow(`\n  ☁️  "${service.name}" is hosted on Cloudflare Pages, not Railway.`));
    console.log(chalk.gray('  🔄 Cloudflare Pages deploys automatically on git push.\n'));
    return;
  }

  console.log(chalk.hex('#FF6B00').bold(`\n  🚀 Deploying ${service.name}... 🛠️\n`));

  const spinner = options.detach ? ora('📡 Starting deployment...').start() : null;

  try {
    await deployService(service, options.detach);

    if (options.detach) {
      spinner?.succeed(chalk.green('🎯 Deployment started in background'));
      console.log(chalk.gray('\n  👀 Check status with: br status'));
    } else {
      console.log(chalk.green('\n  🎉 Deployment complete! Ship it! 🚢\n'));
    }
  } catch (e) {
    if (options.detach) {
      spinner?.fail(chalk.red('💀 Deployment failed'));
    }
    console.log(chalk.red(`\n  😭 Error: ${e.message}\n`));
  }
}

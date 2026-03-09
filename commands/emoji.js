import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  emoji,
  dictionary,
  phrases,
  exampleSentences,
  parseToEmoji,
  randomSentence,
  timeGreeting,
} from '../lib/emoji.js';

// Translate text to emoji
function translateToEmoji(text) {
  return parseToEmoji(text);
}

// Reverse lookup - emoji to word
function emojiToWord(emojiChar) {
  // Check dictionary first
  for (const [word, e] of Object.entries(dictionary)) {
    if (e === emojiChar) return word;
  }
  // Check main emoji object
  for (const [word, e] of Object.entries(emoji)) {
    if (e === emojiChar) return word;
  }
  return emojiChar;
}

// Interactive mode
async function interactiveMode() {
  console.log(chalk.hex('#FF6B00').bold('\n  🗣️  Emoji Translator - Interactive Mode 💬\n'));
  console.log(chalk.gray('  Type text to translate, or commands:'));
  console.log(chalk.gray('  • "random" - generate random sentence'));
  console.log(chalk.gray('  • "examples" - see example sentences'));
  console.log(chalk.gray('  • "grammar" - learn emoji grammar'));
  console.log(chalk.gray('  • "lookup <emoji>" - find emoji meaning'));
  console.log(chalk.gray('  • "exit" - quit\n'));

  while (true) {
    const { input } = await inquirer.prompt([{
      type: 'input',
      name: 'input',
      message: '📝',
      prefix: '',
    }]);

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      console.log(chalk.hex('#FF6B00')('\n  👋 ' + timeGreeting() + '! Bye!\n'));
      break;
    }

    if (input.toLowerCase() === 'random') {
      console.log(chalk.cyan(`  🎲 ${randomSentence()}\n`));
      continue;
    }

    if (input.toLowerCase() === 'examples') {
      console.log(chalk.hex('#FF6B00').bold('\n  📚 Example Sentences:\n'));
      const examples = Object.entries(exampleSentences).slice(0, 15);
      for (const [key, value] of examples) {
        console.log(chalk.gray(`  ${key}:`) + chalk.cyan(` ${value}`));
      }
      console.log(chalk.gray('\n  ... and many more! Type "examples more" for more.\n'));
      continue;
    }

    if (input.toLowerCase() === 'examples more') {
      console.log(chalk.hex('#FF6B00').bold('\n  📚 More Example Sentences:\n'));
      const examples = Object.entries(exampleSentences).slice(15, 40);
      for (const [key, value] of examples) {
        console.log(chalk.gray(`  ${key}:`) + chalk.cyan(` ${value}`));
      }
      console.log();
      continue;
    }

    if (input.toLowerCase() === 'grammar') {
      console.log(chalk.hex('#FF6B00').bold('\n  📖 Emoji Grammar Rules:\n'));
      console.log(chalk.yellow('  Sentence Structure:'));
      console.log(chalk.gray('    Subject → Verb → Object → Emotion'));
      console.log(chalk.cyan('    👆 ❤️ ☕ 😊 = I love coffee, happy!\n'));

      console.log(chalk.yellow('  Tense Markers:'));
      console.log(chalk.gray('    ⏮️ past | ▶️ present | ⏭️ future | 🔄 continuous'));
      console.log(chalk.cyan('    🚀⏮️ = deployed | 🚀🔄 = deploying | 🚀⏭️ = will deploy\n'));

      console.log(chalk.yellow('  Questions & Negation:'));
      console.log(chalk.gray('    ❓ = question | 🚫 = no/not'));
      console.log(chalk.cyan('    ❓👉☕ = Do you want coffee?'));
      console.log(chalk.cyan('    🚫👆😴 = I\'m not tired\n'));

      console.log(chalk.yellow('  Pronouns:'));
      console.log(chalk.gray('    👆 I | 👉 you | 👩 she | 👨 he | 👥 we\n'));
      continue;
    }

    if (input.toLowerCase().startsWith('lookup ')) {
      const emojiToLookup = input.slice(7).trim();
      const meaning = emojiToWord(emojiToLookup);
      console.log(chalk.cyan(`  ${emojiToLookup} → ${meaning}\n`));
      continue;
    }

    // Default: translate text to emoji
    const translated = translateToEmoji(input);
    console.log(chalk.cyan(`  💬 ${translated}\n`));
  }
}

// Show phrase library
function showPhrases() {
  console.log(chalk.hex('#FF6B00').bold('\n  📚 Emoji Phrase Library 🎭\n'));

  console.log(chalk.yellow('  Status Messages:'));
  Object.entries(phrases).slice(0, 10).forEach(([key, value]) => {
    console.log(chalk.gray(`    ${key}:`) + chalk.cyan(` ${value}`));
  });

  console.log(chalk.yellow('\n  Greetings:'));
  Object.entries(phrases).slice(10, 20).forEach(([key, value]) => {
    console.log(chalk.gray(`    ${key}:`) + chalk.cyan(` ${value}`));
  });

  console.log(chalk.yellow('\n  Reactions:'));
  Object.entries(phrases).slice(20).forEach(([key, value]) => {
    console.log(chalk.gray(`    ${key}:`) + chalk.cyan(` ${value}`));
  });
  console.log();
}

// Dictionary search
function searchDictionary(term) {
  const results = [];
  const searchLower = term.toLowerCase();

  for (const [word, e] of Object.entries(dictionary)) {
    if (word.includes(searchLower)) {
      results.push({ word, emoji: e });
    }
  }

  for (const [word, e] of Object.entries(emoji)) {
    if (word.toLowerCase().includes(searchLower)) {
      results.push({ word, emoji: e });
    }
  }

  return results;
}

export async function emojiCommand(text, options) {
  // Interactive mode
  if (options.interactive || (!text && !options.phrases && !options.search && !options.random)) {
    await interactiveMode();
    return;
  }

  // Show phrases
  if (options.phrases) {
    showPhrases();
    return;
  }

  // Random sentence
  if (options.random) {
    console.log(chalk.hex('#FF6B00').bold('\n  🎲 Random Emoji Sentences:\n'));
    for (let i = 0; i < 5; i++) {
      console.log(chalk.cyan(`  ${randomSentence()}`));
    }
    console.log();
    return;
  }

  // Search dictionary
  if (options.search) {
    const results = searchDictionary(options.search);
    console.log(chalk.hex('#FF6B00').bold(`\n  🔍 Search results for "${options.search}":\n`));

    if (results.length === 0) {
      console.log(chalk.gray('  No results found.\n'));
    } else {
      results.slice(0, 20).forEach(r => {
        console.log(chalk.gray(`    ${r.word}:`) + chalk.cyan(` ${r.emoji}`));
      });
      if (results.length > 20) {
        console.log(chalk.gray(`\n    ... and ${results.length - 20} more results`));
      }
      console.log();
    }
    return;
  }

  // Translate provided text
  if (text) {
    const translated = translateToEmoji(text);
    console.log(chalk.hex('#FF6B00').bold('\n  🗣️  Translation:\n'));
    console.log(chalk.gray(`  Input:  ${text}`));
    console.log(chalk.cyan(`  Output: ${translated}\n`));
  }
}

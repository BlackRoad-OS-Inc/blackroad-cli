import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  dictionary,
  exampleSentences,
} from '../lib/emoji.js';
import { sleep } from '../lib/utils.js';

// Word quiz questions
function generateWordQuiz() {
  const words = Object.entries(dictionary);
  const selected = words[Math.floor(Math.random() * words.length)];
  const [word, correctEmoji] = selected;

  // Get 3 wrong answers
  const otherEmojis = words
    .filter(([w]) => w !== word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(([, e]) => e);

  const choices = [correctEmoji, ...otherEmojis].sort(() => Math.random() - 0.5);

  return {
    question: `What emoji represents "${word}"?`,
    choices,
    correct: correctEmoji,
    type: 'translate',
  };
}

// Decode quiz - guess what emoji means
function generateDecodeQuiz() {
  const words = Object.entries(dictionary);
  const selected = words[Math.floor(Math.random() * words.length)];
  const [correctWord, emojiChar] = selected;

  // Get 3 wrong answers
  const otherWords = words
    .filter(([w]) => w !== correctWord)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(([w]) => w);

  const choices = [correctWord, ...otherWords].sort(() => Math.random() - 0.5);

  return {
    question: `What does ${emojiChar} mean?`,
    choices,
    correct: correctWord,
    type: 'decode',
  };
}

// Sentence completion
function generateCompleteQuiz() {
  const sentences = Object.entries(exampleSentences);
  const selected = sentences[Math.floor(Math.random() * sentences.length)];
  const [key, emojiSentence] = selected;

  // Split sentence and hide one emoji
  const parts = emojiSentence.split(' ');
  if (parts.length < 2) {
    return generateDecodeQuiz(); // Fallback
  }

  const hideIndex = Math.floor(Math.random() * parts.length);
  const hidden = parts[hideIndex];
  parts[hideIndex] = '___';

  // Get wrong options
  const allEmojis = Object.values(dictionary).slice(0, 50);
  const wrongOptions = allEmojis
    .filter(e => e !== hidden)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const choices = [hidden, ...wrongOptions].sort(() => Math.random() - 0.5);

  return {
    question: `Complete: ${parts.join(' ')}`,
    hint: `(Sentence: ${key})`,
    choices,
    correct: hidden,
    type: 'complete',
  };
}

// Grammar quiz
function generateGrammarQuiz() {
  const grammarQuestions = [
    {
      question: 'How do you mark PAST tense in emoji?',
      choices: ['⏮️', '⏭️', '🔄', '✅'],
      correct: '⏮️',
    },
    {
      question: 'How do you mark FUTURE tense in emoji?',
      choices: ['⏮️', '⏭️', '🔄', '✅'],
      correct: '⏭️',
    },
    {
      question: 'Which emoji means "I" (first person)?',
      choices: ['👆', '👉', '👥', '👇'],
      correct: '👆',
    },
    {
      question: 'Which emoji means "you" (second person)?',
      choices: ['👆', '👉', '👥', '👇'],
      correct: '👉',
    },
    {
      question: 'How do you make a question?',
      choices: ['❓ + statement', '🚫 + statement', '❗ + statement', '✅ + statement'],
      correct: '❓ + statement',
    },
    {
      question: 'How do you negate a statement?',
      choices: ['❓ + statement', '🚫 + statement', '❗ + statement', '✅ + statement'],
      correct: '🚫 + statement',
    },
    {
      question: 'Which emoji means "and" (conjunction)?',
      choices: ['➕', '🔀', '↩️', '∴'],
      correct: '➕',
    },
    {
      question: 'Which emoji means "but" (conjunction)?',
      choices: ['➕', '🔀', '↩️', '∴'],
      correct: '↩️',
    },
    {
      question: 'Which shows CONTINUOUS action?',
      choices: ['⏮️', '⏭️', '🔄', '✅'],
      correct: '🔄',
    },
    {
      question: 'What does 👥 represent?',
      choices: ['I', 'You', 'We/They', 'It'],
      correct: 'We/They',
    },
  ];

  return grammarQuestions[Math.floor(Math.random() * grammarQuestions.length)];
}

// Run a quiz round
async function runQuiz(rounds = 5, type = 'mixed') {
  console.log(chalk.hex('#FF6B00').bold('\n  🎮 Emoji Language Quiz! 🧠\n'));
  console.log(chalk.gray(`  ${rounds} questions • Type: ${type}\n`));

  let score = 0;
  let streak = 0;
  let maxStreak = 0;

  for (let i = 0; i < rounds; i++) {
    console.log(chalk.hex('#FF6B00')(`  ─── Round ${i + 1}/${rounds} ───\n`));

    // Generate question based on type
    let question;
    if (type === 'mixed') {
      const types = ['translate', 'decode', 'complete', 'grammar'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      question = generateQuestion(randomType);
    } else {
      question = generateQuestion(type);
    }

    // Display hint if available
    if (question.hint) {
      console.log(chalk.gray(`  ${question.hint}`));
    }

    const { answer } = await inquirer.prompt([{
      type: 'list',
      name: 'answer',
      message: question.question,
      choices: question.choices,
    }]);

    if (answer === question.correct) {
      score++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
      console.log(chalk.green(`\n  ✅ Correct! ${getStreakMessage(streak)}\n`));
    } else {
      streak = 0;
      console.log(chalk.red(`\n  ❌ Wrong! The answer was: ${question.correct}\n`));
    }

    await sleep(500);
  }

  // Final score
  console.log(chalk.hex('#FF6B00').bold('  ═══ Final Score ═══\n'));
  console.log(chalk.cyan(`  🎯 Score: ${score}/${rounds} (${Math.round(score / rounds * 100)}%)`));
  console.log(chalk.cyan(`  🔥 Best Streak: ${maxStreak}`));
  console.log(chalk.cyan(`  ${getScoreMessage(score, rounds)}\n`));
}

function generateQuestion(type) {
  switch (type) {
    case 'translate':
      return generateWordQuiz();
    case 'decode':
      return generateDecodeQuiz();
    case 'complete':
      return generateCompleteQuiz();
    case 'grammar':
      return generateGrammarQuiz();
    default:
      return generateWordQuiz();
  }
}

function getStreakMessage(streak) {
  if (streak >= 5) return '🔥🔥🔥 ON FIRE!';
  if (streak >= 3) return '🔥 Hot streak!';
  if (streak >= 2) return '⚡ Nice!';
  return '💪';
}

function getScoreMessage(score, total) {
  const percent = score / total * 100;
  if (percent === 100) return '🏆 PERFECT! You\'re an Emoji Master! 👑';
  if (percent >= 80) return '🥇 Amazing! You speak fluent Emoji! 🌟';
  if (percent >= 60) return '🥈 Good job! Keep practicing! 💪';
  if (percent >= 40) return '🥉 Not bad! Room for improvement! 📈';
  return '😅 Keep learning! Every expert was once a beginner! 📚';
}

// Flashcard mode
async function flashcardMode(count = 10) {
  console.log(chalk.hex('#FF6B00').bold('\n  📚 Emoji Flashcards 🃏\n'));
  console.log(chalk.gray('  Press Enter to flip, or type "exit" to quit\n'));

  const words = Object.entries(dictionary).sort(() => Math.random() - 0.5).slice(0, count);
  let index = 0;

  while (index < words.length) {
    const [word, emojiChar] = words[index];

    console.log(chalk.cyan(`\n  Card ${index + 1}/${words.length}`));
    console.log(chalk.hex('#FF6B00').bold(`\n    ${emojiChar}\n`));

    const { action } = await inquirer.prompt([{
      type: 'input',
      name: 'action',
      message: 'Press Enter to reveal, or type "exit":',
    }]);

    if (action.toLowerCase() === 'exit') break;

    console.log(chalk.green(`    = ${word}\n`));

    const { next } = await inquirer.prompt([{
      type: 'input',
      name: 'next',
      message: 'Press Enter for next card:',
    }]);

    if (next.toLowerCase() === 'exit') break;
    index++;
  }

  console.log(chalk.hex('#FF6B00')('\n  🎉 Flashcard session complete!\n'));
}

// Sentence builder game
async function sentenceBuilder() {
  console.log(chalk.hex('#FF6B00').bold('\n  🏗️  Emoji Sentence Builder 📝\n'));
  console.log(chalk.gray('  Build sentences using emoji grammar!\n'));

  const subjects = ['👆', '👉', '👩', '👨', '👥'];
  const verbs = ['❤️', '🚀', '💻', '🔧', '🍽️', '😴', '🏃'];
  const objects = ['☕', '🍕', '💻', '🐛', '🎮', '📱'];
  const emotions = ['😊', '😢', '😤', '🤩', '', '💯'];

  while (true) {
    console.log(chalk.yellow('\n  Choose components for your sentence:\n'));

    const { subject } = await inquirer.prompt([{
      type: 'list',
      name: 'subject',
      message: 'Subject (who?):',
      choices: [...subjects, '← Exit'],
    }]);

    if (subject === '← Exit') break;

    const { verb } = await inquirer.prompt([{
      type: 'list',
      name: 'verb',
      message: 'Verb (action):',
      choices: verbs,
    }]);

    const { object } = await inquirer.prompt([{
      type: 'list',
      name: 'object',
      message: 'Object (what?):',
      choices: objects,
    }]);

    const { emotion } = await inquirer.prompt([{
      type: 'list',
      name: 'emotion',
      message: 'Emotion (optional):',
      choices: emotions,
    }]);

    const { tense } = await inquirer.prompt([{
      type: 'list',
      name: 'tense',
      message: 'Tense:',
      choices: [
        { name: 'Present ▶️', value: '' },
        { name: 'Past ⏮️', value: '⏮️' },
        { name: 'Future ⏭️', value: '⏭️' },
        { name: 'Continuous 🔄', value: '🔄' },
      ],
    }]);

    const { modifier } = await inquirer.prompt([{
      type: 'list',
      name: 'modifier',
      message: 'Modifier:',
      choices: [
        { name: 'None', value: '' },
        { name: 'Question ❓', value: '❓' },
        { name: 'Negative 🚫', value: '🚫' },
        { name: 'Exclamation ❗', value: '❗' },
      ],
    }]);

    // Build sentence
    let sentence = `${subject} ${verb}${tense} ${object}`;
    if (emotion) sentence += ` ${emotion}`;
    if (modifier === '❓') sentence = `❓ ${sentence}`;
    if (modifier === '🚫') sentence = `🚫 ${sentence}`;
    if (modifier === '❗') sentence += ' ❗';

    console.log(chalk.green(`\n  📝 Your sentence: ${sentence}\n`));
  }

  console.log(chalk.hex('#FF6B00')('\n  👋 Thanks for building sentences!\n'));
}

export async function quizCommand(options) {
  // Flashcard mode
  if (options.flashcards) {
    await flashcardMode(options.count || 10);
    return;
  }

  // Sentence builder
  if (options.builder) {
    await sentenceBuilder();
    return;
  }

  // Quiz with options
  const rounds = parseInt(options.rounds) || 5;
  const type = options.type || 'mixed';

  await runQuiz(rounds, type);
}

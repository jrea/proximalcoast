import { REST, Routes, SlashCommandBuilder } from 'discord.js';

export const COMMANDS = [
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Jerkstore account using your API key')
    .addStringOption(option =>
      option.setName('key')
        .setDescription('Your Jerkstore API Key')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check your subscription status and roast credits'),
  new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Generate a roast')
    .addStringOption(option =>
      option.setName('target')
        .setDescription('Who or what to roast')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Style of roast (default: spicy)')
        .addChoices(
          { name: 'Mild', value: 'mild' },
          { name: 'Spicy', value: 'spicy' },
          { name: 'Nuclear (Savage Only)', value: 'nuclear' }
        )
    ),
  new SlashCommandBuilder()
    .setName('signup')
    .setDescription('Get a link to create a Jerkstore account'),
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure your preferences')
    .addStringOption(option =>
      option.setName('default_style')
        .setDescription('Set your default roast style')
        .addChoices(
          { name: 'Mild', value: 'mild' },
          { name: 'Spicy', value: 'spicy' },
          { name: 'Nuclear', value: 'nuclear' }
        )
    )
];

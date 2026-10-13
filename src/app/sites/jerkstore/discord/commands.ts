import { SlashCommandBuilder } from 'discord.js';

export const COMMANDS = [
  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Jerkstore account using your API key')
    .addStringOption(option =>
      // The interactions handler reads the option named 'api_key'.
      // This builder previously registered it as 'key', so Discord never
      // delivered the value under the name the handler expects and
      // /link could never succeed.
      option.setName('api_key')
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
  // 'signup' and 'config' were previously registered here but had no
  // handler in the interactions route, so Discord users got a raw 400.
  // They are deregistered until they are implemented; re-registering is
  // a one-command step (pnpm discord:register) once handlers exist.
];

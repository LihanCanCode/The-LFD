require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BACKEND_URL = 'http://localhost:3001';

client.once('ready', () => {
  console.log(`Discord Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === '!status') {
    // TODO: Fetch from BACKEND_URL/devices
    message.reply('Status command received! (Skeleton: Member 3 to implement API fetch)');
  }
  else if (command === '!room') {
    const roomName = args.join(' ');
    if (!roomName) {
      return message.reply('Please provide a room name. Usage: `!room <name>`');
    }
    // TODO: Fetch from BACKEND_URL/devices/:room
    message.reply(`Fetching stats for room: ${roomName} (Skeleton)`);
  }
  else if (command === '!usage') {
    // TODO: Fetch from BACKEND_URL/usage
    message.reply('Usage command received! (Skeleton)');
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in .env file.");
} else {
  client.login(process.env.DISCORD_TOKEN);
}

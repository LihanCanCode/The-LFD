require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const ALERT_CHANNEL_ID = process.env.DISCORD_ALERT_CHANNEL_ID;
const seenAlerts = new Set();

client.once('ready', () => {
  console.log(`🤖 Discord Bot logged in as ${client.user.tag}`);

  // Proactive Alert Poller
  setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/alerts`);
      if (!response.ok) return;
      
      const activeAlerts = await response.json();
      
      activeAlerts.forEach(async (alert) => {
        if (!seenAlerts.has(alert.id)) {
          seenAlerts.add(alert.id);
          console.log(`New alert detected: ${alert.message}`);
          
          if (ALERT_CHANNEL_ID) {
            const channel = await client.channels.fetch(ALERT_CHANNEL_ID).catch(() => null);
            if (channel) {
              const embed = new EmbedBuilder()
                .setColor(alert.type === 'OVERTIME' ? '#f59e0b' : '#ef4444')
                .setTitle(`⚠️ Alert: ${alert.type === 'OVERTIME' ? 'Overtime Usage' : 'After-Hours Usage'}`)
                .setDescription(alert.message)
                .setTimestamp(new Date(alert.timestamp));
              
              channel.send({ embeds: [embed] });
            }
          }
        }
      });
    } catch (error) {
      // Silently ignore network errors during polling
    }
  }, 10000); // Check every 10 seconds
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    if (command === '!status') {
      const response = await fetch(`${BACKEND_URL}/devices`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      
      const devices = await response.json();
      const onDevices = devices.filter(d => d.status === 'on');
      const offDevices = devices.filter(d => d.status === 'off');

      const embed = new EmbedBuilder()
        .setColor(onDevices.length > 0 ? '#34d399' : '#94a3b8')
        .setTitle('🏢 Office Power Status')
        .setDescription(`Hello! Here is the current overall status of the office devices:`)
        .addFields(
          { name: '🟢 Active Devices', value: `${onDevices.length} running`, inline: true },
          { name: '⚫ Inactive Devices', value: `${offDevices.length} turned off`, inline: true },
          { name: '⚡ Total Power Load', value: `${onDevices.reduce((sum, d) => sum + d.watts, 0)}W`, inline: false }
        )
        .setFooter({ text: 'Techathon Rover Summit AI' })
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
    
    else if (command === '!room') {
      const roomName = args.join(' ');
      if (!roomName) {
        return message.reply('Please provide a room name! Example: `!room Drawing Room`');
      }

      // Encode the room name for the URL parameter
      const encodedRoom = encodeURIComponent(roomName.toLowerCase());
      const response = await fetch(`${BACKEND_URL}/devices/${encodedRoom}`);
      
      if (!response.ok) throw new Error('Failed to fetch room');
      
      const devices = await response.json();
      
      if (devices.length === 0) {
        return message.reply(`Hmm, I couldn't find any devices in a room named **${roomName}**. Please check the spelling!`);
      }

      const activeList = devices.filter(d => d.status === 'on').map(d => `• ${d.type.toUpperCase()} (${d.id}) - ${d.watts}W`).join('\n') || 'None';
      const totalWatts = devices.filter(d => d.status === 'on').reduce((sum, d) => sum + d.watts, 0);

      const embed = new EmbedBuilder()
        .setColor('#3b82f6')
        .setTitle(`🚪 Room Report: ${roomName}`)
        .addFields(
          { name: 'Active Devices', value: activeList },
          { name: 'Room Energy Usage', value: `${totalWatts}W currently drawn` }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
    
    else if (command === '!usage') {
      const response = await fetch(`${BACKEND_URL}/usage`);
      if (!response.ok) throw new Error('Failed to fetch usage');
      
      const usageData = await response.json();
      
      const breakdownText = usageData.roomBreakdown
        .map(room => `**${room.room}**: ${room.totalWatts}W (${room.deviceCount} devices)`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#ef4444')
        .setTitle('⚡ Live Usage Report')
        .setDescription(`Current instantaneous energy draw across the entire office.`)
        .addFields(
          { name: 'Total Instant Consumption', value: `**${usageData.totalWatts} Watts**`, inline: true },
          { name: 'Estimated Energy Used', value: `**${(usageData.totalKWh || 0).toFixed(4)} kWh**`, inline: true },
          { name: 'Room Breakdown', value: breakdownText, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Bot API Error:', error);
    message.reply('Oops! I ran into a bit of trouble communicating with the backend server. Please make sure the backend is running!');
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in .env file.");
} else {
  client.login(process.env.DISCORD_TOKEN);
}

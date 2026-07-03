require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const BACKEND_URL = 'http://localhost:4000';
const sentAlerts = new Set();

client.once('ready', () => {
  console.log(`Discord Bot logged in as ${client.user.tag}`);
  
  // Proactive background alerts channel polling (Bonus Feature)
  setInterval(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/alerts`);
      if (!response.ok) return;
      const alerts = await response.json();
      
      for (const alert of alerts) {
        if (!sentAlerts.has(alert.id)) {
          sentAlerts.add(alert.id);
          
          client.guilds.cache.forEach(guild => {
            // Locate a channel named 'alerts' (or fallback to 'general')
            const channel = guild.channels.cache.find(
              ch => (ch.name === 'alerts' || ch.name === 'general') && ch.isTextBased()
            );
            if (channel) {
              channel.send(`⚠️ **Alert System Notification:** ${alert.message}`);
            }
          });
        }
      }
      
      // Clean up cleared alerts from cache
      const activeIds = new Set(alerts.map(a => a.id));
      for (const sentId of sentAlerts) {
        if (!activeIds.has(sentId)) {
          sentAlerts.delete(sentId);
        }
      }
    } catch (err) {
      // Suppress network errors during background check
    }
  }, 8000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    if (command === '!status') {
      const response = await fetch(`${BACKEND_URL}/devices`);
      if (!response.ok) {
        return message.reply("Sorry, I can't reach the backend server right now.");
      }
      const devices = await response.json();
      
      const statusMap = {};
      devices.forEach(d => {
        if (!statusMap[d.room]) {
          statusMap[d.room] = { fansOn: 0, lightsOn: 0, total: 0, onCount: 0 };
        }
        statusMap[d.room].total++;
        if (d.status === 'on') {
          statusMap[d.room].onCount++;
          if (d.type === 'fan') statusMap[d.room].fansOn++;
          else statusMap[d.room].lightsOn++;
        }
      });
      
      let reply = "Here is the current status of all office rooms:\n";
      Object.entries(statusMap).forEach(([room, data]) => {
        if (data.onCount === 0) {
          reply += `• **${room}**: All devices are off. 🟢\n`;
        } else {
          const parts = [];
          if (data.fansOn > 0) parts.push(`${data.fansOn} fan${data.fansOn > 1 ? 's' : ''} ON`);
          if (data.lightsOn > 0) parts.push(`${data.lightsOn} light${data.lightsOn > 1 ? 's' : ''} ON`);
          reply += `• **${room}**: ${parts.join(' and ')} active. ⚠️\n`;
        }
      });
      message.reply(reply);
    }
    
    else if (command === '!room') {
      const roomInput = args.join(' ');
      if (!roomInput) {
        return message.reply('Please provide a room name. Usage: `!room <name>` (e.g., `!room work1`)');
      }
      
      const roomKey = roomInput.toLowerCase().replace(/\s+/g, '');
      let targetRoom = '';
      if (roomKey.includes('drawing')) targetRoom = 'Drawing Room';
      else if (roomKey.includes('work1') || (roomKey.includes('work') && roomKey.includes('1'))) targetRoom = 'Work Room 1';
      else if (roomKey.includes('work2') || (roomKey.includes('work') && roomKey.includes('2'))) targetRoom = 'Work Room 2';

      if (!targetRoom) {
        return message.reply("Hmm, I couldn't find that room. Try `drawing`, `work1`, or `work2`.");
      }

      const response = await fetch(`${BACKEND_URL}/devices`);
      if (!response.ok) {
        return message.reply("Sorry, I can't reach the backend server right now.");
      }
      const devices = await response.json();
      const roomDevices = devices.filter(d => d.room === targetRoom);
      
      const activeDevices = roomDevices.filter(d => d.status === 'on');
      let reply = `Here's what's happening in **${targetRoom}**:\n`;
      if (activeDevices.length === 0) {
        reply += "All devices are currently turned off. Great job conserving energy! 🟢";
      } else {
        reply += `There are **${activeDevices.length}** active devices right now:\n`;
        activeDevices.forEach(d => {
          const typeLabel = d.type === 'fan' ? 'Fan' : 'Light';
          const index = d.id.split('-').pop();
          reply += `- ${typeLabel} ${index} is ON (${d.watts}W)\n`;
        });
      }
      message.reply(reply);
    }
    
    else if (command === '!usage') {
      const response = await fetch(`${BACKEND_URL}/usage`);
      if (!response.ok) {
        return message.reply("Sorry, I can't reach the backend server right now.");
      }
      const usage = await response.json();
      const estKWh = ((usage.totalWatts * 24) / 1000).toFixed(1);
      
      let reply = `🔌 **Live Power Usage Report:**\n`;
      reply += `- **Total Power Draw:** ${usage.totalWatts}W right now.\n`;
      reply += `- **Estimated Today:** ~${estKWh} kWh (assumes current load for 24h).\n\n`;
      reply += `Room breakdown:\n`;
      usage.roomBreakdown.forEach(rb => {
        reply += `• **${rb.room}**: ${rb.totalWatts}W (${rb.deviceCount} devices)\n`;
      });
      message.reply(reply);
    }
  } catch (err) {
    console.error(err);
    message.reply("An error occurred while fetching device data from the backend.");
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in .env file.");
} else {
  client.login(process.env.DISCORD_TOKEN);
}

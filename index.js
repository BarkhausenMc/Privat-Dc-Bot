const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

client.on("guildMemberAdd", (member) => {
  const channel = member.guild.systemChannel;

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("Willkommen!")
    .setDescription(`Hey ${member}, willkommen auf **${member.guild.name}**! 🎉`)
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(0x6d4aff)
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

require("dotenv").config();
client.login(process.env.DISCORD_TOKEN);
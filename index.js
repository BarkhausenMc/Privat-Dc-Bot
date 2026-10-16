require('dotenv').config();
const chalk = require('chalk');

const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonStyle,
  TextDisplayComponent,
  Sweepers
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

async function updateMemberCount(guild) {
  try {
    if (!guild) return;

    const channelId = process.env.MEMBER_COUNT_CHANNEL_ID;
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId);

    if (!channel) return;

    const isVoice =
      channel.type === ChannelType.GuildVoice ||
      channel.type === ChannelType.GuildStageVoice;

    if (!isVoice) return;

    const name = `👥・Members: ${guild.memberCount}`;

    if (channel.name !== name) {
      await channel.setName(name);
    }
  } catch (error) {
    console.error(
      'Fehler beim Aktualisieren des Member Counters:',
      error
    );
  }
}

client.once('clientReady', async () => {
  console.clear();

  const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));

  const phoenix = [
    '██████╗ ██╗  ██╗ ██████╗ ███████╗███╗   ██╗██╗██╗  ██╗',
    '██╔══██╗██║  ██║██╔═══██╗██╔════╝████╗  ██║██║╚██╗██╔╝',
    '██████╔╝███████║██║   ██║█████╗  ██╔██╗ ██║██║ ╚███╔╝ ',
    '██╔═══╝ ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║██║ ██╔██╗ ',
    '██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║██║██╔╝ ██╗',
    '╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝'
  ];

const colors = [
  chalk.hex('#9400D3'), 
  chalk.hex('#8A2BE2'), 
  chalk.hex('#9932CC'), 
  chalk.hex('#BA55D3'), 
  chalk.hex('#8A2BE2'), 
  chalk.hex('#6A0DAD')  
];

  console.log('\n');

  for (let i = 0; i < phoenix.length; i++) {
    console.log(colors[i](phoenix[i]));
    await sleep(100);
  }

  console.log('');
  console.log(chalk.hex('#9932CC')('       🔥 P H O E N I X   B O T 🔥'));
  console.log('');

  const frames = [
    '⠋', '⠙', '⠹', '⠸', '⠼',
    '⠴', '⠦', '⠧', '⠇', '⠏'
  ];

  for (let i = 0; i < 20; i++) {
    process.stdout.write(
      `\r${chalk.hex('#BA55D3')(frames[i % frames.length])} ` +
      chalk.white('Initializing Phoenix systems...')
    );

    await sleep(100);
  }

    console.log(
      '\r' + chalk.hex('#BA55D3')('✔ Phoenix systems initialized!       ')
    );

    console.log(chalk.hex('#4B0082')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.hex('#BA55D3')('  ✔ ') + chalk.white(`Logged in as: ${client.user.tag}`));
    console.log(chalk.hex('#BA55D3')('  ✔ ') + chalk.white('Discord connection established'));
    console.log(chalk.hex('#BA55D3')('  ✔ ') + chalk.white('Member counter initialized'));
    console.log(chalk.hex('#4B0082')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.hex('#9932CC')('          ✨ PHOENIX BOT ONLINE ✨'));

  const guild = client.guilds.cache.first();

  if (guild) {
    await updateMemberCount(guild);
  } else {
    console.log(chalk.yellow('⚠ Kein Discord-Server gefunden.'));
  }

  setInterval(() => {
    if (guild) {
      updateMemberCount(guild);
    }
  }, 60000);
});

client.on('guildMemberAdd', async member => {
  try {
    const roleId = process.env.MEMBER_ROLE_ID;

    if (roleId) {
      await member.roles.add(roleId);
    }
  } catch (error) {
    console.error('Fehler beim Vergeben der Rolle:', error);
  }

  setTimeout(() => {
    updateMemberCount(member.guild);
  }, 2000);
});

client.on('guildMemberRemove', member => {
  setTimeout(() => {
    updateMemberCount(member.guild);
  }, 2000);
});

async function sendVoiceLog(guild, title, details, color = 0x8A2BE2) {
  const logChannelId = process.env.VOICE_LOG_CHANNEL_ID;

  if (!logChannelId) return;

  const logChannel = await guild.channels.fetch(logChannelId);

  if (!logChannel || !logChannel.isTextBased()) return;

  const container = new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 🔮 PHOENIX · VOICE LOGS\n` +
        `**${title}**`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(details)
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '-# PHOENIX VOICE SYSTEM'
      )
    );

  await logChannel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [container]
  });
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    const member = newState.member ?? oldState.member;

    if (!member || member.user.bot) return;

    if (!oldChannel && newChannel) {
      await sendVoiceLog(
        newState.guild,
        '🟢 Voice Channel betreten',
        `👤 **User:** ${member.user.tag}\n` +
        `📥 **Channel:** ${newChannel.name}\n` +
        `🆔 **User-ID:** ${member.id}`,
        0x8A2BE2
      );
    } else if (oldChannel && !newChannel) {
      await sendVoiceLog(
        oldState.guild,
        '🔴 Voice Channel verlassen',
        `👤 **User:** ${member.user.tag}\n` +
        `📤 **Channel:** ${oldChannel.name}\n` +
        `🆔 **User-ID:** ${member.id}`,
        0x4B0082
      );
    } else if (
      oldChannel &&
      newChannel &&
      oldChannel.id !== newChannel.id
    ) {
      await sendVoiceLog(
        newState.guild,
        '🟣 Voice Channel gewechselt',
        `👤 **User:** ${member.user.tag}\n` +
        `📤 **Von:** ${oldChannel.name}\n` +
        `📥 **Zu:** ${newChannel.name}\n` +
        `🆔 **User-ID:** ${member.id}`,
        0x9932CC
      );
    }
  } catch (error) {
    console.error('Fehler beim Voice-Logging:', error);
  }
});
client.login(process.env.DISCORD_BOT_TOKEN);


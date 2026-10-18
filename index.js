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
  ThumbnailBuilder,
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
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const timestamp = new Date().toLocaleString('de-DE', {
  timeZone: 'Europe/Berlin',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
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

async function sendVoiceLog(guild, member, title, details, color) {
  const logChannelId = process.env.VOICE_LOG_CHANNEL_ID;

  if (!logChannelId) return;

  const logChannel = await guild.channels.fetch(logChannelId);

  if (!logChannel || !logChannel.isTextBased()) return;

  const voiceContainer = new ContainerBuilder()
  .setAccentColor(color)
  .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## ${title}`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
    )
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(details)
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder({
            media: {
              url: member.user.displayAvatarURL({
                size: 256,
                extension: 'png'
              })
            }
          })
        )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '-# PHOENIX VOICE LOG SYSTEM'
      )
    );

  await logChannel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [voiceContainer]
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
        member,
        `🟢 Voice Channel betreten von: ${member.user.tag}`,
        `> 👤 **User:** ${member.user.tag}\n` +
        `> 📥 **Channel:** ${newChannel.name}\n` +
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 🕒 **Zeitpunkt:** ${timestamp}`, 
        0x2ECC71
      );
    } else if (oldChannel && !newChannel) {
      await sendVoiceLog(
        oldState.guild,
        member,
        `🔴 Voice Channel verlassen von: ${member.user.tag}`,
        `> 👤 **User:** ${member.user.tag}\n` +
        `> 📤 **Channel:** ${oldChannel.name}\n` +
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 🕒 **Zeitpunkt:** ${timestamp}`, 
        0xE74C3C
      );
    } else if (
      oldChannel &&
      newChannel &&
      oldChannel.id !== newChannel.id
    ) {
      await sendVoiceLog(
        newState.guild,
        member,
        `🟡 Voice Channel gewechselt von: ${member.user.tag}`,
        `> 👤 **User:** ${member.user.tag}\n` +
        `> 📤 **Von:** ${oldChannel.name}\n` +
        `> 📥 **Zu:** ${newChannel.name}\n` +
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 🕒 **Zeitpunkt:** ${timestamp}`, 
        0xF1C40F
      );
    }
  } catch (error) {
    console.error('Fehler beim Voice-Logging:', error);
  }
});

// Rollenmenü erstellen
const settingsContainer = new ContainerBuilder()
  .addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      'Drücke den Button für die Rolle'
    )
  )
  .addSeparatorComponents(
    new SeparatorBuilder()
      .setDivider(true)
      .setSpacing(1)
  )
  .addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rolle1')
        .setLabel('rolle1')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('rolle2')
        .setLabel('rolle2')
        .setStyle(ButtonStyle.Secondary)
    )
  );

client.on('interactionCreate', async (interaction) => {

  // Slash-Command: /setup
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== 'settings') return;

    const settingsChannel = await interaction.guild.channels.fetch(
      process.env.SETTINGS_CHANNEL_ID
    );

    if (!settingsChannel) {
      return interaction.reply({
        content: 'Channel nicht gefunden!',
        flags: MessageFlags.Ephemeral
      });
    }

    await settingsChannel.send({
      components: [settingsContainer],
      flags: MessageFlags.IsComponentsV2
    });

    return interaction.reply({
      content: 'Das Rollenmenü wurde gesendet!',
      flags: MessageFlags.Ephemeral
    });
  }

  // Button: rolle1
  if (interaction.isButton()) {
    if (interaction.customId !== 'rolle1') return;

    const role1 = process.env.ROLE_1_ID

    if (!role1) {
      return interaction.reply({
        content: 'Die Rolle wurde nicht gefunden!',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await interaction.member.roles.add(role1);

      const addedRoleContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            'Du hast die Rolle 1 bekommen!'
          )
        );

      return interaction.reply({
        components: [addedRoleContainer],
        flags:
          MessageFlags.IsComponentsV2 |
          MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Fehler beim Vergeben der Rolle:', error);

      return interaction.reply({
        content:
          'Die Rolle konnte nicht vergeben werden. Prüfe meine Berechtigungen!',
        flags: MessageFlags.Ephemeral
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);


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

const settingsContainer = new ContainerBuilder()
  .addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      [
        '## 🎭 Rollenverwaltung',
        'Wähle aus, über welche Themen du informiert werden möchtest.',
        '',
        '📢 **Ankündigungen** – Erfahre von wichtigen Neuigkeiten.',
        '📝 **Changelogs** – Bleibe über Updates auf dem Laufenden.',
        '🤝 **Partner** – Erhalte Informationen zu unseren Partnern.',
        '',
        '> Klicke auf einen Button, um die jeweilige Rolle zu erhalten.'
      ].join('\n')
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
        .setCustomId('ankündigung')
        .setLabel('Ankündigungen')
        .setEmoji('📢')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('changelogs')
        .setLabel('Changelogs')
        .setEmoji('📝')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('partner')
        .setLabel('Partner')
        .setEmoji('🤝')
        .setStyle(ButtonStyle.Secondary)
    )
  );


const roleButtons = {
  ankündigung: {
    roleId: process.env.ANNOUNCEMENT_ROLE_ID,
    name: 'Ankündigungen'
  },
  changelogs: {
    roleId: process.env.CHANGELOGS_ROLE_ID,
    name: 'Changelogs'
  },
  partner: {
    roleId: process.env.PARTNER_ROLE_ID,
    name: 'Partner'
  }
};

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const config = roleButtons[interaction.customId];
  if (!config) return;

  const { roleId, name } = config;

  if (!roleId || !/^\d{17,20}$/.test(roleId)) {
    console.error(
      `Ungültige Rollen-ID für ${name}:`,
      roleId
    );

    return interaction.reply({
      content: 'Diese Rolle ist momentan nicht richtig konfiguriert.',
      flags: MessageFlags.Ephemeral
    });
  }

  try {
    const member = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const role = await interaction.guild.roles.fetch(roleId);

    if (!role) {
      return interaction.reply({
        content: `Die Rolle **${name}** wurde auf dem Server nicht gefunden.`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role);

    await sendRoleLog({
      guild: interaction.guild,
      user: interaction.user,
      role,
      action: 'removed'
    });

      return interaction.reply({
        content: `➖ Die Rolle **${name}** wurde entfernt.`,
        flags: MessageFlags.Ephemeral
      });
    }

    await member.roles.add(role);

    await sendRoleLog({
      guild: interaction.guild,
      user: interaction.user,
      role,
      action: 'added'
    });
    
    return interaction.reply({
      content: `✅ Du hast die Rolle **${name}** erhalten!`,
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    console.error(`Fehler bei der Rolle ${name}:`, error);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: 'Beim Ändern deiner Rolle ist ein Fehler aufgetreten.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
});

async function sendRoleLog({ guild, user, role, action }) {
  const logChannelId = process.env.SERVER_LOG_CHANNEL_ID;

  if (!logChannelId) {
    console.error('SERVER_LOG_CHANNEL_ID fehlt in der .env!');
    return;
  }

  try {
    const logChannel = await guild.channels.fetch(logChannelId);

    if (!logChannel || !logChannel.isTextBased()) {
      console.error('Der Log-Channel wurde nicht gefunden.');
      return;
    }

    const added = action === 'added';

    const logContainer = new ContainerBuilder()
      .setAccentColor(added ? 0x57F287 : 0xED4245)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `## ${added ? '🟢 Rolle hinzugefügt' : '🔴 Rolle entfernt'}`,
            '',
            `**Mitglied:** ${user} (\`${user.id}\`)`,
            `**Rolle:** ${role} (\`${role.id}\`)`,
            `**Aktion:** ${added ? 'Hinzugefügt' : 'Entfernt'}`,
            `**Zeitpunkt:** <t:${Math.floor(Date.now() / 1000)}:F>`
          ].join('\n')
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(1)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Rollenprotokoll • ${guild.name}`
        )
      );

    await logChannel.send({
      components: [logContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
  } catch (error) {
    console.error('Fehler beim Senden des Rollen-Logs:', error);
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);



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

const MODERATOR_ROLE_ID = process.env.MODERATOR_ROLE_ID;
const SERVER_LOG_CHANNEL_ID = process.env.SERVER_LOG_CHANNEL_ID;

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

const ACTIONS = {
    timeout: {
        button: 'mod_timeout',
        modal: 'mod_modal_timeout',
        label: 'Timeout',
        color: 0x5865F2,
    },
    kick: {
        button: 'mod_kick',
        modal: 'mod_modal_kick',
        label: 'Kick',
        color: 0xF39C12,
    },
    ban: {
        button: 'mod_ban',
        modal: 'mod_modal_ban',
        label: 'Ban',
        color: 0xED4245,
    },
};

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
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 📥 **Channel:** ${newChannel.name}\n` +
        `> 🕒 **Zeitpunkt:** ${timestamp}`,
        0x2ECC71
      );
    } else if (oldChannel && !newChannel) {
      await sendVoiceLog(
        oldState.guild,
        member,
        `🔴 Voice Channel verlassen von: ${member.user.tag}`,
        `> 👤 **User:** ${member.user.tag}\n` +
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 📤 **Channel:** ${oldChannel.name}\n` +
        `> 🕒 **Zeitpunkt:** ${timestamp}`,
        0xED4245
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
        `> 🆔 **User-ID:** ${member.id}\n` +
        `> 📤 **Von:** ${oldChannel.name}\n` +
        `> 📥 **Zu:** ${newChannel.name}\n` +
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
        '## ⚙️・Rollenmenü\n' +
        'Hier kannst du dir Rollen selbst geben und wieder nehmen – ganz einfach per Klick.'
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
      '### 🎭 Rollenverwaltung\n' +
      '📢 **Ankündigungen** – Erfahre von wichtigen Neuigkeiten.\n' +
      '📝 **Changelogs** – Bleibe über Updates auf dem Laufenden.\n' +
      '🤝 **Partner** – Erhalte Informationen zu unseren Partnern.\n' +
      '> Klicke auf einen Button, um die jeweilige Rolle zu erhalten.'
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
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('meine-rollen')
        .setLabel('Meine Rollen')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success)
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

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName !== 'settings') return;

      if (!interaction.channel || !interaction.channel.isTextBased()) {
        return interaction.reply({
          content: 'Dieser Channel unterstützt keine Nachrichten.',
          flags: MessageFlags.Ephemeral
        });
      }

      await interaction.channel.send({
        components: [settingsContainer],
        flags: MessageFlags.IsComponentsV2
      });

      return interaction.reply({
        content: '✅ Das Rollenmenü wurde gesendet.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === 'meine-rollen') {
      const member = await interaction.guild.members.fetch(
        interaction.user.id
      );

      const rollen = member.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => `- ${role.toString()}`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎭 Deine Rollen\nHier siehst du alle Rollen auf **${interaction.guild.name}**.`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(1)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            rollen.length
              ? rollen.join('\n')
              : 'Du hast keine zusätzlichen Rollen.'
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(1)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Insgesamt **${rollen.length}** Rollen`
          )
        );

      return await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        allowedMentions: { parse: [] }
      });
    }

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

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral
    });

    const member = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const role = await interaction.guild.roles.fetch(roleId);

    if (!role) {
      return interaction.editReply({
        content: `Die Rolle **${name}** wurde auf dem Server nicht gefunden.`
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

      return interaction.editReply({
        content: `➖ Die Rolle **${name}** wurde entfernt.`
      });
    }

    await member.roles.add(role);

    await sendRoleLog({
      guild: interaction.guild,
      user: interaction.user,
      role,
      action: 'added'
    });

    return interaction.editReply({
      content: `✅ Du hast die Rolle **${name}** erhalten!`
    });
  } catch (error) {
    console.error('Fehler bei der Interaktion:', error);

    if (interaction.deferred) {
      await interaction.editReply({
        content: 'Beim Verarbeiten deiner Anfrage ist ein Fehler aufgetreten.'
      }).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({
        content: 'Beim Verarbeiten deiner Anfrage ist ein Fehler aufgetreten.',
        flags: MessageFlags.Ephemeral
      }).catch(() => {});
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
    const timestamp = Math.floor(Date.now() / 1000);

    const logContainer = new ContainerBuilder()
      .setAccentColor(added ? 0x57F287 : 0xED4245)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${added ? '🟢 Rolle hinzugefügt' : '🔴 Rolle entfernt'}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(1)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `> 👤 **User:** ${user.tag ?? user.username}`,
            `> 🆔 **User-ID:** ${user.id}`,
            `> 🎭 **Rolle:** ${role.name}`,
            `> 🆔 **Role-ID:** ${role.id}`,
            `> ▶️ **Aktion:** ${added ? '📥 Hinzugefügt' : '📤 Entfernt'}`,
            `> 🕒 **Zeitpunkt:** <t:${timestamp}:F>`
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
          '-# PHOENIX ROLE LOG SYSTEM'
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

// ─────────────────────────────
// 1. Moderationspanel erstellen
// ─────────────────────────────


if (
    interaction.isChatInputCommand() &&
    interaction.commandName === 'admin-settings'
) {
    if (!interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator
    )) {
        return interaction.reply({
            content: '❌ Du benötigst Administratorrechte.',
            flags: MessageFlags.Ephemeral,
        });
    }

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('mod_timeout')
            .setLabel('Timeout')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('mod_kick')
            .setLabel('Kick')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('mod_ban')
            .setLabel('Ban')
            .setStyle(ButtonStyle.Danger),
    );

    const panel = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                '# Moderationspanel\n' +
                'Wähle eine Moderationsaktion:\n\n' +
                '🕒 **Timeout** – Mitglied temporär stummschalten\n' +
                '👢 **Kick** – Mitglied vom Server entfernen\n' +
                '🔨 **Ban** – Mitglied vom Server bannen'
            )
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addActionRowComponents(buttons);

    await interaction.channel.send({
        components: [panel],
        flags: MessageFlags.IsComponentsV2,
    });

    return interaction.reply({
        content: '✅ Das Moderationspanel wurde gesendet.',
        flags: MessageFlags.Ephemeral,
    });
}

// ─────────────────────────────
// 2. Berechtigungen prüfen
// ─────────────────────────────

async function getModerator(interaction) {
    if (!interaction.guild) {
        throw new Error('Diese Aktion ist nur auf einem Server möglich.');
    }

    if (!MODERATOR_ROLE_ID) {
        throw new Error('MODERATOR_ROLE_ID fehlt in der .env.');
    }

    if (!SERVER_LOG_CHANNEL_ID) {
        throw new Error('SERVER_LOG_CHANNEL_ID fehlt in der .env.');
    }

    const guild = interaction.guild;
    const moderator = await guild.members.fetch(interaction.user.id);
    const botMember = await guild.members.fetchMe();

    if (!moderator.roles.cache.has(MODERATOR_ROLE_ID)) {
        throw new Error('Du benötigst die Moderator-Rolle.');
    }

    if (!botMember.permissions.has('ModerateMembers')) {
        throw new Error('Mir fehlt die Berechtigung „Mitglieder moderieren“.');
    }

    return { guild, moderator, botMember };
}

async function getTarget(interaction, userId, action) {
    if (!/^\d{17,20}$/.test(userId)) {
        throw new Error('Die Discord-User-ID ist ungültig.');
    }

    let target;

    try {
        target = await interaction.guild.members.fetch(userId);
    } catch {
        throw new Error('Das Mitglied wurde auf diesem Server nicht gefunden.');
    }

    if (target.id === interaction.user.id) {
        throw new Error('Du kannst diese Aktion nicht auf dich selbst anwenden.');
    }

    if (target.id === interaction.client.user.id) {
        throw new Error('Diese Aktion kann nicht auf den Bot angewendet werden.');
    }

    if (target.id === interaction.guild.ownerId) {
        throw new Error('Der Serverinhaber kann nicht moderiert werden.');
    }

    const { moderator, botMember } = await getModerator(interaction);

    if (
        target.roles.highest.comparePositionTo(
            moderator.roles.highest
        ) >= 0
    ) {
        throw new Error(
            'Deine höchste Rolle muss über der höchsten Rolle des Ziels liegen.'
        );
    }

    if (
        target.roles.highest.comparePositionTo(
            botMember.roles.highest
        ) >= 0
    ) {
        throw new Error(
            'Die höchste Rolle des Bots muss über der höchsten Rolle des Ziels liegen.'
        );
    }

    if (action === 'timeout' && target.user.bot) {
        throw new Error('Bots können nicht mit diesem Timeout-Tool timeoutet werden.');
    }

    return target;
}

// ─────────────────────────────
// 3. Modal erstellen
// ─────────────────────────────

function createInput(id, label, options = {}) {
    const input = new TextInputBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(options.paragraph
            ? TextInputStyle.Paragraph
            : TextInputStyle.Short)
        .setRequired(options.required ?? true);

    if (options.placeholder) {
        input.setPlaceholder(options.placeholder);
    }

    if (options.maxLength) {
        input.setMaxLength(options.maxLength);
    }

    if (options.minLength) {
        input.setMinLength(options.minLength);
    }

    return new ActionRowBuilder().addComponents(input);
}

function createModal(action) {
    const config = ACTIONS[action];

    const modal = new ModalBuilder()
        .setCustomId(config.modal)
        .setTitle(`${config.label} – Mitglied`);

    modal.addComponents(
        createInput(
            'target_id',
            'Discord User-ID',
            {
                placeholder: '123456789012345678',
                minLength: 17,
                maxLength: 20,
            }
        ),
    );

    if (action === 'timeout') {
        modal.addComponents(
            createInput(
                'duration',
                'Timeout-Dauer (z. B. 10m, 1h, 7d)',
                { placeholder: '1h', maxLength: 10 }
            ),
        );
    }

    modal.addComponents(
        createInput(
            'reason',
            'Grund (optional)',
            {
                required: false,
                paragraph: true,
                placeholder: 'Regelverstoß ...',
                maxLength: 500,
            }
        ),
    );

    return modal;
}

// ─────────────────────────────
// 4. Timeout-Dauer auswerten
// ─────────────────────────────

function parseDuration(input) {
    const match = input.trim().match(/^(\d+)\s*(m|h|d)$/i);

    if (!match) {
        throw new Error('Ungültige Dauer. Beispiele: 10m, 1h, 7d.');
    }

    const amount = Number(match[1]);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throw new Error('Die Timeout-Dauer muss größer als 0 sein.');
    }

    const multipliers = {
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    const duration = amount * multipliers[match[2].toLowerCase()];

    if (duration > MAX_TIMEOUT) {
        throw new Error('Die maximale Timeout-Dauer beträgt 28 Tage.');
    }

    return duration;
}

// ─────────────────────────────
// 5. Components-V2-Log senden
// ─────────────────────────────

async function sendModerationLog({
    guild,
    moderator,
    targetUser,
    action,
    reason,
    durationText,
}) {
    const channel = await guild.channels.fetch(SERVER_LOG_CHANNEL_ID);

    if (!channel || !channel.isTextBased() || !channel.send) {
        throw new Error('Der Log-Channel wurde nicht gefunden oder ist ungültig.');
    }

    const config = ACTIONS[action];

    const details = [
        `## ${config.label} durchgeführt`,
        '',
        `**Mitglied:** ${targetUser.tag}`,
        `**User-ID:** \`${targetUser.id}\``,
        `**Moderator:** ${moderator.user.tag}`,
        `**Moderator-ID:** \`${moderator.id}\``,
        ...(durationText ? [`**Dauer:** ${durationText}`] : []),
        `**Grund:** ${reason || 'Kein Grund angegeben'}`,
        `**Zeitpunkt:** <t:${Math.floor(Date.now() / 1000)}:F>`,
    ].join('\n');

    const container = new ContainerBuilder()
        .setAccentColor(config.color)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(details),
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `*Moderationsprotokoll • ${guild.name}*`
            ),
        );

    await channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
    });
}

// ─────────────────────────────
// 6. Interaktionen verarbeiten
// ─────────────────────────────

async function handleModerationInteraction(interaction) {
    // Buttons
    if (interaction.isButton()) {
        const action = Object.keys(ACTIONS).find(
            key => ACTIONS[key].button === interaction.customId
        );

        if (!action) return;

        try {
            await getModerator(interaction);
            await interaction.showModal(createModal(action));
        } catch (error) {
            const message = `❌ ${error.message || 'Ein Fehler ist aufgetreten.'}`;

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: message,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: message,
                    ephemeral: true,
                });
            }
        }

        return;
    }

    // Modal-Absendung
    if (!interaction.isModalSubmit()) return;

    const action = Object.keys(ACTIONS).find(
        key => ACTIONS[key].modal === interaction.customId
    );

    if (!action) return;

    await interaction.deferReply({ ephemeral: true });

    let actionCompleted = false;

    try {
        const { guild, moderator } = await getModerator(interaction);

        const userId = interaction.fields
            .getTextInputValue('target_id')
            .trim();

        const reason = interaction.fields
            .getTextInputValue('reason')
            .trim();

        const target = await getTarget(interaction, userId, action);

        const auditReason = reason
            ? `${reason} | Moderator: ${interaction.user.tag}`
            : `Moderation durch ${interaction.user.tag}`;

        let durationText;

        // Timeout
        if (action === 'timeout') {
            if (!target.moderatable) {
                throw new Error('Dieses Mitglied kann ich nicht timeouten.');
            }

            const durationInput = interaction.fields
                .getTextInputValue('duration')
                .trim();

            const duration = parseDuration(durationInput);
            durationText = durationInput.toLowerCase();

            await target.timeout(duration, auditReason);
        }

        // Kick
        if (action === 'kick') {
            if (!target.kickable) {
                throw new Error('Dieses Mitglied kann ich nicht kicken.');
            }

            await target.kick(auditReason);
        }

        // Ban
        if (action === 'ban') {
            if (!target.bannable) {
                throw new Error('Dieses Mitglied kann ich nicht bannen.');
            }

            await target.ban({
                reason: auditReason,
            });
        }

        actionCompleted = true;

        await interaction.editReply({
            content:
                `✅ **${ACTIONS[action].label} erfolgreich!**\n` +
                `Mitglied: ${target.user.tag} (\`${target.id}\`)` +
                (durationText ? `\nDauer: ${durationText}` : '') +
                `\nGrund: ${reason || 'Kein Grund angegeben'}`,
        });

        try {
            await sendModerationLog({
                guild,
                moderator,
                targetUser: target.user,
                action,
                reason,
                durationText,
            });
        } catch (logError) {
            console.error('Moderationsaktion erfolgreich, Log fehlgeschlagen:', logError);

            await interaction.followUp({
                content:
                    '⚠️ Die Aktion war erfolgreich, aber das Log konnte nicht gesendet werden. Bitte prüfe den Log-Channel und meine Berechtigungen.',
                ephemeral: true,
            });
        }

    } catch (error) {
        console.error('Moderationsfehler:', error);

        await interaction.editReply({
            content: `❌ ${error.message || 'Die Moderationsaktion ist fehlgeschlagen.'}`,
        });
    }
}

client.login(process.env.DISCORD_BOT_TOKEN);

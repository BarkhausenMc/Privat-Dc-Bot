const {
  Client,
  GatewayIntentBits,
  Partials,
  SlashCommandBuilder,
  REST,
  Routes,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

const configFile = "./config.json";

function loadConfig() {
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(configFile, "utf8"));
}

function saveConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

// --- Neue Funktion: Rollmenü erstellen ---
async function createRoleMenu(interaction, input) {
  const entries = input.split(",").map(e => e.trim());
  const roleMap = {};
  const lines = [];
  const emojis = [];

  for (const entry of entries) {
    const [emoji, roleId] = entry.split(":").map(s => s.trim());
    if (!emoji || !roleId) continue;

    const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
    const roleName = role ? role.name : "❌ Unbekannte Rolle";
    
    roleMap[emoji] = roleId;
    lines.push(`${emoji} — **${roleName}**`);
    emojis.push(emoji);
  }

  if (lines.length === 0) {
    await interaction.reply({
      content: "⚠️ Keine gültigen Rollen gefunden. Format: `emoji:rolle_id` (durch Komma trennen)",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Nachricht erstellen
  const container = new ContainerBuilder()
    .setAccentColor(0x6d4aff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "## 🎮 Rolle auswählen\nReagiere mit einem Emoji, um eine Rolle zu erhalten oder zu entfernen."
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(lines.join("\n"))
    );

  const msg = await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  // Konfiguration speichern
  const config = loadConfig();
  config.roleMenus = config.roleMenus || {};
  config.roleMenus[msg.id] = roleMap;
  saveConfig(config);

  // Emojis hinzufügen
  for (const emoji of emojis) {
    await msg.react(emoji).catch(console.error);
  }

  await interaction.followUp({
    content: `✅ Role-Menu erstellt! ${emojis.length} Rollen hinzugefügt.`,
    flags: MessageFlags.Ephemeral,
  });
}

// --- Commands definieren ---
const commands = [
  new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Legt den Willkommens-Channel fest")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Der Channel für Willkommens-Nachrichten")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("setcounter")
    .setDescription("Legt den Voice-Channel für den Member-Counter fest")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Der Voice-Channel für den Member-Counter")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("rolemenu")
    .setDescription("Erstellt ein Role-Menu mit Reactions")
    .addStringOption((option) =>
      option
        .setName("rollen")
        .setDescription("Format: emoji:rolle_id (durch Komma trennen)")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

// --- Commands registrieren ---
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Slash Commands für deinen Server registriert!");
  } catch (error) {
    console.error(error);
  }
})();

// --- Event: Bot bereit ---
client.once("clientReady", () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

// --- Event: Interaction ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "setwelcome") {
    const channel = interaction.options.getChannel("channel");
    const config = loadConfig();
    config.welcomeChannelId = channel.id;
    saveConfig(config);

    const container = new ContainerBuilder()
      .setAccentColor(0x6d4aff)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## Willkommens-Channel gesetzt\n\nAb jetzt werden Willkommens-Nachrichten in ${channel} gesendet.`
        )
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  if (interaction.commandName === "setcounter") {
    const channel = interaction.options.getChannel("channel");
    const config = loadConfig();
    config.counterChannelId = channel.id;
    saveConfig(config);

    const container = new ContainerBuilder()
      .setAccentColor(0x6d4aff)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## Counter-Channel gesetzt\n\nDer Member-Counter ist jetzt in ${channel} aktiv.`
        )
      );

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }

  if (interaction.commandName === "rolemenu") {
    const input = interaction.options.getString("rollen");
    await createRoleMenu(interaction, input);
  }
});

// --- Event: Reaktion hinzufügen ---
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  const config = loadConfig();
  const roleMap = config.roleMenus?.[reaction.message.id];
  if (!roleMap) return;

  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  await member.roles.add(roleId).catch(console.error);
});

// --- Event: Reaktion entfernen ---
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch {
      return;
    }
  }

  const config = loadConfig();
  const roleMap = config.roleMenus?.[reaction.message.id];
  if (!roleMap) return;

  const roleId = roleMap[reaction.emoji.name];
  if (!roleId) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  if (!member) return;

  await member.roles.remove(roleId).catch(console.error);
});

// --- Event: Mitglied kommt ---
client.on("guildMemberAdd", async (member) => {
  const config = loadConfig();
  const channelId = config.welcomeChannelId;
  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const container = new ContainerBuilder()
    .setAccentColor(0x6d4aff)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 👋 Willkommen auf **${member.guild.name}**, ${member}!`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Mitglied seit: <t:${Math.floor(Date.now() / 1000)}:R>`
      )
    );

  await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
});

// --- Event: Mitglied geht ---
client.on("guildMemberRemove", (member) => {
  // Optional: Counter aktualisieren, falls du das noch brauchst
});

client.login(process.env.DISCORD_TOKEN);
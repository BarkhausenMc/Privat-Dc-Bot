const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
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
].map((command) => command.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("Slash Commands registriert!");
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

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
      )
    await interaction.reply({
    components: [container],
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  }
});

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
        `👋 Willkommen auf dem **${member.guild.name}** Dc,${member}!`
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

client.login(process.env.DISCORD_TOKEN);
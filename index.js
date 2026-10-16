import 'dotenv/config';

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
    GatewayIntentBits.GuildMembers
  ]
});

async function updateMemberCount(guild) {
  try {
    if (!guild) return;

    const channel = await guild.channels.fetch(
      process.env.MEMBER_COUNT_CHANNEL_ID
    );

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
    console.error('Fehler beim Aktualisieren des Member Counters:', error);
  }
}

const chalk = (await import('chalk')).default;

client.once('clientReady', async () => {
  console.clear();

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const phoenix = [
    '██████╗ ██╗  ██╗ ██████╗ ███████╗███╗   ██╗██╗██╗  ██╗',
    '██╔══██╗██║  ██║██╔═══██╗██╔════╝████╗  ██║██║╚██╗██╔╝',
    '██████╔╝███████║██║   ██║█████╗  ██╔██╗ ██║██║ ╚███╔╝ ',
    '██╔═══╝ ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║██║ ██╔██╗ ',
    '██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║██║██╔╝ ██╗',
    '╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝'
  ];

  const colors = [
    chalk.hex('#ff4500'),
    chalk.hex('#ff6600'),
    chalk.hex('#ff8c00'),
    chalk.hex('#ffaa00'),
    chalk.hex('#ff6600'),
    chalk.hex('#ff4500')
  ];

  console.log('\n');

  for (let i = 0; i < phoenix.length; i++) {
    console.log(colors[i](phoenix[i]));
    await sleep(100);
  }

  console.log('');
  console.log(chalk.hex('#ff6600')('       🔥 P H O E N I X   B O T 🔥'));
  console.log('');

  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  for (let i = 0; i < 20; i++) {
    process.stdout.write(
      `\r${chalk.hex('#ff8c00')(frames[i % frames.length])} ${chalk.white('Initializing Phoenix systems...')}`
    );
    await sleep(100);
  }

  console.log('\r' + chalk.green('✔ Phoenix systems initialized!       '));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.green('  ✔ ') + chalk.white(`Logged in as: ${client.user.tag}`));
  console.log(chalk.green('  ✔ ') + chalk.white('Discord connection established'));
  console.log(chalk.green('  ✔ ') + chalk.white('Member counter initialized'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.hex('#ff6600')('          🚀 PHOENIX BOT ONLINE 🚀'));
  console.log('\n');

  const guild = client.guilds.cache.first();

  if (guild) {
    await updateMemberCount(guild);
  }

  setInterval(() => {
    if (guild) {
      updateMemberCount(guild);
    }
  }, 60000);
});

client.on('guildMemberAdd', async (member) => {

  try {
    await member.roles.add(process.env.MEMBER_ROLE_ID);
  } catch (error) {
    console.error('Fehler beim Vergeben der Rolle:', error);
  }

  setTimeout(() => {
    updateMemberCount(member.guild);
  }, 2000);
});

client.on('guildMemberRemove', async (member) => {
  setTimeout(() => {
    updateMemberCount(member.guild);
  }, 2000);
});

client.login(process.env.DISCORD_BOT_TOKEN);
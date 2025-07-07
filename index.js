require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
} = require('discord.js');
const { spawnBots, stopBots } = require('./handlers/botmanager');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ALLOWED_ROLE_ID = '1391711806778773514';
const ALLOWED_SERVER_NAME = 'anarchy.vn';

let isRunning = false;

// Slash commands with 'server' option restricted to choice 'anarchy.vn'
const commands = [
  {
    name: 'joinbot',
    description: 'Spawn bots to join a Minecraft server',
    options: [
      {
        name: 'server',
        type: 3, // STRING
        description: 'chọn server để bot join',
        required: true,
        choices: [
          { name: 'anarchy.vn', value: 'anarchy.vn:25565' },
        ],
      },
      {
        name: 'amount',
        type: 4, // INTEGER
        description: 'Amount of bots to spawn',
        required: true,
                choices: [
          { name: '10', value: '10' },
          { name: '50', value: '50' },
          { name: '70', value: '70' },
        ],
      },
      {
        name: 'time',
        type: 4, // INTEGER
        description: 'Duration in seconds',
        required: true,
      },
    ],
  },
  {
    name: 'stop',
    description: 'Stop all running bots',
  },
];

// Replace with your bot token and guild IDs
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = '752110575332491324'; // Your bot's application ID
const GUILD_ID = '929320567146938379';  // Your anarchy.vn server's guild ID

const rest = new REST({ version: '10' }).setToken("NzUyMTEwNTc1MzMyNDkxMzI0.GMyiPK.srjKyrhAM8S-cB3ru3KDRuzbWirNSt7kbdzhgI");

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  // Check if user has the required role
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
    return interaction.reply({
      content: 'Bạn không có quyền sử dụng lệnh này.',
      ephemeral: true,
    });
  }

  if (interaction.commandName === 'joinbot') {
    if (isRunning) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⚠️ Bot đã chạy')
        .setDescription('Vui lòng sử dụng lệnh `/stop` để dừng bot trước khi chạy lệnh mới.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const server = interaction.options.getString('server'); // guaranteed to be a choice now
    const amount = interaction.options.getInteger('amount');
    const time = interaction.options.getInteger('time');

    if (amount < 1 || time < 1) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('❌ Số lượng hoặc thời gian không hợp lệ')
        .setDescription('Vui lòng nhập số lượng và thời gian hợp lệ.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    isRunning = true;

    const startEmbed = new EmbedBuilder()
      .setColor('Green')
      .setTitle('🤖 Bots Đang Khởi Động')
      .addFields(
        { name: 'Server', value: `\`${server}\``, inline: true },
        { name: 'Số lượng bot', value: `${amount}`, inline: true },
        { name: 'Thời gian (giây)', value: `${time}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [startEmbed] });

    spawnBots(server, amount);

    setTimeout(() => {
      stopBots();
      isRunning = false;

      const endEmbed = new EmbedBuilder()
        .setColor('DarkRed')
        .setTitle('⏰ Hết giờ')
        .setDescription('Tất cả bot đã bị hủy.');
      interaction.followUp({ embeds: [endEmbed] });
    }, time * 1000);

  } else if (interaction.commandName === 'stop') {
    if (!isRunning) {
      const embed = new EmbedBuilder()
        .setColor('Yellow')
        .setTitle('❌ Không có bot nào đang chạy');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    stopBots();
    isRunning = false;

    const stopEmbed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('🛑 Đã dừng tất cả bot')
      .setDescription('Tất cả bot đã bị tắt.');
    return interaction.reply({ embeds: [stopEmbed] });
  }
});

client.login("NzUyMTEwNTc1MzMyNDkxMzI0.GMyiPK.srjKyrhAM8S-cB3ru3KDRuzbWirNSt7kbdzhgI");

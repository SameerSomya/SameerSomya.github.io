require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./utils/database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.commands = new Collection();
client.prefix = process.env.PREFIX || '!';
client.databaseChannelId = process.env.DB_CHANNEL_ID;
client.guildId = process.env.GUILD_ID;

// Load Commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

// Basic event handler
client.once('ready', async () => {
    console.log(`[MIL-NET] System online. Logged in as ${client.user.tag}`);
    console.log(`[MIL-NET] Synchronizing chain of command...`);
    await db.load(client);
    client.db = db;
});

// Interaction (Slash Command) listener
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const commandName = interaction.commandName;

    // Simulate standard message structure for reuse of existing commands
    const mockMessage = {
        author: interaction.user,
        member: interaction.member,
        guild: interaction.guild,
        channel: interaction.channel,
        mentions: {
            users: {
                first: () => interaction.options.getUser('target')
            }
        },
        reply: async (content) => await interaction.reply(content)
    };

    let args = [];
    if (interaction.options.getUser('target')) {
        args.push(`<@${interaction.options.getUser('target').id}>`);
    }
    if (interaction.options.getString('loadout')) {
        args.push(interaction.options.getString('loadout'));
    }
    if (interaction.options.getString('reason')) {
        args.push(...interaction.options.getString('reason').split(' '));
    }
    if (interaction.options.getString('op_id')) {
        args.push(interaction.options.getString('op_id'));
    }

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        // Many older message commands use message.channel.send for non-replies
        mockMessage.channel.send = async (content) => {
            if (interaction.replied || interaction.deferred) {
                return await interaction.followUp(content);
            } else {
                return await interaction.reply(content);
            }
        };

        await command.execute(mockMessage, args, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'System Error: Central command encountered an anomaly while executing protocol. Abort.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'System Error: Central command encountered an anomaly while executing protocol. Abort.', ephemeral: true });
        }
    }
});

// Message listener and command execution
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) {
        if (commandName === 'ping') {
            return message.reply('Pong. Connection to central command is stable.');
        }
        return;
    }

    const command = client.commands.get(commandName);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('System Error: Central command encountered an anomaly while executing protocol. Abort.');
    }
});

client.login(process.env.DISCORD_TOKEN);

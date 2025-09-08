const Discord = require('discord.js');
const config = require('./config/config');
const { getRandomActivity } = require('./utils/helpers');

// Import command modules
const musicCommands = require('./commands/music');
const gameCommands = require('./commands/games');
const utilityCommands = require('./commands/utilities');
const socialCommands = require('./commands/social');
const sportsCommands = require('./commands/sports');
const moderationCommands = require('./commands/moderation');

// Initialize Discord client with proper intents
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.MessageContent
    ]
});

// Keep server alive
const keepUp = require("./server");

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Bot login
client.login(process.env.DISCORD_TOKEN);

// Collection to store slash commands
client.commands = new Discord.Collection();

// Ready event - set bot status and activity
client.on('ready', async () => {
    console.log(`${client.user.tag} is ready!`);

    // Register slash commands
    await registerSlashCommands(client);

    // Set random activity every 15 seconds
    setInterval(() => {
        const activity = getRandomActivity();
        client.user.setPresence({
            activities: [{
                name: activity,
                type: Discord.ActivityType.Playing
            }],
            status: 'dnd'
        });
    }, 15000);
});

// Main message handler - command router
client.on('message', async (msg) => {
    // Ignore bot messages
    if (msg.author.bot) return;

    // Handle DMs separately
    if (msg.channel.type === 'dm') {
        return socialCommands.handleDMCommands(msg, client);
    }

    // Word filtering (before processing any commands)
    if (config.moderation.enabled && !msg.content.startsWith(config.prefix)) {
        const wasFiltered = await moderationCommands.filterMessage(
            msg,
            config.moderation.bannedWords,
            config.moderation.logChannelName,
            config.moderation.bypassRoles
        );
        if (wasFiltered) {
            return; // Message was deleted, don't process further
        }
    }

    // Check for product codes without prefix (e.g., "qtrs 5", "bb 10")
    const words = msg.content.trim().toLowerCase().split(' ');
    if (words.length === 2) {
        const productCode = words[0];
        const quantity = parseFloat(words[1]);
        
        // Check if it's a valid product code and number
        if (config.products[productCode] && !isNaN(quantity) && quantity > 0) {
            // Delete the original message first
            msg.delete().catch(() => {});
            
            // Create a fake message object for the calculation function
            const fakeMsg = {
                ...msg,
                content: `-calc ${productCode} ${quantity}`,
                delete: () => Promise.resolve() // Override delete to prevent errors
            };
            await utilityCommands.handleCalculateCommand(fakeMsg);
            return;
        }
    }

    // Check if message starts with prefix
    if (!msg.content.startsWith(config.prefix)) return;

    // Extract command from message
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args[0].toLowerCase();

    try {
        // Route commands to appropriate handlers
        switch (command) {
            // Music Commands
            case 'play':
                await musicCommands.handleMusicCommand(msg);
                break;
            case 'leave':
                musicCommands.handleLeaveCommand(msg);
                break;

            // Game Commands
            case '8ball':
                gameCommands.handle8BallCommand(msg);
                break;
            case 'coinflip':
            case 'coin':
                gameCommands.handleCoinFlipCommand(msg);
                break;
            case 'dice':
            case 'roll':
                gameCommands.handleDiceCommand(msg);
                break;
            case 'rps':
                gameCommands.handleRPSCommand(msg);
                break;
            case 'meme':
                gameCommands.handleMemeCommand(msg);
                break;
            case 'hog':
                gameCommands.handleHogCommand(msg);
                break;

            // Utility Commands
            case 'help':
            case 'commands':
                await utilityCommands.handleHelpCommand(msg);
                break;
            case 'calculate':
            case 'calc':
                utilityCommands.handleCalculateCommand(msg);
                break;
            case 'clear':
            case 'purge':
                await utilityCommands.handleClearCommand(msg);
                break;
            case 'ping':
                utilityCommands.handlePingCommand(msg);
                break;

            // Social Commands
            case 'hi':
                socialCommands.handleHiCommand(msg);
                break;
            case 'hello':
                socialCommands.handleHelloCommand(msg);
                break;
            case 'harass':
                await socialCommands.handleHarassCommand(msg, client);
                break;

            // Sports Commands
            case 'fixtures':
            case 'pl':
            case 'premierleague':
                await sportsCommands.handlePLFixturesCommand(msg);
                break;
            case 'table':
            case 'pltable':
                await sportsCommands.handlePLTableCommand(msg);
                break;
            case 'live':
            case 'livescores':
                await sportsCommands.handlePLLiveCommand(msg);
                break;
            case 'next':
            case 'upcoming':
                await sportsCommands.handlePLNextCommand(msg);
                break;
            case 'sportshelp':
            case 'football':
                await sportsCommands.handleSportsHelpCommand(msg);
                break;

            // Moderation Commands
            case 'addban':
            case 'addword':
                await moderationCommands.handleAddBannedWordCommand(msg);
                break;
            case 'removeban':
            case 'removeword':
                await moderationCommands.handleRemoveBannedWordCommand(msg);
                break;
            case 'listban':
            case 'banlist':
                await moderationCommands.handleListBannedWordsCommand(msg);
                break;

            // Unknown command
            default:
                // Only respond to commands that clearly look like commands (start with prefix)
                if (msg.content.length > 1) {
                    msg.channel.send(`❌ Unknown command: \`${command}\`\nType \`${config.prefix}help\` to see available commands.`);
                }
                break;
        }
    } catch (error) {
        console.error(`Error handling command ${command}:`, error);
        msg.channel.send("❌ An error occurred while processing your command. Please try again.");
    }
});

// Export client for other modules
module.exports = client;

// Slash command registration function
async function registerSlashCommands(client) {
    const commands = [
        {
            name: "play",
            description: "Play music from YouTube or other sources",
            options: [
                {
                    name: "url",
                    description: "YouTube URL or search term",
                    type: Discord.ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
    ];

    try {
        console.log("Started refreshing application (/) commands.");
        
        await client.application.commands.set(commands);
        
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error("Error registering slash commands:", error);
    }
}

// Handle slash command interactions
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === "play") {
            const url = interaction.options.getString("url");
            
            // Create a fake message object for compatibility with existing music command
            const fakeMsg = {
                author: interaction.user,
                member: interaction.member,
                guild: interaction.guild,
                channel: interaction.channel,
                content: `-play ${url}`,
                delete: () => Promise.resolve(), // No-op for slash commands
                reply: (content) => interaction.reply(content)
            };
            
            // Acknowledge the interaction first
            await interaction.deferReply();
            
            // Call existing music command
            await musicCommands.handleMusicCommand(fakeMsg);
            
            // If no reply was sent, send a default response
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply("🎵 Processing your music request...");
            }
        }
    } catch (error) {
        console.error("Error handling slash command:", error);
        
        const errorMessage = "❌ An error occurred while processing your command.";
        
        if (interaction.deferred) {
            await interaction.editReply(errorMessage);
        } else if (!interaction.replied) {
            await interaction.reply(errorMessage);
        }
    }
});

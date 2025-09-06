const Discord = require('discord.js');
const config = require('../config/config');
const { calculateProduct, safeDeleteMessage } = require('../utils/helpers');

// Help command with paginated display
async function handleHelpCommand(msg) {
    // Delete the command message
    msg.delete().catch(() => {});
    const pages = [
        {
            title: "🎵 Music Commands",
            description: "Control music playback in voice channels",
            fields: [
                { name: "`-play [URL]`", value: "Play audio from YouTube or other sources", inline: false },
                { name: "`-leave`", value: "Make the bot leave the voice channel", inline: false }
            ],
            color: 0x1DB954
        },
        {
            title: "🎮 Fun & Games",
            description: "Entertainment and interactive commands",
            fields: [
                { name: "`-8ball [question]`", value: "Ask the magic 8-ball a question", inline: false },
                { name: "`-coinflip`", value: "Flip a coin (heads or tails)", inline: false },
                { name: "`-dice`", value: "Roll a 6-sided die", inline: false },
                { name: "`-rps [choice]`", value: "Play rock paper scissors", inline: false },
                { name: "`-meme`", value: "Get a random programming meme", inline: false },
                { name: "`-hog`", value: "Display ASCII art", inline: false }
            ],
            color: 0xFF6B6B
        },
        {
            title: "🛠️ Utility Commands",
            description: "Helpful tools and information",
            fields: [
                { name: "`-calculate [product] [quantity]`", value: "Calculate product weights", inline: false },
                { name: "`-clear [amount]`", value: "Delete messages (1-100)", inline: false },
                { name: "`-ping`", value: "Check bot response time", inline: false },
                { name: "`-help`", value: "Show this help menu", inline: false }
            ],
            color: 0x4ECDC4
        },
        {
            title: "💬 Social Commands",
            description: "Interaction and communication",
            fields: [
                { name: "`-hi`", value: "Get a friendly greeting", inline: false },
                { name: "`-hello`", value: "Alternative greeting command", inline: false },
                { name: "`-harass [user_id] [message]`", value: "Send a message to another user via DM", inline: false }
            ],
            color: 0x95E1D3
        },
        {
            title: "⚽ Sports Commands",
            description: "Premier League fixtures and information",
            fields: [
                { name: "`-fixtures` / `-pl`", value: "Show today's Premier League fixtures", inline: false },
                { name: "`-table` / `-pltable`", value: "Display current Premier League table", inline: false }
            ],
            color: 0x3F1582
        },
        {
            title: "🔢 Product Calculations",
            description: "Quick weight calculations (no prefix needed!)",
            fields: [
                { name: "Tray Products", value: "`qtrs`, `hb`, `wedges`, `sp`", inline: false },
                { name: "Box Products", value: "`bb`, `sc`, `mung`, `ed`, `cp`, `grp`, `rp`, `yp`, `csc`, `gl`, `o10`", inline: false },
                { name: "Usage Examples", value: "Type `qtrs 5` or `bb 10` (no prefix needed!)", inline: false },
                { name: "Alternative", value: "`-calc [product] [quantity]` also works", inline: false }
            ],
            color: 0xF8B500
        },
        {
            title: "🛡️ Moderation Commands",
            description: "Content filtering and moderation tools (Admin only)",
            fields: [
                { name: "`-addban [word]`", value: "Add a word to the banned list", inline: false },
                { name: "`-removeban [word]`", value: "Remove a word from the banned list", inline: false },
                { name: "`-listban`", value: "Show all banned words", inline: false },
                { name: "`-clearwarnings [@user]`", value: "Clear warnings for a user", inline: false }
            ],
            color: 0xE74C3C
        },
        {
            title: "ℹ️ Bot Information",
            description: "About this Discord bot",
            fields: [
                { name: "Features", value: "Music playback, games, calculations, utilities", inline: false },
                { name: "Prefix", value: "All commands start with `-`", inline: false },
                { name: "Support", value: "Bot handles errors gracefully and provides helpful feedback", inline: false }
            ],
            color: 0x9B59B6
        }
    ];

    let currentPage = 0;
    const embed = new Discord.MessageEmbed()
        .setTitle(pages[currentPage].title)
        .setDescription(pages[currentPage].description)
        .addFields(pages[currentPage].fields)
        .setColor(pages[currentPage].color)
        .setFooter(`Page ${currentPage + 1} of ${pages.length} • Use ⬅️ ➡️ to navigate`);

    const helpMsg = await msg.channel.send(embed);
    
    // Add reaction controls
    await helpMsg.react('⬅️');
    await helpMsg.react('➡️');
    await helpMsg.react('❌');

    // Create reaction collector
    const filter = (reaction, user) => {
        return ['⬅️', '➡️', '❌'].includes(reaction.emoji.name) && user.id === msg.author.id;
    };

    const collector = helpMsg.createReactionCollector(filter, { time: 60000 });

    collector.on('collect', (reaction) => {
        reaction.users.remove(msg.author.id);

        if (reaction.emoji.name === '⬅️') {
            currentPage = currentPage === 0 ? pages.length - 1 : currentPage - 1;
        } else if (reaction.emoji.name === '➡️') {
            currentPage = currentPage === pages.length - 1 ? 0 : currentPage + 1;
        } else if (reaction.emoji.name === '❌') {
            collector.stop();
            return;
        }

        const newEmbed = new Discord.MessageEmbed()
            .setTitle(pages[currentPage].title)
            .setDescription(pages[currentPage].description)
            .addFields(pages[currentPage].fields)
            .setColor(pages[currentPage].color)
            .setFooter(`Page ${currentPage + 1} of ${pages.length} • Use ⬅️ ➡️ to navigate`);

        helpMsg.edit(newEmbed);
    });

    collector.on('end', () => {
        helpMsg.reactions.removeAll().catch(() => {});
    });
}

// Product calculation command
function handleCalculateCommand(msg) {
    const args = msg.content.split(' ').slice(1);
    
    if (args.length !== 2) {
        return msg.channel.send("❌ Usage: `-calc [product] [number]`\nExample: `-calc apples 5`");
    }
    
    // Delete the command message
    msg.delete().catch(() => {});

    const productName = args[0];
    const number = parseFloat(args[1]);

    if (isNaN(number)) {
        return msg.channel.send("❌ Please provide a valid number.");
    }

    // Check if it's a known product with specific weight calculation
    const knownProducts = ['qtrs', 'hb', 'wedges', 'spc','bb','sc','mung','ed','cp','grp','rp','yp','csc','gl','o10'];
    let result;
    
    if (knownProducts.includes(productName.toLowerCase())) {
        // Use the existing weight calculation system for known products
        result = calculateProduct(productName, number);
        
        const embed = new Discord.MessageEmbed()
            .setTitle("📊 Product Weight Calculation")
            .setColor(0x00AE86)
            .addField("Product", result.product, true)
            .addField("Quantity", `${result.quantity} ${result.unit}`, true)
            .addField("Weight per unit", `${result.weightPerUnit} kg`, true)
            .addField("Total Weight", `${result.totalWeight} kg`, false)
            .setTimestamp();

        msg.channel.send(embed);
    } else {
        // For any other product, just multiply by the number
        const baseValue = 1;
        const total = baseValue * number;
        
        const embed = new Discord.MessageEmbed()
            .setTitle("🧮 Simple Calculation")
            .setColor(0x4ECDC4)
            .addField("Product", productName, true)
            .addField("Multiplier", number.toString(), true)
            .addField("Result", `${productName} × ${number} = ${total}`, false)
            .setTimestamp();

        msg.channel.send(embed);


    }
}

// Clear messages command
async function handleClearCommand(msg) {
    // This command deletes itself as part of its functionality
    const args = msg.content.split(' ').slice(1);
    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
        return msg.channel.send("❌ Please specify a number between 1 and 100.");
    }

    try {
        // Delete the command message first
        await safeDeleteMessage(msg);
        
        // Fetch and delete messages
        const messages = await msg.channel.messages.fetch({ limit: amount });
        const deletedMessages = await msg.channel.bulkDelete(messages, true);
        
        // Send confirmation
        const confirmMsg = await msg.channel.send(`✅ Deleted ${deletedMessages.size} messages.`);
        safeDeleteMessage(confirmMsg, 3000);
        
    } catch (error) {
        console.error('Clear command error:', error);
        msg.channel.send("❌ Failed to delete messages. Make sure I have the proper permissions.");
    }
}

// Ping command
function handlePingCommand(msg) {
    // Delete the command message
    msg.delete().catch(() => {});
    const ping = Date.now() - msg.createdTimestamp;
    msg.channel.send(`🏓 Pong! Latency: ${ping}ms`);
}

module.exports = {
    handleHelpCommand,
    handleCalculateCommand,
    handleClearCommand,
    handlePingCommand
};
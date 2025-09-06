const Discord = require('discord.js');
const config = require('../config/config');

// Store user warnings (in production, use a database)
const userWarnings = new Map();

// Word filtering and logging function
async function filterMessage(msg, bannedWords, logChannelName, bypassRoles) {
    // Skip if user has bypass role
    if (bypassRoles.some(role => msg.member.roles.cache.some(r => r.name === role))) {
        return false;
    }

    // Check message content for banned words
    const messageContent = msg.content.toLowerCase();
    const foundWords = bannedWords.filter(word => 
        messageContent.includes(word.toLowerCase())
    );

    if (foundWords.length > 0) {
        // Delete the message
        await msg.delete().catch(console.error);

        // Find or create log channel
        let logChannel = msg.guild.channels.cache.find(channel => 
            channel.name === logChannelName && channel.type === 'text'
        );

        if (!logChannel) {
            // Create log channel if it doesn't exist
            try {
                logChannel = await msg.guild.channels.create(logChannelName, {
                    type: 'text',
                    topic: 'Moderation logs - flagged messages',
                    permissionOverwrites: [
                        {
                            id: msg.guild.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        // Allow roles with moderation permissions to view
                        ...msg.guild.roles.cache
                            .filter(role => role.permissions.has('MANAGE_MESSAGES'))
                            .map(role => ({
                                id: role.id,
                                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                            }))
                    ]
                });
            } catch (error) {
                console.error('Could not create log channel:', error);
                return true; // Message was still deleted
            }
        }

        // Add warning to user
        const userId = msg.author.id;
        const currentWarnings = userWarnings.get(userId) || 0;
        const newWarningCount = currentWarnings + 1;
        userWarnings.set(userId, newWarningCount);

        // Determine if maximum warnings reached
        const maxWarnings = config.moderation.warnings.maxWarnings;
        const maxWarningsReached = newWarningCount >= maxWarnings;

        // Create log embed
        const logEmbed = new Discord.MessageEmbed()
            .setTitle('🚫 Message Flagged and Deleted')
            .setColor(maxWarningsReached ? 0x8B0000 : 0xFF0000)
            .addField('User', `${msg.author.tag} (${msg.author.id})`, true)
            .addField('Channel', `${msg.channel.name} (${msg.channel.id})`, true)
            .addField('Flagged Words', foundWords.join(', '), true)
            .addField('Original Message', msg.content.length > 1024 ? msg.content.substring(0, 1021) + '...' : msg.content, false)
            .addField('Warnings', `${newWarningCount}/${maxWarnings}${maxWarningsReached ? ' ⚠️ MAX REACHED' : ''}`, true)
            .setTimestamp()
            .setThumbnail(msg.author.displayAvatarURL());

        // Add note for moderators if max warnings reached
        if (maxWarningsReached) {
            logEmbed.addField('📋 Moderator Note', 'User has reached maximum warnings. Manual action may be required.', false);
        }

        // Send to log channel
        await logChannel.send(logEmbed);

        // Send warning to user
        try {
            const warningEmbed = new Discord.MessageEmbed()
                .setTitle(maxWarningsReached ? '🚨 Maximum Warnings Reached' : '⚠️ Message Deleted')
                .setDescription(maxWarningsReached ? 
                    'You have reached the maximum number of warnings. Please be more careful with your language.' :
                    'Your message contained inappropriate content and has been removed.')
                .addField('Reason', `Inappropriate language: ${foundWords.join(', ')}`, false)
                .addField('Warnings', `${newWarningCount}/${maxWarnings}`, false)
                .setColor(maxWarningsReached ? 0x8B0000 : 0xFFA500)
                .setTimestamp();

            if (maxWarningsReached) {
                warningEmbed.addField('Next Steps', 'A moderator has been notified. Please follow server rules to avoid further issues.', false);
            }

            await msg.author.send(warningEmbed);
        } catch (error) {
            // User has DMs disabled, send warning in channel
            const warningText = maxWarningsReached ? 
                `🚨 ${msg.author}, maximum warnings reached (${newWarningCount}/${maxWarnings}). Please be more careful with your language.` :
                `⚠️ ${msg.author}, your message was deleted for inappropriate content. Warning ${newWarningCount}/${maxWarnings}`;
                
            const warningMsg = await msg.channel.send(warningText);
            setTimeout(() => warningMsg.delete().catch(() => {}), maxWarningsReached ? 8000 : 5000);
        }

        return true; // Message was filtered
    }

    return false; // Message was not filtered
}

// Add banned word command (Admin only)
async function handleAddBannedWordCommand(msg) {
    msg.delete().catch(() => {});

    // Check permissions
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
        return msg.channel.send("❌ You need 'Manage Messages' permission to use this command.");
    }

    const args = msg.content.split(' ').slice(1);
    if (args.length === 0) {
        return msg.channel.send("❌ Usage: `-addban [word]`\nExample: `-addban spam`");
    }

    const wordToAdd = args.join(' ').toLowerCase();
    
    if (config.moderation.bannedWords.includes(wordToAdd)) {
        return msg.channel.send("❌ That word is already banned.");
    }

    config.moderation.bannedWords.push(wordToAdd);

    const embed = new Discord.MessageEmbed()
        .setTitle('✅ Banned Word Added')
        .setDescription(`Added "${wordToAdd}" to the banned words list.`)
        .addField('Total Banned Words', config.moderation.bannedWords.length, true)
        .setColor(0x00FF00)
        .setTimestamp();

    msg.channel.send(embed);
}

// Remove banned word command (Admin only)
async function handleRemoveBannedWordCommand(msg) {
    msg.delete().catch(() => {});

    // Check permissions
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
        return msg.channel.send("❌ You need 'Manage Messages' permission to use this command.");
    }

    const args = msg.content.split(' ').slice(1);
    if (args.length === 0) {
        return msg.channel.send("❌ Usage: `-removeban [word]`\nExample: `-removeban spam`");
    }

    const wordToRemove = args.join(' ').toLowerCase();
    const wordIndex = config.moderation.bannedWords.indexOf(wordToRemove);
    
    if (wordIndex === -1) {
        return msg.channel.send("❌ That word is not in the banned words list.");
    }

    config.moderation.bannedWords.splice(wordIndex, 1);

    const embed = new Discord.MessageEmbed()
        .setTitle('✅ Banned Word Removed')
        .setDescription(`Removed "${wordToRemove}" from the banned words list.`)
        .addField('Total Banned Words', config.moderation.bannedWords.length, true)
        .setColor(0x00FF00)
        .setTimestamp();

    msg.channel.send(embed);
}

// List banned words command (Admin only)
async function handleListBannedWordsCommand(msg) {
    msg.delete().catch(() => {});

    // Check permissions
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
        return msg.channel.send("❌ You need 'Manage Messages' permission to use this command.");
    }

    const embed = new Discord.MessageEmbed()
        .setTitle('📋 Banned Words List')
        .setDescription(config.moderation.bannedWords.length > 0 ? 
            `\`${config.moderation.bannedWords.join('`, `')}\`` : 
            'No banned words configured.')
        .addField('Total', config.moderation.bannedWords.length, true)
        .addField('Log Channel', config.moderation.logChannelName, true)
        .setColor(0x3498DB)
        .setTimestamp();

    msg.channel.send(embed);
}

// Clear user warnings command (Admin only)
async function handleClearWarningsCommand(msg) {
    msg.delete().catch(() => {});

    // Check permissions
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
        return msg.channel.send("❌ You need 'Manage Messages' permission to use this command.");
    }

    const args = msg.content.split(' ').slice(1);
    if (args.length === 0) {
        return msg.channel.send("❌ Usage: `-clearwarnings [@user]`");
    }

    const user = msg.mentions.users.first();
    if (!user) {
        return msg.channel.send("❌ Please mention a valid user.");
    }

    userWarnings.delete(user.id);

    const embed = new Discord.MessageEmbed()
        .setTitle('✅ Warnings Cleared')
        .setDescription(`Cleared all warnings for ${user.tag}`)
        .setColor(0x00FF00)
        .setTimestamp();

    msg.channel.send(embed);
}

module.exports = {
    filterMessage,
    handleAddBannedWordCommand,
    handleRemoveBannedWordCommand,
    handleListBannedWordsCommand,
    handleClearWarningsCommand,
    userWarnings
};
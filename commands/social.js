const Discord = require('discord.js');

// Greeting commands
function handleHiCommand(msg) {
    msg.delete().catch(() => {});
    const greetings = [
        `Hey there, ${msg.author.username}! 👋`,
        `Hello ${msg.author.username}! How's it going? 😊`,
        `Hi ${msg.author.username}! Great to see you! 🌟`,
        `What's up, ${msg.author.username}? 🚀`,
        `Greetings, ${msg.author.username}! 🎉`
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    msg.channel.send(randomGreeting);
}

function handleHelloCommand(msg) {
    msg.delete().catch(() => {});
    const responses = [
        `Hello there, ${msg.author.username}! 👋`,
        `Well hello, ${msg.author.username}! Nice to meet you! 😄`,
        `Hello ${msg.author.username}! How can I help you today? 🤖`,
        `Hey ${msg.author.username}! Hope you're having a great day! ☀️`,
        `Hello! ${msg.author.username}, ready for some fun? 🎮`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    msg.channel.send(randomResponse);
}

// Message delivery command
async function handleHarassCommand(msg, client) {
    const args = msg.content.split(' ');
    
    if (args.length < 3) {
        return msg.channel.send("❌ Usage: `-harass [user_id] [message]`\nExample: `-harass 123456789012345678 Hello there!`");
    }

    const targetUserId = args[1];
    const message = args.slice(2).join(' ');

    // Validate user ID format
    if (!/^\d{17,19}$/.test(targetUserId)) {
        return msg.channel.send("❌ Invalid user ID format. Please provide a valid Discord user ID.");
    }

    try {
        // Try to fetch the target user
        const targetUser = await client.users.fetch(targetUserId);
        
        if (!targetUser) {
            return msg.channel.send("❌ User not found. Please check the user ID and try again.");
        }

        // Create the message embed
        const embed = new Discord.MessageEmbed()
            .setTitle("📨 Message Delivery")
            .setDescription(message)
            .addField("From", `${msg.author.username}#${msg.author.discriminator}`, true)
            .addField("Server", msg.guild ? msg.guild.name : "Direct Message", true)
            .setThumbnail(msg.author.displayAvatarURL())
            .setColor(0x00AE86)
            .setTimestamp();

        // Send the message to target user
        await targetUser.send({ embeds: [embed] });
        
        // Confirm delivery to sender
        msg.channel.send(`✅ Message delivered to ${targetUser.username}#${targetUser.discriminator}!`);
        
        // Delete the original command message for privacy
        msg.delete().catch(() => {});

    } catch (error) {
        console.error('Message delivery error:', error);
        
        if (error.code === 50007) {
            msg.channel.send("❌ Cannot send message to this user. They may have DMs disabled or have blocked the bot.");
        } else if (error.code === 10013) {
            msg.channel.send("❌ User not found. Please check the user ID and try again.");
        } else {
            msg.channel.send("❌ Failed to deliver message. The user may not exist or have DMs disabled.");
        }
    }
}

// DM handling for specific users
function handleDMCommands(msg, client) {
    if (msg.content.includes('brawl-stars')) {
        const webhook = new Discord.WebhookClient('1064659669885972593', 'KZWGUG_w3Eo7MuQ-4nK3T8U6-MfAXYYtNUAiA67mDKaOmWxqPIaEp29PpP5iUJsS5TQj');
        
        const embed = new Discord.MessageEmbed()
            .setTitle("Brawl Stars Message")
            .setDescription(msg.content)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL())
            .setTimestamp();
        
        webhook.send({
            embeds: [embed]
        }).catch(console.error);
    }
}

module.exports = {
    handleHiCommand,
    handleHelloCommand,
    handleHarassCommand,
    handleDMCommands
};
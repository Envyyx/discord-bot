const Discord = require('discord.js');
const { safeDeleteMessage } = require('../utils/helpers');

// 8-ball command
function handle8BallCommand(msg) {
    msg.delete().catch(() => {});
    const question = msg.content.replace('-8ball', '').trim();
    
    if (!question) {
        return msg.channel.send("❌ Please ask a question!\nUsage: `-8ball [question]`");
    }

    const responses = [
        "🎱 It is certain",
        "🎱 Without a doubt",
        "🎱 Yes definitely",
        "🎱 You may rely on it",
        "🎱 As I see it, yes",
        "🎱 Most likely",
        "🎱 Outlook good",
        "🎱 Yes",
        "🎱 Signs point to yes",
        "🎱 Reply hazy, try again",
        "🎱 Ask again later",
        "🎱 Better not tell you now",
        "🎱 Cannot predict now",
        "🎱 Concentrate and ask again",
        "🎱 Don't count on it",
        "🎱 My reply is no",
        "🎱 My sources say no",
        "🎱 Outlook not so good",
        "🎱 Very doubtful"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const embed = new Discord.MessageEmbed()
        .setTitle("🎱 Magic 8-Ball")
        .addField("Question", question, false)
        .addField("Answer", randomResponse, false)
        .setColor(0x8B008B)
        .setTimestamp();

    msg.channel.send(embed);
}

// Coin flip command
function handleCoinFlipCommand(msg) {
    msg.delete().catch(() => {});
    const outcomes = ['Heads! 🪙', 'Tails! 🪙'];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    const embed = new Discord.MessageEmbed()
        .setTitle("🪙 Coin Flip")
        .setDescription(result)
        .setColor(0xFFD700)
        .setTimestamp();

    msg.channel.send(embed);
}

// Dice roll command
function handleDiceCommand(msg) {
    msg.delete().catch(() => {});
    const roll = Math.floor(Math.random() * 6) + 1;
    const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    const embed = new Discord.MessageEmbed()
        .setTitle("🎲 Dice Roll")
        .setDescription(`You rolled: ${diceEmojis[roll - 1]} **${roll}**`)
        .setColor(0xFF4500)
        .setTimestamp();

    msg.channel.send(embed);
}

// Rock Paper Scissors command
function handleRPSCommand(msg) {
    msg.delete().catch(() => {});
    const choice = msg.content.replace('-rps', '').trim().toLowerCase();
    const validChoices = ['rock', 'paper', 'scissors'];
    
    if (!validChoices.includes(choice)) {
        return msg.channel.send("❌ Please choose: rock, paper, or scissors\nUsage: `-rps [choice]`");
    }

    const botChoice = validChoices[Math.floor(Math.random() * validChoices.length)];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    
    let result;
    if (choice === botChoice) {
        result = "It's a tie! 🤝";
    } else if (
        (choice === 'rock' && botChoice === 'scissors') ||
        (choice === 'paper' && botChoice === 'rock') ||
        (choice === 'scissors' && botChoice === 'paper')
    ) {
        result = "You win! 🎉";
    } else {
        result = "I win! 🤖";
    }

    const embed = new Discord.MessageEmbed()
        .setTitle("✂️ Rock Paper Scissors")
        .addField("Your choice", `${emojis[choice]} ${choice}`, true)
        .addField("My choice", `${emojis[botChoice]} ${botChoice}`, true)
        .addField("Result", result, false)
        .setColor(0x00FF00)
        .setTimestamp();

    msg.channel.send(embed);
}

// Meme command (simple responses)
function handleMemeCommand(msg) {
    msg.delete().catch(() => {});
    const memes = [
        "Why did the programmer quit his job? Because he didn't get arrays! 😄",
        "There are only 10 types of people in the world: those who understand binary and those who don't! 🤓",
        "99 little bugs in the code, 99 little bugs... Take one down, patch it around, 117 little bugs in the code! 🐛",
        "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?' 🍺",
        "Why do programmers prefer dark mode? Because light attracts bugs! 🌙",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
    ];

    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    
    const embed = new Discord.MessageEmbed()
        .setTitle("😂 Random Meme")
        .setDescription(randomMeme)
        .setColor(0xFF1493)
        .setTimestamp();

    msg.channel.send(embed);
}

// Hog command
function handleHogCommand(msg) {
    msg.delete().catch(() => {});
    
    const hogArt = `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠉⢈⠩⢙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢋⠠⠀⠀⠨⠐⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⢐⠐⠌⡌⢄⢐⢈⠔⡝⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡏⠉⡀⠐⡀⢁⠈⠐⠱⠑⡑⠈⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⢗⠀⠀⠐⡠⡛⠔⡁⢜⡔⡬⢎⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡿⠡⠀⠀⠀⠀⠂⠁⠀⠄⢂⠈⠂⢂⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⡿⢟⠩⠐⡀⠀⠀⠀⠐⠐⠁⠓⠒⠒⢀⠁⢐⢝⢟⢿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠫⠡⠡⠨⢀⠂⠠⠀⠀⢁⠑⡱⠛⠗⡓⢂⠠⢸⢸⢨⠣⡝⣻⣿⣿⣿⣿⣿⣿
⣿⢏⢐⢁⠊⢌⠐⡈⠄⠠⠀⠀⠀⠀⠁⠑⠈⠀⢄⢕⠸⡨⠪⡪⡘⣻⣿⡿⣿⣿⣿
⣿⢂⠂⡂⠅⡂⠅⡐⠨⢐⠐⠠⠠⡀⢄⠠⡠⡡⡱⡐⠕⢌⢊⢆⢣⢒⠽⢿⣿⣿⣿
⠣⢂⠂⠄⠡⠐⠐⠈⠌⡐⠨⡈⠢⠨⡂⢌⢂⠆⡪⠨⡊⠂⡂⠢⢡⣢⣣⡣⣍⢿⣿
⠨⢂⢂⠁⡀⠀⠀⠁⠐⠈⠐⠈⢈⠈⠐⡀⠄⠁⠌⠈⠔⣄⡀⠠⡑⡂⠆⠢⢂⠑⠽
⡨⠐⠀⠀⠀⢠⡎⡀⠀⠀⠄⠈⡀⠌⠐⠠⠈⠄⡁⠂⡀⡫⠑⣑⠀⢂⠌⠄⢕⠀⠨
⠺⡪⠢⡀⠀⠞⢇⢂⠀⠂⡀⠠⠀⠄⠁⠌⠨⠀⢄⠢⡁⢂⢿⡟⡀⠀⠈⠈⡀⠂⣰
⢀⢀⠀⠄⠀⠀⡐⠀⡈⠄⡐⠅⡊⠌⢌⠄⡕⡑⡁⢂⠂⢂⠸⣿⡄⠀⠈⣠⣴⣿⣿
⢐⠔⠠⠀⠀⡐⠠⢈⠢⢑⠄⠑⢈⠊⡂⡱⢁⣂⢌⢔⢌⢄⠀⠹⢀⣺⡿⣟⢿⣿⣿
⢀⠡⠁⠂⠐⠠⠈⠄⢈⠠⢈⢢⡣⣗⠕⠄⣕⢮⣞⣞⣗⣯⢯⡷⡴⣹⡪⣷⣿⣿⣿
⠊⠄⠠⠠⠡⠈⠠⢐⠠⡊⡎⣗⢭⢐⠹⡹⣮⡳⡵⣳⣻⢾⣻⣽⣻⣺⣺⣽⣿⣿⣿
⣨⣾⢐⠰⠐⠅⡂⡂⢕⢜⢜⢵⢹⢑⢔⠨⢘⠸⡹⡵⣯⣻⢽⣳⣻⣺⢞⡿⣿⣿⣿
⣿⣿⡔⠠⢈⠐⠐⢠⢱⢸⢸⢸⢸⠰⡡⢘⢔⢕⠝⢮⣳⢽⢝⡾⡵⡯⣏⠯⣿⣿⣿
⣿⣿⣗⢅⢢⠠⠡⠢⡱⡑⡕⡕⢅⠣⡊⢨⢪⡣⡣⡂⡬⡳⢽⢽⢽⢽⣞⣧⠙⣿⣿
⡻⣿⡯⡪⠢⡡⠡⢑⢌⠪⡪⡊⠆⢌⠪⢐⢕⢱⢱⢱⢱⢱⢙⢮⡫⡟⣞⢮⣳⠙⣿
⠊⣿⣯⠪⡊⠄⢅⠂⢂⠁⢇⢇⢃⠂⢕⠐⠌⡲⡰⡡⣇⠇⢇⢕⠪⠉⠂⠅⠂⡑⠹
⣸⢿⣳⢱⠨⡐⡽⡿⡶⡾⡬⡢⢂⠅⡢⢡⣌⠐⠈⢎⢎⢎⢔⠠⠡⠠⠠⠡⡁⡂⠡
⡯⡯⡇⢅⠕⠠⢱⢹⡙⢮⢹⠨⡂⡂⢇⠌⠮⡳⠅⡂⢕⠡⡑⠠⢁⢁⣡⣡⣢⣶⣿
⣗⢽⢌⡢⡡⡡⡸⡢⡣⡣⡱⡑⠔⡈⢎⢆⢂⠂⠅⣢⡳⣽⡐⢅⢂⣊⣿⣿⣿⣿⣿
⣯⢯⢷⢽⢮⢯⣺⣪⢞⡮⣳⢘⠔⢌⢜⣞⣖⣮⣻⢮⣯⢷⣿⣻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣾⣷⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`;

    msg.channel.send(`\`\`\`${hogArt}\`\`\``);
}

module.exports = {
    handle8BallCommand,
    handleCoinFlipCommand,
    handleDiceCommand,
    handleRPSCommand,
    handleMemeCommand,
    handleHogCommand
};
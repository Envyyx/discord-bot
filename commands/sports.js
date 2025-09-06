const Discord = require('discord.js');
const fetch = require('node-fetch');

// API-Football configuration
const API_BASE_URL = 'https://v3.football.api-sports.io';
const PREMIER_LEAGUE_ID = 39; // Premier League ID in api-football
const CURRENT_SEASON = 2024; // Current season

// Helper function to make API requests
async function makeApiRequest(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'x-apisports-key': process.env.API_FOOTBALL_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Premier League fixtures command
async function handlePLFixturesCommand(msg) {
    msg.delete().catch(() => {});
    
    try {
        // Send loading message
        const loadingMsg = await msg.channel.send("⚽ Fetching today's Premier League fixtures...");
        
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch today's fixtures from api-football
        const data = await makeApiRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&date=${today}`);
        
        loadingMsg.delete().catch(() => {});
        
        if (!data.response || data.response.length === 0) {
            return msg.channel.send("📅 No Premier League fixtures scheduled for today.");
        }
        
        // Create embed for fixtures
        const embed = new Discord.MessageEmbed()
            .setTitle("⚽ Today's Premier League Fixtures")
            .setColor(0x3F1582)
            .setTimestamp()
            .setFooter("Powered by API-Football", "https://media.api-sports.io/football/leagues/39.png");
        
        // Add fixtures to embed
        data.response.forEach(fixture => {
            const homeTeam = fixture.teams.home.name;
            const awayTeam = fixture.teams.away.name;
            const venue = fixture.fixture.venue.name;
            
            // Format kick-off time
            const kickoffTime = new Date(fixture.fixture.date);
            const timeString = kickoffTime.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/London'
            });
            
            let matchStatus = '';
            const status = fixture.fixture.status.short;
            
            if (status === 'FT') {
                matchStatus = `**FT** ${fixture.goals.home} - ${fixture.goals.away}`;
            } else if (['1H', '2H', 'HT', 'LIVE'].includes(status)) {
                const minute = fixture.fixture.status.elapsed || '0';
                matchStatus = `**LIVE ${minute}'** ${fixture.goals.home || 0} - ${fixture.goals.away || 0}`;
            } else if (status === 'NS') {
                matchStatus = `**${timeString}** UK Time\n📍 ${venue}`;
            } else {
                matchStatus = `**${status}** ${fixture.goals.home || 0} - ${fixture.goals.away || 0}`;
            }
            
            embed.addField(
                `${homeTeam} vs ${awayTeam}`,
                matchStatus,
                true
            );
        });
        
        msg.channel.send(embed);
        
    } catch (error) {
        console.error('Premier League fixtures error:', error);
        msg.channel.send("❌ Failed to fetch Premier League fixtures. Please try again later.");
    }
}

// Premier League table command
async function handlePLTableCommand(msg) {
    msg.delete().catch(() => {});
    
    try {
        const loadingMsg = await msg.channel.send("📊 Fetching Premier League table...");
        
        // Fetch league standings from api-football
        const data = await makeApiRequest(`/standings?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}`);
        
        loadingMsg.delete().catch(() => {});
        
        if (!data.response || data.response.length === 0) {
            return msg.channel.send("❌ No Premier League standings available.");
        }
        
        const standings = data.response[0].league.standings[0];
        
        const embed = new Discord.MessageEmbed()
            .setTitle("📊 Premier League Table 2024/25")
            .setColor(0x3F1582)
            .setTimestamp()
            .setFooter("Powered by API-Football", "https://media.api-sports.io/football/leagues/39.png");
        
        // Split into two sections for better formatting
        let topHalf = '';
        let bottomHalf = '';
        
        standings.forEach((team, index) => {
            const position = team.rank;
            const name = team.team.name;
            const played = team.all.played;
            const points = team.points;
            const goalDiff = team.goalsDiff >= 0 ? `+${team.goalsDiff}` : team.goalsDiff;
            
            // Add position indicators
            let indicator = '';
            if (position <= 4) indicator = '🟢'; // Champions League
            else if (position === 5) indicator = '🟡'; // Europa League
            else if (position === 6) indicator = '🟠'; // Conference League
            else if (position >= 18) indicator = '🔴'; // Relegation
            
            const teamLine = `${indicator} **${position}.** ${name}\n📊 ${played}P • ${points}pts • ${goalDiff}GD\n\n`;
            
            if (index < 10) {
                topHalf += teamLine;
            } else {
                bottomHalf += teamLine;
            }
        });
        
        embed.addField("Positions 1-10", topHalf, true);
        embed.addField("Positions 11-20", bottomHalf, true);
        
        // Add legend
        embed.addField("🏆 Legend", 
            "🟢 Champions League\n🟡 Europa League\n🟠 Conference League\n🔴 Relegation", 
            false);
        
        msg.channel.send(embed);
        
    } catch (error) {
        console.error('Premier League table error:', error);
        msg.channel.send("❌ Failed to fetch Premier League table. Please try again later.");
    }
}

// Premier League live scores command
async function handlePLLiveCommand(msg) {
    msg.delete().catch(() => {});
    
    try {
        const loadingMsg = await msg.channel.send("⚽ Fetching live Premier League matches...");
        
        // Fetch live fixtures from api-football
        const data = await makeApiRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&live=all`);
        
        loadingMsg.delete().catch(() => {});
        
        if (!data.response || data.response.length === 0) {
            return msg.channel.send("📺 No Premier League matches are currently live.");
        }
        
        const embed = new Discord.MessageEmbed()
            .setTitle("🔴 LIVE Premier League Matches")
            .setColor(0xFF0000)
            .setTimestamp()
            .setFooter("Live • Updates every 15 seconds", "https://media.api-sports.io/football/leagues/39.png");
        
        data.response.forEach(fixture => {
            const homeTeam = fixture.teams.home.name;
            const awayTeam = fixture.teams.away.name;
            const homeScore = fixture.goals.home || 0;
            const awayScore = fixture.goals.away || 0;
            const minute = fixture.fixture.status.elapsed;
            const status = fixture.fixture.status.short;
            
            let statusText = '';
            if (status === 'HT') {
                statusText = '**HALF TIME**';
            } else if (status === '1H') {
                statusText = `**${minute}' 1ST HALF**`;
            } else if (status === '2H') {
                statusText = `**${minute}' 2ND HALF**`;
            } else {
                statusText = `**${minute}' LIVE**`;
            }
            
            embed.addField(
                `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
                statusText,
                true
            );
        });
        
        msg.channel.send(embed);
        
    } catch (error) {
        console.error('Premier League live error:', error);
        msg.channel.send("❌ Failed to fetch live Premier League matches. Please try again later.");
    }
}

// Get next Premier League fixtures
async function handlePLNextCommand(msg) {
    msg.delete().catch(() => {});
    
    try {
        const loadingMsg = await msg.channel.send("⚽ Fetching next Premier League fixtures...");
        
        // Get next 10 fixtures
        const data = await makeApiRequest(`/fixtures?league=${PREMIER_LEAGUE_ID}&season=${CURRENT_SEASON}&next=10`);
        
        loadingMsg.delete().catch(() => {});
        
        if (!data.response || data.response.length === 0) {
            return msg.channel.send("📅 No upcoming Premier League fixtures found.");
        }
        
        const embed = new Discord.MessageEmbed()
            .setTitle("📅 Next Premier League Fixtures")
            .setColor(0x3F1582)
            .setTimestamp()
            .setFooter("Powered by API-Football", "https://media.api-sports.io/football/leagues/39.png");
        
        data.response.slice(0, 8).forEach(fixture => {
            const homeTeam = fixture.teams.home.name;
            const awayTeam = fixture.teams.away.name;
            
            const matchDate = new Date(fixture.fixture.date);
            const dateString = matchDate.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            const timeString = matchDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/London'
            });
            
            embed.addField(
                `${homeTeam} vs ${awayTeam}`,
                `📅 ${dateString}\n⏰ ${timeString} UK`,
                true
            );
        });
        
        msg.channel.send(embed);
        
    } catch (error) {
        console.error('Premier League next fixtures error:', error);
        msg.channel.send("❌ Failed to fetch next Premier League fixtures. Please try again later.");
    }
}

// Sports help command
async function handleSportsHelpCommand(msg) {
    msg.delete().catch(() => {});
    
    const embed = new Discord.MessageEmbed()
        .setTitle("⚽ Sports Commands - Premier League Coverage")
        .setDescription("Professional football data powered by API-Football")
        .setColor(0x3F1582)
        .setThumbnail("https://media.api-sports.io/football/leagues/39.png")
        .addField("📅 **Today's Fixtures**", 
            "`-fixtures` / `-pl` / `-premierleague`\nShow today's Premier League matches with kick-off times and venues", 
            false)
        .addField("📊 **League Table**", 
            "`-table` / `-pltable`\nCurrent Premier League standings with:\n🟢 Champions League spots\n🟡 Europa League\n🟠 Conference League\n🔴 Relegation zone", 
            false)
        .addField("🔴 **Live Scores**", 
            "`-live` / `-livescores`\nReal-time match scores updating every 15 seconds\nShows current minute and match status", 
            false)
        .addField("📅 **Upcoming Fixtures**", 
            "`-next` / `-upcoming`\nNext 8 Premier League matches with dates and times", 
            false)
        .addField("✨ **Professional Features**", 
            "• **Real-time updates** - Live scores every 15 seconds\n• **Official data** - Same API used by major sports sites\n• **Comprehensive info** - Venues, times, standings\n• **Visual indicators** - Color-coded league positions", 
            false)
        .addField("🏆 **Data Source**", 
            "Powered by API-Football - trusted by professional sports platforms worldwide", 
            false)
        .setFooter("Try any command above to get started!")
        .setTimestamp();
    
    msg.channel.send(embed);
}

module.exports = {
    handlePLFixturesCommand,
    handlePLTableCommand,
    handlePLLiveCommand,
    handlePLNextCommand,
    handleSportsHelpCommand
};
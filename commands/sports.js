const Discord = require('discord.js');
const fetch = require('node-fetch');

// Premier League fixtures command
async function handlePLFixturesCommand(msg) {
    msg.delete().catch(() => {});
    
    try {
        // Send loading message
        const loadingMsg = await msg.channel.send("⚽ Fetching today's Premier League fixtures...");
        
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch fixtures from Fantasy Premier League API
        const response = await fetch('https://fantasy.premierleague.com/api/fixtures/');
        const fixtures = await response.json();
        
        // Get team data for team names
        const bootstrapResponse = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const bootstrapData = await bootstrapResponse.json();
        const teams = bootstrapData.teams;
        
        // Filter fixtures for today
        const todayFixtures = fixtures.filter(fixture => {
            const fixtureDate = new Date(fixture.kickoff_time).toISOString().split('T')[0];
            return fixtureDate === today && fixture.finished === false;
        });
        
        loadingMsg.delete().catch(() => {});
        
        if (todayFixtures.length === 0) {
            return msg.channel.send("📅 No Premier League fixtures scheduled for today.");
        }
        
        // Create embed for fixtures
        const embed = new Discord.MessageEmbed()
            .setTitle("⚽ Today's Premier League Fixtures")
            .setColor(0x3F1582)
            .setTimestamp()
            .setFooter("Premier League", "https://resources.premierleague.com/premierleague/badges/25/t3.png");
        
        // Add fixtures to embed
        todayFixtures.forEach(fixture => {
            const homeTeam = teams.find(team => team.id === fixture.team_h);
            const awayTeam = teams.find(team => team.id === fixture.team_a);
            
            const kickoffTime = new Date(fixture.kickoff_time);
            const timeString = kickoffTime.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/London'
            });
            
            let matchStatus = '';
            if (fixture.started) {
                if (fixture.finished) {
                    matchStatus = `**FT** ${fixture.team_h_score} - ${fixture.team_a_score}`;
                } else {
                    matchStatus = `**LIVE** ${fixture.team_h_score || 0} - ${fixture.team_a_score || 0}`;
                }
            } else {
                matchStatus = `**${timeString}** UK Time`;
            }
            
            embed.addField(
                `${homeTeam.name} vs ${awayTeam.name}`,
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
        
        // Fetch league table from Fantasy Premier League API
        const response = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
        const data = await response.json();
        const teams = data.teams;
        
        // Sort teams by position
        teams.sort((a, b) => a.position - b.position);
        
        loadingMsg.delete().catch(() => {});
        
        const embed = new Discord.MessageEmbed()
            .setTitle("📊 Premier League Table")
            .setColor(0x3F1582)
            .setTimestamp()
            .setFooter("Premier League", "https://resources.premierleague.com/premierleague/badges/25/t3.png");
        
        // Add top 10 teams to embed
        const topTeams = teams.slice(0, 10);
        let tableText = '';
        
        topTeams.forEach((team, index) => {
            const position = index + 1;
            tableText += `**${position}.** ${team.name} - ${team.points}pts\n`;
        });
        
        embed.addField("Top 10 Teams", tableText, false);
        
        if (teams.length > 10) {
            embed.addField("More Teams", `... and ${teams.length - 10} more teams`, false);
        }
        
        msg.channel.send(embed);
        
    } catch (error) {
        console.error('Premier League table error:', error);
        msg.channel.send("❌ Failed to fetch Premier League table. Please try again later.");
    }
}

module.exports = {
    handlePLFixturesCommand,
    handlePLTableCommand
};
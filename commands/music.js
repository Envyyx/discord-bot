const ytdl = require('ytdl-core');
const config = require('../config/config');
const { isValidUrl, isYouTubeUrl, safeDisconnect, safeDeleteMessage } = require('../utils/helpers');

// Music command handler
async function handleMusicCommand(msg) {
    try {
        // Check if user is in voice channel
        if (!msg.member.voice.channel) {
            return msg.channel.send("❌ You need to join a voice channel first!");
        }

        // Extract URL from command
        const url = msg.content.replace('-play', '').trim();
        
        if (!url) {
            return msg.channel.send("❌ Please provide a URL to play!\n📝 Usage: `-play [URL]`");
        }

        // Validate URL format
        if (!isValidUrl(url)) {
            return msg.channel.send("❌ Please provide a valid URL (YouTube, SoundCloud, etc.)");
        }

        // Show loading message
        const loadingMsg = await msg.channel.send("🎵 Loading audio...");
        
        // Join voice channel with retry mechanism
        const connection = await joinVoiceChannelWithRetry(msg.member.voice.channel, msg, config.voice.maxRetries);
        
        if (!connection) {
            safeDeleteMessage(loadingMsg);
            return;
        }

        // Delete command message after successful connection
        safeDeleteMessage(msg);
        
        // Play audio
        await playAudio(connection, url, msg, loadingMsg);

    } catch (error) {
        console.error('Music command error:', error);
        msg.channel.send("❌ An unexpected error occurred while processing your request.");
    }
}

// Voice channel connection with retry and optimized settings
async function joinVoiceChannelWithRetry(voiceChannel, msg, maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempting to join voice channel (attempt ${attempt}/${maxRetries})`);
            
            // Use optimized connection settings for cloud environments
            const connection = await voiceChannel.join({
                timeout: config.voice.timeout,
                guildTimeout: config.voice.timeout
            });
            
            // Setup connection handlers
            connection.on('disconnect', () => {
                console.log('Voice connection disconnected');
            });
            
            connection.on('error', (error) => {
                console.error('Voice connection error:', error);
            });

            console.log('Successfully joined voice channel');
            return connection;
            
        } catch (error) {
            console.error(`Voice connection attempt ${attempt} failed:`, error);
            
            if (attempt === maxRetries) {
                if (error.code === 'VOICE_CONNECTION_TIMEOUT') {
                    msg.channel.send("❌ Voice connection timed out after multiple attempts. This is common in cloud environments - please try the command again.");
                } else {
                    msg.channel.send("❌ Failed to join voice channel. Check bot permissions and try again.");
                }
                return null;
            }
            
            // Progressive wait time (longer waits for later attempts)
            const waitTime = attempt * config.voice.retryBaseDelay;
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Audio playback handler
async function playAudio(connection, url, msg, loadingMsg) {
    try {
        let stream;
        
        // Handle different URL types
        if (isYouTubeUrl(url)) {
            stream = ytdl(url, {
                filter: "audioonly",
                opusEncoded: config.audio.opusEncoded,
                fmt: config.audio.format,
                quality: config.audio.quality,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            });
        } else {
            // For non-YouTube URLs, attempt direct streaming
            const fetch = require('node-fetch');
            const response = await fetch(url);
            stream = response.body;
        }

        const dispatcher = connection.play(stream, {
            type: 'unknown',
            volume: config.audio.volume,
            highWaterMark: 1
        });

        // Handle playback events
        dispatcher.on('start', () => {
            loadingMsg.edit("🎵 Now playing your audio!").then(playMsg => {
                safeDeleteMessage(playMsg, 4000);
            });
        });

        dispatcher.on('finish', () => {
            console.log('Audio finished playing');
            setTimeout(() => safeDisconnect(connection), 1000);
        });

        dispatcher.on('error', (error) => {
            console.error('Audio playback error:', error);
            safeDeleteMessage(loadingMsg);
            msg.channel.send("❌ Audio playback failed. The audio format may not be supported.");
            setTimeout(() => safeDisconnect(connection), 1000);
        });

        // Add error handling for the stream itself
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            safeDeleteMessage(loadingMsg);
            msg.channel.send("❌ Audio stream error. The source may be unavailable.");
            setTimeout(() => safeDisconnect(connection), 1000);
        });

    } catch (error) {
        console.error('Audio streaming error:', error);
        safeDeleteMessage(loadingMsg);
        msg.channel.send("❌ Failed to stream audio. The URL may be invalid or restricted.");
        setTimeout(() => safeDisconnect(connection), 1000);
    }
}

// Leave voice channel command
function handleLeaveCommand(msg) {
    // Delete the command message
    msg.delete().catch(() => {});
    
    if (!msg.member.voice.channel) {
        return msg.channel.send("❌ You're not in a voice channel.");
    }
    
    msg.member.voice.channel.leave();
    msg.channel.send("👋 Left the voice channel!").then(leaveMsg => {
        safeDeleteMessage(leaveMsg, 3000);
    });
}

module.exports = {
    handleMusicCommand,
    handleLeaveCommand
};
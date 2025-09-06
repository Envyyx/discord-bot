# MotionlessLittleDistributeddatabase

## Overview

This is a Discord bot built with Discord.js v12 that provides music playback, games, utilities, and social interaction features. The bot can join voice channels to play audio from YouTube and other sources, includes various mini-games like 8-ball and coin flip, offers moderation tools like message clearing, and provides utility functions including product weight calculations. The bot is designed to be hosted on a service like Replit with a keep-alive server to maintain uptime.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v12**: Core Discord API wrapper for bot functionality
- **Event-driven architecture**: Uses Discord.js event handlers for message processing and bot lifecycle management
- **Modular command structure**: Commands are organized into separate modules (music, games, utilities, social) for maintainability

### Command System
- **Prefix-based commands**: All commands use a `-` prefix (configurable in config)
- **Message content parsing**: Commands are processed by analyzing message content rather than using slash commands
- **Permission validation**: Certain commands like message clearing require appropriate Discord permissions

### Audio Processing
- **ytdl-core**: Primary library for YouTube audio streaming
- **Multiple audio backends**: Supports various audio sources beyond YouTube through different ytdl packages
- **Voice connection management**: Handles joining/leaving voice channels with retry mechanisms and error handling
- **Audio encoding**: Uses opus encoding for Discord voice transmission with configurable quality settings

### Utility Features
- **Product calculation system**: Custom business logic for calculating weights based on product types and quantities
- **Message moderation**: Bulk message deletion with permission checks and validation
- **Interactive games**: 8-ball, coin flip, dice roll, and rock-paper-scissors implementations

### Error Handling
- **Global exception handlers**: Prevents bot crashes from uncaught exceptions and unhandled rejections
- **Safe operation wrappers**: Helper functions for message deletion and voice disconnection that handle errors gracefully
- **Retry mechanisms**: Voice connection attempts include retry logic with configurable delays

### Configuration Management
- **Centralized config**: All bot settings stored in a single configuration module
- **Environment variables**: Discord token and sensitive data loaded from environment
- **Modular settings**: Separate configuration sections for different bot features (voice, audio, products)

## External Dependencies

### Discord Services
- **Discord API**: Core platform for bot operation through Discord.js library
- **Discord Voice**: Voice channel integration for audio playback functionality

### Audio Services
- **YouTube**: Primary audio source through ytdl-core integration
- **Multiple streaming sources**: Support for various audio platforms through different ytdl packages

### Infrastructure
- **Express.js server**: Keep-alive HTTP server to prevent hosting service timeouts
- **Node.js runtime**: JavaScript runtime environment for bot execution

### Development Tools
- **FFmpeg**: Audio processing and format conversion for Discord voice transmission
- **Opus codec**: Audio compression for efficient voice transmission

### Third-party Libraries
- **axios**: HTTP client for external API requests
- **discord-webhook-node**: Webhook functionality for enhanced messaging features
- **node-fetch**: Additional HTTP request capabilities for external integrations
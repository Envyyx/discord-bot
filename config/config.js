module.exports = {
    prefix: '-',
    activities: [
        'with pp',
        'with pp, very hard',
        'Warlocks >'
    ],
    
    // Product calculation settings
    products: {
        qtrs: { unit: 'trays', weightPerUnit: 10.77 },
        hb: { unit: 'trays', weightPerUnit: 10.36 },
        wedges: { unit: 'trays', weightPerUnit: 8.84 },
        spc: { unit: 'trays', weightPerUnit: 7 },
        // Default products use boxes
        bb: { unit: 'boxes', weightPerUnit: 11.5 },
        sc: { unit: 'boxes', weightPerUnit: 8.5 },
        mung: { unit: 'boxes', weightPerUnit: 11.76 },
        ed: { unit: 'boxes', weightPerUnit: 9.1 },
        cp: { unit: 'boxes', weightPerUnit: 11.52 },
        grp: { unit: 'boxes', weightPerUnit: 7.5 },
        rp: { unit: 'boxes', weightPerUnit: 7.5 },
        yp: { unit: 'boxes', weightPerUnit: 7.5 },
        csc: { unit: 'boxes', weightPerUnit: 8.5 },
        gl: { unit: 'boxes', weightPerUnit: 12 },
        o10: { unit: 'boxes', weightPerUnit: 8.5 },
        
    },

    // Voice connection settings
    voice: {
        timeout: 25000,
        maxRetries: 3,
        retryBaseDelay: 3000
    },

    // Audio settings
    audio: {
        volume: 0.7,
        quality: 'lowestaudio',
        opusEncoded: false,
        format: 'mp3'
    },

    // Moderation settings
    moderation: {
        enabled: true,
        logChannelName: 'mod-logs', // Channel name where flagged messages will be sent
        bannedWords: [
            // Add banned words here (case insensitive)
            'badword1',
            'badword2',
            'spam'
        ],
        bypassRoles: ['Admin', 'Moderator'] // Roles that bypass word filtering
    }
};
const config = require('../config/config');

// URL validation helpers
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}

// Safe connection disconnect
function safeDisconnect(connection) {
    try {
        if (connection && connection.voice && connection.voice.connection) {
            connection.disconnect();
        }
    } catch (error) {
        console.error('Error during disconnect:', error);
    }
}

// Product calculation helper
function calculateProduct(productName, quantity) {
    const product = config.products[productName.toLowerCase()] || config.products.default;
    const totalWeight = parseFloat((quantity * product.weightPerUnit).toFixed(2));
    return {
        product: productName,
        quantity: quantity,
        unit: product.unit,
        weightPerUnit: parseFloat(product.weightPerUnit.toFixed(2)),
        totalWeight: totalWeight
    };
}

// Message deletion with error handling
async function safeDeleteMessage(message, delay = 0) {
    try {
        if (delay > 0) {
            setTimeout(() => message.delete().catch(() => {}), delay);
        } else {
            await message.delete();
        }
    } catch (error) {
        // Ignore deletion errors
    }
}

// Generate random activity
function getRandomActivity() {
    const activities = config.activities;
    const index = Math.floor(Math.random() * activities.length);
    return activities[index];
}

module.exports = {
    isValidUrl,
    isYouTubeUrl,
    safeDisconnect,
    calculateProduct,
    safeDeleteMessage,
    getRandomActivity
};
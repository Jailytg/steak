const mineflayer = require('mineflayer');

let bots = [];
let registeredBots = new Set(); // Track which bots have registered
const PASSWORD = 'test123';

function generateBotName() {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
        suffix += charset[Math.floor(Math.random() * charset.length)];
    }
    return `C00lKidd${suffix}`;
}

function startBot(host, port, name = null) {
    const botName = name || generateBotName();

    const bot = mineflayer.createBot({
        host,
        port,
        username: botName,
        version: "1.12.2"
    });

    // Store the bot name explicitly so it’s always available later
    bot._botName = botName;

function startAdLoop(bot) {
    const baseMessage = 'WE ARE FORSAKEN!!!';
    let playerIndex = 0;

    setInterval(() => {
        const players = Object.keys(bot.players).filter(username =>
            username !== bot.username && !username.startsWith('C00lKidd')
        );

        if (players.length === 0) return;

        // Rotate through players
        const target = players[playerIndex % players.length];
        playerIndex++;

        // Add variation to message to bypass spam detection
        const randomSuffix = Math.random().toString(36).substring(2, 5);
        const message = `${baseMessage} [${randomSuffix}]`;

        bot.chat(`/msg ${target} ${message}`);
        bot.chat(`${message}`)
        console.log(`[~] Whispered to ${target}: ${message}`);
    }, 15000); // Wait 15 seconds between each whisper
}


    bot.once('login', () => {
        console.log(`[+] ${bot._botName} joined`);

        setTimeout(() => {
            if (registeredBots.has(bot._botName)) {
                console.log(`[+] ${bot._botName} attempting to login`);
                bot.chat(`/login ${PASSWORD}`);
               startAdLoop(bot)
            } else {
                console.log(`[+] ${bot._botName} attempting to register`);
                bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
            }
        }, 3000); // Wait for 3 seconds before sending /login or /register
    });

bot.on('kicked', (reason) => {
    console.log(`[!] ${bot._botName} was kicked: ${reason}`);

    if (!registeredBots.has(bot._botName)) {
        registeredBots.add(bot._botName);
        console.log(`[+] ${bot._botName} registered. Reconnecting in 5 seconds...`);
        setTimeout(() => {
            startBot(host, port, bot._botName);
        }, 5000);
    }
});


    bot.on('spawn', () => {
        // Wait 3s after spawn to ensure login finishes
        setTimeout(() => {
            if (registeredBots.has(bot._botName)) {
                bot.chat('/avn');
            }
        }, 3000);
    });

    // When window is opened, simulate clicking slot 13
    bot.on('windowOpen', (window) => {
        console.log(`[~] ${bot._botName} sees a window. Trying to click slot 13.`);
        const slot = window.slots[13];

        if (slot) {
            bot.simpleClick.leftMouse(13);
            console.log(`[✔] ${bot._botName} clicked the crystal at slot 13.`);
        } else {
            console.log(`[✖] Slot 13 was empty or undefined.`);
        }
    });

    bot.on('end', () => {
        console.log(`[-] ${bot._botName} disconnected`);
    });

    bot.on('error', (err) => {
        console.log(`[!] ${bot._botName} error:`, err.message);
    });

    bots.push(bot);
}

function spawnBots(server, amount) {
    const [host, portStr] = server.split(':');
    const port = portStr ? parseInt(portStr) : 25565;

    for (let i = 0; i < amount; i++) {
        setTimeout(() => {
            startBot(host, port);
        }, i * 300); // delay each bot slightly to avoid flooding
    }
}

function stopBots() {
    for (const bot of bots) {
        bot.quit('Disconnected by user');
    }
    bots = [];
}

module.exports = {
    spawnBots,
    stopBots
};

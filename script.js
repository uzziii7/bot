const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const token = '7196223885:AAHcyEMgX-YiXnlmQRvXK8s0etjvC7ppMfk';
const bot = new TelegramBot(token, { polling: true });

let userResources = {};

app.use(express.static('public'));
app.use(bodyParser.json());

// Endpoint to handle coin earning from the web UI
app.post('/earn', (req, res) => {
    const userId = req.body.userId;
    const coinsEarned = 10; // Example coin amount

    // Update the user's resources
    if (!userResources[userId]) {
        userResources[userId] = { gold: 0, silver: 0, iron: 0, coins: 0 };
    }
    userResources[userId].coins += coinsEarned;

    // Send a message to the user's Telegram
    bot.sendMessage(userId, `You earned ${coinsEarned} coins! Your total is now ${userResources[userId].coins} coins.`);

    res.json({ message: 'Coins earned!', coins: userResources[userId].coins });
});

// Telegram bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to MiniWarriors! Let the battles begin!");
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Commands:\n/start - Start the game\n/fight - Engage in a battle\n/stats - Check your stats\n/mine - Start mining\n/profile - View your profile\n/shop - View shop items\n/equip [item] - Equip an item\n/quests - View available quests\n/daily - Claim your daily reward\n/leaderboard - View top players\n/settings - Adjust your settings");
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.chat.id;
    const resources = userResources[userId] || { gold: 0, silver: 0, iron: 0, coins: 0 };
    bot.sendMessage(chatId, `Your stats:\nGold: ${resources.gold}\nSilver: ${resources.silver}\nIron: ${resources.iron}\nCoins: ${resources.coins}`);
});

bot.onText(/\/profile/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Profile:\nName: John Doe\nLevel: 1\nXP: 100\nWins: 2\nLosses: 1");
});

// Mining command with inline keyboard
bot.onText(/\/mine/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "You are in the mining area. Choose an action:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Start Mining", callback_data: 'start_mining' }],
                [{ text: "Check Resources", callback_data: 'check_resources' }],
                [{ text: "Leave", callback_data: 'leave_mining' }]
            ]
        }
    });
});

// Handle inline keyboard actions for mining
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const action = callbackQuery.data;
    const userId = message.chat.id;

    if (action === 'start_mining') {
        bot.sendMessage(userId, "Mining started... ⛏️");

        setTimeout(() => {
            if (!userResources[userId]) {
                userResources[userId] = { gold: 0, silver: 0, iron: 0, coins: 0 };
            }
            userResources[userId].gold += Math.floor(Math.random() * 3);
            userResources[userId].silver += Math.floor(Math.random() * 2);
            userResources[userId].iron += 1;

            bot.sendMessage(userId, `You mined some resources!\nGold: ${userResources[userId].gold}\nSilver: ${userResources[userId].silver}\nIron: ${userResources[userId].iron}`);
        }, 3000); // Mining takes 3 seconds
    }

    if (action === 'check_resources') {
        const resources = userResources[userId] || { gold: 0, silver: 0, iron: 0, coins: 0 };
        bot.sendMessage(userId, `You have:\nGold: ${resources.gold}\nSilver: ${resources.silver}\nIron: ${resources.iron}\nCoins: ${resources.coins}`);
    }

    if (action === 'leave_mining') {
        bot.sendMessage(userId, "You have left the mining area.");
    }

    bot.answerCallbackQuery(callbackQuery.id); // Acknowledge the callback query
});

// Start the web server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

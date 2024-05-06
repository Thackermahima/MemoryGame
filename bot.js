const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_API;
const bot = new TelegramBot(token, { polling: true });

const games = {};

function initializeGame(chatId) {
    const emojis = ["🔥", "🔥", "😎", "😎", "😸", "😸", "🍔", "🍔", "🍟", "🍟", "🍪", "🍪", "❤️", "❤️", "🚀", "🚀"];
    emojis.sort(() => 0.5 - Math.random());  // Shuffle emojis
    const gameData = {
        board: emojis,
        selections: [],
        matchedPairs: []
    };
    games[chatId] = gameData;
    return gameData;
}

function generateKeyboard(gameData, chatId) {
    let keyboard = [];
    let row = [];

    gameData.board.forEach((emoji, index) => {
        let displayEmoji = "◼️";
        if (gameData.matchedPairs.includes(index) || gameData.selections.includes(index)) {
            displayEmoji = emoji;
        }
        row.push({ text: displayEmoji, callback_data: 'select_' + index });

        if (row.length === 4) {
            keyboard.push(row);
            row = []; // Start a new row
        }
    });

    if (row.length > 0) {
        keyboard.push(row);
    }

    // Add a reset button at the bottom
    keyboard.push([{ text: "Reset Game", callback_data: 'reset_game' }]);
    return { inline_keyboard: keyboard };
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    initializeGame(chatId);
    bot.sendMessage(chatId, 'Memory Game started! Select two tiles.', {
        reply_markup: generateKeyboard(games[chatId], chatId)
    });
});

bot.on('callback_query', (callbackQuery) => {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const index = parseInt(action.split('_')[1]);

    if (action === 'reset_game') {
        initializeGame(chatId);
        bot.editMessageText('Memory Game restarted! Select two tiles.', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: generateKeyboard(games[chatId], chatId)
        });
        return;
    }

    const gameData = games[chatId];
    if (gameData.selections.length < 2 && !gameData.selections.includes(index)) {
        gameData.selections.push(index);

        if (gameData.selections.length === 2) {
            const [firstIndex, secondIndex] = gameData.selections;
            if (gameData.board[firstIndex] === gameData.board[secondIndex]) {
                gameData.matchedPairs.push(firstIndex, secondIndex);
                gameData.selections = [];
                console.log(gameData.board.length);
                if (gameData.matchedPairs.length  === gameData.board.length) {
                    setTimeout(() => {
                        bot.sendMessage(chatId, 'Congratulations! You have matched all pairs!');
                    }, 500);  // Delay the message slightly to let the user see the final match
                }
            } else {
                setTimeout(() => {
                    gameData.selections = [];
                    bot.editMessageReplyMarkup({
                        inline_keyboard: generateKeyboard(gameData, chatId).inline_keyboard
                    }, {
                        chat_id: chatId,
                        message_id: msg.message_id
                    });
                }, 500);
            }
        }

        bot.editMessageReplyMarkup({
            inline_keyboard: generateKeyboard(gameData, chatId).inline_keyboard
        }, {
            chat_id: chatId,
            message_id: msg.message_id
        });
    }
});

bot.on('polling_error', (error) => {
    console.log('Polling error:', error);
});
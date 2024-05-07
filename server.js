const express = require('express');
const bodyParser = require('body-parser');
const gameManager = require('./gameManager');
const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serves your index.html and static files

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use(express.static(__dirname));

// Optionally set up body-parser for JSON
app.use(bodyParser.json());

// Route to ensure index.html is served from the correct location
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname));  // Adjust path based on your directory structure
});

// API to start a new game
app.post('/api/start', (req, res) => {
    try {
        let gameId = new Date().getTime().toString(); // Example way to generate a unique ID
        let game = gameManager.initializeGame(gameId);
        if (!game) throw new Error("Failed to initialize game");
        res.json({ gameId, ...game });  // Include gameId in the response
    } catch (error) {
        console.error("Failed to start game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.post('/api/move', (req, res) => {
    const { gameId, index } = req.body;
    try {
        let game = gameManager.makeMove(gameId, index);
        if (!game) throw new Error("Invalid move or game session expired");
        res.json(game);
    } catch (error) {
        console.error("Error processing move:", error.message);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

const token = process.env.TELEGRAM_BOT_API; // Make sure this is defined in your .env file

const bot = new TelegramBot(token, { polling: true });

// Bot event handlers
bot.onText(/\/start/, (msg) => {
    console.log("Received /start command from user:", msg.from.id);
    const chatId = msg.chat.id.toString();
    let game = gameManager.initializeGame(chatId);
    console.log(game);
    bot.sendMessage(chatId, 'Memory Game started! Select two tiles.', {
                reply_markup: generateKeyboard(game[chatId], chatId)
            });
});


bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id.toString();
    const index = parseInt(callbackQuery.data.split('_')[1]);
    if (isNaN(index)) {
        if (callbackQuery.data === 'reset_game') {
            let game = gameManager.initializeGame(chatId);
            let keyboard = generateKeyboard(game, chatId);
            bot.sendMessage(chatId, "Game started! Select two tiles.", {
                reply_markup: generateKeyboard(game, chatId)
            });
            
        }
    } else {
        const gameData = gameManager.makeMove(chatId, index);
        console.log(gameData, "gameData");
        if (gameData.isGameOver) {
            console.log(gameData.isGameOver, "GameData.isGameOver");
            bot.sendMessage(chatId, "Congratulations! You have matched all pairs!");
        } else {
            let keyboard = generateKeyboard(gameData, chatId);
            console.log(keyboard, "keyboard");
            bot.editMessageText("Updated game state", {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id,
                reply_markup: { inline_keyboard: keyboard }
            });
        }
    }
});

function generateKeyboard(gameData, chatId) {
    let keyboard = [];
    let row = [];

    gameData.board.forEach((emoji, index) => {
        let displayEmoji = gameData.matchedPairs.includes(index) || gameData.selections.includes(index) ? emoji : "◼️";
        
        // Append current tile to the row
        row.push({ text: displayEmoji, callback_data: `select_${index}` });

        // If row has 4 tiles, push it to the keyboard and reset the row
        if (row.length === 4) {
            keyboard.push(row);
            row = [];
        }
    });

    // If there's an incomplete row, add it to the keyboard
    if (row.length > 0) {
        keyboard.push(row);
    }

    // Add a reset button on a new line
    keyboard.push([{ text: "Reset Game", callback_data: 'reset_game' }]);

    console.log("Generated Keyboard:", JSON.stringify(keyboard));
    return { inline_keyboard: keyboard };
}





    bot.on('polling_error', (error) => {
         console.log('Polling error:', error);
     });
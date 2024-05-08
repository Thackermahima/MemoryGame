const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const gameManager = require('./gameManager');
const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use(express.static(__dirname));

// Optionally set up body-parser for JSON
app.use(bodyParser.json());

// Route to ensure index.html is served from the correct location
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,  'Index.html'));
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

// const token = process.env.TELEGRAM_BOT_API; 

// const bot = new TelegramBot(token, { polling: true });

const { Telegraf } = require("telegraf");
const TOKEN = process.env.TELEGRAM_BOT_API;
const bot = new Telegraf(TOKEN);

const web_link = "";

bot.start((ctx) =>
  ctx.reply("Welcome..!!!!!!!!", {
    reply_markup: {
      keyboard: [[{ text: "web app", web_app: { url: web_link } }]],
    },
  })
);

bot.launch();
// Bot event handlers
// bot.onText(/\/start/, (msg) => {
//     console.log("Received /start command from user:", msg.from.id);
//     const chatId = msg.chat.id.toString();
//     let game = gameManager.initializeGame(chatId);
//     console.log(game, "game");
//     console.log(game[chatId], "game[chatId]");
//     bot.sendMessage(chatId, 'Memory Game started! Select two tiles.', {
//                 reply_markup: generateKeyboard(game, chatId)
//             });
// });

// bot.on('callback_query', (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id.toString();
//     const msg = callbackQuery.message;
//     const index = parseInt(callbackQuery.data.split('_')[1]);

//     if (!isNaN(index)) {
//         const gameData = gameManager.makeMove(chatId, index);

//         if (gameData.isGameOver) {
//              // First update the keyboard with the final matched pair
//              const keyboard = generateKeyboard(gameData, chatId);
//              bot.editMessageReplyMarkup({ inline_keyboard: keyboard.inline_keyboard }, {
//                  chat_id: chatId,
//                  message_id:  msg.message_id
//              }).then(() => {
//                  // Delay the congratulations message to let the user see the matched pair
//                  setTimeout(() => {
//                      bot.sendMessage(chatId, "Congratulations! You have matched all pairs!");
//                  }, 500);  // Adjust delay as needed
//              });
//         } else if (gameData.resetNeeded) {
//             // Update with selected tiles first
//             let tempKeyboard = generateKeyboard({ ...gameData, selections: gameData.selections }, chatId);
//             bot.editMessageReplyMarkup({ inline_keyboard: tempKeyboard.inline_keyboard }, {
//                 chat_id: chatId,
//                 message_id: msg.message_id
//             }).then(() => {
//                 // After a brief delay, reset the view
//                                     setTimeout(() => {
//                                         gameData.selections = [];
//                                         bot.editMessageReplyMarkup({
//                                             inline_keyboard: generateKeyboard(gameData, chatId).inline_keyboard
//                                         }, {
//                                             chat_id: chatId,
//                                             message_id: msg.message_id
//                                         });
//                                     }, 300);
                                
//             });
//         } else {
//             bot.editMessageReplyMarkup({
//                             inline_keyboard: generateKeyboard(gameData, chatId).inline_keyboard
//                         }, {
//                             chat_id: chatId,
//                             message_id: msg.message_id
//                         });
                    
//         }
//     } else if (callbackQuery.data === 'reset_game') {
//         const gameData = gameManager.initializeGame(chatId);  // Reset the game
//         const keyboard = generateKeyboard(gameData, chatId);
//         bot.editMessageText("Game restarted! Select two tiles.", {
//             chat_id: chatId,
//             message_id: msg.message_id,
//             reply_markup: { inline_keyboard: keyboard.inline_keyboard }
//         });
//     }
// });



// function generateKeyboard(gameData, chatId) {
//     let keyboard = [];
//     let row = [];

//     gameData.board.forEach((emoji, index) => {
//         let displayEmoji = "◼️";
//         if (gameData.matchedPairs.includes(index) || gameData.selections.includes(index)) {
//             displayEmoji = emoji;
//         }
//         row.push({ text: displayEmoji, callback_data: 'select_' + index });

//         if (row.length === 4) {
//             keyboard.push(row);
//             row = []; // Start a new row
//         }
//     });

//     if (row.length > 0) {
//         keyboard.push(row);
//     }

//     // Add a reset button at the bottom
//     keyboard.push([{ text: "Reset Game", callback_data: 'reset_game' }]);
//     return { inline_keyboard: keyboard };
// }





//     bot.on('polling_error', (error) => {
//          console.log('Polling error:', error);
//      });
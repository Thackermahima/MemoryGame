const express = require('express');
const bodyParser = require('body-parser');
const gameManager = require('./gameManager');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serves your index.html and static files

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// API to start a new game
app.post('/api/start', (req, res) => {
    let game = gameManager.initializeGame(new Date().getTime().toString());
    res.json(game);
});

// API to handle a move
app.post('/api/move', (req, res) => {
    const { gameId, index } = req.body;
    let game = gameManager.makeMove(gameId, index);
    res.json(game);
});

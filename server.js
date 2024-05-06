const express = require('express');
const bodyParser = require('body-parser');
const gameManager = require('./gameManager');

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

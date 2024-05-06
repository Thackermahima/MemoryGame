const games = {};

function initializeGame(gameId) {
    const emojis = ["🔥", "🔥", "😎", "😎", "😸", "😸", "🍔", "🍔", "🍟", "🍟", "🍪", "🍪", "❤️", "❤️", "🚀", "🚀"];
    emojis.sort(() => Math.random() - 0.5);
    games[gameId] = { board: emojis, selections: [], matchedPairs: [] };
    return games[gameId];
}

function getGame(gameId) {
    return games[gameId];
}

function makeMove(gameId, index) {
    let game = games[gameId];
    if (!game) return null;

    // Check if the tile at the index has already been matched
    if (game.matchedPairs.includes(index)) {
        return game; // Already matched, nothing to do
    }

    // Adding the index to selections if it's not already added
    if (!game.selections.includes(index)) {
        game.selections.push(index);
    }

    // Check if two tiles are selected
    if (game.selections.length == 2) {
        const [firstIndex, secondIndex] = game.selections;

        // Check if the two selected tiles match
        if (game.board[firstIndex] === game.board[secondIndex]) {
            // Add to matched pairs
            game.matchedPairs.push(firstIndex, secondIndex);

            // Clear selections for next moves
            game.selections = [];
        } else {
            // If they don't match, clear selections after a short delay
            // In a backend scenario, you might handle this delay in the frontend or simply reset immediately
            game.selections = [];
        }
    }

    // Check if the game is over (all pairs are matched)
    if (game.matchedPairs.length === game.board.length / 2) {
        game.isGameOver = true;
    }

    return game;
}

module.exports = { initializeGame, getGame, makeMove };

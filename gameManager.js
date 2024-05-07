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

function getGame(gameId) {
    return games[gameId];
}

function makeMove(gameId, index) {
    let game = games[gameId];
    console.log(game, "game");
    if (!game) return null;

    let lastMoveMatched = false; // Flag to indicate if the last move was a match

    if (game.matchedPairs.includes(index)) {
        return game; // Already matched, nothing to do
    }

    if (!game.selections.includes(index)) {
        game.selections.push(index);
    }

    if (game.selections.length == 2) {
        const [firstIndex, secondIndex] = game.selections;

        if (game.board[firstIndex] === game.board[secondIndex]) {
            game.matchedPairs.push(firstIndex, secondIndex);
            lastMoveMatched = true;
        }
        game.selections = [];
    }

    if (game.matchedPairs.length === game.board.length / 2) {
        game.isGameOver = true;
    }

    return { ...game, lastMoveMatched };
}


module.exports = { initializeGame, getGame, makeMove };

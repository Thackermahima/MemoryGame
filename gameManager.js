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
    if (!game) {
        return { error: "Game not found" };
    }

    // Prevent flipping the same card twice or flipping already matched cards.
    if (game.matchedPairs.includes(index) || game.selections.includes(index)) {
        return { ...game, lastMoveMatched: false, moveAllowed: false };
    }

    game.selections.push(index);

    // Check if two tiles are selected
    if (game.selections.length === 2) {
        const [firstIndex, secondIndex] = game.selections;

        // Check if the selected tiles match
        if (game.board[firstIndex] === game.board[secondIndex]) {
            game.matchedPairs.push(firstIndex, secondIndex);
            game.selections = [];
            console.log(game.matchedPairs.length, "game.matchedPairs.length");
            console.log(game.board.length, "game.board.length");
            if (game.matchedPairs.length  === game.board.length) {
                return { ...game, lastMoveMatched: true, selections: [], isGameOver: true };
            }
        return { ...game, lastMoveMatched: true, selections: [] };
        } else {
            let tempSelections = [...game.selections]; 
            game.selections = [];
            // Return state with selections to show user, then clear
            return { ...game, lastMoveMatched: false, selections: tempSelections, resetNeeded: true };
        }
    }

    // Return the game state if only one tile is flipped or if no action is needed
    return { ...game, lastMoveMatched: false, moveAllowed: true };
}



module.exports = { initializeGame, getGame, makeMove };

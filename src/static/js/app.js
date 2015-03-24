var Game = require('./game'),
    GameView = require('./gameView'),
    Preview = require('./preview');

var game = new Game.Game(),
    view = new GameView(game),
    preview = new Preview(game);

var dts = document.getElementsByTagName('dt');
dts[2].innerText = game.startingLevel;
game.addListener('shape_landed', function(lines) {
    if (lines.length) {
        dts[0].innerText = game.score;
        dts[1].innerText = game.nLinesDestroyed;
        dts[2].innerText = game.level;
    }
}).addListener('game_over', function() {
    alert('Game Over');
});

game.start();
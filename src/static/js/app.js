var Game = require('./game'),
    GameView = require('./gameView');

var game = new Game.Game(),
    view = new GameView(game);
game.start();
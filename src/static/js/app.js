var $ = require('jquery'),
    Game = require('./game'),
    GameView = require('./gameView');

var game = new Game.Game();
console.log(game);

var view = new GameView(game);
game.start();
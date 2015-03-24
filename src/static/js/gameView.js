var PIXI = require('pixi.js'),
    BlockGraphics = require('./blockGraphics'),
    _ = require('lodash'),
    animate = require('./animate');

global.BLOCK_WIDTH = 20;

var GameView = function(game) {
    this.game = game;
    this.stage = null;
    this.shape = null;
    this.init();
    this._bindEvent();
};

GameView.prototype = {
    constructor: GameView,

    init: function() {
        var renderer = new PIXI.WebGLRenderer(this.game.width * BLOCK_WIDTH, this.game.height * BLOCK_WIDTH);
        document.querySelector('.view').appendChild(renderer.view);

        var stage = this.stage = new PIXI.Stage();

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(stage);
        }
        animate();
    },

    _bindEvent: function() {
        var self = this;
        this.game
            .addListener('shape_added', this._addShape.bind(this))
            .addListener('shape_dropped', this._shapeDropped.bind(this))
            .addListener('shape_moved', this._shapeMoved.bind(this))
            .addListener('shape_rotated', this._shapeRotated.bind(this))
            .addListener('shape_landed', this._shapeLanded.bind(this))
        window.addEventListener('keydown', function(e) {
            switch (e.keyCode) {
                case 37: // left
                    self.game.moveLeft();
                    break;
                case 38: // top
                    self.game.rotateLeft();
                    break;
                case 39: // right
                    self.game.moveRight();
                    break;
                case 40: // down
                    self.game.moveDown(true);
                    break;
                case 32: // space
                    self.game.drop();
                    break;
                case 13: // enter
                    self.game.pause = !self.game.pause;
                    break;
            }
        }, false);
        window.addEventListener('keyup', function(e) {
            if (e.keyCode === 40) {
                self.game.moveDown(false);
            }
        }, false)
    },

    _addShape: function() {
        var shape = this.shape = new PIXI.DisplayObjectContainer();
        this.stage.addChild(shape);
        shape.x = this.game.shape.x * BLOCK_WIDTH;
        shape.y = this.game.shape.y * BLOCK_WIDTH;
        this.game.shape.blocks.forEach(function(block) {
            var blockGraphics = new BlockGraphics(block.color);
            shape.addChild(blockGraphics);
            blockGraphics.x = block.x * BLOCK_WIDTH;
            blockGraphics.y = block.y * BLOCK_WIDTH;
            block.graphics = blockGraphics;
        }, this);
    },

    _shapeDropped: function() {
        (function(shape, y) {
            var start = shape.y,
                end = y * BLOCK_WIDTH;
            animate(function(percent) {
                shape.y = start + (end - start) * percent;
            }, 60, 'easeInQuad')
        })(this.shape, this.game.shape.y);
    },

    _shapeMoved: function() {
        var shape = this.shape,
            start = shape.x,
            end = this.game.shape.x * BLOCK_WIDTH;
        animate(function(percent) {
            shape.x = start + (end - start) * percent;
        }, 60, 'easeInQuad')
    },

    _shapeRotated: function() {
        this.game.shape.blocks.forEach(function(block) {
            block.graphics.x = block.x * BLOCK_WIDTH;
            block.graphics.y = block.y * BLOCK_WIDTH;
        });
    },

    _shapeLanded: function(lines, lineBlocks) {
        this.shape.removeChildren();
        this.shape = null;

        this.game.shape.blocks.forEach(function(block) {
            block.graphics.x = block.x * BLOCK_WIDTH;
            block.graphics.y = block.y * BLOCK_WIDTH;
            this.stage.addChild(block.graphics)
        }, this);

        lineBlocks.forEach(function(block) {
            block.graphics.pivot = new PIXI.Point(2, 2);
            animate(function(percent) {
                block.graphics.alpha = 1 + (0 - 1) * percent;
                block.graphics.scale = new PIXI.Point(1 + (2 - 1) * percent, 1 + (2 - 1) * percent);
            }, 500, 'easeInQuint', function() {
                block.graphics = null;
            });
        });

        if (lines.length) {
            for (var x = 0; x < this.game.width; x++) {
                for (var y = 0; y < this.game.height; y++) {
                    var block = this.game.blocks[x][y];
                    if (block) {
                        animate((function(block) {
                            var start = block.graphics.y,
                                end = block.y * BLOCK_WIDTH;
                            return function(percent) {
                                block.graphics.y = start + (end - start) * percent;
                            }
                        })(block), 500, 'easeInBounce');
                    }
                }
            }
        }
    }
};

module.exports = GameView;
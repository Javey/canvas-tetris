var PIXI = require('pixi.js'),
    _ = require('lodash'),
    easing = require('./easing');

var BLOCK_WIDTH = 20;

var animate = function(func, duration, ease, callback) {
    if (_.isFunction(ease)) {
        callback = ease;
        ease = 'linear';
    } else if (_.isEmpty(ease)) {
        ease = 'linear';
    }
    var start = Date.now();
    var tick = function() {
        var remain = Math.max(0, start + duration - Date.now()),
            percent = 1 - easing[ease](remain / duration);
        func(percent);
        if (percent !== 1) {
            requestAnimationFrame(tick);
        } else {
            callback && callback();
        }
    };
    tick();
};

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
        document.body.appendChild(renderer.view);

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
            .addListener('add_shape', this._addShape.bind(this))
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

var BlockGraphics = function(color) {
    PIXI.Graphics.call(this);
    this.color = color;
    this.draw();
};
BlockGraphics.prototype = Object.create(PIXI.Graphics.prototype);
BlockGraphics.prototype.constructor = BlockGraphics;
BlockGraphics.prototype.draw = function() {
    this.clear();

    var colors = [
        0.780392156863, 0.247058823529, 0.247058823529,
        0.713725490196, 0.192156862745, 0.192156862745,
        0.61568627451, 0.164705882353, 0.164705882353, /* red */

        0.552941176471, 0.788235294118, 0.32549019607,
        0.474509803922, 0.713725490196, 0.243137254902,
        0.388235294118, 0.596078431373, 0.18431372549, /* green */

        0.313725490196, 0.450980392157, 0.623529411765,
        0.239215686275, 0.345098039216, 0.474509803922,
        0.21568627451, 0.313725490196, 0.435294117647, /* blue */

        1.0, 1.0, 1.0,
        0.909803921569, 0.909803921569, 0.898039215686,
        0.701960784314, 0.701960784314, 0.670588235294, /* white */

        0.945098039216, 0.878431372549, 0.321568627451,
        0.929411764706, 0.839215686275, 0.113725490196,
        0.760784313725, 0.682352941176, 0.0274509803922, /* yellow */

        0.576470588235, 0.364705882353, 0.607843137255,
        0.443137254902, 0.282352941176, 0.46666666666,
        0.439215686275, 0.266666666667, 0.46666666666, /* purple */

        0.890196078431, 0.572549019608, 0.258823529412,
        0.803921568627, 0.450980392157, 0.101960784314,
        0.690196078431, 0.388235294118, 0.0901960784314, /* orange */

        0.392156862745, 0.392156862745, 0.392156862745,
        0.262745098039, 0.262745098039, 0.262745098039,
        0.21568627451, 0.235294117647, 0.23921568627 /* grey */
    ];
    var toRgb = function(arr) {
        return 'rgb(' + [Math.floor(arr[0] * 255), Math.floor(arr[1] * 255), Math.floor(arr[2] * 255)].join(', ') + ')';
    };
    var toHex = function(arr) {
        return '0x' + ((Math.floor(arr[0] * 255) << 16) + (Math.floor(arr[1] * 255) << 8) + Math.floor(arr[2] * 255)).toString(16);
    };
    /* Layout the block */
    this.beginFill(toHex([colors[this.color * 9 + 6], colors[this.color * 9 + 7], colors[this.color * 9 + 8]]));
    this.drawRoundedRect(0 /*this.color * BLOCK_WIDTH*/, 0 /*this.color * BLOCK_WIDTH*/, BLOCK_WIDTH, BLOCK_WIDTH, 3);

    var canvas = document.createElement('canvas');
    canvas.width = BLOCK_WIDTH - 1;
    canvas.height = BLOCK_WIDTH - 1;
    var ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, toRgb([colors[this.color * 9], colors[this.color * 9 + 1], colors[this.color * 9 + 2]]));
    gradient.addColorStop(1, toRgb([colors[this.color * 9 + 3], colors[this.color * 9 + 4], colors[this.color * 9 + 5]]));
    ctx.fillStyle = gradient;
    ctx.fillRect(1, 1, canvas.width, canvas.height);

    var texture = PIXI.Texture.fromCanvas(canvas),
        sprite = new PIXI.Sprite(texture);
    //sprite.x = this.color * BLOCK_WIDTH;
    //sprite.y = this.color * BLOCK_WIDTH;
    this.addChild(sprite);
};
BlockGraphics.prototype.explode = function() {

};

module.exports = GameView;
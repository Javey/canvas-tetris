var PIXI = require('pixi.js'),
    BlockGraphics = require('./blockGraphics'),
    animate = require('./animate');

var Preview = function(game) {
    this.game = game;
    this.renderer = null;
    this.stage = null;
    this.shape = null;
    this.init();
    this._bindEvent();
};
Preview.prototype = {
    constructor: Preview,

    init: function() {
        var renderer = this.renderer = new PIXI.WebGLRenderer(5 * BLOCK_WIDTH, 5 * BLOCK_WIDTH);
        document.querySelector('.preview').appendChild(renderer.view);

        var stage = this.stage = new PIXI.Stage();

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(stage);
        }
        animate();
    },

    _bindEvent: function() {
        this.game.addListener('shape_added', this._updateBlock.bind(this))
    },

    _updateBlock: function() {
        if (this.shape) {
            this.shape.removeChildren();
            this.shape = null;
        }
        this.shape = new PIXI.DisplayObjectContainer();
        this.stage.addChild(this.shape);

        var minWidth = 4,
            maxWidth = 0,
            minHeight = 4,
            maxHeight = 0;
        this.game.nextShape.blocks.forEach(function(b) {
            minWidth = Math.min(b.x, minWidth);
            maxWidth = Math.max(b.x + 1, maxWidth);
            minHeight = Math.min(b.y, minHeight);
            maxHeight = Math.max(b.y + 1, maxHeight);

            var graphics = new BlockGraphics(b.color);
            graphics.x = b.x * BLOCK_WIDTH;
            graphics.y = b.y * BLOCK_WIDTH;
            this.shape.addChild(graphics);
        }, this);

        var x = (this.renderer.width - (minWidth + maxWidth) * BLOCK_WIDTH) / 2,
            y = (this.renderer.height - (minHeight + maxHeight) * BLOCK_WIDTH) / 2,
            width = maxWidth * BLOCK_WIDTH,
            height = maxHeight * BLOCK_WIDTH;
        this.shape.x = x;
        this.shape.y = y;
        var factor = 0.6;
        this.shape.position.x =  x * factor - (width / 2 + x) * (factor - 1);
        this.shape.position.y =  y * factor - (height / 2 + y) * (factor - 1);
        this.shape.scale = new PIXI.Point(factor, factor);
        var shape = this.shape;
        animate(function(percent) {
            var factor = 0.6 + (1 - 0.6) * percent;
            shape.scale = new PIXI.Point(factor, factor);
            shape.position.x = x * factor - (width / 2 + x) * (factor - 1);
            shape.position.y = y * factor - (height / 2 + y) * (factor - 1);
        }, 300, 'easeInQuint');
    }
};

module.exports = Preview;
var _ = require('lodash'),
    EventEmitter = require('eventEmitter');

global.NCOLORS = 8;

var blockTable = [
        /* *** */
        /* *   */
        0, 0, 0, 0,
        1, 1, 1, 0,
        1, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,

        0, 0, 1, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,

        1, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        /* *** */
        /*   * */
        0, 0, 0, 0,
        1, 1, 1, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,

        0, 1, 1, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        1, 0, 0, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 0, 0,
        1, 1, 0, 0,
        0, 0, 0, 0,

        /* *** */
        /*  *  */
        0, 0, 0, 0,
        1, 1, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        1, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        1, 1, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        /*  ** */
        /* **  */

        0, 0, 0, 0,
        0, 1, 1, 0,
        1, 1, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 1, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,

        0, 1, 1, 0,
        1, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,

        1, 0, 0, 0,
        1, 1, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        /* **  */
        /*  ** */

        0, 0, 0, 0,
        1, 1, 0, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,

        0, 0, 1, 0,
        0, 1, 1, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,

        1, 1, 0, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        1, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 0, 0,

        /* **** */
        0, 0, 0, 0,
        1, 1, 1, 1,
        0, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,

        0, 0, 0, 0,
        1, 1, 1, 1,
        0, 0, 0, 0,
        0, 0, 0, 0,

        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,

        /* ** */
        /* ** */
        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,

        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,

        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0,

        0, 0, 0, 0,
        0, 1, 1, 0,
        0, 1, 1, 0,
        0, 0, 0, 0
    ];

var Block = function(x, y, color) {
    this.x  = x;
    this.y = y;
    this.color = color
};
Block.prototype.copy = function() {
    return new Block(this.x, this.y, this.color);
};

var Shape = function(x, y, rotation, type, blocks) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.type = type;
    this.blocks = blocks || [];
};
Shape.prototype.copy = function() {
    var s = new Shape(this.x, this.y, this.rotation, this.type);
    _.each(this.blocks, function(block) {
        s.blocks.push(block.copy());
    });
    return s;
};

var Game = function(options) {
    this.shape = null;
    this.nextShape = null;
    this.blocks = [];

    this.__defineGetter__('width', function() {
        return this.blocks.length;
    });
    this.__defineGetter__('height', function() {
        return this.blocks[0] ? this.blocks[0].length : 0;
    });

    this.nLinesDestroyed = 0;
    this.score = 0;
    this.startingLevel = 1;
    this.__defineGetter__('level', function() {
        return this.startingLevel + this.nLinesDestroyed / 10;
    });

    this._hasStarted = false;
    this._paused = false;
    this.__defineGetter__('pause', function() {
        return this._paused;
    });
    this.__defineSetter__('pause', function(value) {
        this._paused = value;
        if (this._hasStarted) {
            console.log('started');
        }
        console.log('pause')
    });

    this.__defineGetter__('shadowY', function() {
        if (!this.shape) return 0;
        //var d = 0,
        //    g = thiscopy()
        console.log('shadowY');
    });

    this.gameOver = false;

    this.init(options);
};

Game.prototype = Object.create(EventEmitter.prototype);
_.extend(Game.prototype, {
    constructor: Game,

    init: function(options) {
        options = _.defaults({
            lines: 20,
            columns: 14,
            filledLines: 0,
            fillProb: 5
        }, options);
        this.blocks = new Array(options.columns);
        for (var x = 0; x < options.columns; x++) {
            this.blocks[x] = new Array(options.lines);
            var blank = _.random(0, options.columns);
            for (var y = 0; y < options.lines; y++) {
                //console.log(y >= (options.lines - options.filledLines))
                //if (y >= (options.lines - options.filledLines) && x !== blank && _.random(0, 10) < options.fillProb) {
                    this.blocks[x][y] = new Block(x, y, _.random(0, NCOLORS - 1));
                //} else {
                //    this.blocks[x][y] = null;
                //}
            }
        }
        this.nextShape = this.pickRandomShape();
    },

    start: function() {
        this._hasStarted = true;
        this.addShape();
    },

    addShape: function() {
        this.shape = this.nextShape.copy();
        this.nextShape = this.pickRandomShape();

        this.emit('add_shape');
    },

    pickRandomShape: function() {
        return this.makeShape(_.random(0, NCOLORS - 1), _.random(0, 4));
    },

    makeShape: function(type, rotation) {
        var shape = new Shape();
        shape.type = type;
        shape.rotation = rotation;

        var offset = shape.type * 64 + shape.rotation * 16,
            minWidth = 4,
            maxWidth = 0,
            minHeight = 4,
            maxHeight = 0;
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                if (blockTable[offset + y * 4 + x] === 0) {
                    continue;
                }
                minWidth = Math.min(x, minWidth);
                maxWidth = Math.max(x + 1, maxWidth);
                minHeight = Math.min(y, minHeight);
                maxHeight = Math.min(y + 1, maxHeight);

                var b = new Block(x, y, type);
                shape.blocks.push(b);
            }
        }
        var blockWidth = maxWidth - minWidth;
        shape.x = Math.floor((this.width - blockWidth) / 2) - minWidth;
        shape.y = -minHeight;

        return shape;
    }
});

module.exports = {
    Game: Game
};
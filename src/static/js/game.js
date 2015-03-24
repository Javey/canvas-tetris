var _ = require('lodash'),
    EventEmitter = require('eventEmitter');

global.NCOLORS = 7;

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
    this.x = x;
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
        return this.startingLevel + Math.floor(this.nLinesDestroyed / 10);
    });

    this._dropTimer = null;

    this._fastForward = false;


    this._hasStarted = false;
    this._paused = false;
    this.__defineGetter__('pause', function() {
        return this._paused;
    });
    this.__defineSetter__('pause', function(value) {
        this._paused = value;
        if (this._hasStarted) {
            this._setupDropTimer();
        }
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
            columns: 14
        }, options);
        this.blocks = new Array(options.columns);
        for (var x = 0; x < options.columns; x++) {
            this.blocks[x] = new Array(options.lines);
        }
        this.nextShape = this._pickRandomShape();
    },

    start: function() {
        this._hasStarted = true;
        this._addShape();
        this._setupDropTimer();
    },

    moveLeft: function() {
        return this._moveShape(-1, 0, 0);
    },

    moveRight: function() {
        return this._moveShape(1, 0, 0);
    },

    moveDown: function(enable) {
        if (this._fastForward === enable || this.gameOver) return;
        if (enable && !this._moveShape(0, 1, 0)) return;
        this._fastForward = enable;
        this._setupDropTimer();
    },

    rotateLeft: function() {
        return this._moveShape(0, 0, -1);
    },

    rotateRight: function() {
        return this._moveShape(0, 0, 1);
    },

    drop: function() {
        if (this.shape) {
            while (this._moveShape(0, 1, 0)) {}
            this._fallTimeout();
        }
    },

    _addShape: function() {
        this.shape = this.nextShape.copy();
        this.nextShape = this._pickRandomShape();

        for (var i = 0, l = this.shape.blocks.length; i < l; i++) {
            var b = this.shape.blocks[i];
            var x = this.shape.x + b.x,
                y = this.shape.y + b.y;
            if (y >= 0 && this.blocks[x][y] != null) {
                if (this._dropTimer) {
                    clearInterval(this._dropTimer);
                    this._dropTimer = null;
                }
                this.shape = null;
                this.gameOver = true;

                this.emit('game_over');

                return;
            }
        }

        this.emit('shape_added');
    },

    _pickRandomShape: function() {
        return this._makeShape(_.random(0, NCOLORS - 1), _.random(0, 3));
    },

    _makeShape: function(type, rotation) {
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
                if (!blockTable[offset + y * 4 + x]) {
                    continue;
                }
                minWidth = Math.min(x, minWidth);
                maxWidth = Math.max(x + 1, maxWidth);
                minHeight = Math.min(y, minHeight);
                maxHeight = Math.max(y + 1, maxHeight);

                var b = new Block(x, y, type);
                shape.blocks.push(b);
            }
        }
        var blockWidth = maxWidth - minWidth;
        shape.x = Math.floor((this.width - blockWidth) / 2) - minWidth;
        shape.y = -minHeight;

        return shape;
    },

    _setupDropTimer: function() {
        var timestep = Math.round(80 + 800 * Math.pow(0.75, this.level - 1));
        timestep = Math.max(10, timestep);

        if (this._fastForward) {
            timestep = 80;
        }

        if (this._dropTimer) {
            clearInterval(this._dropTimer);
            this._dropTimer = null;
        }
        if (!this._paused) {
            this._dropTimer = setInterval(this._fallTimeout.bind(this), timestep);
        }
    },

    _fallTimeout: function() {
        if (!this._moveShape(0, 1, 0)) {
            this._landShape();
            this._addShape();
        }
    },

    _moveShape: function(xStep, yStep, rStep) {
        if (!this.shape) return false;
        this._rotateShape(rStep);
        var canMove = true;
        _.find(this.shape.blocks, function(block) {
            var x = this.shape.x + xStep + block.x,
                y = this.shape.y + yStep + block.y;
            if (x < 0 || x >= this.width || y >= this.height || (this.blocks[x] && this.blocks[x][y])) {
                canMove = false;
                return true;
            }
            return false;
        }, this);

        if (canMove) {
            this.shape.x += xStep;
            this.shape.y += yStep;
            if (xStep) {
                this.emit('shape_moved');
            } else if (yStep > 0) {
                this.emit('shape_dropped');
            } else {
                this.emit('shape_rotated');
            }
        } else {
            this._rotateShape(-rStep);
        }

        return canMove;
    },

    _rotateShape: function(rStep) {
        var shape = this.shape;
        var r = shape.rotation + rStep;
        r = (4 + r % 4) % 4;
        if (r !== shape.rotation) {
            shape.rotation = r;
            var i = 0,
                b = shape.blocks[i],
                offset = shape.type * 64 + r * 16;
            for (var x = 0; x < 4; x++) {
                for (var y = 0; y < 4; y++) {
                    if (blockTable[offset + y * 4 + x]) {
                        b.x = x;
                        b.y = y;
                        b = shape.blocks[++i];
                    }
                }
            }
        }
    },

    _landShape: function() {
        var shape = this.shape,
            blocks = this.blocks;
        shape.blocks.forEach(function(b) {
            b.x += shape.x;
            b.y += shape.y;
            blocks[b.x][b.y] = b;
        });

        var fallDistance = 0,
            lines = [],
            nLines = 0,
            baseLineDestroyed = false,
            x, y, explode;
        for (y = this.height - 1; y >= 0; y--) {
            explode = true;
            for (x = 0; x < this.width; x++) {
                if (!blocks[x][y]) {
                    explode = false;
                    break;
                }
            }

            if (explode) {
                if (y === this.height -1) {
                    baseLineDestroyed = true;
                }
                lines[nLines] = y;
                nLines++;
            }
        }

        var lineBlocks = [];
        for (y = this.height - 1; y >= 0; y--) {
            explode = true;
            for (x = 0; x < this.width; x++) {
                if (!blocks[x][y]) {
                    explode = false;
                    break;
                }
            }

            if (explode) {
                for (x = 0; x < this.width; x++) {
                    lineBlocks.push(blocks[x][y]);
                    blocks[x][y] = null;
                }
                fallDistance++;
            } else if (fallDistance > 0) {
                for (x = 0; x < this.width; x++) {
                    var b = blocks[x][y];
                    if (b) {
                        b.y += fallDistance;
                        blocks[b.x][b.y] = b;
                        blocks[x][y] = null;
                    }
                }
            }
        }

        var oldLevel = this.level;
        this.nLinesDestroyed += nLines;
        switch (nLines) {
            case 0:
                break;
            case 1:
                this.score += 40 * this.level;
                break;
            case 2:
                this.score += 100 * this.level;
                break;
            case 3:
                this.score += 300 * this.level;
                break;
            case 4:
                this.score += 1200 * this.level;
                break;
        }
        //if (baseLineDestroyed) {
        //    this.score += 10000 * this.level;
        //}
        if (this.level !== oldLevel) {
            this._setupDropTimer();
        }
        this.emit('shape_landed', lines, lineBlocks);
        this.shape = null;
    }
});

module.exports = {
    Game: Game
};
var PIXI = require('pixi.js');

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

module.exports = BlockGraphics;

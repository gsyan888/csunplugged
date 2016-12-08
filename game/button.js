goog.provide('game.Button');

goog.require('lime.Button');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.fill.LinearGradient');

/**
 * Glossy button. Rounded button with some predefined style.
 * Use lime.Button for lower level control.
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends lime.Button
 */
game.Button = function(txt) {
    lime.Button.call(this, this.makeState_(txt), this.makeState_(txt));
	//this.setText(txt);
    this.borderWidth = 4;
    //this.setColor('#000');
	this.setColor('#999999');
	
};
goog.inherits(game.Button, lime.Button);

/**
 * Make state for a button.
 * @private
 * @return {lime.RoundedRect} state.
 */
game.Button.prototype.makeState_ = function(txt) {
    var state = new lime.RoundedRect().setFill('#fff').setRadius(15);
    state.inner = new lime.RoundedRect().setRadius(15);
    //state.label = new lime.Label().setAlign('center').setFontColor('#eef').setFontSize(35).setSize(250, 35);
	state.label = new lime.Label().setText(txt).setAlign('center').setFontColor('#000000').setFontSize(28)
									//.setSize(400, 30)
									.setFontFamily('標楷體');
    state.appendChild(state.inner);
    state.inner.appendChild(state.label);
    return state;
};

/**
 * Set button base color
 * @param {mixed} clr New base color.
 * @return {game.Button} object itself.
 */
game.Button.prototype.setColor = function(clr) {
    clr = lime.fill.parse(clr);
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        var c = s == this.downstate ? clr.clone().addBrightness(.1) : clr;
        s.setFill(c);	//水晶
        var c2 = c.clone().addBrightness(.3);
        var grad = new lime.fill.LinearGradient().setDirection(0, 0, 0, 1);
        grad.addColorStop(0, c2);
        grad.addColorStop(.45, c);
        grad.addColorStop(.55, c);
        grad.addColorStop(1, c2);
        s.inner.setFill(grad);
    },this);
    return this;
};

/**
 * Set button text.
 * @param {string} txt Text.
 * @return {game.Button} object itself.
 */
game.Button.prototype.setText = function(txt) {
    this.upstate.label.setText(txt);
    this.downstate.label.setText(txt);
	this.updateFontSize();
    return this;
};
/**
 * Set button text font size.
 * @param {string} color code.
 * @return {game.Button} object itself.
 */
game.Button.prototype.setFontColor = function(value) {
    this.upstate.label.setFontColor(value);
    this.downstate.label.setFontColor(value);
    return this;
};
/**
 * Set button text font size.
 * @param {number} txt Number.
 * @return {game.Button} object itself.
 */
game.Button.prototype.setFontSize = function(size) {
    this.upstate.label.setFontSize(size);
    this.downstate.label.setFontSize(size);
    return this;
};
/**
 * Set button text font family.
 * @param {string} font-family.
 * @return {game.Button} object itself.
 */
game.Button.prototype.setFontFamily = function(font) {
    this.upstate.label.setFontFamily(font);
    this.downstate.label.setFontFamily(font);
    return this;
};
/** @inheritDoc */
game.Button.prototype.setSize = function(value, opt_height) {
    if (this.upstate) {
    this.upstate.setSize.apply(this.upstate, arguments);
    var size = this.upstate.getSize();
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        s.setSize(size);
        var innerSize = size.clone();
        innerSize.width -= this.borderWidth;
        innerSize.height -= this.borderWidth;
        s.inner.setSize(innerSize);
    },this);
	this.updateFontSize();
    }
    return this;
};

/** @inheritDoc */
game.Button.prototype.getSize = function() {
    return this.upstate.getSize();
};

game.Button.prototype.updateFontSize = function() {
	var s = this.getSize();
	if( s.width > 0 ) {
		var sizeMax = Math.floor(s.height*0.8);
		var scale = (s.width-this.borderWidth)*.95/this.upstate.label.getSize().width;
		var size = Math.floor(this.upstate.label.getFontSize() * scale);
		if( size > sizeMax ) {
			size = sizeMax;
		}
		var w = s.width;
		var h = size;
		this.upstate.label.setSize(w, h);
		this.downstate.label.setSize(w, h);
		this.setFontSize(size);
	}		
};

/**
 * Get button label Text
 * @private
 */
game.Button.prototype.getText = function() {
	return this.upstate.label.getText();
};
game.Button.prototype.setFontFamily = function(font) {
	this.upstate.label.setFontFamily(font);
	return this;
};


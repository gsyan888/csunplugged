goog.provide('game.CircleButton');

goog.require('lime.Button');
goog.require('lime.Label');
goog.require('lime.Circle');

/**
 * Glossy button. Rounded button with some predefined style.
 * Use lime.Button for lower level control.
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends lime.Button
 */
game.CircleButton = function(txt) {
    lime.Button.call(this, this.makeState_(txt), this.makeState_(txt));
    this.borderWidth = 14;
	this.setColor('#04B404');
	this.setFontColor('#886A08');
	this.setStroke(this.borderWidth, '#088A08');
	
};
goog.inherits(game.CircleButton, lime.Button);

/**
 * Make state for a button.
 * @private
 * @return {lime.Circle} state.
 */
game.CircleButton.prototype.makeState_ = function(txt) {
    var state = new lime.Circle().setFill('#33ff00').setStroke(1, '#339900');
    state.inner = new lime.Circle().setFill('#33ff00').setStroke(2,'#00cc00');
	state.label = new lime.Label().setText(txt).setAlign('center').setFontColor('#666600').setFontSize(28)
									//.setSize(400, 30)
									.setFontFamily('標楷體');
    state.appendChild(state.inner);
    state.inner.appendChild(state.label);
    return state;
};

/**
 * Set button base color
 * @param {mixed} clr New base color.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setColor = function(clr) {
    clr = lime.fill.parse(clr);
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        var c = s == this.downstate ? clr.clone().addBrightness(.1) : clr;
        s.setFill(c);
        var c2 = c.clone().addBrightness(.2);
        s.inner.setFill(c2);
    },this);
    return this;
};
/**
 * Set button text font size.
 * @param {string} color code.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setStroke = function(width, clr) {
	this.borderWidth = width;
	var size = this.upstate.getSize();
	clr = lime.fill.parse(clr);
    goog.array.forEach([this.upstate, this.downstate], function(s) {
        var c = s == this.downstate ? clr.clone().addBrightness(.1) : clr;
        var c2 = c.clone().addBrightness(.2);
		if(s == this.downstate) {
			s.setStroke(1, c2);
			s.inner.setStroke(2,c);
		} else {
			s.inner.setStroke(1, c2);
			s.setStroke(3,c);
		}
    },this);
	this.setSize(size);
    return this;
};
/**
 * Set button text.
 * @param {string} txt Text.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setText = function(txt) {
    this.upstate.label.setText(txt);
    this.downstate.label.setText(txt);
	this.updateFontSize();
    return this;
};
/**
 * Set button text font size.
 * @param {string} color code.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setFontColor = function(value) {
    this.upstate.label.setFontColor(value);
    this.downstate.label.setFontColor(value);
    return this;
};
/**
 * Set button text font size.
 * @param {number} txt Number.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setFontSize = function(size) {
    this.upstate.label.setFontSize(size);
    this.downstate.label.setFontSize(size);
    return this;
};
/**
 * Set button text font family.
 * @param {string} font-family.
 * @return {game.CircleButton} object itself.
 */
game.CircleButton.prototype.setFontFamily = function(font) {
    this.upstate.label.setFontFamily(font);
    this.downstate.label.setFontFamily(font);
    return this;
};
/** @inheritDoc */
game.CircleButton.prototype.setSize = function(value, opt_height) {
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
game.CircleButton.prototype.getSize = function() {
    return this.upstate.getSize();
};

game.CircleButton.prototype.updateFontSize = function() {
	var s = this.getSize();
	if( s.width > 0 ) {
		var sizeMax = Math.floor(s.height*0.8);
		var scale = (s.width-this.borderWidth)*.95/this.upstate.label.getSize().width;
		var size = Math.floor(this.upstate.label.getFontSize() * scale);
		if( size > sizeMax ) {
			size = sizeMax;
		}
		this.setFontSize(size);
	}		
};

/**
 * Get button label Text
 * @private
 */
game.CircleButton.prototype.getText = function() {
	return this.upstate.label.getText();
};
game.CircleButton.prototype.setFontFamily = function(font) {
	this.upstate.label.setFontFamily(font);
	return this;
};


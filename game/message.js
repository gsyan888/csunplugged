goog.provide('game.FadeOutMessage');

goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('lime.animation.FadeTo');
goog.require('game.Button');

/**
 * Show fade out message
 * @param {function} callball the function call back.
 * @constructor
 * @extends lime.RoundedRect
 */
game.FadeOutMessage = function(callback) {
    lime.RoundedRect.call(this);
	this.callback = callback;
	this.delay = 3;
	this.finalAlpha = 0.5
	this.setSize(1024*.9, 100)
			.setFill(0x00,0xff,0x66,0.8)
			.setRadius(30)
			.setStroke(3, '#ffcc00')
			.setHidden(1);
	this.label = new lime.Label().setFontSize(24).setFontColor('#ffffff');
	this.appendChild(this.label);
	
};
goog.inherits(game.FadeOutMessage, lime.RoundedRect);

/**
 * Set message text.
 * @param {string} txt String.
 * @return {game.FadeOutMessage} object itself.
 */
game.FadeOutMessage.prototype.setText = function(value) {
	this.text = value;
	this.label.setText(value);
	this.updateFontSize();
	return this;
};

/**
 * Set message text font size.
 * @param {number} txt Number.
 * @return {game.FadeOutMessage} object itself.
 */
game.FadeOutMessage.prototype.setFontSize = function(value) {
	if( typeof(this.text) == 'undefined' ) {
		this.label.setFontSize(value);
	} else {
		this.label.setScale(value/this.label.getFontSize());
	}
	//this.updateFontSize();
	return this;
};

/**
 * Set message text font color.
 * @param {string} txt String.
 * @return {game.FadeOutMessage} object itself.
 */
game.FadeOutMessage.prototype.setFontColor = function(value) {
	this.label.setFontColor(value);
	return this;
};
/**
 * Set message text font family.
 * @param {string} txt String.
 * @return {game.FadeOutMessage} object itself.
 */
game.FadeOutMessage.prototype.setFontFamily = function(value) {
	this.label.setFontFamily(value);
	return this;
};
/**
 * Set message text dely time.
 * @param {number} txt Number.
 * @return {game.FadeOutMessage} object itself.
 */
game.FadeOutMessage.prototype.setDelay = function(value) {
	this.delay = value;
	return this;
};

/**
 * update Text font size
 * @private
 */
game.FadeOutMessage.prototype.updateFontSize = function() {
	var s = this.getSize();
	if( s.width > 0 ) {
		var sizeMax = Math.floor(s.height*0.7);
		var scale = s.width*.85/this.label.getSize().width;
		var size = Math.floor(this.label.getFontSize() * scale);
		if( size > sizeMax ) {
			size = sizeMax;
		}
		this.label.setFontSize(size);
	}		
};

game.FadeOutMessage.prototype.play = function() {
	this.setHidden(0);
	var ani = new lime.animation.FadeTo(this.finalAlpha).setDuration(this.delay);
	this.runAction( ani );
	goog.events.listen(ani, lime.animation.Event.STOP, function() {
		try {
			this.getParent().removeChild(this);
		} catch(e) { };
		if(typeof this.callback == 'function') {
			this.callback();
		}
	}, false, this);
	return this;
};
goog.provide('cs.text_compression.Button');

goog.require('lime.GlossyButton');

/**
 * Glossy button. Rounded button with some predefined style.
 * Use lime.Button for lower level control.
 * @param {string} txt Text shown on the button.
 * @constructor
 * @extends lime.Button
 */
cs.text_compression.Button = function(txt) {
    lime.GlossyButton.call(this, txt);

    this.borderWidth = 4;
    //this.setColor('#000');
	this.setColor('#999999');
	
	this.upstate.label.setSize(this.getSize());
};
goog.inherits(cs.text_compression.Button, lime.GlossyButton);

/**
 * Make state for a button.
 * @private
 * @return {lime.RoundedRect} state.
 */
cs.text_compression.Button.prototype.makeState_ = function() {
    var state = new lime.RoundedRect().setFill('#fff').setRadius(15);
    state.inner = new lime.RoundedRect().setRadius(15);
    //state.label = new lime.Label().setAlign('center').setFontColor('#eef').setFontSize(35).setSize(250, 35);
	state.label = new lime.Label().setAlign('center').setFontColor('#000000').setFontSize(28).setSize(400, 30).setFontFamily('標楷體');
    state.appendChild(state.inner);
    state.inner.appendChild(state.label);
    return state;
};

/**
 * Set button base color
 * @param {mixed} clr New base color.
 * @return {lime.GlossyButton} object itself.
 */
cs.text_compression.Button.prototype.setColor = function(clr) {
	this.color = clr;
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
 * Get button label Text
 * @private
 */
cs.text_compression.Button.prototype.getText = function() {
	return this.upstate.label.getText();
};

cs.text_compression.Button.prototype.setFontFamily = function(font) {
	this.upstate.label.setFontFamily(font);
	return this;
};

cs.text_compression.Button.prototype.getColor = function() {
	return this.color;
};


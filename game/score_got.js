goog.provide('game.effect.ShowScoreGot');

goog.require('lime.Label');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.Spawn');

/**
 * A Label to show fade out message
 * @param {object} parent to append
 * @param {function} callball the function call back.
 * @constructor
 * @extends lime.Label
 */
game.effect.ShowScoreGot = function(sprite, callback) {
	lime.Label.call(this);
	this.sprite = sprite;
	this.callback = callback;
	var pos = sprite.getPosition();
	pos.y -= 20;
	this.setPosition(pos.x, pos.y).setFontWeight(700).setHidden(1);
	sprite.getParent().appendChild(this);
};
goog.inherits(game.effect.ShowScoreGot, lime.Label);

game.effect.ShowScoreGot.prototype.play = function() {
	//�]�w�ʵe���{��
	this.setHidden(0);
	var show = new lime.animation.Spawn(
        new lime.animation.MoveBy(0, -50),	//���W����
        new lime.animation.FadeTo(0),		//��������
        new lime.animation.ScaleBy(1.5)		//��j
	);
	//����ʵe
	this.runAction(show);
	//�ʵe�����, �����[����� label
	goog.events.listen(show, lime.animation.Event.STOP, function() {
		try {
			this.getParent().removeChild(this);
		} catch(e) { };
		if( typeof(this.callback) == 'function' ) {
			this.callback();
		}
	},false, this);
	return this;
};

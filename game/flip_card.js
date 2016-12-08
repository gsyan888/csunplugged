goog.provide('game.FlipCard');

goog.require('lime.Layer');

/**
 * Flip Card object. 
 * @constructor
 * @extends lime.Layer
 */
game.FlipCard = function(opt_front, opt_back, callback) {
    lime.Layer.call(this);
	
	this.callback = callback;
	this.enabled = true;	
	this.direction = game.FlipCard.Direction.VERTICAL;
	
	if (goog.isDef(opt_front)) {
        this.setFrontState(opt_front);
    }
	if (goog.isDef(opt_back)) {
        this.setBackState(opt_back);
    }
	
	this.setDirection(this.direction);
	
	
	this.value1 = '';
	this.value2 = '';
	
	this.currentIndex = 0;
	var p = this;
};

goog.inherits(game.FlipCard, lime.Layer);
/**
 * Card states
 * @enum {number}
 */
game.FlipCard.State = {
    FRONT: 0,
    BACK: 1
};
/**
 * Card direction
 * @enum {number}
 */
game.FlipCard.Direction = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

game.FlipCard.prototype.setDirection = function(value) {
	if( goog.events.hasListener(this,['mousedown','touchstart'], game.FlipCard.mouseHandler_ ) ) {
		goog.events.unlisten(this,['mousedown','touchstart'], game.FlipCard.mouseHandler_ );
	}
	try {
		goog.events.unlisten(this.scaleToZero, lime.animation.Event.STOP, game.FlipCard.scaleToZeroHandler_ );
	} catch(e) {};
	try {
		goog.events.unlisten(this.scaleToNormal, lime.animation.Event.STOP, game.FlipCard.scaleToNormalHandler_ );
	} catch(e) {};	
	
	this.direction = ( value == game.FlipCard.Direction.HORIZONTAL ? value : game.FlipCard.Direction.VERTICAL );

	this.scaleToZero = new lime.animation.ScaleTo( this.getBackScale() ).setDuration(.1);
	this.scaleToNormal = new lime.animation.ScaleTo(1, 1).setDuration(.1);

	if( this.isActive(this.front) ) {
		this.front.setScale(1,1);
		this.back.setScale(this.getBackScale());
	} else {
		this.front.setScale(this.getBackScale());
		this.back.setScale(1,1);
	}
	
	//按下時就進行翻面
	goog.events.listen(this, ['mousedown','touchstart'], this.mouseHandler_ , false, this);
	//當縮到最小的動作停止後, 開始將一面顯示(翻出來)
	goog.events.listen(this.scaleToZero, lime.animation.Event.STOP, this.scaleToZeroHandler_ , false, this);
	//當恢復成正常大小的動作停止後
	goog.events.listen(this.scaleToNormal, lime.animation.Event.STOP, this.scaleToNormalHandler_ , false, this);
	
	return this;
};	
game.FlipCard.prototype.mouseHandler_ = function(e){
	if(this.enabled) {
		if( this.isFront() ) {
			this.hideFront();
		} else {
			this.hideBack();
		}
	}
};
game.FlipCard.prototype.scaleToZeroHandler_ = function(){
	this.scaleToNormal.removeTarget(this.scaleToNormal.targets[0]);	//清除 target, 準備執行恢復為原來大小的程序
	if(this.front == this.scaleToZero.targets[0]) {	//目前顯示的是正面
		this.back.runAction(this.scaleToNormal);		//翻到背面
	} else {							//目前顯示的是背面
		this.front.runAction(this.scaleToNormal);		//翻到正面
	}
}
game.FlipCard.prototype.scaleToNormalHandler_ = function(){
	if( typeof(this.callback) == 'function' ) {
		this.callback();
	}
}

game.FlipCard.prototype.setFrontState = function(obj) {
    this.front = obj;
	this.front.setScale(1,1);
    this.appendChild(this.front);
};

game.FlipCard.prototype.setBackState = function(obj) {
    this.back = obj;
	this.back.setScale(this.getBackScale());
    this.appendChild(this.back);
};
game.FlipCard.prototype.getBackScale = function() {
	if(this.direction == game.FlipCard.Direction.HORIZONTAL) {
		var scale = new goog.math.Vec2(0,1);
	} else {
		var scale = new goog.math.Vec2(1,0);
	}
	return scale;
};
game.FlipCard.prototype.replace = function(front, back) {
	var isBack = this.isBack();
	this.removeAllChildren();
	this.setFrontState(front);
	this.setBackState(back);
	this.setDirection(this.direction);
	if(isBack) {
		this.hideFront();
	} else {
		this.hideBack();
	}
	return this;
};

game.FlipCard.prototype.hideFront = function() {
	if( this.isActive(this.front) ) {
		if(typeof this.scaleToZero.targets[0] != 'undefined') {
			this.scaleToZero.removeTarget(this.scaleToZero.targets[0]);
		}
		this.front.runAction(this.scaleToZero);
	}
};
game.FlipCard.prototype.hideBack = function() {
	if( this.isActive(this.back) ) {
		if(typeof this.scaleToZero.targets[0] != 'undefined') {
			this.scaleToZero.removeTarget(this.scaleToZero.targets[0]);
		}
		this.back.runAction(this.scaleToZero);
	}
};

game.FlipCard.prototype.isFront = function() {
	return  this.isActive(this.front);		
};

game.FlipCard.prototype.isBack = function() {
	return  this.isActive(this.back);	
};

game.FlipCard.prototype.isActive = function(obj) {
	var isThis = false;
	if(this.direction == game.FlipCard.Direction.HORIZONTAL && obj.getScale().x > 0) {
		isThis = true;
	} else if(this.direction == game.FlipCard.Direction.VERTICAL && obj.getScale().y > 0) {
		isThis = true;
	}
	return isThis;	
};

//game.FlipCard.Value = function(v1, v2) {
//	this.question = v1;
//	this.color = v2;
//};

game.FlipCard.prototype.setValue = function(v) {
	this.question = v;
	return this;
};
	
game.FlipCard.prototype.getValue = function() {
	return this.value_;
}
game.FlipCard.prototype.setEnabled = function(v) {
	if(v != true) {
		v = false;
	}
	this.enabled = v;
};
game.FlipCard.prototype.getEnabled = function(v) {
	return this.enabled;
};
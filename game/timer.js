goog.provide('game.Timer');

goog.require('lime.Circle');
goog.require('lime.Polygon');
goog.require('lime.Label');
goog.require('lime.Sprite');
goog.require('lime.animation.ScaleTo');
goog.require('lime.scheduleManager');

/**
 * Show fade out message
 * @param {function} callball the function call back.
 * @constructor
 * @extends lime.Sprite
 */
game.Timer = function(time, callback) {
	lime.Sprite.call(this);
	
	this.callback = callback;
	this.pause = true;
	this.color = '#00ff31';
	this.align = 'right';
	this.fontSize = 24;
	this.size = 32;
	if(typeof(time) == 'undefined') {
		this.time = 0;
	} else {
		this.time = time;
	}
	this.newTimer();
};
goog.inherits(game.Timer, lime.Sprite);

/**
 * initial a new timer
 * @private
 */
game.Timer.prototype.newTimer = function() {
	this.pointer = new lime.Polygon().setOpacity(0.5);
	this.circle = new lime.Circle();
	this.label = new lime.Label().setText(this.time).setFontSize(this.fontSize);
	this.setClockSize(this.size);
	this.setColor(this.color);
	this.appendChild(this.label);
	this.appendChild(this.pointer);
	this.appendChild(this.circle);
};
game.Timer.prototype.setTime = function(t) {
	this.time = t;
	return this;
};
game.Timer.prototype.getTime = function() {
	return parseInt( this.label.getText());
};	
game.Timer.prototype.setClockSize = function(size) {
	if( typeof(this.circle) != 'undefined' ) {
		this.size = size;
		var strokeSize = Math.floor(size/15);
		if(strokeSize < 1) {
			strokeSize = 1;
		}
		this.circle.setSize(size, size).setStroke(strokeSize,this.color);
		this.pointer.setPoints(0,0, strokeSize*-1.3,size*0.415, strokeSize*1.3,size*0.415);
		this.setLabelPosition();
	}
	return this;
};
game.Timer.prototype.setColor = function(color) {
	this.color = color;
	if( typeof(this.circle) != 'undefined' ) {
		if( typeof(this.circle.getStroke().width) == 'undefined' ) {
			var stroke = 3;
		} else {
			var stroke = this.circle.getStroke().width;
		}
		this.circle.setStroke(stroke , color);
		this.pointer.setFill(color);
		this.label.setFontColor(color);
	}
	return this;
};

game.Timer.prototype.setLabelAlign = function(align) {
	this.align = align;
	this.setLabelPosition();
	return this;
};
game.Timer.prototype.setFontSize = function(size) {
	this.fontSize = size;
	this.label.setFontSize(size);
	this.setLabelPosition();
	return this;
};
game.Timer.prototype.setLabelPosition = function() {
	var c = this.circle.getSize();
	var f = this.label.getFontSize();
	var w = f*6;
	this.label.setSize(w, f);
	switch(this.align) {
		case 'left' :
			this.label.setAlign('right').setPosition((c.width+w+f/2)/-2,0);
			break;
		case 'right' :
			this.label.setAlign('left').setPosition((c.width+w+f/2)/2,0);
			break;
		case 'top' :
			this.label.setAlign('center').setPosition(0,(c.height+f*1.5)/-2);
			break;
		case 'center' :
			this.label.setAlign('center').setPosition(0,0);
			break;
		default :
			this.label.setAlign('center').setPosition(0,(c.height+f*1.5)/2);
			break;
	}
	return this;
};
game.Timer.prototype.init = function() {
	try {
		lime.scheduleManager.unschedule(this._timerHandler, this);
	} catch(e) {  };	
	lime.scheduleManager.scheduleWithDelay(this._timerHandler, this, 100);
	return this;
};
game.Timer.prototype._timerHandler = function() {
	if( !this.pause ) {
		var d = this.pointer.getRotation();
		if(d-20 == 0) {	//用這個解決畫面閃爍的問題(角度為0時會閃爍)
			d = 21;
		}			
		this.pointer.setRotation(d-20);
		if(this.time > 0) {
			var t  = this.time - Math.round((new Date() - this.startAt)/1000);
			//if time less than 10 , make a pop up effect
			if( t<=10 && t != this.getTime() ) {
				this.circle.runAction( new lime.animation.Sequence(
					new lime.animation.ScaleTo(1.2).setDuration(.1),
					new lime.animation.ScaleTo(1).setDuration(.1)
				));
			}
		}  else {	//計時器如果設為 0 或小於 0 , 時間為正數的方式
			var t = Math.round((new Date() - this.startAt)/1000);
		}
		this.label.setText(t);
		//time is up run callback function
		if(this.time > 0 && t <= 0) {
			this.pointer.setRotation(180)
			lime.scheduleManager.unschedule(this._timerHandler, this);
			if(typeof this.callback == 'function') {
				this.callback();
			}
		}
	}
}
game.Timer.prototype.stop = function() {
	this.pause = true;
	return this;
};
game.Timer.prototype.play = function() {
	if(this.time > 0) {	//倒數
		var t = new Date().valueOf() - 1000*( this.time - this.getTime() );
		this.startAt = new Date(t); 
	} else {		//正數
		if(!this.pause) {
			var t = new Date().valueOf();
		} else {
			var t = new Date().valueOf() - 1000* this.getTime() ;
		}
	}
	this.startAt = new Date(t); 
	if(this.pause) {
		this.pause = false;
		this.init();		
	}
	return this;
};
game.Timer.prototype.resetTime = function() {
	this.startAt = new Date(); 
	this.pause = false;
	return this;
}



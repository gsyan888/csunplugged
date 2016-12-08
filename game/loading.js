goog.provide('game.LoadingIcon');

goog.require('lime.CanvasContext');
goog.require('lime.scheduleManager');
/****
 載入中的動畫
 參數:
	size:大小
	this.color:顏色代碼
	type: circle=圓圈動畫 , 其它則為直線動畫
*/
game.LoadingIcon = function() {
	lime.CanvasContext.call(this);
	//this.size = 60;
	this.total = 12;
	this.color = 'gray';
	this.type = 'line';
};
goog.inherits(game.LoadingIcon, lime.CanvasContext);

game.LoadingIcon.prototype.draw = function(ctx) {
	this.size = this.getSize().width;
	ctx.lineWidth = 20*this.size/200;
	ctx.lineCap="round";
	ctx.strokeStyle = this.color;
	ctx.fillStyle = this.color;
	ctx.globalAlpha=0.5;
	var angle = Math.PI*2/this.total;
	var x = 0;
	var y = this.size/2-ctx.lineWidth;
	var r = ctx.lineWidth*.8;		//circle's radius
	for(var i=0; i<this.total; i++) {
		ctx.rotate(angle);
		ctx.save();
		if(i==1) {
			ctx.globalAlpha=0.2;
		}
		if(this.type == 'circle') {
			ctx.beginPath();
			ctx.beginPath();
			ctx.arc(x , y , r, 0, 2*Math.PI);
			ctx.fill();
			ctx.closePath()
		} else {
			ctx.moveTo(x, ctx.lineWidth*2.5);
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		ctx.restore();
	}
};
//game.LoadingIcon.prototype.this.total = this.total;
game.LoadingIcon.prototype.start = function() {
	if(typeof(this.started) == 'undefined') {
		this.started = true;
		lime.scheduleManager.scheduleWithDelay(this.ani, this, 50);
	}
	return this;
}
game.LoadingIcon.prototype.stop = function() {
	if(typeof(this.started) != 'undefined') {
		delete this.started;
		lime.scheduleManager.unschedule(this.ani, this);
	}
}
game.LoadingIcon.prototype.ani = function() {
	this.setRotation(this.getRotation()-360/this.total);
};
game.LoadingIcon.prototype.remove = function() {
	this.stop();
	try {
		this.getParent().removeChild(this);
	} catch(e) {};
};
game.LoadingIcon.prototype.setColor = function(color) {
	this.color = color;
	return this;
};
/*
game.LoadingIcon.prototype.setSize = function(size) {
	this.size = size;
	return this;
}
*/
game.LoadingIcon.prototype.setType = function(type) {
	if(type == 'circle') {
		this.type = type;
	} else {
		this.type = 'line';
	}
	return this;
}

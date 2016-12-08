goog.provide('game.ScrollerMenu');

goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('lime.ui.Scroller');
goog.require('game.Button');

game.ScrollerMenu = function(items, callback) {
	lime.RoundedRect.call(this);
	
	this.items = items;
	this.font = '標楷體';
	this.fontcolor = '#ffffff';
	this.hintColor = '#ffff33';
	this.hintText = '上下捲動兩側可以看到更多選單';
	this.buttonColor = '#77ff44';
	this.callback = callback;
	this.setSize(740, 540)
		.setFill(0x00, 0x66, 0x00, .4)
		.setRadius(40)
		.setStroke(3, '#ffcc00')
		//.setHidden(1)
		;
	//顯示選單的垂直捲軸
	this.scrollObject = new lime.ui.Scroller()
			.setSize(this.getSize().width*.95, Math.floor(this.getSize().height*.8/60-1)*60 )
			.setPosition(0,-210)
			.setDirection('vertical')
			.setAnchorPoint(0.5,0)
	this.appendChild(this.scrollObject);
};
goog.inherits(game.ScrollerMenu, lime.RoundedRect);


game.ScrollerMenu.prototype.setFontSize = function(value) {
	this.fontsize = value;
	return this;
};
game.ScrollerMenu.prototype.setFontColor = function(value) {
	this.fontcolor = value;
	return this;
};
game.ScrollerMenu.prototype.setFontFamily = function(value) {
	this.font = value;
	return this;
};
game.ScrollerMenu.prototype.setButtonColor = function(value) {
	this.buttonColor = value;
	return this;
};
//
//製作有捲軸的選單
//
game.ScrollerMenu.prototype.addItems = function() {
	var yStart = 55;
	var itemHeight = 50;
	var itemGap = 10;
	var rowMax = Math.floor(this.scrollObject.getSize().height/(itemHeight+itemGap));
	if(typeof this.items != 'undefined' && this.items.length > 0) {
		if(this.items.length > 1) {
			//如果選單超過五項就顯示捲動捲軸看更多的提示
			if(this.items.length > rowMax) {
				var hintLabel = new lime.Label().setText(this.hintText)
								.setFontColor(this.hintColor).setFontSize(24).setPosition(0,this.getSize().height/2-50).setFontFamily(this.font);
				this.appendChild(hintLabel);
			}
			for(var i=0; i< this.items.length; i++) {
				var txt = this.items[i];
				var btnItem = new game.Button(txt)
									.setPosition(0, yStart+i*(itemHeight+itemGap))
									.setFontColor(this.fontcolor)
									.setColor(this.buttonColor)
									.setFontFamily(this.font)
									.setSize(this.scrollObject.getSize().width*.85, itemHeight);
				this.scrollObject.appendChild(btnItem);
				btnItem.index = i;
				//按下去進行什麼動作
				var p = this;
				goog.events.listen(btnItem, ['mousedown','touchstart'], function() {
					if( typeof(p.callback) == 'function' ) {
						p.callback(this.index);
					}
				}, false,  btnItem );
			}
		} else {
			if( typeof(this.callback) == 'function' ) {
				this.callback( 0 );
			}
		}
	} else {
		//
		if( typeof this.callback != 'undefined' ) {
			this.callback(-1);
		}
	}
	return this;
};
game.ScrollerMenu.prototype.remove = function() {
	var t = this.scrollObject.getNumberOfChildren();
	for(var i=0; i<t; i++) {
		try {
			goog.events.removeAll(this.scrollObject.getChildAt(i));
		} catch(e) {};
	}
	try {
		this.scrollObject.removeAllChildren();
	} catch(e) {};
	try {
		this.removeAllChildren();
	} catch(e) {};
	try {
		this.getParent().removeChild(this);
	} catch(e) {};
};
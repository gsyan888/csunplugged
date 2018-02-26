goog.provide('game.Dialog');

goog.require('lime.RoundedRect');
goog.require('lime.Label');
goog.require('game.Button');

/**
 * Dialog. RoundedRect with caption , message & button .
 * @param {object} {function} {function}
 * @constructor
 * @extends lime.RoundedRect
 */
game.Dialog = function(conf, callback, callback2) {
    lime.RoundedRect.call(this);

	this.setConfig(conf);
	
	this.makeDialog(callback, callback2);

};
goog.inherits(game.Dialog, lime.RoundedRect);


/**
 * Check and set the configuration for a dialog.
 * @protected
 * @param {object} txt Text shown on the button.
 * @return {game.Dialog} object itself.
 */
game.Dialog.prototype.setConfig = function(conf) {
	//initial conf
	if(typeof conf == 'undefined' || typeof conf!= 'object') {
		var conf = new Object();
	}
	if(typeof conf.bgcolor == 'undefined') {
		conf.bgcolor = '#339900';
	}
	if(typeof conf.strokeSize == 'undefined') {
		conf.strokeSize = 4;
	}
	if(typeof conf.strokeColor == 'undefined') {
		conf.strokeColor = '#33cc00';
	}
	if(typeof conf.alpha == 'undefined') {
		conf.alpha = .6;
	}
	if(typeof conf.caption == 'undefined') {
		conf.caption = 'Game Over';
	}
	if(typeof conf.captionColor == 'undefined') {
		conf.captionColor = '#ffff00';
	}
	if(typeof conf.font == 'undefined') {
		conf.font = '標楷體';
	}
	if(typeof conf.description == 'undefined') {
		conf.description = '';
	}
	if(typeof conf.description2 == 'undefined') {
		conf.description2 = '';
	}
	if(typeof conf.fontColor == 'undefined') {
		conf.fontColor = '#ffffff';
	}
	if(typeof conf.fontSize == 'undefined') {
		conf.fontSize = 50;
	}
	if(typeof conf.buttonCaption == 'undefined') {
		conf.buttonCaption = '重新挑戰';
	}
	if(typeof conf.buttonColor == 'undefined') {
		conf.buttonColor = '#77ff44';
	}
	if(typeof conf.button2Caption == 'undefined') {
		conf.button2Caption = '回主選單';
	}
	if(typeof conf.button2Color == 'undefined') {
		conf.button2Color = '#ffff66';
	}
	this.conf = conf;
	return this;
};
/**
 * Get Configuration of the dialog
 * @protected
 * @return {object} conf.
 */
game.Dialog.prototype.getConfig = function() {
	return this.conf;
};

game.Dialog.prototype.makeDialog = function(callback, callback2) {
	var conf = this.conf;
	var rgb = new Array();
	for(var i=0; i<3; i++) {
		rgb[i] = parseInt( '0x'+conf.bgcolor.substr(1+i*2,2) );
	}

	/*
	var dateEnd  = new Date();
	var ss = Math.round((dateEnd-dateStart)/1000);	//轉為秒數(四捨五入)
	//timeTotal = Math.round(timeTotal/1000);	//轉為秒數(四捨五入)
	//var ss = timeTotal;
	var mm = Math.floor(ss/60);
	var hh = Math.floor(mm/60);
	ss = ss%60;
	mm = mm%60;
	var timeTotalStr = '使用時間：'+ hh + '時' + (mm<10 ? '0'+mm : mm) + '分' + (ss<10 ? '0'+ss : ss) + '秒';
	*/
	
	//如果有指定留記錄的 URL 就將做答資訊送給指定位址
	//if(typeof logger_url != 'undefined' && logger_url.length > 0) {
	//	var url = logger_url + '?title=' + labelTitle.getText() + '&timeTotal=' + timeTotal + '&faultTotal=' + faultTotal;
	//	phonetics_quiz.get_file_contents(url, function(str) { /* aler(str); */ } );
	//}
	
	//顯示做答結果
	this.setRadius(40).setSize(720, 540)
							.setFill(rgb[0], rgb[1], rgb[2], conf.alpha).setStroke(conf.strokeSize, conf.strokeColor)
							.setOpacity(1);
	this.caption = new lime.Label().setSize(512,115).setFontSize(76).setPosition(0,-173)
							.setText(conf.caption).setFontColor(conf.captionColor).setFontFamily(conf.font);
	this.appendChild(this.caption);
	this.description = new lime.Label().setSize(640,conf.fontSize).setFontSize(conf.fontSize).setPosition(0,-90)
							.setText(conf.description).setFontColor(conf.fontColor).setFontFamily(conf.font);
	this.appendChild(this.description);
	this.description2 = new lime.Label().setSize(640,conf.fontSize).setFontSize(conf.fontSize).setPosition(0,-90+conf.fontSize*1.5)
							.setText(conf.description2).setFontColor(conf.fontColor).setFontFamily(conf.font);
	this.appendChild(this.description2);
	//var labelTime = new lime.Label().setSize(500,35).setFontSize(32).setPosition(0,10)
	//						.setText(timeTotalStr).setFontColor('#ffffff').setFontFamily('標楷體');
	//thisGameOver.appendChild(labelTime);
	this.button1 = new game.Button(conf.buttonCaption).setPosition(0, 190).setSize(230, 64).setColor(conf.buttonColor).setFontFamily(conf.font);
	//this.setButtonFontSize(this.button1);
	this.appendChild(this.button1);
	//按下去進行什麼動作
	goog.events.listen(this.button1, ['mousedown','touchstart'], function() {
			this.getParent().removeChild(this);
		if(typeof callback == 'function') {
			callback();
		}
	}, false, this);
	//如果有選單設定的話, 多加一個回主選單的按鈕
	if(typeof callback2 == 'function') {
		var pos = this.button1.getPosition();
		var size = this.button1.getSize();
		pos.x = Math.floor(pos.x + size.width/2 + 20);
		//this.button1.setPosition(0, 205);
		this.button1.setPosition(pos.x, pos.y);
		pos.x = pos.x - size.width - 40;
		//this.button2 = new game.Button(conf.button2Caption).setPosition(0, 128).setSize(230, 64).setColor(conf.button2Color).setFontFamily(conf.font);
		this.button2 = new game.Button(conf.button2Caption).setPosition(pos).setSize(size).setColor(conf.button2Color).setFontFamily(conf.font);
		//this.setButtonFontSize(this.button2);
		this.appendChild(this.button2);
		//按下去進行什麼動作
		goog.events.listen(this.button2, ['mousedown','touchstart'], function() {
			this.getParent().removeChild(this);
			callback2();
		}, false, this);
	};

	return this;
};
/**
 * Set label font size for a button.
 * @protected
 * @param {game.Button} object.
 */
game.Dialog.prototype.setButtonFontSize = function(b, size) {
	var s = b.getSize();
	if( s.width > 0 ) {
		if(typeof(size) == 'undefined') {
			var sizeMax = Math.floor(s.height*0.9);
			var scale = (s.width-b.borderWidth)*.95/b.upstate.label.getSize().width;
			size = Math.floor(b.upstate.label.getFontSize() * scale);
			if( size > sizeMax ) {
				size = sizeMax;
			}
		}
		b.upstate.label.setFontSize(size);
		b.downstate.label.setFontSize(size);
	}	
};


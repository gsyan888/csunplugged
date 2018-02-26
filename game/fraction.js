goog.provide('game.Fraction');

goog.require('lime.Sprite');
goog.require('lime.Label');

/**
 * @constructor
 */
game.Fraction = function(callback) {
	lime.Sprite.call(this);
	
	this.defaultFontSize = 60;
	this.fontsize = this.defaultFontSize;
	this.fontcolor = '#000000';
	this.width = 0;
	
};
goog.inherits(game.Fraction, lime.Sprite);

game.Fraction.prototype.setFontSize = function(value) {
	if( typeof(this.text) != 'undefined' ) {
		var scale = value/this.defaultFontSize;
		this.setScale(scale);
	}
	this.fontsize = value;
	return this;
};
game.Fraction.prototype.setFontColor = function(value) {
	this.fontcolor = value;
	return this;
};
game.Fraction.prototype.setShadowColor = function(value) {
	this.shadowColor = value;
	return this;
};
game.Fraction.prototype.setFontFamily = function(value) {
	this.font = value;
	return this;
};
/**
 * 產生分數
 *		參數:
 *			strIn 分數的字串表示法  [a:b:c]+[d:e]= ?  a又c分之b + e分之d = ?
 *			fontsize : 字型大小
 *			fontcolor : 字和線的顏色
 *		傳回一個 Sprite() 物件, 順便多一個 .xOffset 記錄置中時 x 要減多少
 */
game.Fraction.prototype.setText = function(strIn) {
	var x = 0;
	
	var lineThickness = Math.ceil(this.fontsize/20);
	if(lineThickness<1) {
		lineThickness = 1;
	}
	
	//在分數表示式的前後加入chr(0)
	strIn = strIn.replace(/\[\d+:\d+\]|\[\d+:\d+:\d+\]/g,String.fromCharCode(0)+'$&'+String.fromCharCode(0));
	//將分數與其它字串分離
	var strArray = strIn.split(String.fromCharCode(0));
	//把空字串的去掉
	for(var i=0; i< strArray.length; i++) {
		if(strArray[i] == '') {	
			strArray.splice(i, 1);
			i--;
		}
	}
	for(var i=0; i< strArray.length; i++) {
		var str = strArray[i];
		try {
			var f = str.match(/\[(\d+:\d+:\d+)\]|\[(\d+:\d+)\]/);	//去掉中括號
		} catch(e) { var f = null; };
		if( typeof f == 'object' && f != null ) {	//分數
			if(typeof f['1'] == 'string') {
				var fraction = f[1].split(':');
			} else {
				var fraction = f[2].split(':');
			}
			var sprite = new lime.Sprite();			
			if(fraction.length > 2 && fraction[0] != '0') {
				var labelA = new lime.Label().setFontSize(this.fontsize)
											.setFontColor(this.fontcolor)
											.setText(fraction[0]);
				if(typeof this.shadowColor != 'undefined') {
					labelA.setShadow(this.shadowColor, 2, 1,1);
				}
				var wA = labelA.measureText().width;
				sprite.appendChild(labelA);
				x += wA/2;
			} else {
				var wA = 0;
			}
			var labelB = new lime.Label().setFontSize(this.fontsize)
										.setFontColor(this.fontcolor)
										.setText(fraction[fraction.length-2]);
			if(typeof this.shadowColor != 'undefined') {
				labelB.setShadow(this.shadowColor, 2, 1,1);
			}
										
			var labelC = new lime.Label().setFontSize(this.fontsize)
										.setFontColor(this.fontcolor)
										.setText(fraction[fraction.length-1]);
			if(typeof this.shadowColor != 'undefined') {
				labelC.setShadow(this.shadowColor, 2, 1,1);
			}
			var wB = labelB.measureText().width;							
			var wC = labelC.measureText().width;
			var h = labelB.measureText().height;
			if(wB > wC) {
				wLine = wB;
			} else {
				wLine = wC;
			}
			wLine = Math.round(wLine*1.2)+6;
			labelB.setPosition(wA/2+wLine/2+3,-h+this.fontsize/2);
			labelC.setPosition(wA/2+wLine/2+3, h-this.fontsize/2);
			if(typeof this.shadowColor != 'undefined') {		
				var line = new lime.Polygon(0,-1*lineThickness, wLine,-1*lineThickness, wLine,lineThickness, 0,lineThickness).setFill(this.shadowColor)
									.setPosition(wA/2+4,1);
				sprite.appendChild(line);
			}
			var line = new lime.Polygon(0, -1*lineThickness, wLine,-1*lineThickness, wLine,lineThickness, 0,lineThickness).setFill(this.fontcolor)
									.setPosition(wA/2+3,0);
			sprite.appendChild(line);
			sprite.appendChild(labelB);
			sprite.appendChild(labelC);
			this.appendChild(sprite);
			sprite.setPosition(x, 0);
			
			//var s = new lime.Sprite().setSize(1,120).setFill('#00ff00').setPosition(x,0);
			//this.appendChild(s);
			if(wA > 0) {
				x += wLine/2+this.fontsize*.7+wA/2;
			} else {
				if(strArray.length > 1) {
					x += wLine/2+this.fontsize;
				} else {
					x += wLine/2+this.fontsize*.7;
				}
			}
			
			//var s = new lime.Sprite().setSize(1,100).setFill('#ff0000').setPosition(x,0);
			//this.appendChild(s);
		} else {
			var label = new lime.Label().setFontSize(this.fontsize)
										.setFontColor(this.fontcolor)
										.setText(str);
			if(typeof this.shadowColor != 'undefined') {
				label.setShadow(this.shadowColor, 2, 1,1);
			}										
			var wA = label.measureText().width;
			//console.log(str + ':'+wA);
			x += wA*.5;
			//var s = new lime.Sprite().setSize(2,80).setFill('#ffff00').setPosition(x,0);
			//this.appendChild(s);
			label.setPosition(x, 0);
			this.appendChild(label);
			x += wA/2+this.fontsize/5;
			//var s = new lime.Sprite().setSize(3,60).setFill('#00ffff').setPosition(x,0);
			//this.appendChild(s);
		}
	}
	
	this.xOffset = -x/2;
	this.width = x;
	return this;	
};
//判斷是否為分數的表示式
game.Fraction.prototype.isFraction = function(str) {
	try {
		var f = str.match(/\[\d+:\d+:\d+\]|\[\d+:\d+\]/);
	} catch(e) { var f = null; }
	if( typeof f == 'object' && f != null ) {
		return true;
	} else {
		return false;
	}
};

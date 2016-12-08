//set main namespace
goog.provide('cs.colour_by_numbers');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');

goog.require('game.FlipCard');
//goog.require('cs.colour_by_numbers.Audio');

cs.colour_by_numbers.Width = 1024;
cs.colour_by_numbers.Height = 768;


cs.colour_by_numbers.isSoundInit = false;

cs.colour_by_numbers.cardFrontColor = "#000000";
cs.colour_by_numbers.cardBackgroundColor = "#FFFFFF";

isChecking = false;
cardSelected = '';


cs.colour_by_numbers.colourWidth = 800;
cs.colour_by_numbers.colourHeight = 600;
cs.colour_by_numbers.col = 36;
cs.colour_by_numbers.row = 24;

cs.colour_by_numbers.textWidth = 180;

cs.colour_by_numbers.colourStartX = 20;
cs.colour_by_numbers.colourStartY = 70;

cs.colour_by_numbers.boxWidth = 24;
cs.colour_by_numbers.boxHeight = 24;
cs.colour_by_numbers.boxTitleHeight = 40;
cs.colour_by_numbers.boxTextFontSize = 30;



//cs.colour_by_numbers.cardBorder = 2;
//cs.colour_by_numbers.cardBorderColor = '#808080';

cs.colour_by_numbers.cardBorder = 1;				//card 被選時的邊框粗細
cs.colour_by_numbers.cardBorderColor = '#BDBDBD';	//card 被選時的邊框顏色

cs.colour_by_numbers.cardBack = "assets/smile.png";	//card 背面的文字或圖案
cs.colour_by_numbers.cardBackColor = '#6F4E37';		//card 背面文字的背景顏色

// entrypoint
cs.colour_by_numbers.start = function(){

	var director = new lime.Director(document.body,cs.colour_by_numbers.Width ,cs.colour_by_numbers.Height),
	    scene = new lime.Scene();

	var bgLayer = new lime.Layer();
	var creditLayer = new lime.Layer();
	colourLayer = new lime.Layer();
	numbersLayer = new lime.Layer();
	settingLayer = new lime.Layer();
	
	scene.appendChild(bgLayer);			//background
	scene.appendChild(creditLayer);		//credit		
	scene.appendChild(colourLayer);		//colour
	scene.appendChild(numbersLayer);	//numbers		
	scene.appendChild(settingLayer);	//setting
	
	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊

	var labelTitle = new lime.Label().setSize(500,50)
									.setFontColor('#0000FF')
									.setFontSize(48)
									.setPosition(cs.colour_by_numbers.Width/2, 35)
									.setText('Colour by Numbers');	
	bgLayer.appendChild(labelTitle);
	
	
	var labeSettingY = cs.colour_by_numbers.Height-40;
	labelRowSetting= new lime.Label().setSize(100,32)
									.setFontColor('#006600')
									.setFontSize(24)
									//.setStroke(1,'#33cc00')
									.setPosition(cs.colour_by_numbers.Width/2+70, labeSettingY)
									.setText(cs.colour_by_numbers.row);
	labelSetting= new lime.Label().setSize(32,32)
									.setFontColor('#006600')
									.setFontSize(24)
									.setPosition(cs.colour_by_numbers.Width/2, labeSettingY)
									.setText('X');									
	labelColSetting= new lime.Label().setSize(100,32)
									.setFontColor('#006600')
									.setFontSize(24)
									//.setStroke(1,'#33cc00')
									.setPosition(cs.colour_by_numbers.Width/2-70, labeSettingY)
									.setText(cs.colour_by_numbers.col);
	settingLayer.appendChild(labelSetting);
	settingLayer.appendChild(labelRowSetting);
	settingLayer.appendChild(labelColSetting);
	
	var localeLang = (navigator.language || navigator.userLanguage).toLowerCase();
	if( localeLang == 'zh-tw' || localeLang == 'zh-cn' ) {
		inputColCaption = '請輸欄數';
		inputRowCaption = '請輸行數';
	} else {
		inputColCaption = 'the number of columns';
		inputRowCaption = 'the number of rows';
	}
	
	goog.events.listen(labelRowSetting, ['mousedown','touchstart'], function() {
		var row;
		//do {
			row = prompt(inputRowCaption,cs.colour_by_numbers.row );
		//} while(row == null || row < 1);
		if(row != null && cs.colour_by_numbers.row != row) {
			cs.colour_by_numbers.row = row;
			cs.colour_by_numbers.settingChanges();
		}
	});
	goog.events.listen(labelColSetting, ['mousedown','touchstart'], function() {
		var col;
		//do {
			col = prompt(inputColCaption,cs.colour_by_numbers.col );
		//} while(col == null || col < 1);
		if(col != null && cs.colour_by_numbers.col != col) {
			cs.colour_by_numbers.col = col;
			cs.colour_by_numbers.settingChanges();
		}
	});
	
	//以預設的值產生 pixle
	cs.colour_by_numbers.settingChanges();
	
	
	//cs.colour_by_numbers.createAudioObject();
	
	// set current scene active
	director.replaceScene(scene);

}

cs.colour_by_numbers.newColours = function() {
	try {
		colourLayer.removeAllChildren();
	} catch(e) {};
	
	var startX = cs.colour_by_numbers.colourStartX;
}

cs.colour_by_numbers.settingChanges = function() {
	try {
		colourLayer.removeAllChildren();
	} catch(e) {};
	
	labelRowSetting.setText(cs.colour_by_numbers.row);
	labelColSetting.setText(cs.colour_by_numbers.col);
	
	var w = Math.floor(cs.colour_by_numbers.colourWidth/cs.colour_by_numbers.col);
	var h = Math.floor(cs.colour_by_numbers.colourHeight/cs.colour_by_numbers.row);
	
	if( w > h && w*cs.colour_by_numbers.row > cs.colour_by_numbers.colourHeight) {
		w = h;
	}
	
	var cards = new Array();	
	var text = new Array();
	
	var startX = cs.colour_by_numbers.colourStartX + (cs.colour_by_numbers.colourWidth-w*cs.colour_by_numbers.col)/2+w/2;
	var startY = cs.colour_by_numbers.colourStartY + (cs.colour_by_numbers.colourHeight-w*cs.colour_by_numbers.row)/2+w/2;
	for(var r = 0; r < cs.colour_by_numbers.row; r++) {
		for(var c = 0; c < cs.colour_by_numbers.col; c++) {
			var i = r*cs.colour_by_numbers.col+c;
			var back = new lime.Sprite().setSize(w,w)
										.setFill(cs.colour_by_numbers.cardBackgroundColor)
										.setStroke(cs.colour_by_numbers.cardBorder, cs.colour_by_numbers.cardBorderColor);

			var front = new lime.Sprite().setSize(w,w)
										.setFill(cs.colour_by_numbers.cardFrontColor)
										.setStroke(cs.colour_by_numbers.cardBorder, cs.colour_by_numbers.cardBorderColor);
						
			cards[i] = new game.FlipCard(back, front)
										.setPosition(startX+w*c,startY+w*r);
			colourLayer.appendChild(cards[i]);
		}
		var fontSize = Math.floor(w*.7);
		text[r] = new lime.Label().setSize(cs.colour_by_numbers.textWidth,w*.75)
									.setFontColor('#000000')
									.setFontSize(fontSize)
									.setStroke(1,'#E6E6E6')
									.setAlign('left')
									.setPosition(startX+w*cs.colour_by_numbers.col+cs.colour_by_numbers.textWidth/2, startY+w*r)
									.setText('');
        text[r].defaultFontSize = fontSize; 									
		colourLayer.appendChild(text[r]);
		goog.events.listen(text[r], ['mousedown','touchstart'],function(e){
			var value = this.getText();
			var txt;
			//do {
				txt = prompt('請輸入數碼:',value );
			//} while(txt == null);
			if(txt != null && txt != value) {
				this.setText(txt).setFontSize(this.defaultFontSize);
				if(this.measureText().width > cs.colour_by_numbers.textWidth) {
					this.setFontSize(Math.floor(this.defaultFontSize*cs.colour_by_numbers.textWidth/this.measureText().width));
				}
				//alert(this.measureText().width);

			}
		});
	}
}

cs.colour_by_numbers.createAudioObject = function() {
	cs.colour_by_numbers.isSoundInit = false;
	if(goog.global['AudioContext'] || goog.global['webkitAudioContext']) {
		if(goog.userAgent.GECKO) {
			cs.colour_by_numbers.sound_click1 = new cs.colour_by_numbers.Audio(cs.colour_by_numbers.snd_click1_ogg);
			cs.colour_by_numbers.sound_click2 = new cs.colour_by_numbers.Audio(cs.colour_by_numbers.snd_clisk2_ogg);
		} else {
			cs.colour_by_numbers.sound_click1 = new cs.colour_by_numbers.Audio(cs.colour_by_numbers.snd_click1_mp3);
			cs.colour_by_numbers.sound_click2 = new cs.colour_by_numbers.Audio(cs.colour_by_numbers.snd_click2_mp3);
		}
	} else {
		cs.colour_by_numbers.sound_click1 = new cs.colour_by_numbers.Audio('assets/snd_click1.mp3');
		cs.colour_by_numbers.sound_click2 = new cs.colour_by_numbers.Audio('assets/snd_click2.mp3');
	}
}

cs.colour_by_numbers.soundInit = function() {
	cs.colour_by_numbers.isSoundInit = true;
	//if(!cs.colour_by_numbers.isSoundInit && sound_win.isLoaded()) {
	//如果是 iOS 的, 要先利用按鈕播放一次, 後續才能用程式控制
	if( lime.userAgent.IOS ) {	
		try {
			cs.colour_by_numbers.sound_click1.playing_ = false;
			cs.colour_by_numbers.sound_click2.playing_ = false;
		} catch(e) {};
		try {
			cs.colour_by_numbers.sound_click1.setVolume(0);
		} catch(e) {};
		try {
			cs.colour_by_numbers.sound_click1.play();
		} catch(e) {};
		try {
			cs.colour_by_numbers.sound_click2.setVolume(0);
		} catch(e) {};
		try {
			cs.colour_by_numbers.sound_click2.play();
		} catch(e) {};
		
		//alert('test');
	} else {
		try {
			cs.colour_by_numbers.sound_click1.setVolume(1);
		} catch(e) {};	
		try {
			cs.colour_by_numbers.sound_click2.setVolume(1);
		} catch(e) {};
		//cs.colour_by_numbers.sound_correct.play();
		//cs.colour_by_numbers.sound_wrong.play();
	}

};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.colour_by_numbers.start', cs.colour_by_numbers.start);

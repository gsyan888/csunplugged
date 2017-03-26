//set main namespace
goog.provide('cs.battleships');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Polygon');
goog.require('lime.RoundedRect');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy')
goog.require('lime.animation.RotateTo');
goog.require('lime.animation.Sequence');

goog.require('game.Button');
goog.require('game.Audio');
goog.require('game.Util');

cs.battleships.Width = 1024;
cs.battleships.Height = 768;
cs.battleships.config_file = 'battleships_conf.js';
cs.battleships.level = 0;
cs.battleships.enabled = false;
cs.battleships.isSoundInit = false;

// entrypoint
cs.battleships.start = function(){

	director = new lime.Director(document.body,cs.battleships.Width,cs.battleships.Height);
	scene = new lime.Scene();

	backgroundLayer = new lime.Layer();
	shipLayer = new lime.Layer();
	topLayer = new lime.Layer();
	
	scene.appendChild(backgroundLayer);
	scene.appendChild(shipLayer);
	scene.appendChild(topLayer);
	

	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊
	
	radar = new lime.Layer().setPosition(cs.battleships.Width/2,cs.battleships.Height*6/7)
							.setOpacity(0.4);
	var r = cs.battleships.Width*3/4 - 20;
	var radarSprite = cs.battleships.radarSprite(r-50,'#04B431' );
	var circle = new lime.Circle().setSize(r, r)
									.setFill('#E0ECF8')
									.setOpacity(0.7);
	radar.appendChild(radarSprite);
	radar.appendChild(circle);
	backgroundLayer.appendChild(radar);
	
	timer = cs.battleships.newTimer(0, '#04B431', true);
	//timer.setPosition(30, 30);
	timer.setScale(2).setPosition(cs.battleships.Width-70,cs.battleships.Height-70);
	backgroundLayer.appendChild(timer);
	
	
	cs.battleships.init();
	

	// set current scene active
	director.replaceScene(scene);

}

cs.battleships.init = function() {
	game.Util.loadSettingFromExternalScript(cs.battleships.config_file, function() {
		cs.battleships.isSoundInit = false;
		
		if(typeof cfg_locale_LANG == 'undefined' || cfg_digitsTotal == 'undefined' ) {
			cs.battleships.showMessage('File Load Failure : '+cs.battleships.config_file, 36, '#ff0000', 9999, 'middle');
			return;
		}
		
		if(typeof cfg_sound_explosion_file != 'undefined' && cfg_sound_explosion_mp3 != 'undefined' &&  cfg_sound_explosion_ogg != 'undefined' ) {
			sound_explosion = new game.Audio(cfg_sound_explosion_file, cfg_sound_explosion_mp3, cfg_sound_explosion_ogg);
		}
		
		cs.battleships.level = 0;
		
		//任意門,設定 level
		var anywhereDoor = game.Util.gup('AnywhereDoor');
		var level = game.Util.gup('level');
		if(typeof(anywhereDoor) != 'undefined' && typeof(level) != 'undefined') {
			if(anywhereDoor == 'tpet') {
				var n = parseInt(level);
				if(n > 0 && n <= cfg_levelSettings.length) {
					cs.battleships.level = n-1;
				}
				
			}
		}
		var langFilename = 'lang_'+cfg_locale_LANG+'.js';
		game.Util.loadSettingFromExternalScript(langFilename, function() {	
			if(1 && typeof cfg_levelSettings == 'undefined') {
				cs.battleships.showMessage('File Load Failure : '+langFilename, 36, '#ff0000', 9999, 'middle');
				return;
			} else {
				cs.battleships.newGame();
			}
		});
		
	});
}

cs.battleships.soundInit = function() {
	cs.battleships.isSoundInit = true;
	//if(!cs.battleships.isSoundInit && sound_win.isLoaded()) {
	//如果是 iOS 的, 要先利用按鈕播放一次, 後續才能用程式控制
	if( lime.userAgent.IOS ) {	
		sound_explosion.playing_ = false;
		sound_explosion.setVolume(0);
		sound_explosion.play();
	} else {
		sound_explosion.setVolume(1);
	}
};

cs.battleships.newGame = function() {
	//clear all object before a new game
	for(var i=0; i<topLayer.getNumberOfChildren(); i++) {
		var child = topLayer.getChildAt(i);
		//try {
			lime.animation.actionManager.stopAll(child);
			topLayer.removeChild(child);
		//} catch(e) {	};
	}
	try {
		shipLayer.removeAllChildren();
	} catch(e) {	};

	if(!cs.battleships.isSoundInit) {
		cs.battleships.soundInit();
	}

	//關別種類
	cs.battleships.levelType = cfg_levelSettings[cs.battleships.level][3];
	cs.battleships.levelDescription = cfg_levelSettings[cs.battleships.level][4];
	
	scale = 1;
	shipsTotal = cfg_levelSettings[cs.battleships.level][0];
	colTotal = cfg_levelSettings[cs.battleships.level][1];
	if(colTotal > 6) {
		scale = 6/colTotal;
	} else {
		scale = 1;
	}
	shipWidth = 170;	//150x40

	//the Target (the index of shipnumbers : selected by random)
	cs.battleships.target = Math.floor(Math.random()*shipsTotal);
		
	//sorted numbers (range:1000~9999)
	shipNumbers = new Array();
	numberToId = new Array();
	numberIndex = new Array();
	
	//將 1000~9999 分成 shipsTotal 個區間, 
	//每個區間隨選一個數
	if(typeof(cfg_digitsTotal) == 'undefined') {
		cfg_digitsTotal = 4;
	}
	if( cfg_digitsTotal < 2) {
		cfg_digitsTotal = 1;
		shipNumberMin = 0;
		shipNumberTotal = 9;
	} else {
		shipNumberMin = Math.pow(10, cfg_digitsTotal-1);
		shipNumberTotal = shipNumberMin * 9;
	}
	//console.log([cfg_digitsTotal, numberMin, numberTotal]);
	shipNumberOffset = Math.floor(shipNumberTotal/shipsTotal);
	for(var i=0; i<shipsTotal; i++) {
		if( shipNumberOffset > 20) {
			shipNumbers[i] = shipNumberMin+shipNumberOffset*i+Math.floor(Math.random()*(shipNumberOffset-10));
		} else {
			shipNumbers[i] = shipNumberMin+shipNumberOffset*i+Math.floor(Math.random()*shipNumberOffset);
		}
		numberIndex[i] = i;
	}
	
	//level 4,5 檢查是否超過每個港的最大容量
	//超過就將它調至下一個
	if(cs.battleships.levelType == 2) {	//hash type level
		var portMax = 5;	//每個港最大容量
		var shipPorts = new Array();
		for(var i=0; i<shipsTotal; i++) {
			var shipNumber = shipNumbers[i];
			
			//get hash number
			//var col = ( Math.floor(shipNumber/1000) + Math.floor(shipNumber/100) + Math.floor(shipNumber/10) + (shipNumber%10) ) % 10;
			col = cs.battleships.getHash(shipNumber, cfg_digitsTotal);
			
			if(typeof(shipPorts[col])=='undefined') {
				shipPorts[col] = new Array();
				shipPorts[col][0] = i;
			} else if(shipPorts[col].length < portMax) {
				var row = shipPorts[col].length;
				shipPorts[col][row] = i;
			} else {
				shipNumbers[i]++;
				i--;
			}
		}
		delete shipPorts;
	}
	
			
	//Current Level (at the right bottom)
	levelCaption = new lime.Circle().setSize(80,80)
									.setFill('#E0ECF8')
									.setOpacity(0.7)
									.setPosition(cs.battleships.Width-70,cs.battleships.Height-70);
	var caption = new lime.Label().setText('Level')
									.setFontSize(8)
									.setFontColor('#0000ff')
									.setPosition(0,-22);
	var label = new lime.Label().setText(cs.battleships.level+1)
									.setFontSize(40)
									.setFontColor('#0000ff')
									.setPosition(0,8);
	levelCaption.appendChild(caption);
	levelCaption.appendChild(label);
	shipLayer.appendChild(levelCaption);
	
	
	ships = new Array();
	portSprites = new Array();
	
	var xStart = (cs.battleships.Width - shipWidth*scale*(colTotal-1))/2;
	var yStart = 130*scale;
	
	//draw ship ports 
	if(cs.battleships.levelType == 2) {	//hash type level
		var shipPorts = new Array();
		yStart = 120;
		for(var i=0; i<colTotal; i++) {
			shipPorts[i] = new Array();
			var x = xStart + shipWidth*(i%colTotal)*scale;
			portSprites[i] = new lime.Sprite().setSize(shipWidth*scale, cs.battleships.Height/2-100)
										.setStroke(1)
										//.setOpacity(0.5)
										.setPosition(x,cs.battleships.Height/4+30);
			portSprites[i].label = new lime.Label().setText(i)
										.setFontSize(42)
										.setFontColor('#A4A4A4')
										.setPosition(0, -portSprites[i].getSize().height/2-25);
			portSprites[i].appendChild(portSprites[i].label);
			shipLayer.appendChild(portSprites[i]);
		}
	}
	
	var shipNumberIndexToShipsIndex = new Array();
	
	//draw ships
	for(var i=0; i<shipsTotal; i++) {
		//get ship number && make ship number and ship ID map
		if( cfg_levelSettings[cs.battleships.level][2] == false ) {
			//random shipnumber
			var n = Math.floor(Math.random()*numberIndex.length);
			shipNumber = shipNumbers[numberIndex[n]];
			shipNumberIndexToShipsIndex[numberIndex[n]] = i;
			numberIndex.splice(n, 1);
			var idIndex = Math.floor((shipNumber-shipNumberMin)/shipNumberOffset);
			numberToId[idIndex] = String.fromCharCode(65+i);
			if(idIndex == cs.battleships.target) {
				targetShipIndex = i;
			}
		} else {
			//sorted shipnumber
			shipNumber = shipNumbers[i];
			numberToId[i] = String.fromCharCode(65+i);
			shipNumberIndexToShipsIndex[i] = i;
			if(i == cs.battleships.target) {
				targetShipIndex = i;
			}
		}
		
		//get posisition
		if(cs.battleships.levelType == 2) { //hash type level
			//var col = ( Math.floor(shipNumber/1000) + Math.floor(shipNumber/100) + Math.floor(shipNumber/10) + (shipNumber%10) ) % 10;
			var col = cs.battleships.getHash(shipNumber, cfg_digitsTotal);
			var row = shipPorts[col].length;
			shipPorts[col][row] = i;
			var x = xStart + shipWidth*scale*col;
			var y = yStart + 90*scale*row;
		} else {	//other type level
			var x = xStart + shipWidth*(i%colTotal)*scale;
			var y = yStart + 120*Math.floor(i/colTotal)*scale;
		}
		
		
		ships[i] = new lime.Layer().setScale(scale).setPosition(x,y);
		ships[i].sprite = new lime.Sprite().setFill(cfg_imageShip)
									.setPosition(0,0);
		ships[i].appendChild(ships[i].sprite);
		ships[i].label = new lime.Label().setText(String.fromCharCode(65+i))
									.setFontSize(24)
									.setPosition(0, -40);
		ships[i].appendChild(ships[i].label);
		
		
		ships[i].number = new lime.Label().setText(shipNumber)
									.setFontSize(24)
									.setFontColor('#00ff00')
									.setHidden(1)
									.setPosition(0, 5);
		ships[i].appendChild(ships[i].number);
		shipLayer.appendChild(ships[i]);
		
		if(cfg_debug) {	
			ships[i].number.setHidden(0); 
		}
	}
	
	//Level 5/6  change ship id
	if(cs.battleships.levelType == 2) {	//hash type level
		var c = 0;
		for(var col=0; col<shipPorts.length; col++) {
			for(var row=0; row<shipPorts[col].length; row++) {
				ships[shipPorts[col][row]].label.setText(String.fromCharCode(65+c));
				var shipNumber = parseInt(ships[shipPorts[col][row]].number.getText());
				var idIndex = Math.floor((shipNumber-shipNumberMin)/shipNumberOffset);
				numberToId[idIndex] = String.fromCharCode(65+c);
				if(shipNumbers[cs.battleships.target] == shipNumber) {
					targetShipIndex = shipPorts[col][row];
					targetPortIndex = col;
				}
				c++;
			}
		}
		portSprites[targetPortIndex].setFill('#F6CEF5');
		portSprites[targetPortIndex].label.setFontColor('#ff0000');
	}
	
	//draw rocket
	shoots = new Array();
	var yStart = cs.battleships.Height/2+60;
	//random order for unsorted position
	if(  cfg_levelSettings[cs.battleships.level][2] == false ) {
		var randomOrder = game.Util.makeRandomIndex(0, shipsTotal-1);
	}
	//start to draw all rockets
	for(var i=0; i<shipsTotal; i++) {
		if(  cfg_levelSettings[cs.battleships.level][2] == false ) {
			var r = randomOrder[i];
			var x = xStart + shipWidth*scale*(r%colTotal);
			var y = yStart + 170*scale*Math.floor(r/colTotal);
		} else {
			var x = xStart + shipWidth*scale*(i%colTotal);
			var y = yStart + 170*scale*Math.floor(i/colTotal);
		}
		shoots[i] = cs.battleships.makeShoot(shipNumbers[i],numberToId[i]).setScale(scale).setPosition(x,y);
		shipLayer.appendChild(shoots[i]);
		shoots[i].shipIndex = shipNumberIndexToShipsIndex[i];
	}
	helpText = cs.battleships.levelDescription;
	cs.battleships.helpDialog();	//顯示說明的對話框	
	
	if(cs.battleships.level == 0 || cs.battleships.level >= cfg_levelSettings.length) {
		cs.battleships.resetTimer();
		cs.battleships.pauseTimer();
		timer.label.setText(0);
	}
}

cs.battleships.getHash = function(numberInput, digitsTotal) {
	var result = 0;
	for(var c = digitsTotal-1; c >= 1; c--) {
		result += Math.floor(numberInput/Math.pow(10, c));
	}
	result = ( result + (numberInput % 10) ) % 10;
	//console.log([digitsTotal, numberInput, result]);
	return result;
}

cs.battleships.playGame = function() {
	if(cs.battleships.levelType == 2) {	//hash type level
		cs.battleships.showMessage(cfg_messagePortHintPrefix + targetPortIndex + cfg_messagePortHintPostfix, 46,"#ff0000", cfg_messageDelayPortHint , 'bottom', function() { 
			cs.battleships.enabled = true;
			cs.battleships.playTimer();
		});
	} else {	//other type level
		cs.battleships.enabled = true;
		cs.battleships.playTimer();
	}
}

cs.battleships.makeShoot = function(shipNumber, shipId) {
	var sprite = new lime.Layer();
	var labelColor = '#0000ff';
	//if(String.fromCharCode(65+cs.battleships.target) == shipId) {
	if(numberToId[cs.battleships.target] == shipId) {
		labelColor = '#ff0000';
		sprite.isTarget = true;
	} else {
		sprite.isTarget = false;
	}
	sprite.rocket = new lime.Sprite().setFill(cfg_imageRocket)
							.setOpacity(30)
							.setPosition(0,0);
	sprite.number = new lime.Label().setText(shipNumber)
									.setFontSize(32)
									.setFontColor('#AEB404')
									.setPosition(0,-70);
	sprite.label = new lime.Label().setText(shipId)
									.setFontSize(24)
									.setFontColor(labelColor)
									.setHidden(1)		
									.setPosition(0,8);
	if(cfg_debug) {	
		sprite.label.setHidden(0);
		if(sprite.isTarget)									 {
			sprite.label.setFontSize(48);
		}
	}
	sprite.rocket.appendChild(sprite.label);
	//sprite.appendChild(sprite.target);
	sprite.appendChild(sprite.rocket);
	sprite.appendChild(sprite.number);
	sprite.enabled = true;
	goog.events.listen(sprite, ['mousedown','touchstart'], function(e){	
		if(!cs.battleships.enabled || !this.enabled) {
			return;
		}
		
		cs.battleships.enabled = false;	//2017.03.27 add by gsyan 
		
		//temprature hide the still rocket,
		//find ship number and show shooted animation
		sprite.rocket.setHidden(1);	

		var n = sprite.shipIndex;	//the index of shooted ship
		
		var x1 = ships[n].getPosition().x;
		var y1 = ships[n].getPosition().y;
		var x2 = sprite.getPosition().x;
		var y2 = sprite.getPosition().y;
		var flyingRocket = new lime.Sprite().setFill(cfg_imageRocket)
								.setOpacity(30)
								.setPosition(x2,y2);
		var flame = new lime.Sprite().setFill(cfg_imageRocketFlame).setPosition(0,85).setHidden(0);
		flyingRocket.appendChild(flame);
		
		sprite.getParent().appendChild(flyingRocket);
		var xOffset = 50;
		if( x2-xOffset < 50 ) {
			xOffset = -50;
		}
		var deltaX = x2-xOffset - x1;
		var deltaY = y2 - y1;
		var deg = 90-Math.atan2(deltaY, deltaX)*180.0/Math.PI;
		//rocket.setRotation(deg)
		var ani = new lime.animation.Sequence(
							new lime.animation.MoveTo(x2-xOffset, y2).setDuration(.5),
							new lime.animation.RotateTo(deg).setDuration(.1),
							new lime.animation.Spawn(
								new lime.animation.ScaleTo(.3).setDuration(.4),
								new lime.animation.MoveTo(x1, y1).setDuration(.5)
							)
						);
		flyingRocket.runAction(ani);		
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			ships[n].sprite.setFill(cfg_imageExplode)
						.setSize(183,157)
						.setOpacity(0.5)
						.setPosition(0,0);
			ships[n].number.setFontColor('#04B431').setFontSize(32);

			//試著播放爆炸的音效
			try {
				sound_explosion.setVolume(1);
				sound_explosion.play();
			} catch(e) {};		
			flyingRocket.getParent().removeChild(flyingRocket);
			flyingRocket.removeDomElement();
			
			sprite.rocket.setHidden(0);
				
			cs.battleships.enabled = false;
			this.enabled = false;
			this.label.setHidden(0);
			if(this.isTarget) {
				cs.battleships.pauseTimer();
				
				for(var i=0; i<shipsTotal; i++) {
					if(shoots[i].label.getHidden() == 1) {
						shoots[i].rocket.setFill(cfg_imageShipGrey).setSize(150,40);
						shoots[i].number.setPosition(0,-45);
					}
					ships[i].number.setHidden(0);
				}
				
				this.rocket.setFill(cfg_imageShipPink).setSize(150,40);
				this.number.setFontColor('#ff0000');
				
				ships[targetShipIndex].number.setFontColor('#ff0000').setFontSize(32);
				ships[targetShipIndex].label.setFontColor('#ff0000');
				
				cs.battleships.showMessage(cfg_messageTargetHitted,70 ,"#ff0000", cfg_messageDelayTargetHitted, 'top', function() { 
					cs.battleships.enabled = false;
					levelCaption.setPosition(cs.battleships.Width-72,cs.battleships.Height-140);
					var nextButton = cs.battleships.nextButton()
													.setScale(.7)
													.setOpacity(.85)
													.setPosition(cs.battleships.Width-70,cs.battleships.Height-70);
					topLayer.appendChild(nextButton);
				});
			} else {
				this.rocket.setFill(cfg_imageShipGrey).setSize(150,40);
				//this.target.setHidden(1);
				this.number.setPosition(0,-45);
				if( cs.battleships.levelType == 1 ) {	//binary serch type level
					var numShip = parseInt(ships[targetShipIndex].number.getText());
					var numShoot = parseInt(this.number.getText());
					if(numShoot < numShip) {
						var msg = cfg_messageTooLow;
					} else {
						var msg = cfg_messageTooHigh;
					}
					cs.battleships.showMessage(msg, 70,"#FE2EC8", cfg_messageDelayTooLowOrHigh, 'top', function() { 
						cs.battleships.enabled = true;
						ships[n].sprite.setFill(cfg_imageShipSinking)
										.setSize(150,106)
										.setOpacity(0.7)
										.setPosition(0,10);
					});
				} else {	//random type or hash type level
					cs.battleships.showMessage(cfg_messageTargetMissed, 70,"#04B404", cfg_messageDelayTargetMissed, 'top', function() { 
						cs.battleships.enabled = true;
						ships[n].sprite.setFill(cfg_imageShipSinking)
										.setSize(150,106)
										.setOpacity(0.7)
										.setPosition(0,10);
					});
				}
				
			}
		},false, sprite);
	});
	return sprite;
}

//比賽說明的對話框
cs.battleships.helpDialog = function() {
	cs.battleships.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.battleships.enabled = false;	//diable按鈕
	var conf = new Object();
	conf.title = cfg_messageDescriptionLevelPrefix + (cs.battleships.level+1) + cfg_messageDescriptionLevelPostfix;
	conf.buttonText = cfg_messageDescriptionButtonOk;
	if(typeof helpText != 'undefined' && helpText != '') {
		conf.message = helpText;
	} else {
		conf.message = helpTextDefault;
	}
	conf.bgcolor = '#cc9966';
	conf.titleColor = '#ffff66';
	conf.fontColor = '#ffffff';
	conf.buttonColor = '#009966';

	conf.fontSize = 30;
	conf.font = cs.battleships.font;
	conf.alpha = .85;
	var dialog = cs.battleships.createDialog(conf, function() { 
		//cs.battleships.counDownAndPlay();
		cs.battleships.soundInit();
		cs.battleships.playGame();
	});
	dialog.setPosition(cs.battleships.Width/2, cs.battleships.Height/2)
			.setScale(cs.battleships.Width/800);
	topLayer.appendChild(dialog);
};

/**
 * create a dialog
 *	conf.title
 *	conf.message
 *  conf.message2
 *	conf.buttonText
 *	conf.titleColor
 *  conf.font
 *  conf.fontColor
 *  conf.fontSize 
 *  conf.buttonTextColor
 *  conf.buttonColor
 *	conf.bgcolor
 *	conf.borderColor
 *	conf.alpha
 */
cs.battleships.createDialog = function(conf, callback) {
//cs.battleships.createDialog = function(title, message, buttonTxt, callback) {
	//initial conf
	if(typeof conf == 'undefined' || typeof conf!= 'object') {
		var conf = new Object();
	}
	if(typeof conf.bgcolor == 'undefined') {
		conf.bgcolor = '#cc6600';
	}
	if(typeof conf.borderColor == 'undefined') {
		conf.borderColor = '#cc9900';
	}
	if(typeof conf.alpha == 'undefined') {
		conf.alpha = .5;
	}
	if(typeof conf.title == 'undefined') {
		conf.title = '';
	}
	if(typeof conf.titleColor == 'undefined') {
		conf.titleColor = '#ffff00';
	}
	if(typeof conf.font == 'undefined') {
		conf.font = '標楷體';
	}
	if(typeof conf.message == 'undefined') {
		conf.message = '';
	}
	if(typeof conf.message2 == 'undefined') {
		conf.message2 = '';
	}
	if(typeof conf.fontColor == 'undefined') {
		conf.fontColor = '#ffffff';
	}
	if(typeof conf.fontSize == 'undefined') {
		conf.fontSize = 38;
	}
	if(typeof conf.buttonText == 'undefined') {
		conf.buttonText = '繼續';
	}
	if(typeof conf.buttonColor == 'undefined') {
		conf.buttonColor = '#77ff44';
	}
	var rgb = new Array();
	for(var i=0; i<3; i++) {
		rgb[i] = parseInt( '0x'+conf.bgcolor.substr(1+i*2,2) );
	}

	//顯示做答結果
	var dialog = new lime.RoundedRect().setRadius(40).setSize(550, 420)
							.setFill(rgb[0],rgb[1],rgb[2], conf.alpha).setStroke(3,conf.borderColor)
							//.setPosition(cs.battleships.Width/2, cs.battleships.Height/2)
							.setOpacity(1);
	var label = new lime.Label().setSize(400,90).setFontSize(40).setPosition(0,-145)
							.setText(conf.title).setFontColor(conf.titleColor).setFontFamily(conf.font);
	dialog.appendChild(label);
	var labelMessage = new lime.Label().setSize(500,35).setFontSize(conf.fontSize).setPosition(0,-120)
							.setAlign('left').setText(conf.message).setFontColor(conf.fontColor).setFontFamily(conf.font);
	dialog.appendChild(labelMessage);
	if(conf.message2 != '') {
		var labelMessage2 = new lime.Label().setSize(500,35).setFontSize(conf.fontSize).setPosition(0,15)
								.setText(conf.message2).setFontColor(conf.fontColor).setFontFamily(conf.font);
		dialog.appendChild(labelMessage2);
	}
	var okButton = new game.Button(conf.buttonText).setPosition(0, 165).setSize(180, 50).setColor(conf.buttonColor).setFontSize(34).setFontFamily(conf.font);
	dialog.appendChild(okButton);
	//按下去進行什麼動作
	goog.events.listen(okButton, ['mousedown','touchstart'], function() {
		dialog.getParent().removeChild(dialog);
		dialog = null;
		if(typeof callback == 'function') {
			callback();
		}
	}, false, dialog);
	return dialog;
};
//show message
cs.battleships.showMessage = function(txt, fontSize, color, delay, vAlign, callback) {
	for(var i=0; i<topLayer.getNumberOfChildren(); i++) {
		var child = topLayer.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
			topLayer.removeChild(child);
		} catch(e) {	};
	}
	
	if(vAlign == 'top') {
		var y = cs.battleships.Height/2-180;
	} else if( vAlign== 'middle') {
		var y = cs.battleships.Height/2;
	} else {
		var y = cs.battleships.Height/2+180;
	}
	var bg = new lime.RoundedRect().setFill(0xF7, 0x9F, 0x81, .9) //.setStroke(10, '#ffcc00').setOpacity(1)
				.setRadius(40).setSize(cs.battleships.Width*.75, 160)
				.setPosition( cs.battleships.Width/2, y);
	var label = new lime.Label().setText(txt).setFontSize(fontSize)
							.setSize(cs.battleships.Width*.7, 90)
							.setFontColor(color)
							.setPosition(0,(70-fontSize)/2);
	bg.appendChild(label);
	topLayer.appendChild(bg);
	var ani = new lime.animation.FadeTo(0.6).setDuration(delay);
	bg.runAction( ani );
	goog.events.listen(ani, lime.animation.Event.STOP, function() {
		try {
			this.getParent().removeChild(this);
		} catch(e) { };
		if(typeof callback == 'function') {
			callback();
		}
	}, false, bg);
};

cs.battleships.nextButton = function() {
	//按鈕:next
	var r = 110;
	//外圈圓
	nextButton = new lime.Circle().setSize(r,r)
						.setFill('#F5A9A9')
						.setStroke(5, '#ff0000');
	//內圈圓
	nextButton.inner = new lime.Circle().setSize(r*.85,r*.85)
						.setFill('#FA8258')
						.setStroke(2,'#FF4000');
	nextButton.appendChild(nextButton.inner);
	//文字
	nextButton.label = new lime.Label().setText(cfg_messageNextLevel)
						.setSize(80, 80)
						.setFontSize(24)
						.setPosition(0,28)
						.setFontColor('#ff0000');
	nextButton.appendChild(nextButton.label);
	
	if(cs.battleships.level < cfg_levelSettings.length-1) {
		nextButton.getDeepestDomElement().title = cfg_messageNextLevel;
	} else {
		nextButton.getDeepestDomElement().title = cfg_messagePlayAgain;
		nextButton.label.setText(cfg_messagePlayAgain);
		//計算花費的時間
		var ss = parseInt(timer.label.getText());
		var mm = Math.floor(ss/60);
		var hh = Math.floor(mm/60);
		ss = ss%60;
		mm = mm%60;
		var timeTotalStr = cfg_messageRecordPrefix+ hh + cfg_messageRecordHour + (mm<10 ? '0'+mm : mm) + cfg_messageRecordMin + (ss<10 ? '0'+ss : ss) + cfg_messageRecordSec;
		cs.battleships.showMessage(timeTotalStr, 42,"#0B6121", 300, 'bottom', function() { 
			cs.battleships.level = 0;
			cs.battleships.newGame();
		});
	}
	goog.events.listen(nextButton,['mouseup','touchend'],function(){
		var thisButton = nextButton;
		//模擬按下的動畫
		var ani = new lime.animation.Spawn(
			new lime.animation.MoveBy(2,2).setDuration(.1),		//移動
			new lime.animation.ScaleBy(.95).setDuration(.1)		//縮小
		);
		var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
		this.runAction(ani2);	//開始播放動畫
		//動畫放完就...
		goog.events.listen(ani2, lime.animation.Event.STOP, function() {
			if(cs.battleships.level < cfg_levelSettings.length-1) {
				cs.battleships.level++;
			} else {
				cs.battleships.level = 0;
			}
			cs.battleships.newGame();
		},false, this);
	});
	return nextButton;
}

cs.battleships.radarSprite = function(size, color) {
	if(typeof color == 'undefined') {
		color = '#00ff31';
	}
	var strokeSize = Math.floor(size/15);
	var radar = new lime.Layer().setOpacity(0.4);
	//radar.pointer = new lime.Polygon(0,0, -2,12, 2,12)
	radar.pointer = new lime.Polygon(0,0, strokeSize*2/-3,size*2/5, strokeSize*2/3,size*2/5)
								.setFill(color)
								.setRotation(180);
	radar.appendChild(radar.pointer);
	//radar.circle = new lime.Circle().setSize(32,32)
	radar.circle = new lime.Circle().setSize(size,size)	
									.setStroke(strokeSize,color);
	radar.appendChild(radar.circle);
	lime.scheduleManager.scheduleWithDelay(timerHandler=function() {
			var d = radar.pointer.getRotation();
			if(d-20 == 0) {	//用這個解決畫面閃爍的問題(角度為0時會閃爍)
				d = 21;
			}			
			radar.pointer.setRotation(d-20);
	}, radar, 180);
	//radar.setScale(size/32);
	return radar;
};

/**
 * 圓形帶旋轉指針的計時器
 *
 *	參數:
 *			time 		倒數幾秒
 *			color 		顏色
 *			pause		是否先暫停
 *			callback	時間到時要執行的函數
 *	傳回值:
 *			傳回計時器物件
 *
 */
cs.battleships.newTimer = function(time, color, pause, callback) {
	try {
		lime.scheduleManager.unschedule(timerHandler, timer);
		timer.removeAllChildren();
		timer.getParent().removeChild(timer);
	} catch(e) { };
	if(typeof color == 'undefined') {
		color = '#00ff31';
	}
	timer = new lime.Layer().setPosition(400,20);
	timer.pointer = new lime.Polygon(0,0, -3,12, 3,12).setFill(color).setRotation(180);
	timer.appendChild(timer.pointer);
	timer.circle = new lime.Circle().setSize(32,32).setStroke(3,color);
	timer.appendChild(timer.circle);
	timer.start  = new Date();
	timer.label = new lime.Label().setText(0).setFontSize(12).setFontColor(color)
									//.setAlign('right')
									//.setSize(200,30)
									.setPosition(2,26);
	timer.appendChild(timer.label);
	//infoLayer.appendChild(timer);
	timer.time = time;
	timer.label.setText(time);
	if(typeof pause != 'undefined') {
		timer.pause = pause;
	} else {
		timer.pause = false;
	}
	timer.callback = callback;
	lime.scheduleManager.scheduleWithDelay(timerHandler=function() {
		if( !timer.pause ) {
			var d = timer.pointer.getRotation();
			if(d-20 == 0) {	//用這個解決畫面閃爍的問題(角度為0時會閃爍)
				d = 21;
			}			
			timer.pointer.setRotation(d-20);
			if(timer.time > 0) {
				var t  = timer.time - Math.round((new Date() - timer.start)/1000);
				if( t<=10 && t != parseInt(timer.label.getText()) ) {
					timer.circle.runAction( new lime.animation.Sequence(
						new lime.animation.ScaleTo(1.2).setDuration(.1),
						new lime.animation.ScaleTo(1).setDuration(.1)
					));
				}
			} else {	//計時器如果設為 0 或小於 0 , 時間為正數的方式
				var t = Math.round((new Date() - timer.start)/1000);
			}
			timer.label.setText(t);
			if(timer.time > 0 && t <= 0) {
				timer.pointer.setRotation(180)
				lime.scheduleManager.unschedule(timerHandler, timer);
				if(typeof timer.callback == 'function') {
					timer.callback();
				}
			}
		}
	}, timer, 100);
	return timer;
};
cs.battleships.pauseTimer = function() {
	timer.pause = true;
};
cs.battleships.playTimer = function() {
	timer.pause = false;
	if(timer.time > 0) {	//倒數
		var t = new Date().valueOf() - 1000*( timer.time - parseInt(timer.label.getText()) );
	} else {	//正數
		var t = new Date().valueOf() - 1000*parseInt(timer.label.getText());
	}
	timer.start = new Date(t); 
};
cs.battleships.resetTimer = function() {
	timer.start = new Date(); 
	timer.pause = false;
}



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.battleships.start', cs.battleships.start);

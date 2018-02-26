//set main namespace
goog.provide('cs.network_protocols');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Sprite');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Polygon');
goog.require('lime.RoundedRect');
goog.require('lime.ui.Scroller');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy')
goog.require('lime.animation.Loop');
goog.require('lime.scheduleManager');

goog.require('game.Button');
goog.require('game.CircleButton');
goog.require('game.Util');
goog.require('game.FadeOutMessage');
goog.require('game.effect.Explode');
goog.require('game.Input');
goog.require('game.Util');
goog.require('game.Audio');
goog.require('game.Timer');

cs.network_protocols.Width = 1024;
cs.network_protocols.Height = 768;
cs.network_protocols.config_file = 'network_protocols_conf.js';
cs.network_protocols.enabled = false;
cs.network_protocols.isSoundInit = false;

cfg_soundEffectEnable = true;

cs.network_protocols.level = 0;
cs.network_protocols.mode = 0;
cs.network_protocols.currentState = 0;
cs.network_protocols.cardTotal = 4;
cs.network_protocols.sentTotal = 0;

cs.network_protocols.debug = 0;

/**
 * Action states
 * @enum {number}
 */
cs.network_protocols.State = {
    NEXT: 0,
	SENT: 1,
	GET_ACTION : 2,
	ROUTING : 3,
	LOST : 4,
	DONE : 5,
	RCVD_INIT : 6,
	RCVD_SENT : 7,
	RCVD_GET_ACTION : 8,
	RCVD_ROUTING : 9,
	RCVD_DONE : 10
};
cs.network_protocols.Mode = {
	ACK_DISABLED : 0,
	ACK_ENABLED : 1
};

// entrypoint
cs.network_protocols.start = function(){

	director = new lime.Director(document.body,cs.network_protocols.Width,cs.network_protocols.Height);
	scene = new lime.Scene();

	backgroundLayer = new lime.Layer();
	contentLayer = new lime.Layer();
	topLayer = new lime.Layer();
	scene.appendChild(backgroundLayer);
	scene.appendChild(contentLayer);
	scene.appendChild(topLayer);
	
	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊
		

	
	cs.network_protocols.init();
	
	
	// set current scene active
	director.replaceScene(scene);

}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.init = function() {
	game.Util.loadSettingFromExternalScript(cs.network_protocols.config_file, function() {
		cs.network_protocols.isSoundInit = false;
		
		if( typeof(cfg_levelActionConf) == 'undefined'
				|| typeof cfg_locale_LANG  == 'undefined'
				|| typeof cfg_actionColor == 'undefined' ) {
			//alert('Failed to load the configuration file : '+cs.network_protocols.config_file);
			cs.network_protocols.showMessage('Failed to load the configuration file : '+cs.network_protocols.config_file,9999).setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height/2);;
			return;
		}
		
		//任意門,設定 level
		var anywhereDoor = game.Util.gup('AnywhereDoor');
		var level = game.Util.gup('level');
		if(typeof(anywhereDoor) != 'undefined' && typeof(level) != 'undefined') {
			if(anywhereDoor.toLowerCase() == 'tpet') {
				var n = parseInt(level);
				if(n > 0 && n <= cfg_levelActionConf.length) {
					cs.network_protocols.level = n-1;
				}
				
			}
		}
		var debug = parseInt(game.Util.gup('debug'));
		if( !isNaN(debug) ) {
			cs.network_protocols.debug = debug;
		}
		
		if( cfg_soundEffectEnable ) {
			try {
				sound = {
					  explosion : new game.Audio(cfg_sound_explosion_file, cfg_sound_explosion_mp3, cfg_sound_explosion_ogg)
					, correct : new game.Audio(cfg_sound_correct_file, cfg_sound_correct_mp3, cfg_sound_correct_ogg)
					, wrong : new game.Audio(cfg_sound_wrong_file, cfg_sound_wrong_mp3, cfg_sound_wrong_ogg)
				};
			} catch(e) {
				cfg_soundEffectEnable = false;
			}
		}
		var langFilename = 'lang_'+cfg_locale_LANG+'.js';
		game.Util.loadSettingFromExternalScript(langFilename, function() {	
			if( typeof cfg_messageActionCaption == 'undefined' 
					|| typeof cfg_messageLevelCaption == 'undefined' ) {
						
				cs.network_protocols.showMessage('File Load Failure : '+langFilename,9999).setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height/2);;
				return;
			} else {
				cs.network_protocols.getSetting();
			}
		});
	});
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.getSetting = function() {
	var row, col,
		cardMin = 4,
		cardMax = 20,
		colTotal = 4,
		width = 90,
		height = 64,
		gap = 20
		;
	var	rowTotal = Math.floor((cardMax-cardMin)/colTotal),
		xOffset = width+gap,
		yOffset = height+gap,
		xStart = (cs.network_protocols.Width-(width+gap)*(colTotal-1))/2,
		yStart = (cs.network_protocols.Height-height*rowTotal-gap*(rowTotal-1))/2
		;
	
	cs.network_protocols.clearAll(topLayer);
	cs.network_protocols.clearAll(contentLayer);
	
	cs.network_protocols.currentState = 0;
	cs.network_protocols.sentTotal = 0;
	
	var x = cs.network_protocols.Width/2;
	var y = cs.network_protocols.Height - 200;
	var w = 80;

	checkBox = cs.network_protocols.createCheckBox('ACK signal', cs.network_protocols.mode, function(v) {
		if(v) {
			cs.network_protocols.mode = 1;
		} else {
			cs.network_protocols.mode = 0;
		}
	}).setPosition(x,120);
	topLayer.appendChild(checkBox);
	
	
	var cw = 60;
	var cx = x - cw-100
	var c = new Array();
	var desc = new lime.Label().setText(cfg_messageSetLevelCaption)
								.setSize(cs.network_protocols.Width, 36)
								.setFontColor('#ffff00').setFontSize(28)
								.setFill('#ff6666')
								.setPosition(x, 300-cw/2-30);
	topLayer.appendChild(desc);	
	for(var i=0; i<3; i++) {
		c[i] = new lime.Circle().setSize(cw, cw)
									.setFill('#ffff33')
									.setStroke(4,'#ff0000')
									.setPosition(cx+(cw+100)*i, 300);
		c[i].label = new lime.Label().setText(cfg_messageLevelCaption[i]).setFontSize(30).setFontColor('#660099')
									.setPosition(0, cw/2+28);
		c[i].appendChild(c[i].label);
		topLayer.appendChild(c[i]);
		c[i].value = i;
		if(i == cs.network_protocols.level) {
			c[i].setStroke(15,'#ff0000').setOpacity(1);
			c[i].selected = true;
		}
		goog.events.listen(c[i],['mousedown','touchstart'],function(e){
			for(var j=0; j<3; j++) {
				if(j == this.value) {
					c[j].setStroke(15,'#ff0000').setOpacity(1);
					c[j].selected = true;
					c[j].label.runAction( 
								new lime.animation.Sequence(
									new lime.animation.ScaleTo(1.2).setDuration(.1),
									new lime.animation.ScaleTo(1).setDuration(.1)
								));
					cs.network_protocols.level = j;
				} else {
					c[j].setStroke(4,'#ff0000').setOpacity(.8);
					c[j].selected = false;
				}
			}
		},false, c[i]);
									
	}

	var desc = new lime.Label().setText(cfg_messageSetCardTotalDescription)
								.setSize(cs.network_protocols.Width*.8, 40)
								.setFontColor('#ffff00').setFontSize(28)
								.setFill('#00cc66')
								.setPosition(x, y-100);
	topLayer.appendChild(desc);
	var bPlus = new game.Button()
						.setFontColor('#660000')
						.setText('+')
						.setSize(w, w)
						.setColor('#00cc66')
						.setPosition(x+w*1.25, y);
	var bMinus = new game.Button()
						.setText('-')
						.setSize(w, w)
						.setFontColor('#660000')
						.setColor('#ff6699')
						.setPosition(x-w*1.25, y);
	var labelCardTotoal = new lime.Label()
						//.setSize(120, 40)
						.setFontColor('#0000aa')
						.setFontSize(w)
						.setText(cs.network_protocols.cardTotal)
						.setPosition(x, y);
	topLayer.appendChild(labelCardTotoal);
	topLayer.appendChild(bPlus);
	topLayer.appendChild(bMinus);
	goog.events.listen(bPlus,['mousedown','touchstart'],function(e){
		updateValue(labelCardTotoal, '+', 20);
	});
	goog.events.listen(bMinus,['mousedown','touchstart'],function(e){
		updateValue(labelCardTotoal, '-', 4);
	});
	var updateValue = function(target, op, limit) {
		var v = parseInt(target.getText());
		if(op == '+') {
			v++;
			if(v > limit) { v= limit;}
		} else {
			v--;
			if(v < limit) { v= limit;}			
		}
		cs.network_protocols.cardTotal = v;
		target.setText(v);
	}

	var go = new game.CircleButton()
						.setSize(100, 100)
						.setFontColor('#660000')
						.setColor('#ffff00')
						.setFontSize(24)
						.setText(cfg_messageButtonOKCaption)
						.setPosition(cs.network_protocols.Width-80, cs.network_protocols.Height-80);
	topLayer.appendChild(go);
	goog.events.listen(go,['mousedown','touchstart'],function(e){
		if( cfg_soundEffectEnable ) {
			//sound.correct.playing_ = false;
			//game.setMute(true);
			sound.correct.setVolume(0);
			sound.correct.play();
		}
		cs.network_protocols.setCardText();
	});	
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.setCardText = function() {
	//clear scene
	cs.network_protocols.clearAll(topLayer);
	cs.network_protocols.clearAll(contentLayer);
	
	if( cfg_soundEffectEnable ) {
		//game.setMute(false);
		sound.correct.stop();
		sound.correct.setVolume(1);
	}
	if(typeof cs.network_protocols.cardValues != 'undefined') {
		delete cs.network_protocols.cardValues;
	}
	cs.network_protocols.cardValues = new Array();
	
	var desc = new lime.Label().setText(cfg_messageCardMessageInputCaption)
								.setSize(cs.network_protocols.Width, 80)
								.setFontColor('#ffff00').setFontSize(60)
								.setFill('#00cc66')
								.setPosition(cs.network_protocols.Width/2, 90);
	topLayer.appendChild(desc);	
	
	//		cs.network_protocols.gamePlay();

	var colTotal, rowTotal, x, y, xStart, yStart, i
		w = 180, 
		h = 40,
		xGap = 1,
		yGap = h*1.5,
		widthMax = cs.network_protocols.Width*.85;
		
	if((w+xGap)* cs.network_protocols.cardTotal <= widthMax) {
		colTotal = cs.network_protocols.cardTotal;
	} else if(cs.network_protocols.cardTotal%5 == 0) {
		colTotal = 5;
	} else if(cs.network_protocols.cardTotal%4 == 0) {
		colTotal = 4;
	} else {
		colTotal = 5;
	}
	rowTotal = Math.ceil(cs.network_protocols.cardTotal/colTotal);
	xStart = (cs.network_protocols.Width - (w+xGap)*(colTotal-1))/2;
	yStart = 100 + (cs.network_protocols.Height-100-200-(h+yGap)*(rowTotal-1))/2;
	i = 0;
	var cardSelected = 0;
	var cards = new Array();
	while(i<cs.network_protocols.cardTotal) {
		x = xStart + (w+xGap)*(i%colTotal);
		y = yStart + (h+yGap)*Math.floor(i/colTotal);
		cards[i] =  cs.network_protocols.makeCard()
								.setFill(game.Util.getRandomColor(4))
								.setPosition(x, y)
		cards[i].label.setText('?');
		cards[i].number.setText(i+1).setHidden(0);
		contentLayer.appendChild(cards[i]);
		goog.events.listen(cards[i],['mousedown','touchstart'],function(e){
			if( dialog.getHidden() == 1) {
				getInput( parseInt(this.number.getText())-1 );
			}
		});
		i++;
	}
	var dialog = new lime.RoundedRect().setRadius(40)
							.setSize(612, 418)
							.setFill(0x66, 0x99, 0xcc, .85)
							.setStroke(5,'#cccc66')
							.setHidden(1)
							.setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height/2)
							.setOpacity(1);
	contentLayer.appendChild(dialog);
	var inputText = new game.Input().setFontSize(40).setSize(300,80)
								.setPosition(0,-40);
	dialog.appendChild(inputText);
	dialog.caption = new lime.Label().setText('訊息內容').setFontSize(24).setFontColor('00cc66').setSize(300,30) //.setAlign('left')
									.setFill('#ffffcc')
									.setStroke(1)
									.setPosition(0, -95);
	dialog.appendChild(dialog.caption);
	dialog.ok = new game.Button().setSize(200,40)
								.setFontColor('#660000')
								.setColor('#ffff00')
								.setFontSize(30)
								.setText('OK')
								.setPosition(0, 150);
	dialog.appendChild(dialog.ok);
	goog.events.listen(dialog.ok,['mousedown','touchstart'],function(e){
		checkValues();
	});
	inputText.getInputText().maxLength = 5;
	inputText.getInputText().placeholder = cfg_messageCardMessageInputPlaceholder;

	//加入鍵盤監聽, 處理 Enter 鍵	
	goog.events.listen(document, ['keyup'], inputKeyupHandler=function(e) {
		if(e.keyCode == 13) {	
			checkValues();
		}
	});
	var getInput = function(c) {
		cardSelected = c;
		var card = cards[cardSelected];
		var input = inputText.getInputText();
		var txt = card.label.getText();
		if( txt.length > 0 && txt != '?' ) {
			input.value = txt;
		} else {
			input.value = '';
		}
		dialog.caption.setText(cfg_messageCardMessageInputCardNumberPrefix+(cardSelected+1));
		dialog.setHidden(0);
		input.focus();
	};
	var checkValues = function() {
		var input = inputText.getInputText();
		if(input.value.length > 0 && input.value!='?') {
			cards[cardSelected].label.setText(input.value);
		}
		dialog.setHidden(1);
		var haveText = 0;
		for(var i=0; i<cs.network_protocols.cardTotal; i++) {
			var txt = cards[i].label.getText();
			if( txt != '?') {
				cs.network_protocols.cardValues[i] = {
					color : cards[i].getFill(),
					txt : txt
				};
				haveText++;
			} else {
				cs.network_protocols.cardValues[i] = {
					color : cards[i].getFill(),
					txt : txt
				}
			}
		}
		if(haveText >= cs.network_protocols.cardTotal) {
			go.setHidden(0);
			try {
				goog.events.unlisten(document, ['keyup'], inputKeyupHandler);
			} catch(e) { };
		}
		window.scrollTo(0, 0);
	}
	var go = new game.CircleButton()
						.setSize(100, 100)
						.setFontColor('#660000')
						.setColor('#ffff00')
						.setFontSize(24)
						.setHidden(1)
						.setText(cfg_messageCardMessageInputButtonOKCaption)
						.setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height-80);
	topLayer.appendChild(go);
	goog.events.listen(go,['mousedown','touchstart'],function(e){
		if(this.getHidden() != 1) {
			cs.network_protocols.gamePlay();
		}
	}, false, go);
	
	if(cs.network_protocols.debug == 1) {
		go.setHidden(0);
	}

}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.gamePlay = function() {
	//clear scene
	cs.network_protocols.clearAll(topLayer);
	cs.network_protocols.clearAll(contentLayer);
	
	cs.network_protocols.currentState = 0;
	cs.network_protocols.sentTotal = 0;

	if( cs.network_protocols.debug == 1 ) {
		if( cs.network_protocols.cardValues.length < cs.network_protocols.cardTotal ) {
			for(var i=0; i<cs.network_protocols.cardTotal; i++) {
				cs.network_protocols.cardValues[i] = {
					color : game.Util.getRandomColor(4),
					txt : 'DATA '+(i+1)					
				};
			}
		}
	}
	
	var routeY = cs.network_protocols.Height-250;
	var internet = new lime.Sprite().setSize(400,400).setFill('assets/internet.png').setOpacity(0.3).setPosition(cs.network_protocols.Width/2, routeY);
	var route = new lime.Sprite().setSize(cs.network_protocols.Width-400,20)
									.setStroke(1, '#E6E6E6')
									//.setFill(0xE6,0xE6,0xE6, 0.5)
									.setFill(0xE6,0x00,0x00, 0.5)
									.setPosition(cs.network_protocols.Width/2, routeY);
	switch(cs.network_protocols.level) {
		case 1 :	//level 2
			route.setFill(0xff,0xff,0x00, 0.5);
			break;
		case 2 :	//level 3
			route.setFill(0xE6,0x00,0x00, 0.5);
			break;
		default :
			route.setFill(0xE6,0xE6,0xE6, 0.5);
			break;
	}
	
	cs.network_protocols.action = cs.network_protocols.makeActionCard().setPosition(cs.network_protocols.Width/2, routeY);	
	cs.network_protocols.arrow = cs.network_protocols.makeArrow().setPosition(cs.network_protocols.Width/3, routeY);
	cs.network_protocols.arrowRouting = cs.network_protocols.makeArrow().setPosition(cs.network_protocols.Width*2/3, routeY);
	cs.network_protocols.arrowQueue = cs.network_protocols.makeArrow().setPosition(cs.network_protocols.Width/2, routeY-220).setRotation(90);
	
	var serverReceiver = new lime.Sprite().setFill('assets/server_left.png').setSize(65,100).setPosition(cs.network_protocols.Width-200,routeY);
	var serverSender = new lime.Sprite().setFill('assets/server_right.png').setSize(100,100).setPosition(200,routeY);
		
	var totalHieght = 42*cs.network_protocols.cardTotal-2;
	var w = 200;
	var h = (totalHieght > 419 ? 419 : totalHieght);
	var x = serverSender.getPosition().x;
	var y = routeY-h-50;
	senderCards = new lime.ui.Scroller()
			.setSize(w, h)
			//.setStroke(1)
			.setDirection(lime.ui.Scroller.Direction.VERTICAL)
			.setAnchorPoint(0.5,0)
			.setPosition(x, y);
	
	x = serverReceiver.getPosition().x;
	receiverCards = new lime.ui.Scroller()
			.setSize(w, h)
			//.setStroke(1)
			.setDirection(lime.ui.Scroller.Direction.VERTICAL)
			.setAnchorPoint(0.5,0)
			.setPosition(x, y);
	receiverCards.originY = y;
	
	//queue area , half height
	h = (totalHieght > 167 ? 167 : totalHieght);
	x = cs.network_protocols.Width/2;
	y = routeY-h-300;
	queueCards = new lime.ui.Scroller()
			.setSize(w, h)
			//.setStroke(1)
			.setFill(0xff,0xff,0x00,0.2)
			.setOpacity(0.4)
			.setDirection(lime.ui.Scroller.Direction.VERTICAL)
			.setAnchorPoint(0.5,0)
			.setPosition(x, y);
	queueCards.originY = y;
	
	contentLayer.appendChild(internet);
	contentLayer.appendChild(route);
	contentLayer.appendChild(cs.network_protocols.arrowQueue);
	contentLayer.appendChild(cs.network_protocols.action);
	contentLayer.appendChild(cs.network_protocols.arrow);
	contentLayer.appendChild(cs.network_protocols.arrowRouting);
	contentLayer.appendChild(serverReceiver);
	contentLayer.appendChild(serverSender);
	contentLayer.appendChild(senderCards);
	contentLayer.appendChild(queueCards);
	contentLayer.appendChild(receiverCards);
	
	var cardX = serverSender.getPosition().x;
	var yStart = routeY - 70;
	for(var i=0; i<cs.network_protocols.cardTotal; i++) {
		var value = cs.network_protocols.cardValues[i];
		var card = cs.network_protocols.makeCard()
								.setFill(value.color)
								//.setPosition(cardX, yStart-i*42)
								.setPosition(0, -i*42)
								;
		card.label.setText(value.txt);
		card.number.setText(i+1);
		//contentLayer.appendChild(card);
		senderCards.appendChild(card);
	}

	cs.network_protocols.scrollOneCard(senderCards, 1);
	
	cs.network_protocols.sentButton = new game.CircleButton().setSize(100,100)
										.setText(cfg_messageButtonSendCaption)
										.setColor('#5858FA')
										.setPosition(cardX,routeY+100);
	contentLayer.appendChild(cs.network_protocols.sentButton);
	goog.events.listen(cs.network_protocols.sentButton,['mousedown','touchstart'],function(e){
		if( cs.network_protocols.currentState == cs.network_protocols.State.NEXT ) {
			cs.network_protocols.processCheck();
		}
	});

	x = serverReceiver.getPosition().x;
	cs.network_protocols.sentRcvdButton = new game.CircleButton().setSize(100,100)
										.setText(cfg_messageButtonSendAckCaption)
										.setColor('#CCFF33')
										.setFontColor('#9966cc')
										.setHidden(1)
										.setPosition(x,routeY+105);
	contentLayer.appendChild(cs.network_protocols.sentRcvdButton);
	goog.events.listen(cs.network_protocols.sentRcvdButton,['mousedown','touchstart'],function(e){
		if( cs.network_protocols.currentState == cs.network_protocols.State.RCVD_INIT ) {
			cs.network_protocols.processCheck();
		}
	});
	var pos = cs.network_protocols.sentRcvdButton.getPosition();
	x = x - 50;
	y = routeY;
	cs.network_protocols.sentRcvdButton.deliver = new lime.Sprite().setFill('assets/tux_right.png').setHidden(1).setPosition(x, y);
	contentLayer.appendChild(cs.network_protocols.sentRcvdButton.deliver);
	var label = new lime.Label().setText(cfg_messageAckCardCaption).setSize(150,60).setFontSize(54).setFontColor('#0000aa').setFill(0xff,0xff,0x00,0.7).setStroke(1,'#0000ff').setPosition(0,-70);
	cs.network_protocols.sentRcvdButton.deliver.appendChild(label);

	var checkBox = cs.network_protocols.createCheckBox('ACK:',cs.network_protocols.mode, function(v) {
		if(v) {
			cs.network_protocols.mode = 1;
		} else {
			cs.network_protocols.mode = 0;
		}
	}).setScale(.5,.5).setPosition(cs.network_protocols.Width-75,30);
	checkBox.setText('ON OFF');
	checkBox.label.setPosition(-178,0).setSize(200,40).setAlign('right').setFontSize(36).setFontColor('#999966');
	checkBox.circle.setFill('#999966');
	contentLayer.appendChild(checkBox);	
	
	cs.network_protocols.currentState = cs.network_protocols.State.NEXT;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.scrollOneCard = function(cards, duration) {
	var more = 0;
	var max = 10;
	if(cs.network_protocols.cardTotal > max) {
		more = max*2 - cs.network_protocols.cardTotal;
	}
	cards.scrollTo(cards.getSize().height - 42*(cs.network_protocols.sentTotal+more), duration);
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.processCheck = function() {
	switch(cs.network_protocols.currentState) {
		case cs.network_protocols.State.NEXT :
			//wait to press sent button
			cs.network_protocols.scrollOneCard(senderCards, 1);
			cs.network_protocols.scrollOneCard(receiverCards, 1);
			cs.network_protocols.currentState = cs.network_protocols.State.SENT;
			cs.network_protocols.sentButton.setHidden(1);
			cs.network_protocols.arrow.play();
			lime.scheduleManager.callAfter(cs.network_protocols.processCheck, contentLayer, 1000);
			break;
		case cs.network_protocols.State.SENT :
			//show network chance button & wait to press
			cs.network_protocols.showMessage(cfg_messageGetActionCard, 3);
			cs.network_protocols.currentState = cs.network_protocols.State.GET_ACTION;
			cs.network_protocols.action.init();
			cs.network_protocols.scrollOneCard(senderCards, 1);
			break;
		case cs.network_protocols.State.GET_ACTION :
			//hide button & got random network deliever action
			cs.network_protocols.currentState = cs.network_protocols.State.ROUTING;
			cs.network_protocols.action.play();
			lime.scheduleManager.callAfter(cs.network_protocols.processCheck, contentLayer, 2000);
			break;
		case cs.network_protocols.State.ROUTING :
			//run deliever action
			var a = cs.network_protocols.action.getValue();
			if(a<2 || cs.network_protocols.mode == cs.network_protocols.Mode.ACK_DISABLED ) {
				if(a<2 && cs.network_protocols.mode == cs.network_protocols.Mode.ACK_ENABLED ) {
					cs.network_protocols.currentState = cs.network_protocols.State.LOST;
				} else {
					cs.network_protocols.currentState = cs.network_protocols.State.DONE;
				}	
			} else {
				cs.network_protocols.currentState = cs.network_protocols.State.RCVD_INIT;
			}
			cs.network_protocols.routing(a);
			break;
		case cs.network_protocols.State.LOST :
			//can't get ACK , packet lost , resend
			cs.network_protocols.sentTotal--;
			cs.network_protocols.currentState = cs.network_protocols.State.DONE;
			cs.network_protocols.resend();
			break;
		case cs.network_protocols.State.DONE :
			cs.network_protocols.arrow.stop();
			cs.network_protocols.arrowRouting.stop();
			cs.network_protocols.arrowQueue.stop();
			cs.network_protocols.action.stop();
			cs.network_protocols.scrollOneCard(senderCards, 1);
			cs.network_protocols.scrollOneCard(receiverCards, 1);
			//if( cs.network_protocols.mode == cs.network_protocols.Mode.ACK_ENABLED &&  )
			if(cs.network_protocols.sentTotal < cs.network_protocols.cardTotal) {
				cs.network_protocols.currentState = cs.network_protocols.State.NEXT;
				cs.network_protocols.sentButton.setHidden(0);
			} else {	//game over
				cs.network_protocols.sentButton.setHidden(1);
				//clear queue
				if(queueCards.moving_.getNumberOfChildren() > 0) {
					if(cs.network_protocols.mode != cs.network_protocols.Mode.ACK_DISABLED ) {
						cs.network_protocols.currentState = cs.network_protocols.State.RCVD_INIT;
					}	
					cs.network_protocols.doDeliver();
				} else {
					if( cfg_soundEffectEnable ) {
						sound.correct.playing_ = false;
						sound.correct.play();
					}
					cs.network_protocols.gameOver();					
				}
			}
			break;
		case cs.network_protocols.State.RCVD_INIT :
			if(cs.network_protocols.sentRcvdButton.getHidden() == 0) {
				cs.network_protocols.currentState = cs.network_protocols.State.RCVD_SENT;
				cs.network_protocols.sentRcvdButton.setHidden(1);
				cs.network_protocols.arrowRouting.play(1);
				cs.network_protocols.routingRCVD();	//move RCVD message to center
				//lime.scheduleManager.callAfter(cs.network_protocols.processCheck, contentLayer, 1000);
			} else {
				cs.network_protocols.initRCVD();
			}
			break;
		case cs.network_protocols.State.RCVD_SENT :
			//show network chance button & wait to press
			cs.network_protocols.showMessage(cfg_messageGetActionCard, 3);
			cs.network_protocols.currentState = cs.network_protocols.State.RCVD_GET_ACTION;
			cs.network_protocols.action.init();
			cs.network_protocols.scrollOneCard(senderCards, 1);
			break;
		case cs.network_protocols.State.RCVD_GET_ACTION :
			//hide button & got random network deliever action
			cs.network_protocols.currentState = cs.network_protocols.State.RCVD_ROUTING;
			cs.network_protocols.action.play();
			lime.scheduleManager.callAfter(cs.network_protocols.processCheck, contentLayer, 2000);
			break;
		case cs.network_protocols.State.RCVD_ROUTING :
			//run deliever action
			cs.network_protocols.currentState = cs.network_protocols.State.RCVD_DONE;
			var a = cs.network_protocols.action.getValue();
			cs.network_protocols.routingRCVD(a);
			break;
		case cs.network_protocols.State.RCVD_DONE :
			break;
	}
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.resend = function() {
	var message = cfg_messageResendCard + (cs.network_protocols.sentTotal+1);
	var card = senderCards.moving_.getChildAt(cs.network_protocols.sentTotal);
	card.setOpacity(1);
	card.action.setFill(0x00,0x00,0x00,0);
	var timer = new game.Timer(3, function() {
		topLayer.removeChild(timer);
		cs.network_protocols.showMessage(message, 3);
		cs.network_protocols.scrollOneCard(senderCards, 1);
		cs.network_protocols.processCheck();
	}).setClockSize(80).setFontSize(32)
		.setLabelAlign('center').setColor('#cc0066')
		.setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height-120);
	topLayer.appendChild(timer)
	timer.play();
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.initRCVD = function() {
	cs.network_protocols.arrow.stop();
	cs.network_protocols.arrowRouting.stop();
	cs.network_protocols.arrowQueue.stop();
	cs.network_protocols.action.stop();
	cs.network_protocols.scrollOneCard(senderCards, 1);
	cs.network_protocols.scrollOneCard(receiverCards, 1);
	cs.network_protocols.showMessage(cfg_messagePressButtonToSendACK, 3);
	
	var pos = cs.network_protocols.sentRcvdButton.getPosition();
	var x = pos.x -50;
	var y = pos.y - 105;
	cs.network_protocols.sentRcvdButton.deliver.setFill('assets/tux_right.png').setPosition(x, y).setHidden(0);
	cs.network_protocols.sentRcvdButton.setHidden(0);
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.routingRCVD = function(action) {
	if(typeof action == 'undefined') {
		var x = cs.network_protocols.action.getPosition().x+100;
		var y = cs.network_protocols.action.getPosition().y;
		var ani = new lime.animation.MoveTo(x, y).setSpeed(.3).setEasing(lime.animation.Easing.LINEAR);
		cs.network_protocols.sentRcvdButton.deliver.runAction( ani);
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			cs.network_protocols.processCheck();
		});		
	} else {
		if(action < 2) {
			cs.network_protocols.arrowRouting.stop();
			cs.network_protocols.arrowRouting.play();
			cs.network_protocols.sentRcvdButton.deliver.setFill('assets/tux.png')
			if( cfg_soundEffectEnable ) {
				sound.wrong.playing_ = false;
				sound.wrong.play();
			}
			var x = cs.network_protocols.sentRcvdButton.getPosition().x;
			var y = cs.network_protocols.sentButton.getPosition().y-100;
			var ani = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
			cs.network_protocols.sentRcvdButton.deliver.runAction( ani);
		} else {
			cs.network_protocols.arrow.play(1);
			if( cfg_soundEffectEnable ) {
				sound.correct.playing_ = false;
				sound.correct.play();
			}
			var x = cs.network_protocols.sentButton.getPosition().x;
			var y = cs.network_protocols.sentButton.getPosition().y-100;
			var ani = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
			cs.network_protocols.sentRcvdButton.deliver.runAction( ani);
		}
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			cs.network_protocols.sentRcvdButton.deliver.setHidden(1);
			if(action < 2) {
				cs.network_protocols.arrowRouting.stop();
				cs.network_protocols.currentState = cs.network_protocols.State.RCVD_INIT;
			} else {
				cs.network_protocols.currentState = cs.network_protocols.State.DONE;
			}
			cs.network_protocols.processCheck();
		});	
	}
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.routing = function(action) {
	var card = senderCards.moving_.getChildAt(cs.network_protocols.sentTotal);
	card.setOpacity(0.3);
	card.action.setFill(cfg_actionColor[action]);
	cs.network_protocols.scrollOneCard(senderCards, 1);
	if(action == 0) {
		if( cfg_soundEffectEnable ) {
			sound.explosion.playing_ = false;
			sound.explosion.play();
		}
		cs.network_protocols.doDrop(card);
	} else if(action == 1) {
		cs.network_protocols.arrowQueue.play();
		if( cfg_soundEffectEnable ) {
			sound.wrong.playing_ = false;
			sound.wrong.play();
		}
		cs.network_protocols.doQueue(card);		
	} else if(action == 2) {
		cs.network_protocols.arrowRouting.play();
		if( cfg_soundEffectEnable ) {
			sound.correct.playing_ = false;
			sound.correct.play();
		}
		cs.network_protocols.doDeliver(card);
	}
	cs.network_protocols.sentTotal++;
	cs.network_protocols.scrollOneCard(senderCards, 1);
	cs.network_protocols.scrollOneCard(receiverCards, 1);
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.doDrop = function(card) {
	var pos = cs.network_protocols.sentButton.getPosition();
	var x = pos.x + 50;
	var y = pos.y - 100;
	var deliver = new lime.Sprite().setFill('assets/tux.png')
									.setPosition(x, y);
	contentLayer.appendChild(deliver);
	var newCard = cs.network_protocols.makeCard()
						.setFill(card.getFill())
						.setPosition(-115,0);
	newCard.label.setText(card.label.getText());
	newCard.number.setText(card.number.getText());
	newCard.action.setFill(card.action.getFill());
	deliver.appendChild(newCard);
	x = cs.network_protocols.action.getPosition().x+newCard.getSize().width/2;
	var ani = new lime.animation.MoveTo(x, y).setSpeed(.1).setEasing(lime.animation.Easing.LINEAR);
	deliver.runAction( ani);
	goog.events.listen(ani, lime.animation.Event.STOP, function() {
		cs.network_protocols.arrow.stop();
		newCard.runAction(new lime.animation.FadeTo(0));
		var e = new game.effect.Explode(newCard, function() {
			deliver.removeChild(newCard);
			contentLayer.removeChild(deliver);
			cs.network_protocols.processCheck();
		});
	});
	
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.doQueue = function(card) {
	var pos = cs.network_protocols.sentButton.getPosition();
	var x = pos.x + 50;
	var y = pos.y - 100;
	var deliver = new lime.Sprite().setFill('assets/tux.png')
									.setPosition(x, y);
	contentLayer.appendChild(deliver);
	var newCard = cs.network_protocols.makeCard()
						.setFill(card.getFill())
						.setPosition(-115,0);
	newCard.label.setText(card.label.getText());
	newCard.number.setText(card.number.getText());
	newCard.action.setFill(card.action.getFill());
	deliver.appendChild(newCard);
	x = cs.network_protocols.action.getPosition().x;
	var y2 = queueCards.getPosition().y+queueCards.getSize().height/2;
	var ani = new lime.animation.Sequence(
				new lime.animation.MoveTo(x, y).setSpeed(.1).setEasing(lime.animation.Easing.LINEAR)
				, new lime.animation.MoveTo(x, y2).setSpeed(.1).setEasing(lime.animation.Easing.LINEAR)
	);
	deliver.runAction( ani);
	goog.events.listen(ani, lime.animation.Event.STOP, function() {
		deliver.removeChild(newCard);
		contentLayer.removeChild(deliver);
		var i = queueCards.moving_.getNumberOfChildren();
		newCard.setPosition(0, i*-42)
		queueCards.appendChild(newCard);
		cs.network_protocols.scrollOneCard(queueCards, 1);
		cs.network_protocols.processCheck();
	});
	
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.doDeliver = function(card) {
	var pos = cs.network_protocols.sentButton.getPosition();
	var x = pos.x + 50;
	var y = pos.y - 100;
	var deliver = new lime.Sprite().setFill('assets/tux.png')
									.setPosition(x, y);
	contentLayer.appendChild(deliver);
		
	if(typeof card != 'undefined') {
		var newCard = cs.network_protocols.makeCard()
							.setFill(card.getFill())
							.setPosition(-115,0);
		newCard.label.setText(card.label.getText());
		newCard.number.setText(card.number.getText());
		newCard.action.setFill(card.action.getFill());
		deliver.appendChild(newCard);
	}
	
	//
	//Clear all data in queue at last 
	//	or deliver one data after one data direct deliver.
	//
	var clearQueueAtLast = (typeof card == 'undefined');
	
	if(clearQueueAtLast && queueCards.moving_.getNumberOfChildren() > 0) {
		qCard = queueCards.moving_.getChildAt(0);
		x = cs.network_protocols.action.getPosition().x;
		y = cs.network_protocols.action.getPosition().y;
		//new card move from left to center
		if(typeof newCard != 'undefined') {
			var ani = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
		}
		//queue card move from top to center 
		var ani2 = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
		x = receiverCards.getPosition().x;
		//all card from center to right
		var ani3 = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
		goog.events.listen(ani2, lime.animation.Event.STOP, function() {
			x = receiverCards.getPosition().x;
			contentLayer.removeChild(qCard);
			qCard.setPosition(-115,0);
			if(typeof newCard != 'undefined') {
				newCard.setPosition(-125,-42);
			}
			deliver.appendChild(qCard);
			deliver.runAction(ani3);
		});
		goog.events.listen(ani3, lime.animation.Event.STOP, function() {
			rearrangeCards();
		});
	} else if(typeof newCard != 'undefined') {
		//new card move from left to right
		x = receiverCards.getPosition().x;
		y = cs.network_protocols.action.getPosition().y;
		var ani = new lime.animation.MoveTo(x, y).setSpeed(.2).setEasing(lime.animation.Easing.LINEAR);
	}
	
	var queueCardMove = function() {
		x = cs.network_protocols.action.getPosition().x;
		y = queueCards.getPosition().y;
		qCard.setPosition(x, y);
		contentLayer.appendChild(qCard);			
		qCard.runAction(ani2);		
	}
	
	if(typeof ani != 'undefined') {
		deliver.runAction(ani);
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			if(typeof qCard != 'undefined' && typeof ani2 != 'undefined') {
				queueCardMove();
			} else {
				rearrangeCards();
			}
		});
	} else if(typeof qCard != 'undefined' && typeof ani2 != 'undefined') {
		//no new card , form center to right;
		x = cs.network_protocols.action.getPosition().x;
		y = cs.network_protocols.action.getPosition().y;
		deliver.setPosition(x,y);
		cs.network_protocols.arrowRouting.play();
		queueCardMove();
	}
	
	
	var rearrangeCards = function() {
		contentLayer.removeChild(deliver);
		var h = receiverCards.getSize().height;
		var x = receiverCards.getPosition().x;
		for(var c=deliver.getNumberOfChildren()-1; c>=0; c--) {
			var card = deliver.getChildAt(c);
			//deliver.removeChild(newCard);
			deliver.removeChild(card);
			var i = receiverCards.moving_.getNumberOfChildren();
			//newCard.setPosition(0, -i*42)
			card.setPosition(0, -i*42);
			//receiverCards.appendChild(newCard);
			receiverCards.appendChild(card);

			var y = receiverCards.originY+ h - 4 - 42*(i+1);
			if(y < receiverCards.originY) {
				y = receiverCards.originY;
			}
			receiverCards.setPosition(x, y);
			cs.network_protocols.scrollOneCard(receiverCards, 1);
		}
		if(typeof newCard != 'undefined') {
			cs.network_protocols.processCheck();
		} else {
			if(queueCards.moving_.getNumberOfChildren() > 0) {
				//recursive : clear queue
				cs.network_protocols.arrowRouting.stop();
				cs.network_protocols.doDeliver();
			} else {
				cs.network_protocols.processCheck();
			}
		}
	}
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.gameOver = function() {
	cs.network_protocols.showMessage(cfg_messageAllDataSent, 3);
	
	//hide senderCards: 2017.04.07 add by gsyan
	senderCards.setHidden(1);
	
	//rearrange cards in receiverCards
	var total = receiverCards.moving_.getNumberOfChildren();
	if( total > cs.network_protocols.cardTotal && cs.network_protocols.cardTotal < 10 ) {
		var w = receiverCards.getSize().width;
		var hOld = receiverCards.getSize().height;
		var totalHieght = 42*total-2;
		var h = (totalHieght > 419 ? 419 : totalHieght);
		var x = receiverCards.getPosition().x;
		var y = receiverCards.originY-(h-hOld);
		receiverCards.setSize(w,h);
		receiverCards.setPosition(x, y);
	}
	cs.network_protocols.scrollOneCard(receiverCards, 1);	
	
	var pos = cs.network_protocols.action.getPosition();
	var x = pos.x;
	var y = pos.y + 100;
	var b = new game.Button()
					.setSize(300, 50)
					.setFontColor('#ff6699')
					.setText(cfg_messageButtonBackToMainMenuCaption)
					.setColor('#99cc33')
					.setPosition(x, y);
	contentLayer.appendChild(b);
	goog.events.listen(b,['mousedown','touchstart'],function(e){
		cs.network_protocols.getSetting();
	});
	
	//just test , change level
	y += 80
	var b1 = new game.Button()
					.setSize(140, 40)
					.setFontColor('#3366ff')
					.setText(cfg_messageLevelCaption[0])
					.setColor('#0099cc')
					.setPosition(x-160, y);
	contentLayer.appendChild(b1);
	goog.events.listen(b1,['mousedown','touchstart'],function(e){
		cs.network_protocols.level = 0;
		cs.network_protocols.gamePlay();
	});
	var b2 = new game.Button()
					.setSize(140, 40)
					.setFontColor('#3366ff')
					.setText(cfg_messageLevelCaption[1])
					.setColor('#0099cc')
					.setPosition(x, y);
	contentLayer.appendChild(b2);
	goog.events.listen(b2,['mousedown','touchstart'],function(e){
		cs.network_protocols.level = 1;
		cs.network_protocols.gamePlay();
	});
	var b2 = new game.Button()
					.setSize(140, 40)
					.setFontColor('#3366ff')
					.setText(cfg_messageLevelCaption[2])
					.setColor('#0099cc')
					.setPosition(x+160, y);
	contentLayer.appendChild(b2);
	goog.events.listen(b2,['mousedown','touchstart'],function(e){
		cs.network_protocols.level = 2;
		cs.network_protocols.gamePlay();
	});	
}
//
//
//
cs.network_protocols.makeCard = function() {
	var card = new lime.RoundedRect().setSize(180,40).setRadius(15).setFill('#00ff00').setStroke(1);
	card.label = new lime.Label().setFontSize(24).setSize(180,30);
	card.action = new lime.Circle().setStroke(1).setSize(12,12).setPosition(75,0);//.setFill('#009900');
	card.number = new lime.Label().setFontSize(8).setPosition(-80,-10).setFontColor('#ff0000');
	card.appendChild(card.label);
	card.appendChild(card.action);
	card.appendChild(card.number);
	if(typeof(cfg_showCardNumber) == 'undefined' || cfg_showCardNumber != true) {	//2017.03.27 add by gsyan
		card.number.setHidden(1);
	}
	return card;
}
	
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.makeActionCard = function() {	
	var action = new lime.Sprite().setFill('assets/router.png').setSize(112,70);
	action.light = new lime.Sprite().setSize(120,230).setStroke(3,'#848484').setFill(0xff,0xff,0xff,0.8).setPosition(0,-158).setOpacity(0.7);
	var stick = new lime.Sprite().setSize(20,24).setStroke(5,'#848484').setFill('#848484').setPosition(0,125);
	var pig = new lime.Sprite().setFill('assets/pig.png'); //.setSize(96,200).setPosition(0,-158);
	action.label = new lime.Label().setFontSize(48).setFontColor('#0000ff').setShadow('#0B2F3A',2, 1,1).setHidden(1).setPosition(0,60);
	action.light.appendChild(stick);
	action.light.appendChild(pig);
	action.appendChild(action.light);
	action.appendChild(action.label);
	action.mask = new Array();
	var h = 72;
	for(var i=0; i<3; i++) {
		//action.mask[i] = new lime.Sprite().setSize(96, h).setFill('#ffffff').setOpacity(0.8).setPosition(0,(i-1)*(h-4)-158);
		action.mask[i] = new lime.Sprite().setSize(96, h).setFill('#ffffff').setOpacity(0.8).setPosition(0,(i-1)*(h-4));
		action.light.appendChild(action.mask[i]);
	}
	
	action.chanceButton = new game.CircleButton().setSize(140,140)
										.setFontColor('#FFFFFF')
										.setText(cfg_messageButtonGetActionCardCaption)
										.setColor('#DF3A01')
										.setHidden(1)
										.setPosition(0,110);
	action.appendChild(action.chanceButton);
	goog.events.listen(action.chanceButton,['mousedown','touchstart'],function(e){
		if( cs.network_protocols.currentState == cs.network_protocols.State.GET_ACTION || cs.network_protocols.currentState == cs.network_protocols.State.RCVD_GET_ACTION) {
			cs.network_protocols.processCheck();
		}
	});
	
	
	
	action.aniTime = 30;
	action._aniTimer = 0;
	/**
	 *@this{lime.Sprite}
	 */
	action._aniHandler = function() {
		var r = Math.floor(Math.random()*3);
		this.updateMask(r);
		this._aniTimer++;
	}
	action.updateMask = function(got) {
		if(got >= 0) {
			action.mask[got].setOpacity(0);
		}
		for(var i=0; i<3; i++) {
			if(i != got) {
				action.mask[i].setOpacity(.8);
			}
		}
	}
	action.play = function() {
		action._aniTimer = 0;
		action.light.setHidden(0);
		action.chanceButton.setHidden(1);
		lime.scheduleManager.scheduleWithDelay(action._aniHandler, action, 100);
		return action;
	}
	action.getValue = function() {
		lime.scheduleManager.unschedule(action._aniHandler, action);
		action.chanceButton.setHidden(1);
		action.selected = cs.network_protocols.getRandomAction();
		action.updateMask(action.selected);
		action.label.setHidden(0).setText(cfg_messageActionCaption[action.selected]);
		return action.selected;
	}
	action.stop = function() {
		action.light.setHidden(1);
		action.label.setHidden(1);
		action.chanceButton.setHidden(1);
	}
	action.init = function() {
		action.light.setHidden(0);
		action.updateMask(-1);
		action.chanceButton.setHidden(0);
		action.label.setHidden(1);
		return action;
	}
	action.light.setHidden(1);
	//action.play();
	return action;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.getRandomAction = function() {
	var conf = cfg_levelActionConf[cs.network_protocols.level];
	var src = new Array();
	for(var i=0; i<conf.length; i++) {
		for(var j=0; j<conf[i]; j++) {
			src.push(i);
		}
	}
	var rIndex = game.Util.makeRandomIndex(0, src.length-1);
	return src[rIndex[Math.floor(Math.random()*rIndex.length)]];
};
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.makeArrow = function() {
	var arrow = new lime.Sprite().setFill('assets/arrow.png')
							//.setRotation(180)
							.setSize(200,50);
	//arrow.mask = new lime.Sprite().setSize(30,50).setFill('#ffffff').setOpacity(.3).setPosition(-125,0);
	arrow.mask = new lime.Polygon(-15,0, 0,-25, 25,-25, 10,0, 25,25, 0,25).setFill('#ffffff').setRotation(180).setOpacity(.3).setPosition(-125,0);
	arrow.appendChild(arrow.mask);
	arrow.aniTime = 30;
	arrow._aniTimer = 0;
	/**
	 *@this{lime.Sprite}
	 */	
	arrow._aniHandler = function() {
		var pos = this.mask.getPosition();
		var w = this.mask.getSize().width;
		var xEnd = (this.getSize().width)/2;
		if(pos.x >= xEnd) {
			pos.x = xEnd * -1 -w ;	//reset to star position
		}
		pos.x += w*1.5;
		this.mask.setPosition(pos);
		this._aniTimer++;
	}
	arrow.play = function(d) {
		if(typeof d != 'undefined' && d == 1) {
			if(Math.abs(arrow.getRotation()) == 90) {
				arrow.setRotation(-90);
			} else {
				arrow.setRotation(180);
			}
		} else {
			if(Math.abs(arrow.getRotation()) == 90) {
				arrow.setRotation(90);
			} else {
				arrow.setRotation(0);
			}
		}
		arrow.setHidden(0);
		arrow._aniTimer = 0;
		arrow.mask.setPosition(-125,0);
		lime.scheduleManager.scheduleWithDelay(arrow._aniHandler, arrow, 100);
		return arrow;
	}
	arrow.stop = function() {
		arrow.setHidden(1);
		lime.scheduleManager.unschedule(arrow._aniHandler, arrow);
		return arrow;
	}
	arrow.setHidden(1);
	return arrow;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.showMessage = function(txt, t) {
	var message = new game.FadeOutMessage()//.setSize(500,200)
										//.setFontSize(24)
										.setFontColor('#ffff99')
										.setFill(0xff, 0x66, 0x33, 0.5)
										//.setStroke(4,'#0000ff')
										.setText(txt)
										//.setRadius(20)
										.setDelay(t)
										.play()
										.setPosition(cs.network_protocols.Width/2, cs.network_protocols.Height/5);
	topLayer.appendChild(message);
	return message;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.network_protocols.createCheckBox = function(titleText, value, callback) {
	var w = 140;
	var h = w/2;
	var fontSize = h/4;
	var btn = new game.Button('ON OFF').setSize(w,h)
									//.setPosition(w*.25, h*.5)
									//.setFontSize(Math.floor(h*0.3))
									.setColor('#eee8aa');
	btn.label = new lime.Label().setText(titleText).setSize(w,fontSize).setFontSize(fontSize)
								.setPosition(0, -h/2-fontSize);
	btn.appendChild(btn.label);
	btn.circle = new lime.Circle().setSize(h,h).setFill('#BDB76B')
								.setStroke(1, '#FFD700');
	if(value) {
		btn.circle.setPosition(w*.5-h*.5, 0);
		btn.setColor('#00ff00');
	} else {
		btn.circle.setPosition(-w*.5+h*.5, 0);
		btn.setColor('#eee8aa');
	}
	btn.appendChild(btn.circle);
	goog.events.listen(btn,['mousedown','touchstart'],function(e){
		var circle = btn.getChildAt(btn.getNumberOfChildren()-1);
		if(circle.getPosition().x < 0) {
			var value = true;
			circle.setPosition(btn.getSize().width*.5-h*.5, 0);
			btn.setColor('#00ff00');
		} else {
			var value = false;
			circle.setPosition(-btn.getSize().width*.5+h*.5, 0);
			btn.setColor('#eee8aa');
		}
		if(typeof(callback) == 'function') {
			callback(value);
		}
	});
	return btn;
};
//
//clear all object before a new game
//
// target : lime.Layer object
//
cs.network_protocols.clearAll = function(target) {
	for(var i=0; i<target.getNumberOfChildren(); i++) {
		var child = target.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
		} catch(e) { };
		try {
			goog.events.removeAll(child);
		}  catch(e) {};		
		try {
			target.removeChild(child);
		} catch(e) { };
		try {
			child.removeDomElement()
		} catch(e) { };
	}
	try {
		lime.animation.actionManager.stopAll(target);
	} catch(e) { };
	try {
		goog.events.removeAll(target);
	}  catch(e) {};		
	try {
		target.removeAllChildren();
	} catch(e) {	};
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.network_protocols.start', cs.network_protocols.start);

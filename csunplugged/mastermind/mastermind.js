//set main namespace
goog.provide('cs.mastermind');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.ui.Scroller');

goog.require('lime.scheduleManager');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');

goog.require('game.Button');
goog.require('game.Util');
goog.require('game.FadeOutMessage');
goog.require('game.Audio');

cs.mastermind.config_file = 'mastermind_conf.js';

cs.mastermind.Width = 576;
cs.mastermind.Height = 749;
cs.mastermind.code = '0123';
cs.mastermind.rowWidth = 500;
cs.mastermind.rowHeight = 70;
cs.mastermind.pegWidth = 46;
cs.mastermind.pegHeight = 65;
cs.mastermind.feedbackWidth = 20;
cs.mastermind.feedbackHeight = 27;
cs.mastermind.numberOfSlots = 4;
cs.mastermind.maxNumberOfTrials = 10;
cs.mastermind.maxNumberOfScroller = 8;
cs.mastermind.pegColorTotal = 7;
cs.mastermind.selectEnable = true;
cs.mastermind.allowDuplicate = false;
cs.mastermind.currentSloteId = -1;
cs.mastermind.currentTrial = 0;
cs.mastermind.inputTotal = 0;
cs.mastermind.secondSpend = 0;
cs.mastermind.pressButtonHintDelay = 5; //unit : seconds

// entrypoint
cs.mastermind.start = function(){

	var director = new lime.Director(document.body, cs.mastermind.Width, cs.mastermind.Height),
	    scene = new lime.Scene();

	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊


	
	bg = new lime.Sprite()//.setFill('#ff00ff').
					//.setStroke(1, "#ff0000")
					.setSize(cs.mastermind.Width, cs.mastermind.Height)
					.setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2);
	scene.appendChild(bg);
	if(window.innerWidth > window.innerHeight) {
		bg.setStroke(1, "#ff0000")
	}
	
	gameLayer = new lime.Layer();
	inputLayer = new lime.Layer();
	topLayer = new lime.Layer();
	scene.appendChild(gameLayer);
	scene.appendChild(inputLayer);
	scene.appendChild(topLayer);
	
	var labelTitle = new lime.Label().setText('Mastermind')
										.setFontSize(16)
										.setFontColor('#2E64FE')
										.setPosition(cs.mastermind.Width/2, 12);
	scene.appendChild(labelTitle);
	
	isPegOptionsEnable = new Array();
	
	
	cs.mastermind.init();
	//cs.mastermind.helpDialog('Guess a secret code. The code is a sequence of eggs, and on each trail after you make guess will get hints which will help to improve your guess.', 'The Hints:');
	//cs.mastermind.configGame();
	
	// set current scene active
	director.replaceScene(scene);

}
//-------------------------------------------------
//
//-------------------------------------------------
cs.mastermind.init = function() {
	game.Util.loadSettingFromExternalScript(cs.mastermind.config_file, function() {
		cs.mastermind.isSoundInit = false;
		
		if( typeof(cfg_numberOfSlots) == 'undefined'
				|| typeof(cfg_maxNumberOfTrials) == 'undefined'
				|| typeof(cfg_pegColorTotal) == 'undefined'
				|| typeof(cfg_allowDuplicate) == 'undefined'
				|| typeof(cfg_pressButtonHintDelay) == 'undefined'
				|| typeof(cfg_locale_LANG)  == 'undefined' ) {
			//alert('Failed to load the configuration file : '+cs.mastermind.config_file);
			cs.mastermind.showMessage('Configuration File Load Failure : '+cs.mastermind.config_file,9999).setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2);;
			return;
		}
		
		//任意門,設定 level
		var anywhereDoor = game.Util.gup('AnywhereDoor');
		var level = game.Util.gup('level');
		if(typeof(anywhereDoor) != 'undefined' && typeof(level) != 'undefined') {
			if(anywhereDoor.toLowerCase() == 'tpet') {
				//var n = parseInt(level);
				//if(n > 0 && n <= cfg_levelActionConf.length) {
				//	cs.mastermind.level = n-1;
				//}
			}
		}
		var debug = parseInt(game.Util.gup('debug'));
		if( !isNaN(debug) ) {
			cs.mastermind.debug = debug;
		}
		
		if( cfg_soundEffectEnable ) {
			try {
				sound = {
					  click : new game.Audio(cfg_sound_click_file, cfg_sound_click_mp3, cfg_sound_click_ogg)
					, correct : new game.Audio(cfg_sound_correct_file, cfg_sound_correct_mp3, cfg_sound_correct_ogg)
					, wrong : new game.Audio(cfg_sound_wrong_file, cfg_sound_wrong_mp3, cfg_sound_wrong_ogg)
					, win : new game.Audio(cfg_sound_win_file, cfg_sound_win_mp3, cfg_sound_win_ogg)
				};
			} catch(e) {
				cfg_soundEffectEnable = false;
			}
		}
		var langFilename = 'lang_'+cfg_locale_LANG+'.js';
		game.Util.loadSettingFromExternalScript(langFilename, function() {	
			if( typeof cfg_messageSettingCaption == 'undefined' 
					|| cfg_messageSettingAllowDuplicateCaption == 'undefined' ) {
						
				cs.mastermind.showMessage('File Load Failure : '+langFilename,9999).setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2);;
				return;
			} else {
				//cs.mastermind.configGame();
				cs.mastermind.helpDialog(cfg_messageHelpDescription, cfg_messageHelpHintsCaption);
			}
		});
	});
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.mastermind.configGame = function() {
	cs.mastermind.clearAllChildrenOfLayer(gameLayer);
	cs.mastermind.clearAllChildrenOfLayer(inputLayer);
	cs.mastermind.clearAllChildrenOfLayer(topLayer);
	
	var configButton = new lime.Sprite().setFill('assets/icon_gear.png')
									.setSize(64, 64)
									//.setHidden(1)
									.setOpacity(1)
									.setPosition(55, 80);
	//Setting dialog caption								
	var titleLabel = new lime.Label().setText(cfg_messageSettingCaption)
									.setFontSize(48)
									.setFontColor('#ffffff')
									.setFill('#00b300')
									.setSize(cs.mastermind.Width-66, 64)
									.setStroke(2, '#009900')
									.setPosition(cs.mastermind.Width/2, 80);
	//Allow Duplicate checkbox
	var checkBox = cs.mastermind.createCheckBox(cfg_messageSettingAllowDuplicateCaption, cs.mastermind.allowDuplicate, function(v) {
		if(v) {
			cs.mastermind.allowDuplicate = true;
		} else {
			cs.mastermind.allowDuplicate = false;
		}
	}).setPosition(cs.mastermind.Width/2,260);
	
	//max number of tails radio
	var cw = 60;
	var cx = cs.mastermind.Width/2 - cw-100
	var c = new Array();
	//Caption
	var desc = new lime.Label().setText(cfg_messageSettingNumberOfTrailsCaption)
								.setSize(cs.mastermind.Width*.8, 36)
								.setFontColor('#ffff00').setFontSize(28)
								.setFill('#00cc66')
								.setPosition(cs.mastermind.Width/2, 400);
	gameLayer.appendChild(desc);
	//radio selector
	for(var i=0; i<3; i++) {
		c[i] = new lime.Circle().setSize(cw, cw)
									.setFill('#ffff33')
									.setStroke(4,'#ff0000')
									.setPosition(cx+(cw+100)*i, 460);
		c[i].label = new lime.Label().setText(10+i*5).setFontSize(30).setFontColor('#660099')
									.setPosition(0, cw/2+28);
		c[i].appendChild(c[i].label);
		gameLayer.appendChild(c[i]);
		c[i].value = 10+i*5;
		if(i == (cs.mastermind.maxNumberOfTrials-10)/5) {
			c[i].setStroke(15,'#ff0000').setOpacity(1);
			c[i].selected = true;
		}
		goog.events.listen(c[i],['mousedown','touchstart'],function(e){
			for(var j=0; j<3; j++) {
				if(j == (this.value-10)/5) {
					c[j].setStroke(15,'#ff0000').setOpacity(1);
					c[j].selected = true;
					c[j].label.runAction( 
								new lime.animation.Sequence(
									new lime.animation.ScaleTo(1.2).setDuration(.1),
									new lime.animation.ScaleTo(1).setDuration(.1)
								));
					cs.mastermind.maxNumberOfTrials = 10+5*j;
				} else {
					c[j].setStroke(4,'#ff0000').setOpacity(.8);
					c[j].selected = false;
				}
			}
		},false, c[i]);
									
	}
	//confirm button
	var okButton = new game.Button()
						.setFontColor('#004d00')
						.setText(cfg_messageSettingConfirmButtonCaption)
						.setSize(cs.mastermind.Width*.8, 60)
						.setColor('#00cc66')
						.setPosition(cs.mastermind.Width/2,cs.mastermind.Height-80);
	goog.events.listen(okButton, ['mousedown','touchstart'], function(e) {
		if( cfg_soundEffectEnable ) {
			//sound.correct.playing_ = false;
			//game.setMute(true);
			sound.click.setVolume(0);
			sound.click.play();
		}
		cs.mastermind.playGame();
	});					
	gameLayer.appendChild(titleLabel);
	gameLayer.appendChild(configButton);
	gameLayer.appendChild(checkBox);
	gameLayer.appendChild(okButton);

}

cs.mastermind.playGame = function() {
	cs.mastermind.clearAllChildrenOfLayer(gameLayer);
	cs.mastermind.clearAllChildrenOfLayer(inputLayer);
	cs.mastermind.clearAllChildrenOfLayer(topLayer);
	
	if( cfg_soundEffectEnable ) {
		//game.setMute(false);
		sound.click.stop();
		sound.click.setVolume(1);
	}
	
	//initial some variable
	cs.mastermind.currentSloteId = -1;
	cs.mastermind.currentTrial = 0;
	cs.mastermind.inputTotal = 0;
	
	var totalHeight = (cs.mastermind.rowHeight+5)*(cs.mastermind.maxNumberOfTrials+0)-2;
	var totalHeightMax = (cs.mastermind.rowHeight+5)*cs.mastermind.maxNumberOfScroller-2;
	var w = cs.mastermind.Width;//cs.mastermind.rowWidth+20;
	var h = (totalHeight > totalHeightMax ? totalHeightMax : totalHeight);
	var x = (cs.mastermind.Width)/2;
	var y = 30;
	trialsHistoryScroller = new lime.ui.Scroller()
			.setSize(w, h)
			//.setStroke(1)
			.setDirection(lime.ui.Scroller.Direction.VERTICAL)
			.setAnchorPoint(0.5,0)
			.setPosition(x, y);
	
	gameLayer.appendChild(trialsHistoryScroller);
	
	for(var i=0; i< cs.mastermind.pegColorTotal; i++) {
		isPegOptionsEnable[i] = true;
	}
	
	
	//var yStart = 70;
	var yStart = 44;
	var yOffset = (cs.mastermind.rowHeight+5);
	if(typeof(trialsHistoryArray) != 'undefined') {
		delete trialsHistoryArray;
	}
	trialsHistoryArray = new Array();
	for(var i=0; i<cs.mastermind.maxNumberOfTrials; i++) {
		trialsHistoryArray[i] = cs.mastermind.newTrialRecordRow();
		trialsHistoryArray[i].setPosition(0, yStart+yOffset*i);
		trialsHistoryArray[i].label.setText((i+1)+'.');
		trialsHistoryScroller.appendChild(trialsHistoryArray[i]);
	}
	trialsHistoryArray[cs.mastermind.currentTrial].label.setFontColor('#FF0000');
	
	//Top Status : trails caption
	var trialsLabel = new lime.Label().setText(cfg_messageTopStatusTrialsCaption)
									.setFontSize(12)
									.setFontColor('#FF9900')
									.setPosition(70,12);
	gameLayer.appendChild(trialsLabel);
	trialsValueLabel = new lime.Label().setText(cs.mastermind.currentTrial+1)
									.setFontSize(12)
									.setFontColor('#FF9900')
									.setPosition(110,12);
	gameLayer.appendChild(trialsValueLabel);
	//Top Status : timer caption
	var timerLabel = new lime.Label().setText(cfg_messageTopStatusTimerCaption)
									.setFontSize(12)
									.setFontColor('#FF9900')
									.setPosition(cs.mastermind.Width-100,12);
	gameLayer.appendChild(timerLabel);
	timerValueLabel = new lime.Label().setText('00:00')
									.setFontSize(12)
									.setFontColor('#FF9900')
									.setPosition(cs.mastermind.Width-60,12);
	gameLayer.appendChild(timerValueLabel);
	
	//get random codes
	cs.mastermind.generateNewCode();
	
	//timer
	cs.mastermind.newTimer(0, '#FF9900', true);
	cs.mastermind.playTimer();
	
	//first trial
	cs.mastermind.newTrial();
}

cs.mastermind.newTrial = function() {
	cs.mastermind.clearAllChildrenOfLayer(inputLayer);
	cs.mastermind.clearAllChildrenOfLayer(topLayer);
	
	var inputFrameWidth = cs.mastermind.pegWidth*1.5*cs.mastermind.numberOfSlots+cs.mastermind.pegWidth*0.5;
	inputFrame = new lime.Sprite().setSize(inputFrameWidth, 80) //setSize(cs.mastermind.Width-20, 80)
									.setStroke(2, '#FFBF00')
									//.setPosition(cs.mastermind.Width/2, cs.mastermind.Height-55);
									.setPosition(cs.mastermind.Width/2, cs.mastermind.Height-55);
	inputLayer.appendChild(inputFrame);
	//selector area caption (':: Your Answer ::')
	var titleLabel = new lime.Label().setText(cfg_messageAnswerSelectorCaption)
								.setFontSize(8)
								.setFontColor('#FE642E')
								.setPosition(cs.mastermind.Width/2, cs.mastermind.Height-55-50);
	inputLayer.appendChild(titleLabel);
	
	var inputPegs = new Array();
	for(var i=0; i<cs.mastermind.numberOfSlots; i++) {
		//inputPegs[i] = new lime.Sprite().setFill('assets/peg_0'+(i+1)+'.png')
		//					.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight)
		inputPegs[i] = new lime.Sprite().setFill('assets/selection.png')
							.setSize(50, 50)
							//.setPosition((cs.mastermind.Width-20)/-2+100+cs.mastermind.pegWidth+cs.mastermind.pegWidth*1.5*i, 0);
							.setPosition(inputFrameWidth/-2+cs.mastermind.pegWidth+cs.mastermind.pegWidth*1.5*i, 0);
		inputFrame.appendChild(inputPegs[i]);
		inputPegs[i].value = -1;
		inputPegs[i].nestId = i;
		inputPegs[i].isChecked = false;
		goog.events.listen(inputPegs[i], ['mousedown','touchstart'], function(e) {
			e.event.stopPropagation();
			cs.mastermind.selectPegFromList(this);
		});
	}
	//check answer button
	checkButton = new lime.Sprite().setFill('assets/pengiun_button.png')
									.setSize(86, 66)
									//.setHidden(1)
									.setOpacity(.2)
									//.setPosition((cs.mastermind.Width-20)/-2+50, 5);
									.setPosition(cs.mastermind.Width-70, cs.mastermind.Height-50);
	//check answer button caption
    var checkButtonLabel = new lime.Label().setText(cfg_messageAnswerSelectorCheckButtonCaption)
										.setFontSize(8)
										.setFontColor('#0000ff')
										.setPosition(-25,10);
	checkButton.appendChild(checkButtonLabel);
	//inputFrame.appendChild(checkButton);
	inputLayer.appendChild(checkButton);
	
	goog.events.listen(checkButton, ['mousedown','touchstart'], function(e) {
		e.event.stopPropagation();
		cs.mastermind.checkAnswer(this);
	});

	restartButton = new lime.Sprite().setFill('assets/icon_restart.png')
									.setSize(56, 59)
									//.setHidden(1)
									.setOpacity(1)
									.setPosition(80, cs.mastermind.Height-45);
	inputLayer.appendChild(restartButton);
	goog.events.listen(restartButton, ['mousedown','touchstart'], function() {
		cs.mastermind.playGame();
	});

	var configButton = new lime.Sprite().setFill('assets/icon_gear.png')
									.setSize(32, 32)
									//.setHidden(1)
									.setOpacity(1)
									.setPosition(55, cs.mastermind.Height-100);
	inputLayer.appendChild(configButton);
	goog.events.listen(configButton, ['mousedown','touchstart'], function() {
		cs.mastermind.configGame();
	});
	
	//press button hint
	var x = inputFrame.getPosition().x;
	var y = inputFrame.getPosition().y;
	var scale = 1.5*cs.mastermind.pegHeight/160;
	var pressButton = new lime.Sprite().setFill('assets/press_button.png')
										.setScale(scale, scale)
										.setHidden(1)
										.setPosition(inputFrameWidth/-2+cs.mastermind.pegWidth*0.75+x, y+cs.mastermind.pegHeight*0.05);
    topLayer.appendChild(pressButton);
	lime.scheduleManager.callAfter(function() {
		if( cfg_soundEffectEnable ) {
			sound.click.playing_ = false;
			sound.click.play();
		}

		this.setHidden(0);
		var scale = this.getScale().x;
		this.runAction( new lime.animation.Sequence(
			new lime.animation.ScaleTo(scale*0.8).setDuration(.3),
			new lime.animation.ScaleTo(scale).setDuration(.3),
			new lime.animation.ScaleTo(scale*0.8).setDuration(.3)
		));
	}, pressButton, cs.mastermind.pressButtonHintDelay*1000);
	
	//
	//initial some variables
	//
	//clear all selected flag
	for(var i=0; i< cs.mastermind.pegColorTotal; i++) {
		isPegOptionsEnable[i] = true;
	}
	
	//set current selecter to none
	cs.mastermind.currentSloteId = -1;
	//enable selecter
	cs.mastermind.selectEnable = true;
	
	//set text color of current history row
	trialsHistoryArray[cs.mastermind.currentTrial].label.setFontColor('#FF0000');
	trialsHistoryArray[cs.mastermind.currentTrial].setStroke(3, '#5858fa')
	cs.mastermind.scrolToCurrentRow();
	cs.mastermind.inputTotal = 0;
	
	trialsValueLabel.setText(cs.mastermind.currentTrial+1);
	
	
}
cs.mastermind.generateNewCode = function() {
	cs.mastermind.code = '';
	if(cs.mastermind.allowDuplicate) {
		for(var i=0; i<	cs.mastermind.numberOfSlots; i++) {
			var randomCodes = game.Util.makeRandomIndex( 0, cs.mastermind.pegColorTotal-1 );
			cs.mastermind.code += randomCodes[Math.floor(Math.random()*cs.mastermind.pegColorTotal)];
		}		
	} else {
		var randomCodes = game.Util.makeRandomIndex( 0, cs.mastermind.pegColorTotal-1 );
		for(var i=0; i<	cs.mastermind.numberOfSlots; i++) {
			cs.mastermind.code += randomCodes[i];
		}
	}
}
cs.mastermind.scrolToCurrentRow = function() {
	trialsHistoryScroller.scrollTo((cs.mastermind.rowHeight+5)*(cs.mastermind.currentTrial+1-cs.mastermind.maxNumberOfScroller), 1);
}
cs.mastermind.checkAnswer = function(target) {
	var total = inputFrame.getNumberOfChildren();
	var isAllSelected = true;
	var exactlyCorrect = 0;
	var misplaced = 0;

	if(!cs.mastermind.selectEnable) return;
	
	
	//check if input all fields or not.
	var unfoundCode = new Array();
	for(var i=0; i < total; i++) {
		var value = inputFrame.getChildAt(i).value;
		if( inputFrame.getChildAt(i).value < 0) {
			isAllSelected = false;
			break;
		} else {
			//found all correct fields 
			var code = cs.mastermind.code.substr(i,1);
			if(value.toString() == code) {
				inputFrame.getChildAt(i).isChecked = true;
				exactlyCorrect++;
			} else {
				unfoundCode[unfoundCode.length] = code;
			}		
		}
	}
	
	//check answer
	if(isAllSelected) {
		trialsHistoryArray[cs.mastermind.currentTrial].label.setFontColor('#000000');
		trialsHistoryArray[cs.mastermind.currentTrial].setStroke(1, '#886A08')
		//fill input data to history area 
		//	and check
		for(var i=0; i < total; i++) {
			var value = inputFrame.getChildAt(i).value;
			trialsHistoryArray[cs.mastermind.currentTrial].pegs[i].setFill('assets/peg_0'+(value+1)+'.png')
							.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight);
			//found the fields that at wrong position 
			if(!inputFrame.getChildAt(i).isChecked) {
				for(var j=0; j<unfoundCode.length; j++) {
					if(value.toString() == unfoundCode[j]) {
						misplaced++;
						unfoundCode.slice(j,1);
						break;
					}
				}
			}
		}
		//show feedback
		var currentFeedbasck = 0;
		//excactly correct
		for(var i=0; i < exactlyCorrect; i++ ) {
			trialsHistoryArray[cs.mastermind.currentTrial].feedbackArray[currentFeedbasck++].setFill('assets/feedback_black.png')
							.setSize(cs.mastermind.feedbackWidth, cs.mastermind.feedbackHeight);
		}
		//just only position correct
		for(var i=0; i < misplaced; i++ ) {
			trialsHistoryArray[cs.mastermind.currentTrial].feedbackArray[currentFeedbasck++].setFill('assets/feedback_white.png')
							.setSize(cs.mastermind.feedbackWidth, cs.mastermind.feedbackHeight);
		}
		if(exactlyCorrect >= cs.mastermind.numberOfSlots) {
			cs.mastermind.gameOver();
		} else {
			//move the check history pointer to next one.
			cs.mastermind.currentTrial++;
			if(cs.mastermind.currentTrial < cs.mastermind.maxNumberOfTrials) {
				cs.mastermind.newTrial();
			} else {
				cs.mastermind.gameOver();
			}
		}
	}
}

//
cs.mastermind.selectPegFromList = function(target) {
	if( !cs.mastermind.selectEnable ) return;
	
	cs.mastermind.scrolToCurrentRow();
	
	cs.mastermind.clearAllChildrenOfLayer(topLayer);
	if( cs.mastermind.currentSloteId >= 0 && cs.mastermind.currentSloteId == target.nestId ) {
		cs.mastermind.currentSloteId = -1;
		return;
	}
	
	cs.mastermind.currentSloteId = target.nestId;
		
	//target.setHidden(1);
	var xStart = target.getPosition().x+target.getParent().getPosition().x;
	var yStart = target.getPosition().y+target.getParent().getPosition().y;
	
	//selector background
	var bgW = cs.mastermind.pegWidth+30;
	var bgH = cs.mastermind.pegHeight*(cs.mastermind.pegColorTotal+1)*1.1;
	var optionsBG = new lime.RoundedRect().setRadius(20)
							.setSize(bgW, bgH)
							.setFill(0xF5, 0xEC, 0xCE, .9)
							.setStroke(2,'#cccc66')
							.setHidden(0)
							.setOpacity(1)
							.setPosition(xStart, yStart-bgH/2);
	topLayer.appendChild(optionsBG);
		
	
	var pegOptions = new Array();
	for(var i=0; i<cs.mastermind.pegColorTotal; i++) {
		pegOptions[i] = new lime.Sprite().setFill('assets/peg_0'+(i+1)+'.png')
							.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight)
							.setOpacity(1)
							.setPosition(xStart, yStart-cs.mastermind.pegHeight*(i+1)*1.1);
		pegOptions[i].value = i;
		if(!cs.mastermind.allowDuplicate && !isPegOptionsEnable[i] ) {
			pegOptions[i].setOpacity(0.12);
		}
		topLayer.appendChild(pegOptions[i]);
		goog.events.listen(pegOptions[i], ['mousedown','touchstart'], function() {
			if(this.getOpacity() == 1) {
				if(!cs.mastermind.allowDuplicate) {
					isPegOptionsEnable[this.value] = false;
					if(target.value >= 0) {
						isPegOptionsEnable[target.value] = true;
					}
				}
				if(target.value < 0) {
					cs.mastermind.inputTotal++;
				}
				if(cs.mastermind.inputTotal >= cs.mastermind.numberOfSlots) {
					checkButton.setHidden(0);
					checkButton.setOpacity(1)
				}
				target.value = this.value;
				target.setFill('assets/peg_0'+(this.value+1)+'.png')
							.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight);
				cs.mastermind.currentSloteId = -1;
				cs.mastermind.clearAllChildrenOfLayer(topLayer);
				
				if( cfg_soundEffectEnable ) {
						sound.click.playing_ = false;
						sound.click.play();
				}
			}
		});
	}
}

cs.mastermind.newTrialRecordRow = function() {
	var xStart = -235;
	var yStart = 70;
	var xOffset = cs.mastermind.pegWidth*1.2;

	var rowSprite = new lime.Sprite().setSize(cs.mastermind.rowWidth, cs.mastermind.rowHeight+1)
									.setStroke(1, '#886A08')
									;
	
	rowSprite.label = new lime.Label().setText('1')
								.setFontSize(24)
								.setFontColor('#E6E6E6')
								.setPosition(xStart+10, 0);
    rowSprite.appendChild(rowSprite.label);
	
	rowSprite.pegs = new Array();
	for(var i=0; i<cs.mastermind.numberOfSlots; i++) {
		//rowSprite.pegs[i] = new lime.Sprite().setFill('assets/peg_0'+(i+1)+'.png')
		//					.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight)
		rowSprite.pegs[i] = new lime.Sprite().setFill('assets/peg_blank.png')
							.setSize(30, 30)
							.setPosition(xStart+xOffset*(i+1), 0);
		 rowSprite.appendChild(rowSprite.pegs[i]);
	}
	
	rowSprite.feedbackArray = new Array();
	for(var i=0; i<cs.mastermind.numberOfSlots; i++) {
		rowSprite.feedbackArray[i] = new lime.Sprite().setFill('assets/peg_blank.png')
							.setSize(10, 10)
							.setPosition(250+cs.mastermind.feedbackWidth*(1.2*(-2+i%2)), cs.mastermind.feedbackHeight*(-0.6+1.2*Math.floor(i/2)));
		rowSprite.appendChild(rowSprite.feedbackArray[i]);
	}
	return rowSprite;
};

//
//
//
cs.mastermind.gameOver = function() {
	cs.mastermind.pauseTimer();
	cs.mastermind.selectEnable = false;
	var total = inputFrame.getNumberOfChildren();
	//change the text to code
	inputLayer.getChildAt(1).setText(cfg_messageGameOverCodeCaption);
	for(var i=0; i<total; i++) {
		inputFrame.getChildAt(i).setFill('assets/peg_0'+(parseInt(cs.mastermind.code.substr(i,1))+1)+'.png');
	}
	if(cs.mastermind.currentTrial < cs.mastermind.maxNumberOfTrials) {
		//success
		cs.mastermind.gameOverDialog(cfg_messageGameOverSuccessTrailsPrefix + (cs.mastermind.currentTrial+1) + cfg_messageGameOverSuccessTrailsPostfix, cfg_messageGameOverSuccessTimePrefix + cs.mastermind.secondToTimeString(cs.mastermind.secondSpend) );
	} else {
		//failure (over the max trials number)
		cs.mastermind.gameOverDialog(cfg_messageGameOverFailure);
	}
}
//比賽說明的對話框
cs.mastermind.helpDialog = function(message, message2) {
	cs.mastermind.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.mastermind.enabled = false;	//diable按鈕
	var conf = new Object();
	
	//random show eggs
	var r = game.Util.makeRandomIndex( 0, cs.mastermind.pegColorTotal-1 );
	for(var i=0; i<cs.mastermind.numberOfSlots; i++) {
		var peg = new lime.Sprite().setFill('assets/peg_0'+(r[i]+1)+'.png')
							.setSize(cs.mastermind.pegWidth, cs.mastermind.pegHeight)
							.setPosition(cs.mastermind.Width/2-cs.mastermind.pegWidth*1.2*cs.mastermind.numberOfSlots/2+cs.mastermind.pegWidth*0.6+cs.mastermind.pegWidth*1.2*i, 130);
		gameLayer.appendChild(peg);
	}

	
	conf.type = 'help';
	conf.title = 'MASTERMIND'; //cfg_messageDescriptionLevelPrefix + (cs.mastermind.level+1) + cfg_messageDescriptionLevelPostfix;
	conf.buttonText = 'OK'; //cfg_messageDescriptionButtonOk;
	messageTextDefault = "Game Over";
	if(typeof message != 'undefined' && message != '') {
		conf.message = message;
	} else {
		conf.message = '對話框';
	}
	if(typeof message2 != 'undefined' && message2 != '') {
		conf.message2 = message2;
	}
	conf.bgcolor = '#cc9966';
	conf.titleColor = '#ffff66';
	conf.fontColor = '#ffffff';
	conf.buttonColor = '#009966';

	conf.fontSize = 20;
	conf.font = cs.mastermind.font;
	conf.alpha = .85;
	var dialog = cs.mastermind.createDialog(conf, function() { 
		//cs.mastermind.counDownAndPlay();
		//cs.mastermind.soundInit();
		cs.mastermind.configGame();
	});
	dialog.setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2)
			;//.setScale(cs.mastermind.Width/800);
	topLayer.appendChild(dialog);
};

//比賽結束的對話框
cs.mastermind.gameOverDialog = function(message, message2) {
	cs.mastermind.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.mastermind.enabled = false;	//diable按鈕
	var conf = new Object();
		
	conf.title = 'MASTERMIND'; //cfg_messageDescriptionLevelPrefix + (cs.mastermind.level+1) + cfg_messageDescriptionLevelPostfix;
	conf.buttonText = 'OK'; //cfg_messageDescriptionButtonOk;
	messageTextDefault = "Game Over";
	if(typeof message != 'undefined' && message != '') {
		conf.message = message;
	} else {
		conf.message = messageDefault;
	}
	if(typeof message2 != 'undefined' && message2 != '') {
		conf.message2 = message2;
	}
	conf.bgcolor = '#cc9966';
	conf.titleColor = '#ffff66';
	conf.fontColor = '#ffffff';
	conf.buttonColor = '#009966';

	conf.fontSize = 30;
	conf.font = cs.mastermind.font;
	conf.alpha = .85;
	var dialog = cs.mastermind.createDialog(conf, function() { 
		//cs.mastermind.counDownAndPlay();
		//cs.mastermind.soundInit();
		cs.mastermind.playGame();
	});
	dialog.setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2)
			;//.setScale(cs.mastermind.Width/800);
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
cs.mastermind.createDialog = function(conf, callback) {
//cs.mastermind.createDialog = function(title, message, buttonTxt, callback) {
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
	var w = cs.mastermind.Width*.9;
	var h = cs.mastermind.Width*.65;
	var dialog = new lime.RoundedRect().setRadius(40).setSize(w, h)
							.setFill(rgb[0],rgb[1],rgb[2], conf.alpha).setStroke(3,conf.borderColor)
							//.setPosition(cs.mastermind.Width/2, cs.mastermind.Height/2)
							.setOpacity(1);
	var titleHeight = 50;
	var messageHeight = 35;
	var label = new lime.Label().setSize(w*.9,titleHeight).setFontSize(titleHeight*.85)
							.setPosition(0,15+(titleHeight-h)/2)
							.setText(conf.title).setFontColor(conf.titleColor).setFontFamily(conf.font);
	dialog.appendChild(label);
	var labelMessage = new lime.Label().setSize(w*.9,messageHeight).setFontSize(conf.fontSize)
							.setPosition(0,15+titleHeight+15+(messageHeight-h)/2)
							.setAlign('left').setText(conf.message).setFontColor(conf.fontColor).setFontFamily(conf.font);
	dialog.appendChild(labelMessage);
	if(conf.message2 != '') {
		var labelMessage2 = new lime.Label().setSize(w*.9,35).setFontSize(conf.fontSize)
											.setPosition(0,15)
											.setText(conf.message2).setFontColor(conf.fontColor).setFontFamily(conf.font);
		dialog.appendChild(labelMessage2);
	}
	
	//show hints defined
	if(typeof(conf.type) != 'undefined' && conf.type == 'help') {
		//Correct color, and is on correct place.
		var correctIcon = new lime.Sprite().setFill('assets/feedback_black.png')
											.setSize(cs.mastermind.feedbackWidth, cs.mastermind.feedbackHeight)
											.setPosition(10+cs.mastermind.feedbackWidth-w/2,50);
		var correctLabel = new lime.Label().setText(': '+cfg_messageHelpHintsAllCorrect)
											.setSize(w*.9,cs.mastermind.feedbackHeight)
											.setFontSize(20).setAlign('left')
											.setFontColor(conf.fontColor).setFontFamily(conf.font)
											.setPosition(10+cs.mastermind.feedbackWidth/2,50);
		//Correct color, but is on wrong place.
		var misplacedIcon = new lime.Sprite().setFill('assets/feedback_white.png')
											.setSize(cs.mastermind.feedbackWidth, cs.mastermind.feedbackHeight)
											.setPosition(10+cs.mastermind.feedbackWidth-w/2,60+cs.mastermind.feedbackHeight);
		var misplacedLabel = new lime.Label().setText(': '+cfg_messageHelpHintsOnlyColorCorrect)
											.setSize(w*.9,cs.mastermind.feedbackHeight)
											.setFontSize(20).setAlign('left')
											.setFontColor(conf.fontColor).setFontFamily(conf.font)
											.setPosition(10+cs.mastermind.feedbackWidth/2,60+cs.mastermind.feedbackHeight);
		dialog.appendChild(correctIcon);
		dialog.appendChild(correctLabel);
		dialog.appendChild(misplacedIcon);
		dialog.appendChild(misplacedLabel);
	}
	
	var okButton = new game.Button(conf.buttonText)
						.setPosition(0, (h-40)/2-22).setSize(180, 45).setColor(conf.buttonColor).setFontSize(34).setFontFamily(conf.font);
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
/**
 * 計時器
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
cs.mastermind.newTimer = function(time, color, pause, callback) {
	try {
		lime.scheduleManager.unschedule(timerHandler, timerValueLabel);
	} catch(e) { };
	if(typeof color == 'undefined') {
		color = '#00ff31';
	}
	timerValueLabel.start  = new Date();
	timerValueLabel.setText('00:00').setFontColor(color);
	timerValueLabel.time = time;
	cs.mastermind.secondSpend = time;
	timerValueLabel.setText(cs.mastermind.secondToTimeString(time));
	if(typeof pause != 'undefined') {
		timerValueLabel.pause = pause;
	} else {
		timerValueLabel.pause = false;
	}
	timerValueLabel.callback = callback;
	lime.scheduleManager.scheduleWithDelay(timerHandler=function() {
		if( !timerValueLabel.pause ) {
			if(timerValueLabel.time > 0) {
				var t  = timerValueLabel.time - Math.round((new Date() - timerValueLabel.start)/1000);
			} else {	//計時器如果設為 0 或小於 0 , 時間為正數的方式
				var t = Math.round((new Date() - timerValueLabel.start)/1000);
			}
			cs.mastermind.secondSpend = t;
			timerValueLabel.setText(cs.mastermind.secondToTimeString(t));
			if(timerValueLabel.time > 0 && t <= 0) {
				lime.scheduleManager.unschedule(timerHandler, timerValueLabel);
				if(typeof timerValueLabel.callback == 'function') {
					timerValueLabel.callback();
				}
			}
		}
	}, timerValueLabel, 100);
	return timerValueLabel;
};
cs.mastermind.secondToTimeString = function(sec) {
	var s = sec%60;
	var m = Math.floor(sec/60);
	var ss = s < 10 ? '0'+s : s;
	var mm = m < 10 ? '0'+m : m;
	return mm + ':' + ss;
};
cs.mastermind.pauseTimer = function() {
	timerValueLabel.pause = true;
};
cs.mastermind.playTimer = function() {
	timerValueLabel.pause = false;
	if(timerValueLabel.time > 0) {	//倒數
		var t = new Date().valueOf() - 1000*( timerValueLabel.time - parseInt(cs.mastermind.secondSpend) );
	} else {	//正數
		var t = new Date().valueOf() - 1000*parseInt(cs.mastermind.secondSpend);
	}
	timerValueLabel.start = new Date(t); 
};
cs.mastermind.resetTimer = function() {
	timerValueLabel.start = new Date(); 
	timerValueLabel.pause = false;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.mastermind.showMessage = function(txt, t) {
	var message = new game.FadeOutMessage().setSize(cs.mastermind.Width*.9,60)
										.setFontSize(32)
										.setFontColor('#ff0000')
										.setFill(0xff, 0x66, 0x33, 0.5)
										//.setStroke(4,'#0000ff')
										.setText(txt)
										//.setRadius(20)
										.setDelay(t)
										.play()
										.setPosition(cs.mastermind.Width/2, cs.mastermind.Height/5);
	topLayer.appendChild(message);
	return message;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.mastermind.createCheckBox = function(titleText, value, callback) {
	var w = 140;
	var h = w/2;
	var fontSize = h/4;
	var btn = new game.Button('ON. OFF').setSize(w,h)
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
//-------------------------------------------------
//
//-------------------------------------------------
cs.mastermind.clearAllChildEvents = function(target) {
	try {
		var t = target.getNumberOfChildren();
		for(var i=0; i<t; i++) {
			goog.events.removeAll(target.getChildAt(i));
		}
	} catch(e) {};
}
cs.mastermind.clearAllChildrenOfLayer = function(target) {
	cs.mastermind.clearAllChildEvents(target);
	for(var i=0; i<target.getNumberOfChildren(); i++) {
		var child = target.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
			target.removeChild(child);
		} catch(e) {	};
	}
	try {
		target.removeAllChildren();
	} catch(e) {	};
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.mastermind.start', cs.mastermind.start);

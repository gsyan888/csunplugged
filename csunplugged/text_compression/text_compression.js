//set main namespace
goog.provide('cs.text_compression');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Polygon');
goog.require('lime.Label');
goog.require('lime.ui.Scroller');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveBy');

goog.require('cs.text_compression.Button');


cs.text_compression.Width = 1024;
cs.text_compression.Height = 768;

cs.text_compression.config_file = 'text_compression_config.js';

cs.text_compression.currentSample = 0;

cs.text_compression.enabled = false;

// entrypoint
cs.text_compression.start = function(){

	var director = new lime.Director(document.body,cs.text_compression.Width,cs.text_compression.Height),
	    scene = new lime.Scene();

	backgroundLayer = new lime.Layer();
	textLines = new lime.Layer();
	compressionLayer = new lime.Layer();
	topLayer = new lime.Layer();
	
	scene.appendChild(backgroundLayer);
	scene.appendChild(textLines);
	scene.appendChild(compressionLayer);
	scene.appendChild(topLayer);
	
	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊


	// set current scene active
	director.replaceScene(scene);
	
		
	cs.text_compression.init();
}

cs.text_compression.init = function() {
	cs.text_compression.loadSettingFromExternalScript(cs.text_compression.config_file, function() {
		if( typeof(menuItemAndTextLines) == 'undefined' ) {
			alert('Loaded config file failure : ' + cs.text_compression.config_file );
		} else {
			cs.text_compression.showMenu();
			//cs.text_compression.makeButtons();
			//cs.text_compression.newGame();
		}
	});

}

cs.text_compression.makeButtons = function() {
	var width = 250;
	var height = 50;
	var xStart =  (cs.text_compression.Width-(width*2+40))/2;
	var y = 50;
	buttonPattern = new cs.text_compression.Button(cfg_messageButtonPatternSelect)
									.setColor('#F5A9F2')
									.setSize(width,height)
									.setPosition(xStart,y);
	backgroundLayer.appendChild(buttonPattern);
	
	buttonTarget = new cs.text_compression.Button(cfg_messageButtonTargetSelect)
									.setColor('#ff9900')
									.setSize(width,height)
									.setOpacity(.2)
									.setPosition(xStart+width+40,y);
	backgroundLayer.appendChild(buttonTarget);
	
	buttonCompress = new cs.text_compression.Button(cfg_messageButtonCompressStart)
									.setColor('#6699ff')
									.setSize(width,height)
									.setOpacity(.2)
									.setPosition(xStart+(width+40)*2,y);
	backgroundLayer.appendChild(buttonCompress);
	
	patternLabel = new lime.Label().setText('')
								.setFontSize(32)
								.setFontColor('#F5A9F2')
								.setSize(cs.text_compression.Width, 40)
								.setFill('#00ff00')
								.setPosition(cs.text_compression.Width/2, y+70);
	backgroundLayer.appendChild(patternLabel);

	//按下去進行什麼動作
	cs.text_compression.setButtonAction(buttonPattern);
	cs.text_compression.setButtonAction(buttonTarget);
	cs.text_compression.setButtonAction(buttonCompress);

	//finish button
	var config = new Object();
	config.caption = cfg_messageButtonFinish;
	config.size = 90;
	config.outterColor = '#00ff00';
	config.innerColor = '#ffff00';
	config.fontColor = '#ff0000';
	finishButton = cs.text_compression.circleButton(config, cs.text_compression.finishAction);
	finishButton.setOpacity(0.2).setPosition(cs.text_compression.Width-config.size/2-10, cs.text_compression.Height-config.size/2-10);
	backgroundLayer.appendChild(finishButton)
	
}

cs.text_compression.newGame = function() {
	cs.text_compression.clearAll();
	
	
	cs.text_compression.enabled = true;
	
	cs.text_compression.makeButtons();
	
	textString = cs.text_compression.currentTextLines.replace(/\r/g, '');
	
	textLines.ch = new Array();
	var fontSize = cfg_textFontSize;
	//如果全英數的話, 字距縮小;中文則維持原始大小
	//var width = Math.floor( fontSize*( textString.replace(/\s/g,'').match(/^[A-Za-z0-9]+/) != null ? 0.75 : 1 )  );
	var ch='', col=0, row=0;
	var total = 0;
	var xStart = fontSize/2;
	var yStart = 200;
	var xGap = 8;
	var x = xStart;
	var y = 0;	
	for(var i=0; i<textString.length; i++) {
		ch = textString.substring(i,i+1);
		if(ch == "\n") {
			col = 0;
			x = xStart;
			if(i>0) {
				row++;
			}
		} else {
			//x = fontSize/2+width*col;
			y = yStart + Math.floor(fontSize*1.8)*row;
			textLines.ch[total] = new lime.Label().setText(ch)
											.setFontSize(fontSize)
											;
			var width = textLines.ch[total].measureText().width;
			textLines.ch[total].setSize(width+xGap+1,fontSize+4).setPosition(x+width/2,y);
			//計算下一個字的 x position								
			x += xGap+textLines.ch[total].measureText().width;
											
			textLines.appendChild(textLines.ch[total]);
			textLines.ch[total].text = ch;
			textLines.ch[total].selected = false;
			textLines.ch[total].index = total;
			
			goog.events.listen(textLines.ch[total], ['mousedown','touchstart'], function() {
				if( cs.text_compression.enabled && (cs.text_compression.process_stage == 1 || cs.text_compression.process_stage == 2) ) {
					/*
					if(!this.selected) {
						cs.text_compression.seletedTotal++;
						this.setFill(cs.text_compression.current_color);
					} else {
						cs.text_compression.seletedTotal--;
						this.setFill('#ffffff');
					}
					this.selected = !this.selected;
					*/
					cs.text_compression.clickedLabelIndex = this.index;
				}
			});
			
			total++;
			col++;
		}
	}


	//initialize
	cs.text_compression.process_stage = 0;	//目前的工作階段
	cs.text_compression.patterns = new Array();
	finishButton.setOpacity(0.2);
}
cs.text_compression.finishAction = function() {
	if(finishButton.getOpacity() == 1) {
		/*
		var compressionTotal = 0;
		for(var i=0; i<cs.text_compression.patterns.length; i++) {
			var pattern = cs.text_compression.patterns[i];
			var patternLen = pattern.pattern.length;
			for(var j=1; j<pattern.pos.length; j++) {
				if(pattern.pos[j][1]-pattern.pos[j][0]+1 == patternLen) {
					compressionTotal += patternLen;
				}
			}
		}
		var txt = cfg_messageFinishPrefix;
		txt += cs.text_compression.patterns.length;
		txt += cfg_messageFinishMiddle;
		txt += compressionTotal;
		txt += cfg_messageFinishPostfix;
		cs.text_compression.showMessage(txt, 32,"#ff0000", cfg_messageDelayFinish , 'middle', function() {
				
		});
		*/
		cs.text_compression.helpDialog();
	}
}
cs.text_compression.getPattern = function() {
	var i = 0;
	var firstPos = -1;
	var lastPos = -1;
	var str = '';
	var selectedTotal = 0;
	var errorFound = false;
	//console.log(textLines.ch);
	while( i < textLines.ch.length && selectedTotal < cs.text_compression.seletedTotal )  {
		//console.log(textLines.ch[i]);
		if( textLines.ch[i].selected ) {
			str += textLines.ch[i].text;
			if(firstPos < 0) {
				firstPos = i;
			}
			lastPos = i;
			selectedTotal++;
			textLines.ch[i].selected = false;
		}  else if ( firstPos >= 0 && lastPos >= 0 ) {
			break;
		}
		i++;
	}
	//檢查選取的字數是否相同
	errorFound = selectedTotal < cs.text_compression.seletedTotal;
		
	//將選取的字暫存
	if(!errorFound) {
		var n = cs.text_compression.patterns.length;
		cs.text_compression.patterns[n] = new Object();
		cs.text_compression.patterns[n].pattern = str;
		cs.text_compression.patterns[n].pos = new Array();
		cs.text_compression.patterns[n].pos[0] = [firstPos, lastPos];
		
		patternLabel.setText(str);
	} else {
		for(var i=firstPos; i<=lastPos; i++) {
			textLines.ch[i].selected = true;
		}
	}
	return !errorFound;
}
cs.text_compression.getTarget = function() {
	var i = 0;
	var firstPos = -1;
	var lastPos = -1;
	var str = '';
	var selectedTotal = 0;
	var posGot = new Array();
	var errorFound = false;
	var n = cs.text_compression.patterns.length - 1;
	//console.log(textLines.ch);
	while( i <= textLines.ch.length && selectedTotal <= cs.text_compression.seletedTotal )  {
		//console.log(textLines.ch[i]);
		if( typeof(textLines.ch[i]) != 'undefined' && textLines.ch[i].selected ) {
			str += textLines.ch[i].text;
			if(firstPos < 0) {
				firstPos = i;
			}
			lastPos = i;
			textLines.ch[i].selected = false;
			selectedTotal++;
		} else if ( firstPos >= 0 && lastPos >= 0 ) {
			//將選取的字暫存
			var p = posGot.length;
			posGot[p] = [firstPos, lastPos];
			if( lastPos - firstPos >= 1) {
				//reset to get next word
				str = "";
				firstPos = -1;
				lastPos = -1;			
			} else {
				errorFound = true;
				break;
			}
		}
		i++;
	}
	
	for(var i=0; i<posGot.length; i++) {
		if(!errorFound) {
			var p = cs.text_compression.patterns[n].pos.length;
			cs.text_compression.patterns[n].pos[p] = posGot[i];
		} else {
			for(var j=posGot[i][0]; j<=posGot[i][1]; j++) {
				textLines.ch[j].selected = true;
			}
		}
	}
	return !errorFound;
	//console.log(cs.text_compression.patterns[n]);
}
cs.text_compression.compress = function() {
	try {
		compressionLayer.removeAllChildren();
	} catch(e) {};
	
	var allPatterns = '';
	var i = 0;
	while( i < cs.text_compression.patterns.length )  {
		var pattern = cs.text_compression.patterns[i++];
		//console.log(pattern);
		allPatterns += pattern.pattern + ' ';
		var pos = pattern.pos;
		var p = 0;
		while( p < pos.length) {
			var str = '';
			var firstPos = pos[p][0];
			var lastPos = pos[p][1];
			var size = 24;
			var fontSize = 12;
			var circleOpacity = 0.8;
			var xy = textLines.ch[lastPos].getPosition();
			var x = xy.x;
			var y = xy.y;
			if(p == 0) {
				var color = buttonPattern.getColor();
				y = xy.y-size*2/3;
			} else {
				for(var c=firstPos; c<=lastPos; c++) {
					str += textLines.ch[c].text;
				}
				var isTargetSelectedOk =  (cfg_caseSensitive && str == pattern.pattern) ||  (!cfg_caseSensitive && str.toUpperCase() == pattern.pattern.toUpperCase());
				if( isTargetSelectedOk ) {
					var color = '#ffff00';
				} else {
					var color = '#ff0000';
					circleOpacity = 0.6;
					x = x +size*2/3;
				}
			}
			for(var c=firstPos; c<=lastPos; c++) {
				textLines.ch[c].setFill(color);
				if(p > 0 && isTargetSelectedOk) {
					textLines.ch[c].setText('');
				}
			}
			var circle = new lime.Circle().setSize(size, size)
								.setStroke(1)
								.setFill('#ffffff')
								.setOpacity(circleOpacity)
								.setPosition(x, y);
			var label = new lime.Label().setText(i)
										.setFontSize(fontSize);
			circle.appendChild(label);
			compressionLayer.appendChild(circle);
			p++;
		}			
	}
	patternLabel.setText(allPatterns);
}
cs.text_compression.clearAllSelected = function() {
	var i = 0;
	while( i < textLines.ch.length ) {
		if(textLines.ch[i].selected) {
			textLines.ch[i].setFill('#ffffff');
			textLines.ch[i].selected = false;
		}
		i++;
	}
}

cs.text_compression.checkButtonStatus = function() {
	var n = cs.text_compression.patterns.length;
	if(cs.text_compression.process_stage == 1 && n > 0 && typeof(cs.text_compression.patterns[n-1].pos[0]) != 'undefined') {
		buttonTarget.setOpacity(1);
	} else {
		buttonTarget.setOpacity(0.2);
	}
	if(n > 0 && typeof(cs.text_compression.patterns[n-1].pos[1]) != 'undefined') {
		buttonCompress.setOpacity(1);
	} else {
		buttonCompress.setOpacity(0.2);
	}
	//buttonPattern.setOpacity(1);

}

cs.text_compression.setButtonAction = function(sprite) {
	//按下去進行什麼動作
	goog.events.listen(sprite, ['mousedown','touchstart'], function() {
		if(this.getOpacity() < 1 || !cs.text_compression.enabled) {
			return;
		}
		switch( this.getText() ) {
			case cfg_messageButtonPatternSelect : // '選取保留標的'
				//準備選取標的
				this.setText(cfg_messageButtonPatternOk);
				buttonTarget.setOpacity(.2);
				buttonCompress.setOpacity(.2);
				
				patternLabel.setText('');
				cs.text_compression.process_stage = 1;
				cs.text_compression.seletedTotal = 0;
				cs.text_compression.current_color = this.getColor();
				cs.text_compression.clickedLabelIndex = -1;
				cs.text_compression.selectText();
				break;
			case cfg_messageButtonPatternOk : //'保留完成'
				if(cs.text_compression.seletedTotal > 1) {
					cs.text_compression.clearTopLayer();
					if( cs.text_compression.getPattern() ) {	//save result
						this.setText(cfg_messageButtonPatternSelect);
						buttonPattern.setOpacity(.2);	
						cs.text_compression.checkButtonStatus();
						cs.text_compression.process_stage = 0;
					} else {
						cs.text_compression.showMessage(cfg_messagePatternSelectErr2, 46,"#ff0000", cfg_messageDelayPatternSelectErr , 'middle', cs.text_compression.selectText);
					}
				} else {
					cs.text_compression.showMessage(cfg_messagePatternSelectErr1, 46,"#ff0000", cfg_messageDelayPatternSelectErr , 'middle', cs.text_compression.selectText);
				}
				break;
			case cfg_messageButtonTargetSelect : //'選取壓縮標的'
				this.setText(cfg_messageButtonTargetOk);
				buttonPattern.setOpacity(.2);
				buttonCompress.setOpacity(.2);				
				
				cs.text_compression.process_stage = 2;
				cs.text_compression.seletedTotal = 0;
				cs.text_compression.current_color = this.getColor();
				cs.text_compression.clickedLabelIndex = -1;
				cs.text_compression.selectText();
				break;
			case cfg_messageButtonTargetOk : //'標記完成'
				if(cs.text_compression.seletedTotal > 1) {
					cs.text_compression.clearTopLayer();
					if( cs.text_compression.getTarget() ) {
						this.setText(cfg_messageButtonTargetSelect);
						buttonPattern.setOpacity(1);
						cs.text_compression.checkButtonStatus();
						cs.text_compression.process_stage = 0;
					} else {
						cs.text_compression.showMessage(cfg_messagePatternSelectErr1, 46,"#ff0000", cfg_messageDelayPatternSelectErr , 'middle', cs.text_compression.selectText);
					}
				} else {
					cs.text_compression.showMessage(cfg_messagePatternSelectErr1, 46,"#ff0000", cfg_messageDelayPatternSelectErr , 'middle', cs.text_compression.selectText);
				}
				break;
			case cfg_messageButtonCompressStart :	//'開始壓縮'
				this.setText(cfg_messageButtonCompressOk);
				buttonTarget.setOpacity(.2);
				buttonPattern.setOpacity(.2);
				cs.text_compression.process_stage = 3;	
				cs.text_compression.compress();			
				finishButton.setOpacity(1);
				break;
			case cfg_messageButtonCompressOk :	//'完成'
				this.setText(cfg_messageButtonCompressStart);
				buttonPattern.setOpacity(1);
				cs.text_compression.checkButtonStatus();
				cs.text_compression.process_stage = 0;
				patternLabel.setText('');
				break;
		}
	});	
}
cs.text_compression.clearAll = function() {
	try {
		topLayer.removeAllChildren();
		compressionLayer.removeAllChildren();
		backgroundLayer.removeAllChildren();
		try {
			cs.text_compression.clearAllChildEvents(textLines);
		} catch(e) {};
		textLines.removeAllChildren();
	} catch(e) { };
}
cs.text_compression.clearAllChildEvents = function(layer) {
	try {
		var t = layer.getNumberOfChildren();
		for(var i=0; i<t; i++) {
			goog.events.removeAll(layer.getChildAt(i));
		}
	} catch(e) {};
}
cs.text_compression.clearTopLayer = function() {
	for(var i=0; i<topLayer.getNumberOfChildren(); i++) {
		var child = topLayer.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
			topLayer.removeChild(child);
		} catch(e) {	};
	}
	try {
		topLayer.removeAllChildren();
	} catch(e) {	};
}
cs.text_compression.selectText = function() {
	var sprite = new lime.Sprite().setSize(cs.text_compression.Width, 570)
									.setFill(cs.text_compression.current_color)
									.setOpacity(.1)
									.setPosition(cs.text_compression.Width/2, cs.text_compression.Height/2);
	topLayer.appendChild(sprite);
	goog.events.listen(sprite, ['mousedown','touchstart'], function(e) {
		if(!cs.text_compression.enabled) {
			return;
		}
		var selectedArea = new lime.Sprite().setSize(1,1)
										.setStroke(1)
										.setFill(cs.text_compression.current_color)
										.setOpacity(.4);
		var startPos = this.localToNode(e.position, topLayer);
		topLayer.appendChild(selectedArea);
		e.swallow(['mousemove', 'touchmove'], function(e) {
			var endPos = this.localToNode(e.position, topLayer);
			var xOffset = endPos.x - startPos.x;
			var yOffset = endPos.y - startPos.y;
			var x = startPos.x + xOffset/2;
			var y = startPos.y + yOffset/2;			
			var w = Math.abs(xOffset);
			var h = Math.abs(yOffset);
			selectedArea.setSize(w,h).setPosition(x,y);
			//console.log(startPos);
		});
		e.swallow(['mouseup','touchend', 'touchcancel'],function(e){
			var hitTotal = 0;
			for(var i=0; i<textLines.ch.length; i++) {
				var label = textLines.ch[i];
				var pos =  new Object();
				pos.pos = label.getPosition();
				pos.screenPosition = label.getParent().localToScreen(pos.pos);
				if( selectedArea.hitTest(pos) ) {
					if( cs.text_compression.process_stage == 1 || cs.text_compression.process_stage == 2 ) {
						if(!label.selected) {
							cs.text_compression.seletedTotal++;
							label.setFill(cs.text_compression.current_color);
						} else {
							cs.text_compression.seletedTotal--;
							label.setFill('#ffffff');
						}
						label.selected = !label.selected;
					}
					hitTotal++;
				}
			}
			topLayer.removeChild(selectedArea);
			//如果未用拖曳的,檢查是否有 click 某個
			if(hitTotal == 0 && cs.text_compression.clickedLabelIndex >= 0) {
				label = textLines.ch[cs.text_compression.clickedLabelIndex];
				if(!label.selected) {
					cs.text_compression.seletedTotal++;
					label.setFill(cs.text_compression.current_color);
				} else {
					cs.text_compression.seletedTotal--;
					label.setFill('#ffffff');
				}
				label.selected = !label.selected;				
			}
			cs.text_compression.clickedLabelIndex = -1;
		});
	});

}

cs.text_compression.circleButton = function(config, callback) {
	//按鈕:finish
	if(typeof(config) == 'undefined') {
		var config = new Object();
	}
	var size = typeof(config.size)=='undefined' ? 110 : config.size;
	
	var outterColor = typeof(config.outterColor)=='undefined' ? '#F5A9A9' : config.outterColor;
	var outterStrokeSize = typeof(config.outterStrokeSize)=='undefined' ? 5 : config.outterStrokeSize;
	var outterStrokeColor = typeof(config.outterStrokeColor)=='undefined' ? '#ff0000' : config.outterStrokeColor;
	
	var innerColor = typeof(config.innerColor)=='undefined' ? '#FA8258' : config.innerColor;
	var innerStrokeSize = typeof(config.innerStrokeSize)=='undefined' ? Math.floor(outterStrokeSize/2) : config.innerStrokeSize;
	var innerStrokeColor = typeof(config.innerStrokeColor)=='undefined' ? '#FF4000' : config.innerStrokeColor;
	
	var fontSize = Math.floor(size*0.7);
	var fontColor = typeof(config.fontColor)=='undefined' ? '#ff0000' : config.fontColor;
	var caption = typeof(config.caption)=='undefined' ? 'OK' : config.caption;
	
	//外圈圓
	var circleButton = new lime.Circle().setSize(size,size)
						.setFill(outterColor)
						.setStroke(outterStrokeSize, outterStrokeColor);
	//內圈圓
	circleButton.inner = new lime.Circle().setSize(size*.85,size*.85)
						.setFill(innerColor)
						.setStroke(innerStrokeSize,innerStrokeColor);
	circleButton.appendChild(circleButton.inner);
	//文字
	circleButton.label = new lime.Label().setText(caption)
						.setSize(size,fontSize)
						.setFontSize(fontSize)
						//.setStroke(1)
						.setPosition(0,0)
						.setFontColor(fontColor);
	var textScale = fontSize/circleButton.label.measureText().width;
	circleButton.label.setFontSize(fontSize*textScale).setPosition(0,(fontSize-circleButton.label.measureText().height)/2);
	
	circleButton.appendChild(circleButton.label);
	circleButton.getDeepestDomElement().title = caption;
	
	goog.events.listen(circleButton,['mouseup','touchend'],function(){
		if(!cs.text_compression.enabled) {
			return;
		}
		var thisButton = circleButton;
		//模擬按下的動畫
		var ani = new lime.animation.Spawn(
			new lime.animation.MoveBy(2,2).setDuration(.1),		//移動
			new lime.animation.ScaleBy(.95).setDuration(.1)		//縮小
		);
		var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
		this.runAction(ani2);	//開始播放動畫
		//動畫放完就...
		goog.events.listen(ani2, lime.animation.Event.STOP, function() {
			if( typeof callback == 'function' ) {
				callback();	//執行指定的函數
			}
		},false, this);
	});
	return circleButton;
}

cs.text_compression.showMenu = function() {
	cs.text_compression.clearAll();
	cs.text_compression.isPlaying = false;
	cs.text_compression.enabled = false;
	if(typeof menuItemAndTextLines != 'undefined') {
		var menu = new Object;
		if(typeof menu_title == 'undefined') {
				menu_title = 'Text Compreesion';
		}
		menu.title = menu_title;
		if(typeof datafolder != 'undefined') {
			menu.datafolder = datafolder;
		}
		menu.items = menuItemAndTextLines;
		menu.bgcolor = '#009900';
		menu.border = '#009933';
		menu.alpha = .7;
		menu.buttonColor = '#ffff00';
		menu.hintColor = '#ffffff';
		var menuLayer = cs.text_compression.createMenu(menu, function(txt) {
			cs.text_compression.currentTextLines = txt;
			cs.text_compression.newGame();
		});
		//menuLayer.setScale(cs.text_compression.Width/800);
		topLayer.appendChild(menuLayer);
	} else {
		alert('設定檔中找不到選單設定');
	}
};

/**
 * 製作有捲軸的選單
 * 參數: 
 * 		menu.title : 		上方標題
 *		menu.itmes : 		陣列, 每個元素為一字串, 以逗號分隔為選項名稱和檔案路徑
 *		menu.datafolder : 	如果有設定資料夾名稱, 會將這個加在檔案路徑前
 *		menu.bgcolor : 		圓角方框的背景顏色
 *		menu.border :  		圓角方框的邊顏色
 *		menu.alpha  :		圓角方框的透明度
 *		menu.buttonColor:	選項按鈕的顏色
 *		menu.hintColor :	下方說明文字的顏色
 *
 */
cs.text_compression.createMenu = function(menu, callback) {
	var menuLayer = new lime.Layer;
	if(typeof menu.items != 'undefined' && menu.items.length > 0) {
		if(menu.items.length > 1) {
			//title
			var titleLayer = new lime.Layer().setPosition(cs.text_compression.Width/2, 50);
			//架子: H 形(藍色)
			var h = new lime.Polygon(-150,-10, -125,-10, -110,40,  110,40, 125,-10, 150,-10, 130,60, -130,60)
								.setFill('#ABDEF3').setPosition(0, -45).setStroke(2, '#4AAADE');
			titleLayer.appendChild(h);
			//看板:外
			var board = new lime.RoundedRect().setFill(0xFF, 0xcc, 0x00, 1).setStroke(10, '#ffcc00').setOpacity(1)
						.setRadius(20).setSize(230, 90);
			titleLayer.appendChild(board);
			//看板:內
			var titleBg = new lime.RoundedRect().setFill(0xff, 0xff, 0xff, 1).setStroke(1, '#ff6633')
						.setRadius(15).setSize(200, 70).setPosition(0, 0).setOpacity(1);
			titleLayer.appendChild(titleBg);
			//看板中的文字
			var titleLabel = new lime.Label().setFontSize(60).setText('gsyan')
									//.setSize(180,60)
									.setFontColor('#6699ff').setFontFamily('標楷體');
			titleLayer.appendChild(titleLabel);
			var textScale = 60/titleLabel.measureText().width;
			titleLabel.setFontSize(56*textScale).setPosition(0,0);
	
			menuLayer.appendChild(titleLayer);

			if(typeof menu.title != 'undefined') {
				titleLabel.setText(menu.title);
			}

			if(typeof menu.bgcolor == 'undefined') {
				menu.bgcolor = '#006600';
			}
			if(typeof menu.alpha == 'undefined') {
				menu.alpha = .4;
			}
			if(typeof menu.border == 'undefined') {
				menu.border = '#009933';
			}
			if(typeof menu.font == 'undefined') {
				menu.font = '標楷體';
			}
			var rgb = new Array();
			for(var i=0; i<3; i++) {
				//eval( 'rgb['+i+']=0x'+menu.bgcolor.substr(1+i*2,2) );
				rgb[i] = parseInt( '0x'+menu.bgcolor.substr(1+i*2,2) );
			}
			var dialogMenu = new lime.RoundedRect().setFill(rgb[0], rgb[1], rgb[2], menu.alpha).setStroke(3, menu.border) //.setFill(0x66, 0x99, 0xcc, .9)
				.setRadius(40).setSize(600, 450).setPosition(cs.text_compression.Width/2, cs.text_compression.Height/2+50).setOpacity(1);
			menuLayer.appendChild(dialogMenu);
			
			//顯示選單的垂直捲軸
			var scroll = new lime.ui.Scroller().setSize(580, 350).setPosition(0,-200).setDirection('vertical').setAnchorPoint(0.5,0)
			dialogMenu.appendChild(scroll);
			//如果選單超過五項就顯示捲動捲軸看更多的提示
			if(menu.items.length > 5) {
				var hintLabel = new lime.Label().setText('上下捲動兩側可以看到更多選單')
								.setFontColor('#ffff33').setFontSize(16).setPosition(0,190).setFontFamily(menu.font);
				if(typeof menu.hintColor != 'undefined') {
					hintLabel.setFontColor(menu.hintColor);
				}
				dialogMenu.appendChild(hintLabel);
			}
			for(var i=0; i< menu.items.length; i++) {
				var item = menu.items[i];
				var btnItem = new cs.text_compression.Button(item[0]).setPosition(0, 55+i*60).setSize(400, 50).setColor('#77ff44').setFontFamily(menu.font);
				if( typeof menu.buttonColor != 'undefined' ) {
					btnItem.setColor(menu.buttonColor);
				}
				scroll.appendChild(btnItem);
				//按下去進行什麼動作
				goog.events.listen(btnItem, ['mousedown','touchstart'], function() {
					//如果聲音尚末播放過,由選單按鈕來啟動
					//if(cs.text_compression.isSoundEnable() && typeof soundStartCheck == 'undefined' && typeof sound != 'undefined') {
					//	sound.baseElement.play();
					//};
					//載入指定的題庫檔
					if( typeof(callback) == 'function' ) {
						callback(this);
					}
				}, false,  item[1] );
			}
		} else {
			var item = menu.items[0];
			if( typeof(callback) == 'function' ) {
				callback( item[1] );
			}
		}
	} else {
		//由 .js 載入設定值, 完成後再載入國字注音對照表和題庫
		if( typeof callback != 'undefined' ) {
			callback("");
		}
	}
	return menuLayer;
}



//show message
cs.text_compression.showMessage = function(txt, fontSize, color, delay, vAlign, callback) {
	for(var i=0; i<topLayer.getNumberOfChildren(); i++) {
		var child = topLayer.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
			topLayer.removeChild(child);
		} catch(e) {	};
	}
	
	if(vAlign == 'top') {
		var y = cs.text_compression.Height/2-180;
	} else if( vAlign== 'middle') {
		var y = cs.text_compression.Height/2;
	} else {
		var y = cs.text_compression.Height/2+180;
	}
	var bg = new lime.RoundedRect().setFill(0xF7, 0x9F, 0x81, .9) //.setStroke(10, '#ffcc00').setOpacity(1)
				.setRadius(40).setSize(cs.text_compression.Width*.85, 160)
				.setPosition( cs.text_compression.Width/2, y);
	var label = new lime.Label().setText(txt).setFontSize(fontSize)
							.setSize(cs.text_compression.Width*.8, 90)
							.setFontColor(color)
							.setPosition(0,(70-fontSize)/2);
	bg.appendChild(label);
	topLayer.appendChild(bg);
	var ani = new lime.animation.FadeTo(0.5).setDuration(delay);
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


cs.text_compression.helpDialog = function() {
	cs.text_compression.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.text_compression.enabled = false;	//diable按鈕
	
	var compressionTotal = 0;
	for(var i=0; i<cs.text_compression.patterns.length; i++) {
		var pattern = cs.text_compression.patterns[i];
		var patternLen = pattern.pattern.length;
		//pattern 的第 0 個是 "保留目標"
		//			第 1 個以後的才是 "壓縮標的"
		for(var j=1; j<pattern.pos.length; j++) {
			var firstPos = pattern.pos[j][0];
			var lastPos = pattern.pos[j][1];
			//先檢查字串長度
			//if(pattern.pos[j][1]-pattern.pos[j][0]+1 == patternLen) {
			if(lastPos-firstPos+1 == patternLen) {
				//再檢查字串內容是否為 "保留目標"
				var str = '';
				for(var c=firstPos; c<=lastPos; c++) {
					str += textLines.ch[c].text;
				}
				var isTargetSelectedOk =  (cfg_caseSensitive && str == pattern.pattern) ||  (!cfg_caseSensitive && str.toUpperCase() == pattern.pattern.toUpperCase());
				//完全符合的就累計總字數
				if( isTargetSelectedOk ) {					
					compressionTotal += patternLen;
				}
			}
		}
	}	
	var helpText = cfg_messageResultPrefix;
	helpText += cs.text_compression.patterns.length;
	helpText += cfg_messageResultMiddle;
	helpText += compressionTotal;
	helpText += cfg_messageResultPostfix;

	var conf = new Object();
	conf.title = cfg_messageResultCaption;
	conf.buttonText = cfg_messageResultButtonOk;
	if(typeof helpText != 'undefined' && helpText != '') {
		conf.message = helpText;
	} else {
		conf.message = typeof(helpTextDefault) != 'undefined' ? helpTextDefault : 'No message';
	}
	conf.bgcolor = '#cc9966';
	conf.titleColor = '#ffff66';
	conf.fontColor = '#ffffff';
	conf.buttonColor = '#009966';

	conf.fontSize = 30;
	conf.font = cs.text_compression.font;
	conf.alpha = .85;
	var dialog = cs.text_compression.createDialog(conf, function() { 
		cs.text_compression.showMenu();
	});
	dialog.setPosition(cs.text_compression.Width/2, cs.text_compression.Height/2)
			.setScale(cs.text_compression.Width/800);
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
cs.text_compression.createDialog = function(conf, callback) {
//cs.text_compression.createDialog = function(title, message, buttonTxt, callback) {
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
							//.setPosition(cs.text_compression.Width/2, cs.text_compression.Height/2)
							.setOpacity(1);
	var label = new lime.Label().setSize(400,90).setFontSize(40).setPosition(0,-125)
							.setText(conf.title).setFontColor(conf.titleColor).setFontFamily(conf.font);
	dialog.appendChild(label);
	var labelMessage = new lime.Label().setSize(500,35).setFontSize(conf.fontSize).setPosition(0,-80)
							.setAlign('left').setText(conf.message).setFontColor(conf.fontColor).setFontFamily(conf.font);
	dialog.appendChild(labelMessage);
	if(conf.message2 != '') {
		var labelMessage2 = new lime.Label().setSize(500,35).setFontSize(conf.fontSize).setPosition(0,15)
								.setText(conf.message2).setFontColor(conf.fontColor).setFontFamily(conf.font);
		dialog.appendChild(labelMessage2);
	}
	var okButton = new cs.text_compression.Button(conf.buttonText).setPosition(0, 145).setSize(180, 50).setColor(conf.buttonColor).setFontFamily(conf.font);
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

//-------------------------------------------------
//
//-------------------------------------------------
//取得網址中的某一個參數(已編碼過的)
function gup( name ){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+name+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( window.location.href ); 
	if( results == null )    return "";  
	else    return results[1];
}

/**
 * 由外部的 .js 載入設檔值, 並執行 callback 的指令
 * @private
 */
cs.text_compression.loadSettingFromExternalScript = function(scriptSrc, callback)  {
	var nocacheVal = '?nocache=' + new Date().getTime();	//為了避免 cache 的問題,在檔名後加亂數
	var scriptToAdd = document.createElement('script');		//建立一個 scriptElement
	
	scriptToAdd.setAttribute('type','text/javascript');
	scriptToAdd.setAttribute('charset','utf-8');
	scriptToAdd.setAttribute('src', scriptSrc + nocacheVal);	//避免 cache 時用的
	//scriptToAdd.setAttribute('src', scriptSrc);
	//載入成功時
	scriptToAdd.onload = scriptToAdd.onreadystatechange = function() {
		if (!scriptToAdd.readyState || scriptToAdd.readyState === "loaded" || scriptToAdd.readyState === "complete") {
			scriptToAdd.onload = scriptToAdd.onreadystatechange = null;
			document.getElementsByTagName('head')[0].removeChild(scriptToAdd);	//將變數載入後移除 script
			callback();	//執行指定的函數
        };
	};
	//無法載入時, 將設定用預設值
	scriptToAdd.onerror = function() {
		scriptToAdd.onerror = null;	//將事件移除
		document.getElementsByTagName('head')[0].removeChild(scriptToAdd);	//移除 script
		if( typeof callback == 'function' ) {
			callback();	//執行指定的函數
		}
	}
	
	//在 head 的最前頭加上前述的 scriptElement
	var docHead = document.getElementsByTagName("head")[0];
	docHead.insertBefore(scriptToAdd, docHead.firstChild);
};

/**
 * 讀入外部檔案, 並執行 callback 的指令
 * @private
 */
cs.text_compression.get_file_contents = function(text_url, callback ) {
	if (window.XMLHttpRequest) {     
      req = new XMLHttpRequest(); 
	}     
	else if (window.ActiveXObject) {     
      req = new ActiveXObject("Microsoft.XMLHTTP");     
	}     
	
	req.open('GET', text_url);

	req.onreadystatechange = function() {     
   		if (req.readyState == 4) {
			if(req.status == 200) {	//200 為成功讀入資料; 404 : Not Found
				callback(req.responseText);
			} else {
				callback("");
			}
		}
	}
	try {
		req.send(null);
	} catch(e) {
		//alert(e);
	}
}



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.text_compression.start', cs.text_compression.start);

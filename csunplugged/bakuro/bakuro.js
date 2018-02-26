//set main namespace
goog.provide('cs.bakuro');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.RoundedRect');
goog.require('lime.ui.Scroller');
goog.require('lime.Polygon');

goog.require('lime.scheduleManager');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');

goog.require('game.Button');
goog.require('game.Util');
goog.require('game.FadeOutMessage');
goog.require('game.Audio');

cs.bakuro.config_file = 'bakuro_conf.js';

cs.bakuro.Width = 1024;
cs.bakuro.Height = 768;
cs.bakuro.cellsWidth = 720;
cs.bakuro.cellsHeight = 600;


cs.bakuro.currentIndex = -1;
cs.bakuro.isBinarySystem = 0;	//0:十進制, 1:二進制
//cfg_binaryMaxLength = 4;	//二進位最多幾位

cs.bakuro.puzzleColTotal = 0;
cs.bakuro.puzzleRowlTotal = 0;
cs.bakuro.puzzleQuestion = new Array();


/*
cs.bakuro.puzzleColTotal = 3;
cs.bakuro.puzzleRowlTotal = 3;
cs.bakuro.puzzleQuestion = new Array(
	[0,0],	[9,0],	[6,0],
	[0,3], 	[],		[],
	[0,12],	[],		[]
);


cs.bakuro.puzzleColTotal = 10;
cs.bakuro.puzzleRowlTotal = 10;
cs.bakuro.puzzleQuestion = new Array(
	[0,0],	[15,0],	[8,0],	[10,0],	[0,0],	[0,0],		[0,0],	[0,0],	[5,0],	[15,0],
	[0,11],	[],		[],		[],		[3,0],	[0,0],		[7,0],	[9,9],	[],		[],
	[0,4],	[],		[5,9],	[],		[],		[14,15],	[],		[],		[],		[],
	[0,9],	[],		[],		[11,15],[],		[],			[],		[],		[8,4],	[],
	[0,7],	[],		[],		[],		[2,3],	[],			[],		[0,10],	[],		[],
	[0,0],	[0,0],	[13,14],[],		[],		[],			[0,0],	[0,0],	[11,0],	[5,0],
	[0,0],	[6,6],	[],		[],		[11,0],	[1,0],		[7,0],	[0,6],	[],		[],
	[0,10],	[],		[],		[10,13],[],		[],			[],		[12,9],	[],		[],
	[0,15],	[],		[],		[],		[],		[0,7],		[],		[],		[],		[0,0],
	[0,0],	[0,0],	[0,3],	[],		[],		[0,9],		[],		[],		[],		[0,0]
);
*/

// entrypoint
cs.bakuro.start = function(){

	var director = new lime.Director(document.body, cs.bakuro.Width, cs.bakuro.Height),
	    scene = new lime.Scene();

	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊


	
	gameLayer = new lime.Layer();
	inputLayer = new lime.Layer();
	topLayer = new lime.Layer();
	scene.appendChild(gameLayer);
	scene.appendChild(inputLayer);
	scene.appendChild(topLayer);
	
	//title
	var titleLayer = new lime.Layer().setPosition(cs.bakuro.Width/2, 50);
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
	var titleLabel = new lime.Label().setFontSize(60).setText('Bakuro')
							//.setSize(180,60)
							.setFontColor('#6699ff');
	titleLayer.appendChild(titleLabel);
	var textScale = 60/titleLabel.measureText().width;
	titleLabel.setFontSize(60*textScale).setPosition(0,0);

	scene.appendChild(titleLayer);


	//listen keyboard input data
	goog.events.listen(goog.global, ['keydown'], function catchKey(e) {
		var k = '';
        switch (e.keyCode) {
            case 37: //LEFT
            case 65: //A
				k = 'A';
                break;
            case 38: //UP
            case 87: //W
                k = 'W';
                break;          
            case 39: //Right
            case 68: //D
                k = 'D';
                break;
            case 40: //Down
            case 83: //S
                k = 'S';
                break;
        }
		if(k != '') {
			cs.bakuro.keyHandler(k);
		} else {
			if(e.keyCode>=48 && e.keyCode<=57) {
				cs.bakuro.keyHandler(String.fromCharCode(e.keyCode));
			} else if(e.keyCode>=96 && e.keyCode<=105) {
				cs.bakuro.keyHandler(String.fromCharCode(e.keyCode-96+48));
			} else if(e.keyCode == 13) {
				cs.bakuro.keyHandler('OK');
			} else if(e.keyCode == 32) {
				cs.bakuro.keyHandler('C');
			} else if(e.keyCode ==8) {
				cs.bakuro.keyHandler('BackSpace');
			} 
		}
    });
	
	
	
	cs.bakuro.init();
	
	//cs.bakuro.helpDialog('Guess a secret code. The code is a sequence of eggs, and on each trail after you make guess will get hints which will help to improve your guess.', 'The Hints:');
	//cs.bakuro.configGame();
	
	// set current scene active
	director.replaceScene(scene);

}



//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.init = function() {
	cs.bakuro.clearAll();
	
	game.Util.loadSettingFromExternalScript(cs.bakuro.config_file, function() {
		cs.bakuro.isSoundInit = false;
		
		if( typeof(cfg_binaryMaxLength) == 'undefined'
				|| typeof(cfg_questions) == 'undefined'
				|| typeof(cfg_locale_LANG)  == 'undefined' ) {
			//alert('Failed to load the configuration file : '+cs.bakuro.config_file);
			cs.bakuro.showMessage('Configuration File Load Failure : '+cs.bakuro.config_file,9999).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2);;
			return;
		}
		
		//任意門,設定 level
		var anywhereDoor = game.Util.gup('AnywhereDoor');
		var level = game.Util.gup('level');
		if(typeof(anywhereDoor) != 'undefined' && typeof(level) != 'undefined') {
			if(anywhereDoor.toLowerCase() == 'tpet') {
				//var n = parseInt(level);
				//if(n > 0 && n <= cfg_levelActionConf.length) {
				//	cs.bakuro.level = n-1;
				//}
			}
		}
		var debug = parseInt(game.Util.gup('debug'));
		if( !isNaN(debug) ) {
			cs.bakuro.debug = debug;
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
			if( typeof(cfg_messageQuestionConfigError) == 'undefined' 
					|| typeof(cfg_messageNumberBaseCaption) == 'undefined' ) {
						
				cs.bakuro.showMessage('File Load Failure : '+langFilename,9999).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2);;
				return;
			} else {
				//cs.bakuro.playGame();
				cs.bakuro.showMenu();
			}
		});
	});
};

//-------------------------------------------------
// show puzzle menu
//-------------------------------------------------
cs.bakuro.showMenu = function() {
	cs.bakuro.clearAll();
	
	cs.bakuro.isPlaying = false;
	cs.bakuro.enabled = false;
	
	if(typeof(cfg_questions) != 'undefined') {
		var menu = new Object;
		if(typeof menu_title == 'undefined') {
				menu_title = 'Bakuro';
		}
		menu.title = menu_title;
		if(typeof datafolder != 'undefined') {
			menu.datafolder = datafolder;
		}
		menu.items = cfg_questions;
		menu.bgcolor = '#009900';
		menu.border = '#009933';
		menu.alpha = .7;
		menu.buttonColor = '#ffff00';
		menu.hintColor = '#ffffff';
		var menuLayer = cs.bakuro.createMenu(menu, function(questionIndex) {
			cs.bakuro.puzzleColTotal = cfg_questions[questionIndex][1];
			cs.bakuro.puzzleRowlTotal = cfg_questions[questionIndex][2];
			cs.bakuro.puzzleQuestion = cfg_questions[questionIndex][3];
			cs.bakuro.playGame();
		});
		//menuLayer.setScale(cs.bakuro.Width/800);
		topLayer.appendChild(menuLayer);
	} else {
		//alert('設定檔中找不到選單設定');
		cs.bakuro.showMessage(cfg_messageMenuConfigError,9999).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2);
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
cs.bakuro.createMenu = function(menu, callback) {
	var menuLayer = new lime.Layer;
	if(typeof menu.items != 'undefined' && menu.items.length > 0) {
		if(menu.items.length > 1) {

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
				.setRadius(40).setSize(600, 450).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2+50).setOpacity(1);
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
				var btnItem = new game.Button(item[0]).setPosition(0, 55+i*60).setSize(400, 50).setColor('#77ff44').setFontFamily(menu.font);
				btnItem.index = i;
				if( typeof menu.buttonColor != 'undefined' ) {
					btnItem.setColor(menu.buttonColor);
				}
				scroll.appendChild(btnItem);
				//按下去進行什麼動作
				goog.events.listen(btnItem, ['mousedown','touchstart'], function() {
					//如果聲音尚末播放過,由選單按鈕來啟動
					//if(cs.bakuro.isSoundEnable() && typeof soundStartCheck == 'undefined' && typeof sound != 'undefined') {
					//	sound.baseElement.play();
					//};
					//載入指定的題庫檔
					if( typeof(callback) == 'function' ) {
						callback(this.index);
					}
				});
			}
		} else {
			var item = menu.items[0];
			if( typeof(callback) == 'function' ) {
				callback( item );
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


//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.playGame = function() {
	cs.bakuro.clearAllChildrenOfLayer(gameLayer);
	cs.bakuro.clearAllChildrenOfLayer(inputLayer);
	cs.bakuro.clearAllChildrenOfLayer(topLayer);
	
	if( cfg_soundEffectEnable ) {
		//game.setMute(false);
		sound.click.stop();
		sound.click.setVolume(1);
	}
	
	if(! ( typeof(cs.bakuro.puzzleQuestion) != 'undefined' && typeof(cs.bakuro.puzzleColTotal) != 'undefined' && typeof(cs.bakuro.puzzleRowlTotal) != 'undefined' && cs.bakuro.puzzleQuestion.length >= cs.bakuro.puzzleColTotal*cs.bakuro.puzzleRowlTotal  ) ) {
		cs.bakuro.showMessage(cfg_messageQuestionConfigError,9999).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2);;
	}
	
	//initial some variable
	//格子的物件
	if(typeof(cellsSprite) != 'undefined') {
		delete cellsSprite;
	}
	cellsSprite = new Array();
	
	
	var cWidth = Math.floor(cs.bakuro.cellsWidth / cs.bakuro.puzzleColTotal);
	var cHeight = Math.floor(cs.bakuro.cellsHeight / cs.bakuro.puzzleRowlTotal);
	if(cWidth < cHeight) {
		cellSize = cWidth;
	} else {
		cellSize = cHeight;
	}
	var scale = cellSize/100;
	var fontSize = 22*scale*4/cfg_binaryMaxLength;
	var xStart = (cs.bakuro.Width - cellSize*(cs.bakuro.puzzleColTotal-1))/2;
	var yStart = 20+(cs.bakuro.Height - cellSize*(cs.bakuro.puzzleRowlTotal-1))/2;
	for(var i=0; i<cs.bakuro.puzzleRowlTotal; i++) {
		for(var j=0; j<cs.bakuro.puzzleColTotal; j++) {
			var x = xStart + j*(cellSize-1);
			var y = yStart + i*(cellSize-1);
			var index = cs.bakuro.puzzleColTotal*i+j;
			var cellValue = cs.bakuro.puzzleQuestion[index];
			if(cellValue.length < 2 || (typeof(cellValue[0])!='undefined' && typeof(cellValue[1])!='undefined' && cellValue[0].toString()=='' && cellValue[1].toString()=='') ) {
				if(cellValue.length == 0) {
					cellValue = ['', ''];
				}
				cellType = 4;
			} else if(cellValue[0]==0 && cellValue[1]==0 ) { //null
				cellType = 0;
			} else if(cellValue[0]>0 && cellValue[1]>0 ) {	//x + y
				cellType = 3;
			} else if(cellValue[0]>0) {	//y
				cellType = 2;
			} else if(cellValue[1]>0) {	//x
				cellType = 1;
			} else {
				cellType = 4;
			}
			
			//var cellType = Math.floor(Math.random()*5);
			switch(cellType) {
				case 0 :
					var cellBackground = 'assets/cell_bg_null.png';
					break;
				case 1 :
					var cellBackground = 'assets/cell_bg_x.png';
					break;
				case 2 :
					var cellBackground = 'assets/cell_bg_y.png';
					break;
				case 3 :
					var cellBackground = 'assets/cell_bg_x_y.png';
					break;
			}
			if(cellType < 4) {
				cellsSprite[index] = new lime.Sprite().setFill(cellBackground)
									.setSize(cellSize,cellSize)
									.setPosition(x, y);
			} else {
				cellsSprite[index] = new lime.Sprite().setStroke(2*scale)
									.setSize(cellSize,cellSize)
									.setPosition(x, y);
			}
			
			gameLayer.appendChild(cellsSprite[index]);
			
			cellsSprite[index].cellType = cellType;
			cellsSprite[index].cellValue = cellValue;
			
			
			//question: sum
			if(cellType == 1 || cellType == 2) {
				if(cellType == 1) {		//x
					var px = cellSize*0.15;
					var py = fontSize-cellSize*.5;
					var value = cellValue[1];
				} else {	//y
					var px = cellSize*-0.12;
					var py = cellSize*.5-fontSize*0.9;
					var value = cellValue[0];
				}
				cellsSprite[index].label = new lime.Label().setText(value)
											.setFontSize(fontSize)
											.setPosition(px, py);
				cellsSprite[index].appendChild(cellsSprite[index].label);
			} else if(cellType == 3) {	//x,y
				//x
				var px = cellSize*0.15;
				var py = fontSize-cellSize*.5;
				cellsSprite[index].labelX = new lime.Label().setText(cellValue[1])
											.setFontSize(fontSize)
											.setPosition(px, py);
				cellsSprite[index].appendChild(cellsSprite[index].labelX);
				
				//y
				var px = cellSize*-0.12;
				var py = cellSize*.5-fontSize*0.9;
				cellsSprite[index].labelY = new lime.Label().setText(cellValue[0])
											.setFontSize(fontSize)
											.setPosition(px, py);
				cellsSprite[index].appendChild(cellsSprite[index].labelY);
			} else if(cellType == 4) {	//normal cell , wait to input answer			
				var px = 0;
				var py = 0;
				cellsSprite[index].index = index;
				cellsSprite[index].cellValue[0] = '';	//demical value
				cellsSprite[index].cellValue[1] = '';	//binary value
				
				cellsSprite[index].label = new lime.Label().setText('')
											.setFontSize(fontSize)
											.setPosition(px, py);
				cellsSprite[index].appendChild(cellsSprite[index].label);
								
				goog.events.listen(cellsSprite[index], ['mousedown', 'touchstart'], function(e) {
					if(!cs.bakuro.enable) {
						return;
					}
					if(cs.bakuro.currentIndex < 0) {
						cs.bakuro.showNumberPad();
					}
					if(cs.bakuro.inputEnabled) {
						if(typeof(cellsSprite[cs.bakuro.currentIndex]) != 'undefined') {
							try {
								cellsSprite[cs.bakuro.currentIndex].setFill('#ffffff');
							} catch(e) {};
						}
						cs.bakuro.currentIndex = this.index;
						this.setFill('#ffff00');
					}
				},false,cellsSprite[index]);
			}
		}
	}	
	
	var checkBox = cs.bakuro.createCheckBox(cfg_messageNumberBaseCaption, cs.bakuro.isBinarySystem, function(v) {
		if(v) {
			cs.bakuro.isBinarySystem = 1;	//binary
		} else {
			cs.bakuro.isBinarySystem = 0;	//decimal
		}
		var index = 0;
		while(index < cellsSprite.length) {
			if(cellsSprite[index].cellType == 4) {
				if(cs.bakuro.isBinarySystem == 0)	{
					cellsSprite[index].label.setText(cellsSprite[index].cellValue[0]);
				} else {
					cellsSprite[index].label.setText( cellsSprite[index].cellValue[1] );
				}
			} else if(cellsSprite[index].cellType == 1 || cellsSprite[index].cellType == 2 ) {
				if(cellsSprite[index].cellType == 1) {		//x
					var value = cellsSprite[index].cellValue[1];
				} else {
					var value = cellsSprite[index].cellValue[0];
				}
				if(cs.bakuro.isBinarySystem == 0)	{
					cellsSprite[index].label.setText(value);
				} else {
					cellsSprite[index].label.setText( cs.bakuro.formatBinary( value.toString(2) ) );
				}
			} else if(cellsSprite[index].cellType == 3) {
				if(cs.bakuro.isBinarySystem == 0)	{
					cellsSprite[index].labelX.setText(cellsSprite[index].cellValue[1]);
					cellsSprite[index].labelY.setText(cellsSprite[index].cellValue[0]);
				} else {
					cellsSprite[index].labelX.setText( cs.bakuro.formatBinary( cellsSprite[index].cellValue[1].toString(2) ) );
					cellsSprite[index].labelY.setText( cs.bakuro.formatBinary( cellsSprite[index].cellValue[0].toString(2) ) );
				}	
			}
			index++;
		}
	}).setPosition(100,120);
	gameLayer.appendChild(checkBox);
	
	var width = 150;
	var height = 60;
	var xStart = 100;
	var y = cs.bakuro.Height - height*2.5;
	buttonReset = new game.Button(cfg_messageButtonResetCaption)
									.setColor('#F5A9F2')
									.setSize(width,height)
									.setPosition(xStart,y);
	gameLayer.appendChild(buttonReset);
	
	buttonDone = new game.Button(cfg_messageButtonDoneCaption)
									.setColor('#00ff00')
									.setSize(width,height)
									.setPosition(xStart,y+height*1.5);
	gameLayer.appendChild(buttonDone);	
	
	goog.events.listen(buttonReset, ['mousedown','touchstart'], function() {
		cs.bakuro.clearInput();
	});
	goog.events.listen(buttonDone, ['mousedown','touchstart'], function() {
		cs.bakuro.allDone();
	});

	cs.bakuro.enable = true;	
}


//-------------------------------------------------
// 
//-------------------------------------------------
cs.bakuro.showNumberPad = function() {
	cs.bakuro.clearAllChildrenOfLayer(topLayer);
	
	var numberPad = cs.bakuro.keyPad();
	numberPad.setPosition(cs.bakuro.Width-108,cs.bakuro.Height-150);
	cs.bakuro.inputEnabled = true;
	inputLayer.appendChild(numberPad);
};

//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.keyPad = function() {
	var k = new Array(7,8,9,4,5,6,1,2,3,0,'C','←');
	var w = 210;
	var h = 280;
	var keySize = 60;
	var fontSize = Math.floor(keySize*.8);
	var keyCol = 3;
	var keyStartX = -(keySize+4)*(keyCol-1)/2
	var keyStartY = -(keySize+4)*Math.floor(k.length/keyCol)/2+keySize/2;
	var pad = new lime.RoundedRect().setRadius(20)
							.setSize(w, h)
							.setFill(0x00, 0x00, 0x77, .5)
							.setStroke(3,'#000088')
							.setOpacity(1);
	var buttons = new Array();
	for(var i=0; i<k.length; i++) {
		var x = (keySize+4)*(i%keyCol)+keyStartX;
		var y = (keySize+4)*Math.floor(i/keyCol)+keyStartY;
		if(i >= k.length-2) {
			//x += keySize/2;
			if(i == k.length-2) {
				color = '#FF77FF';
				//x -= 6;
			} else {
				color = '#DD7777';
				//x += 6;
				fontSize *= .7;
			}
		} else {
			color = '#ffff00';
		}
		buttons[i] = new lime.Circle().setSize(keySize,keySize)
								.setFill(color)
								.setStroke(1, '#000000')
								.setPosition(x, y);
								
		var label = new lime.Label().setText(k[i])
									.setSize(keySize,keySize)
									.setFontSize(fontSize)
									//.setFontFamily(cs.bakuro.font)
									.setPosition(0,(keySize-fontSize)/2-2);
		buttons[i].appendChild(label);
		pad.appendChild(buttons[i]);
		buttons[i].enabled = true;
		goog.events.listen(buttons[i], ['mousedown', 'touchstart'], function(e) {
			if(cs.bakuro.inputEnabled && this.enabled) {
				this.enabled = false;
				//listen for end event
				e.swallow(['mouseup','touchend'],function(){
					var ani = new lime.animation.Spawn(
						new lime.animation.MoveBy(2,2).setDuration(.15),		//移動
						new lime.animation.ScaleBy(.95).setDuration(.15)		//縮小
					);
					var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
					this.runAction(ani2);	//開始播放動畫
					var button = this;
					//動畫放完就檢查答案
					goog.events.listen(ani2, lime.animation.Event.STOP, function() {
						//goog.events.removeAll(button);
						//cs.bakuro.checkAnswer(button);
						button.enabled = true;
						cs.bakuro.keyHandler(button.getChildAt(0).getText());
					});			
				});
			}
		});
	}
	//handle keypad drag & drop : move the keypad
	goog.events.listen(pad, ['mousedown','touchstart'], function(e) {
		//let target follow the mouse/finger
        e.startDrag();
        //listen for end event
        e.swallow(['mouseup','touchend'],function(e){
			//cs.bakuro.adjustQuetionPostion();	//試著調整題目的位置
		});
	});
	
	return pad;
};



//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.keyHandler = function(k) {
	if(!cs.bakuro.enable) {
		return;
	}
	
	var move = 0;
	var n = Number(k);
	//var str = inputLabel.getText();
	var str = 'undefined';
	if(cs.bakuro.currentIndex >= 0 && cellsSprite[cs.bakuro.currentIndex].cellType == 4) {
		if(cs.bakuro.isBinarySystem == 0) {
			str = cellsSprite[cs.bakuro.currentIndex].cellValue[0];
		} else {
			str = cellsSprite[cs.bakuro.currentIndex].cellValue[1];
		}
	}
	if(!isNaN(n)) {
		str += k;
	} else if(k == 'C') {
		str = '';
	} else if(k == 'BackSpace' || k == '←') {
		if(str.length > 0) {
			str = str.substr(0, str.length-1);
		}
	} else {
        switch (k) {
            case 'A': //Left
				move = -1;
                break;
            case 'W': //UP
                move = cs.bakuro.puzzleColTotal*-1;
                break;          
            case 'D': //Right
                move = 1;
                break;
            case 'S': //Down
                move = cs.bakuro.puzzleColTotal;
                break;
        }
		if(move != 0) {
			if(cs.bakuro.currentIndex < 0) {
				cs.bakuro.currentIndex = 0;
				move = 1;
				cs.bakuro.showNumberPad();
			}

			//find the first input cell
			var index = cs.bakuro.currentIndex+move;
			while(index >= 0 && typeof(cellsSprite[index]) != 'undefined') {
				if(cellsSprite[index].cellType == 4) {
					if(cellsSprite[cs.bakuro.currentIndex].cellType == 4) {
						cellsSprite[cs.bakuro.currentIndex].setFill('#ffffff');
					}
					cs.bakuro.currentIndex = index;
					cellsSprite[cs.bakuro.currentIndex].setFill('#ffff00');
					if(cs.bakuro.isBinarySystem == 0) {
						str = cellsSprite[cs.bakuro.currentIndex].cellValue[0];
					} else {
						str = cellsSprite[cs.bakuro.currentIndex].cellValue[1];
					}
					break;
				} else {
					index += move;
				}
			}
		}
	}
	
	if(k == 'OK') {
		cs.bakuro.checkAnswer(str);
	} else if(str != 'undefined') {
		if(cs.bakuro.currentIndex >= 0) {
			if(cs.bakuro.isBinarySystem == 0) {
				cellsSprite[cs.bakuro.currentIndex].cellValue[0] = str;
			} else {
				cellsSprite[cs.bakuro.currentIndex].cellValue[1] = str;
			}
			cellsSprite[cs.bakuro.currentIndex].label.setText(str);
		}
	}
	
};

//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.clearInput = function() {
	cs.bakuro.clearAllChildrenOfLayer(topLayer);
	
	var index = 0;
	while(index < cellsSprite.length) {
		if(cellsSprite[index].cellType == 4) {
			//if(cs.bakuro.isBinarySystem == 0) {
				cellsSprite[index].cellValue[0] = '';
			//} else {
				cellsSprite[index].cellValue[1] = '';
			//}
			cellsSprite[index].label.setText('');
		}
		index++;
	}	
	cs.bakuro.enable = true;
	cs.bakuro.currentIndex = -1;
};

//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.allDone = function() {
	cs.bakuro.enable = false;
	cs.bakuro.clearAllChildrenOfLayer(inputLayer);
	if(typeof(cellsSprite[cs.bakuro.currentIndex]) != 'undefined') {
		try {
			cellsSprite[cs.bakuro.currentIndex].setFill('#ffffff');
		} catch(e) {};
	}
	var index = 0;
	var errorTotal = 0;
	var v1 = '';
	var v2 = '';
	while(index < cellsSprite.length) {
		if(cellsSprite[index].cellType == 4) {
			v1 = cellsSprite[index].cellValue[0] == '' ? '' : cs.bakuro.formatBinary(parseInt(cellsSprite[index].cellValue[0]).toString(2));
			v2 = cellsSprite[index].cellValue[1] == '' ? '' : cs.bakuro.formatBinary(cellsSprite[index].cellValue[1]);
			if(v1 == '' || v2 == '' || v1 != v2) {
				errorTotal++;
				if( v1 != v2) {	//demical not equal to binary
					cellsSprite[index].setFill('#F78181');
				} else {
					cellsSprite[index].setFill('#F6CEF5');
				}
			} else {
				cellsSprite[index].setFill('#ffffff');
			}
		}
		index++;
	}
	if(errorTotal == 0) {
		index = 0;
		while(index < cellsSprite.length) {
			if(cellsSprite[index].cellType == 4) {
				cellsSprite[index].label.setFontWeight(700);//setShadow('#000000', 3, 1,1);
				cellsSprite[index].setFill('#ffffff');
			}
			index++;
		}
		//回主選單的按鈕
		var backToMenu = new lime.Sprite().setFill('assets/menu_icon.png');
		var backToMenuButton = new lime.Button(backToMenu).setPosition(cs.bakuro.Width-35,cs.bakuro.Height-30);
		backToMenuButton.getDeepestDomElement().title = 'Menu';
		goog.events.listen(backToMenuButton, ['mousedown', 'touchstart'], function() {
			cs.bakuro.showMenu();
			//cs.bakuro.init();
		});
		topLayer.appendChild(backToMenuButton);
		//回主選單的按鈕----end--------------------
		
	} else {	//not finish, show error message
		cs.bakuro.enable = true;
		cs.bakuro.currentIndex = -1;
		cs.bakuro.showMessage(cfg_messageNotFinishTryAgain,5).setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2);
	}
};


//
//
//
cs.bakuro.gameOver = function() {
	cs.bakuro.pauseTimer();
	cs.bakuro.selectEnable = false;
	var total = inputFrame.getNumberOfChildren();
	//change the text to code
	inputLayer.getChildAt(1).setText(cfg_messageGameOverCodeCaption);
	for(var i=0; i<total; i++) {
		inputFrame.getChildAt(i).setFill('assets/peg_0'+(parseInt(cs.bakuro.code.substr(i,1))+1)+'.png');
	}
	if(cs.bakuro.currentTrial < cs.bakuro.maxNumberOfTrials) {
		//success
		cs.bakuro.gameOverDialog(cfg_messageGameOverSuccessTrailsPrefix + (cs.bakuro.currentTrial+1) + cfg_messageGameOverSuccessTrailsPostfix, cfg_messageGameOverSuccessTimePrefix + cs.bakuro.secondToTimeString(cs.bakuro.secondSpend) );
	} else {
		//failure (over the max trials number)
		cs.bakuro.gameOverDialog(cfg_messageGameOverFailure);
	}
}
//比賽說明的對話框
cs.bakuro.helpDialog = function(message, message2) {
	cs.bakuro.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.bakuro.inputEnabled = false;	//diable按鈕
	var conf = new Object();
	
	//random show eggs
	var r = game.Util.makeRandomIndex( 0, cs.bakuro.pegColorTotal-1 );
	for(var i=0; i<cs.bakuro.numberOfSlots; i++) {
		var peg = new lime.Sprite().setFill('assets/peg_0'+(r[i]+1)+'.png')
							.setSize(cs.bakuro.pegWidth, cs.bakuro.pegHeight)
							.setPosition(cs.bakuro.Width/2-cs.bakuro.pegWidth*1.2*cs.bakuro.numberOfSlots/2+cs.bakuro.pegWidth*0.6+cs.bakuro.pegWidth*1.2*i, 130);
		gameLayer.appendChild(peg);
	}

	
	conf.type = 'help';
	conf.title = 'MASTERMIND'; //cfg_messageDescriptionLevelPrefix + (cs.bakuro.level+1) + cfg_messageDescriptionLevelPostfix;
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
	conf.font = cs.bakuro.font;
	conf.alpha = .85;
	var dialog = cs.bakuro.createDialog(conf, function() { 
		//cs.bakuro.counDownAndPlay();
		//cs.bakuro.soundInit();
		cs.bakuro.configGame();
	});
	dialog.setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2)
			;//.setScale(cs.bakuro.Width/800);
	topLayer.appendChild(dialog);
};

//比賽結束的對話框
cs.bakuro.gameOverDialog = function(message, message2) {
	cs.bakuro.isReplay = true;	//出現這個對話除非再由選單進來，不然就不重覆出現
	cs.bakuro.inputEnabled = false;	//diable按鈕
	var conf = new Object();
		
	conf.title = 'MASTERMIND'; //cfg_messageDescriptionLevelPrefix + (cs.bakuro.level+1) + cfg_messageDescriptionLevelPostfix;
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
	conf.font = cs.bakuro.font;
	conf.alpha = .85;
	var dialog = cs.bakuro.createDialog(conf, function() { 
		//cs.bakuro.counDownAndPlay();
		//cs.bakuro.soundInit();
		cs.bakuro.playGame();
	});
	dialog.setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2)
			;//.setScale(cs.bakuro.Width/800);
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
cs.bakuro.createDialog = function(conf, callback) {
//cs.bakuro.createDialog = function(title, message, buttonTxt, callback) {
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
	var w = cs.bakuro.Width*.9;
	var h = cs.bakuro.Width*.65;
	var dialog = new lime.RoundedRect().setRadius(40).setSize(w, h)
							.setFill(rgb[0],rgb[1],rgb[2], conf.alpha).setStroke(3,conf.borderColor)
							//.setPosition(cs.bakuro.Width/2, cs.bakuro.Height/2)
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
											.setSize(cs.bakuro.feedbackWidth, cs.bakuro.feedbackHeight)
											.setPosition(10+cs.bakuro.feedbackWidth-w/2,50);
		var correctLabel = new lime.Label().setText(': '+cfg_messageHelpHintsAllCorrect)
											.setSize(w*.9,cs.bakuro.feedbackHeight)
											.setFontSize(20).setAlign('left')
											.setFontColor(conf.fontColor).setFontFamily(conf.font)
											.setPosition(10+cs.bakuro.feedbackWidth/2,50);
		//Correct color, but is on wrong place.
		var misplacedIcon = new lime.Sprite().setFill('assets/feedback_white.png')
											.setSize(cs.bakuro.feedbackWidth, cs.bakuro.feedbackHeight)
											.setPosition(10+cs.bakuro.feedbackWidth-w/2,60+cs.bakuro.feedbackHeight);
		var misplacedLabel = new lime.Label().setText(': '+cfg_messageHelpHintsOnlyColorCorrect)
											.setSize(w*.9,cs.bakuro.feedbackHeight)
											.setFontSize(20).setAlign('left')
											.setFontColor(conf.fontColor).setFontFamily(conf.font)
											.setPosition(10+cs.bakuro.feedbackWidth/2,60+cs.bakuro.feedbackHeight);
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
cs.bakuro.newTimer = function(time, color, pause, callback) {
	try {
		lime.scheduleManager.unschedule(timerHandler, timerValueLabel);
	} catch(e) { };
	if(typeof color == 'undefined') {
		color = '#00ff31';
	}
	timerValueLabel.start  = new Date();
	timerValueLabel.setText('00:00').setFontColor(color);
	timerValueLabel.time = time;
	cs.bakuro.secondSpend = time;
	timerValueLabel.setText(cs.bakuro.secondToTimeString(time));
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
			cs.bakuro.secondSpend = t;
			timerValueLabel.setText(cs.bakuro.secondToTimeString(t));
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
cs.bakuro.secondToTimeString = function(sec) {
	var s = sec%60;
	var m = Math.floor(sec/60);
	var ss = s < 10 ? '0'+s : s;
	var mm = m < 10 ? '0'+m : m;
	return mm + ':' + ss;
};
cs.bakuro.pauseTimer = function() {
	timerValueLabel.pause = true;
};
cs.bakuro.playTimer = function() {
	timerValueLabel.pause = false;
	if(timerValueLabel.time > 0) {	//倒數
		var t = new Date().valueOf() - 1000*( timerValueLabel.time - parseInt(cs.bakuro.secondSpend) );
	} else {	//正數
		var t = new Date().valueOf() - 1000*parseInt(cs.bakuro.secondSpend);
	}
	timerValueLabel.start = new Date(t); 
};
cs.bakuro.resetTimer = function() {
	timerValueLabel.start = new Date(); 
	timerValueLabel.pause = false;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.showMessage = function(txt, t) {
	var message = new game.FadeOutMessage().setSize(cs.bakuro.Width*.9,60)
										.setFontSize(32)
										.setFontColor('#ff0000')
										.setFill(0xff, 0xff, 0x00, 0.5)
										//.setStroke(4,'#0000ff')
										.setText(txt)
										//.setRadius(20)
										.setDelay(t)
										.play()
										.setPosition(cs.bakuro.Width/2, cs.bakuro.Height/5);
	topLayer.appendChild(message);
	return message;
}
//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.createCheckBox = function(titleText, value, callback) {
	var w = 120;
	var h = w/2;
	var fontSize = h/4;
	var btn = new game.Button('2   10').setSize(w,h)
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
// format the binary number 
//-------------------------------------------------
cs.bakuro.formatBinary = function(strIn) {
	if(strIn != '' && strIn.length < cfg_binaryMaxLength) {
		var zeroPrefix = cfg_binaryMaxLength-strIn.length;
		while(zeroPrefix-- > 0) {
			strIn = '0' + strIn;
		}
	}
	return strIn;
}


//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.clearAll = function() {
	cs.bakuro.clearAllChildrenOfLayer(gameLayer);
	cs.bakuro.clearAllChildrenOfLayer(inputLayer);
	cs.bakuro.clearAllChildrenOfLayer(topLayer);
	//try {
	//	goog.events.unlisten(goog.global, ['keydown'], catchKey);
	//} catch(e) { };

};
//-------------------------------------------------
//
//-------------------------------------------------
cs.bakuro.clearAllChildEvents = function(target) {
	try {
		var t = target.getNumberOfChildren();
		for(var i=0; i<t; i++) {
			goog.events.removeAll(target.getChildAt(i));
		}
	} catch(e) {};
}
cs.bakuro.clearAllChildrenOfLayer = function(target) {
	cs.bakuro.clearAllChildEvents(target);
	for(var i=0; i<target.getNumberOfChildren(); i++) {
		var child = target.getChildAt(i);
		try {
			lime.animation.actionManager.stopAll(child);
		} catch(e) {	};
		try {
			cs.bakuro.clearAllChildEvents(child);
		} catch(e) {	};
		try {
			child.removeAllChildren();
		} catch(e) {	};
		try {
			target.removeChild(child);
		} catch(e) {	};
	}
	try {
		target.removeAllChildren();
	} catch(e) {	};
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.bakuro.start', cs.bakuro.start);

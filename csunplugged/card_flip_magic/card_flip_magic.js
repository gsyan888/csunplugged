//set main namespace
goog.provide('cs.card_flip_magic');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');

goog.require('game.FlipCard');

cs.card_flip_magic.Width = 1024;
cs.card_flip_magic.Height = 768;


cs.card_flip_magic.isSoundInit = false;

cs.card_flip_magic.cardFrontColor = "#000000";
cs.card_flip_magic.cardBackgroundColor = "#FFFFFF";

isChecking = false;
cardSelected = '';

cs.card_flip_magic.iconFilenames = new Array("assets/icon-color.png", "assets/icon-number.png", "assets/icon-coin.png");
cs.card_flip_magic.iconFrontAndBack = new Array(	//反 , 正
												["#000000","#ffffff"],
												["assets/number-0.png", "assets/number-1.png"],
												["assets/coin-back.png", "assets/coin-front.png"]
											);

cs.card_flip_magic.iconSelected = 0;

cs.card_flip_magic.size = 100;

cs.card_flip_magic.colourWidth = 800;
cs.card_flip_magic.colourHeight = 600;
cs.card_flip_magic.col = 6;
cs.card_flip_magic.row = 6;

cs.card_flip_magic.textWidth = 180;

cs.card_flip_magic.colourStartX = (cs.card_flip_magic.Width-cs.card_flip_magic.colourWidth)/2;
cs.card_flip_magic.colourStartY = 90;

cs.card_flip_magic.boxWidth = 24;
cs.card_flip_magic.boxHeight = 24;
cs.card_flip_magic.boxTitleHeight = 40;
cs.card_flip_magic.boxTextFontSize = 30;



//cs.card_flip_magic.cardBorder = 2;
//cs.card_flip_magic.cardBorderColor = '#808080';

cs.card_flip_magic.cardBorder = 1;				//card 被選時的邊框粗細
cs.card_flip_magic.cardBorderColor = '#BDBDBD';	//card 被選時的邊框顏色

cs.card_flip_magic.cardBack = "assets/smile.png";	//card 背面的文字或圖案
cs.card_flip_magic.cardBackColor = '#6F4E37';		//card 背面文字的背景顏色

// entrypoint
cs.card_flip_magic.start = function(){

	var director = new lime.Director(document.body,cs.card_flip_magic.Width ,cs.card_flip_magic.Height),
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

	var localeLang = (navigator.language || navigator.userLanguage).toLowerCase();
	if( localeLang == 'zh-tw' || localeLang == 'zh-cn' ) {
		buttonCaptionReset = '重置版面';
		buttonCaptionApply = '切換圖片';
		buttonWidth = 80;
		buttonPosY = 5;
		buttonFontSize = 28;
		inputColCaption = '請輸欄數';
		inputRowCaption = '請輸行數';
	} else {
		buttonCaptionReset = 'Reset';
		buttonCaptionApply = 'Replace';
		buttonWidth = 120;
		buttonFontSize = 24;
		buttonPosY = (80-buttonFontSize)/2-5;
		inputColCaption = 'the number of columns';
		inputRowCaption = 'the number of rows';
	}
	
 	
	
	
	var labelTitle = new lime.Label().setSize(500,50)
									.setFontColor('#0000FF')
									.setFontSize(48)
									.setPosition(cs.card_flip_magic.Width/2, 35)
									.setText('Card Flip Magic');	
	bgLayer.appendChild(labelTitle);
	
	
	var labeSettingY = cs.card_flip_magic.Height-40;
	labelRowSetting= new lime.Label().setSize(100,32)
									.setFontColor('#006600')
									.setFontSize(24)
									//.setStroke(1,'#33cc00')
									.setPosition(cs.card_flip_magic.Width/2+70, labeSettingY)
									.setText(cs.card_flip_magic.row);
	labelSetting= new lime.Label().setSize(32,32)
									.setFontColor('#006600')
									.setFontSize(24)
									.setPosition(cs.card_flip_magic.Width/2, labeSettingY)
									.setText('X');									
	labelColSetting= new lime.Label().setSize(100,32)
									.setFontColor('#006600')
									.setFontSize(24)
									//.setStroke(1,'#33cc00')
									.setPosition(cs.card_flip_magic.Width/2-70, labeSettingY)
									.setText(cs.card_flip_magic.col);
	settingLayer.appendChild(labelSetting);
	settingLayer.appendChild(labelRowSetting);
	settingLayer.appendChild(labelColSetting);
	
	//右側圖案選單
	var w = 80;
	var x = cs.card_flip_magic.Width-50;
	var y = cs.card_flip_magic.colourStartY + w;	
	var icons = new Array();
	for(var i=0; i<cs.card_flip_magic.iconFilenames.length; i++) {
		icons[i] = cs.card_flip_magic.makeDraggable(i).setSize(w,w)
										.setPosition(x, y+(w+20)*i);
		settingLayer.appendChild(icons[i]);
	}
	
	//reset
	var resetButton = cs.card_flip_magic_resetButton().setPosition(55, cs.card_flip_magic.Height-100);
	settingLayer.appendChild(resetButton);
	
	
	goog.events.listen(labelRowSetting, ['mousedown','touchstart'], function() {
		var row;
		//do {
			row = prompt(inputRowCaption,cs.card_flip_magic.row );
		//} while(row == null || row < 1);
		if(row != null && cs.card_flip_magic.row != row) {
			cs.card_flip_magic.row = row;
			cs.card_flip_magic.settingChanges();
		}
	});
	goog.events.listen(labelColSetting, ['mousedown','touchstart'], function() {
		var col;
		//do {
			col = prompt(inputColCaption,cs.card_flip_magic.col );
		//} while(col == null || col < 1);
		if(col != null && cs.card_flip_magic.col != col) {
			cs.card_flip_magic.col = col;
			cs.card_flip_magic.settingChanges();
		}
	});
	
	//以預設的值產生 pixle
	cs.card_flip_magic.settingChanges();
	
	
	// set current scene active
	director.replaceScene(scene);

}

cs.card_flip_magic.makeDraggable = function(type) {
  icon = new lime.Sprite().setFill(cs.card_flip_magic.iconFilenames[type]);
  icon.type = type;
  goog.events.listen(icon, ['mousedown','touchstart'], function(e){
	cs.card_flip_magic.iconSelected = this.type;
	
	var sprite = new lime.Sprite().setSize(cs.card_flip_magic.size,cs.card_flip_magic.size)
								 .setFill(cs.card_flip_magic.iconFilenames[this.type])
								 .setPosition(this.getPosition());
	settingLayer.appendChild(sprite);
    var drag = e.startDrag(false, null, sprite); // snaptocenter, bounds, target
    
    // Add drop targets.
	for(var i=0; i<colourLayer.getNumberOfChildren(); i++) {
		drag.addDropTarget(colourLayer.getChildAt(i));
    }
    
    // Avoid dragging multiple items together
    e.event.stopPropagation();
    
    // Drop into target and animate
    goog.events.listen(drag, lime.events.Drag.Event.DROP, function(e){
      //console.log('item was dropped');
      var dropTarget = e.activeDropTarget;
	  var ani = new lime.animation.Sequence(
        new lime.animation.ScaleTo(1.2).setDuration(.3),
        new lime.animation.ScaleTo(1).setDuration(.3)
      );
      dropTarget.runAction(ani);
	  goog.events.listen(ani, lime.animation.Event.STOP, function() {
		cs.card_flip_magic.updateCard(dropTarget);
		settingLayer.removeChildAt(settingLayer.getNumberOfChildren()-1);
	  });
    });
    
    // Move back if not dropped on target.
    var lastPosition = sprite.getPosition();
    goog.events.listen(drag, lime.events.Drag.Event.CANCEL, function(){
	  var ani = new lime.animation.MoveTo(lastPosition).setDuration(.5);
      sprite.runAction(ani);
	  goog.events.listen(ani, lime.animation.Event.STOP, function() {
		settingLayer.removeChildAt(settingLayer.getNumberOfChildren()-1);
	  });
    });
    
    
    // Other events include: START, END, CHANGE
    
  });
  return icon;
}
cs.card_flip_magic.updateCard = function(card) {
	frontFill = cs.card_flip_magic.iconFrontAndBack[cs.card_flip_magic.iconSelected][0];
	backFill = cs.card_flip_magic.iconFrontAndBack[cs.card_flip_magic.iconSelected][1];
	if( typeof card.replace == 'function' ) {
		var back = new lime.Sprite().setSize(cs.card_flip_magic.size,cs.card_flip_magic.size)
									.setFill(frontFill)
									.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);;

		var front = new lime.Sprite().setSize(cs.card_flip_magic.size,cs.card_flip_magic.size)
									.setFill(backFill)
									.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);;				
		
		card.replace(back, front);
	} else {
		var p = card.getParent();
		//p.removeChild(card);
		for(var i=0; i<p.getNumberOfChildren()-1; i++) {
			var c = p.getChildAt(i);
			var back = new lime.Sprite().setSize(cs.card_flip_magic.size,cs.card_flip_magic.size)
										.setFill(frontFill)
										.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);;

			var front = new lime.Sprite().setSize(cs.card_flip_magic.size,cs.card_flip_magic.size)
										.setFill(backFill)
										.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);;				
			
			c.replace(front, back);
		}
	}
}

cs.card_flip_magic_resetButton = function() {
	//按鈕:reset
	var r = 110;
	//外圈圓
	resetButton = new lime.Circle().setSize(r,r)
						.setFill('#F5A9A9')
						.setStroke(5, '#ff0000');
	//內圈圓
	var circleInner = new lime.Circle().setSize(r*.85,r*.85)
						.setFill('#FA8258')
						.setStroke(2,'#FF4000');
	resetButton.appendChild(circleInner);
	//文字
	var btnLabel = new lime.Label().setText(buttonCaptionReset)
						.setSize(buttonWidth, 80)
						.setFontSize(buttonFontSize)
						.setPosition(0,buttonPosY)
						.setFontColor('#ff0000');
	resetButton.appendChild(btnLabel);
	resetButton.getDeepestDomElement().title = buttonCaptionReset;
	goog.events.listen(resetButton,['mouseup','touchend'],function(){
		//模擬按下的動畫
		var ani = new lime.animation.Spawn(
			new lime.animation.MoveBy(2,2).setDuration(.1),		//移動
			new lime.animation.ScaleBy(.95).setDuration(.1)		//縮小
		);
		var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
		this.runAction(ani2);	//開始播放動畫
		//動畫放完就...
		goog.events.listen(ani2, lime.animation.Event.STOP, function() {
			cs.card_flip_magic.settingChanges();
		},false, this);
	});
	return resetButton;
}


cs.card_flip_magic.newColours = function() {
	try {
		colourLayer.removeAllChildren();
	} catch(e) {};
	
	var startX = cs.card_flip_magic.colourStartX;
}

cs.card_flip_magic.settingChanges = function() {
	try {
		colourLayer.removeAllChildren();
	} catch(e) {};
	
	labelRowSetting.setText(cs.card_flip_magic.row);
	labelColSetting.setText(cs.card_flip_magic.col);
	
	var w = Math.floor(cs.card_flip_magic.colourWidth/cs.card_flip_magic.col);
	var h = Math.floor(cs.card_flip_magic.colourHeight/cs.card_flip_magic.row);
	
	if( w > h && w*cs.card_flip_magic.row > cs.card_flip_magic.colourHeight) {
		w = h;
	}
	cs.card_flip_magic.size = w;
	
	var cards = new Array();	
	var text = new Array();
	
	var startX = cs.card_flip_magic.colourStartX + (cs.card_flip_magic.colourWidth-w*cs.card_flip_magic.col)/2+w/2;
	var startY = cs.card_flip_magic.colourStartY + (cs.card_flip_magic.colourHeight-w*cs.card_flip_magic.row)/2+w/2;
	for(var r = 0; r < cs.card_flip_magic.row; r++) {
		for(var c = 0; c < cs.card_flip_magic.col; c++) {
			var i = r*cs.card_flip_magic.col+c;
			var front = new lime.Sprite().setSize(w,w)
										.setFill(cs.card_flip_magic.cardBackgroundColor)
										.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);

			var back = new lime.Sprite().setSize(w,w)
										.setFill(cs.card_flip_magic.cardFrontColor)
										.setStroke(cs.card_flip_magic.cardBorder, cs.card_flip_magic.cardBorderColor);
						
			cards[i] = new game.FlipCard(front, back)
										.setPosition(startX+w*c,startY+w*r);
			cards[i].value = 1;
			colourLayer.appendChild(cards[i]);
		}
	}
	//sprite for apply all function
	var x = cs.card_flip_magic.Width-55;
	var y = cs.card_flip_magic.Height-100;
	//var applyAll = new lime.Sprite().setSize(80,80)
	var applyAll = new lime.Circle().setSize(110,110)
										.setPosition(x,y)
										.setFill("#FFFF00")
										.setStroke(5, "#886A08");
	var label = new lime.Label().setText(buttonCaptionApply)
										.setSize(buttonWidth, 80)
										.setFontSize(buttonFontSize)
										.setPosition(0,buttonPosY);
	applyAll.appendChild(label)
	colourLayer.appendChild(applyAll);
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.card_flip_magic.start', cs.card_flip_magic.start);

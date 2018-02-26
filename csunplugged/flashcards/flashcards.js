//set main namespace
goog.provide('cs.flashcards');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Button');
goog.require('lime.RoundedRect');
goog.require('lime.CanvasContext');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.scheduleManager');

goog.require('game.FlipCard');
goog.require('game.Util');


cs.flashcards.jsFlashcardsSetFile = 'flashcards_set.js';

cs.flashcards.Width = 1024;
cs.flashcards.Height = 768;
cs.flashcards.contexWidth = 800;
cs.flashcards.contexHeight = 600;
cs.flashcards.nextIcon = 'data:image/png;base64,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';
cs.flashcards.penIcon = 'data:image/png;base64,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';
cs.flashcards.eraserIcon = 'data:image/png;base64,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';
cs.flashcards.newIcon = 'data:image/png;base64,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';

order_random = true;

textFontSize = 60;
textAlign = 'left';

strokePenSize = 7;
strokeStyle = '#0000ff';
alphaValueDisabled = 0.2;

// entrypoint
cs.flashcards.start = function(){
	//依據螢幕大小調整畫字外框時線條粗細
	var xScale = cs.flashcards.Width/window.innerWidth;
	var yScale = cs.flashcards.Height/window.innerHeight;
	
	//設定字型
	if( (/(ipod|iphone|ipad|Macintosh)/i).test(navigator.userAgent) ) {
		cs.flashcards.font = 'BiauKai';
	} else {
		cs.flashcards.font = ('標楷體');
	}

	
	var director = new lime.Director(document.body,cs.flashcards.Width,cs.flashcards.Height);
	var scene = new lime.Scene();
	
	var bgLayer = new lime.Layer();
	var creditLayer = new lime.Layer();
	cardLayer = new lime.Layer();
	buttonLayer = new lime.Layer();
	strokeLayer = new lime.Layer();
	topLayer = new lime.Layer();
	
	scene.appendChild(bgLayer);			//background
	scene.appendChild(creditLayer);		//credit
	scene.appendChild(cardLayer);
	scene.appendChild(strokeLayer);		//stroke
	scene.appendChild(buttonLayer);	
	scene.appendChild(topLayer);
	
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊	
	director.makeMobileWebAppCapable();

	//credit------------------start
	var labelCredit= new lime.Label().setSize(150,20)
									.setFontColor('#8FBC8F')
									.setFontSize(14)
									.setPosition(0,0)
									.setText('2014.01.17.f by gsyan');
	var btnCredit = new lime.Button(labelCredit)
									.setPosition(cs.flashcards.Width-100,cs.flashcards.Height-14);
	goog.events.listen(btnCredit, 'click', function() {
        goog.global['location']['href'] = 'http://gsyan888.blogspot.com/';
    });				
	btnCredit.appendChild(labelCredit);
	creditLayer.appendChild(btnCredit);
	//credit------------------end
	

	
	//var size = cs.flashcards.contexSize+40;
	var x = cs.flashcards.Width/2;
	var y = cs.flashcards.Height/2;

	// Flash Card
	
	//Front
	//background--------------start
	var cardFront = new lime.RoundedRect().setRadius(20)
							.setSize(cs.flashcards.contexWidth+75, cs.flashcards.contexHeight+75)
							.setFill(0xff, 0xff, 0xff, .65)
							.setStroke(3,'#33cc00')
							.setPosition(x, y)
							.setOpacity(1);
	
	//卡片文字內容
	cardFrontLabel = new lime.Label()
						//.setSize(800,600)
						.setSize(cs.flashcards.contexWidth, cs.flashcards.contexHeight)
						//.setPosition(cs.flashcards.Width/2, cs.flashcards.Height/2)
						.setFontSize(textFontSize)
						.setFontFamily(cs.flashcards.font)
						.setMultiline(true)
						//.setStroke(1)
						.setAlign(textAlign)
						.setLineHeight(1.5)
						.setText('');
	cardFront.appendChild(cardFrontLabel);

	//Back
	//background--------------start
	var cardBack = new lime.RoundedRect().setRadius(20)
							.setSize(cs.flashcards.contexWidth+75, cs.flashcards.contexHeight+75)
							.setFill(0xF5, 0xF5, 0xDC, .65)
							.setStroke(3,'#B8860B')
							.setPosition(x, y)
							.setOpacity(1);
	
	//卡片的文字內容
	cardBackLabel = new lime.Label()
						//.setSize(800,600)
						.setSize(cs.flashcards.contexWidth, cs.flashcards.contexHeight)
						//.setPosition(cs.flashcards.Width/2, cs.flashcards.Height/2)
						.setFontSize(textFontSize)
						.setFontFamily(cs.flashcards.font)
						.setMultiline(true)
						//.setStroke(1)
						.setAlign(textAlign)
						.setLineHeight(1.5)						
						.setText('');
	cardBack.appendChild(cardBackLabel);
	
	isChecking = false;
	cardSelected = '';
	flipCard = new game.FlipCard(cardFront, cardBack).setPosition(0,0);
	
	cardLayer.appendChild(flipCard);
	//cardLayer.appendChild(cardFront);

	var nextSprite = new lime.Sprite()
						.setFill(cs.flashcards.nextIcon)
						.setPosition(cs.flashcards.Width-32, cs.flashcards.Height/2);
	buttonLayer.appendChild(nextSprite);

	var backSprite = new lime.Sprite()
						.setFill(cs.flashcards.nextIcon)
						.setRotation(180).setOpacity(.5)
						.setPosition(32, cs.flashcards.Height/2);
	buttonLayer.appendChild(backSprite);
	
	cs.flashcards.clickEnable = false;
	//next card button 的滑鼠事件
	goog.events.listen(nextSprite,['mousedown','touchstart'],function(e){		
		if(!cs.flashcards.clickEnabled) return;
		
		//先將工具 disable && clear canvas
		penSprite.setOpacity(alphaValueDisabled);
		eraserSprite.setOpacity(alphaValueDisabled);
		newSprite.setOpacity(alphaValueDisabled);
		colorPicker.setOpacity(0);
				
		strokeEnabled = false;
		strokeSprite.ctx.clearRect(0, 0, strokeSprite.getSize().width, strokeSprite.getSize().height);

		//this card 往右水平移動並消失
		var ani = new lime.animation.MoveTo(cs.flashcards.Width,0).enableOptimizations()
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			flipCard.setPosition(0, cs.flashcards.Height);
			//出題
			cs.flashcards.getOneQuestion();
			//new card 由底往上移動出現
			flipCard.runAction(new lime.animation.MoveTo(0, 0).enableOptimizations());
		});
		flipCard.runAction(ani);
	});
	
	//back card button 的滑鼠事件
	goog.events.listen(backSprite,['mousedown','touchstart'],function(e){		
		if(!cs.flashcards.clickEnabled) return;
		
		if(typeof(currentIndex) == 'undefined') {
			currentIndex = 0;
		}		
		if(currentIndex-2 < 0) {
			//currentIndex = 0;
			return;
		} else {
			currentIndex -= 2;
		}
		
		//先將工具 disable && clear canvas
		penSprite.setOpacity(alphaValueDisabled);
		eraserSprite.setOpacity(alphaValueDisabled);
		newSprite.setOpacity(alphaValueDisabled);
		colorPicker.setOpacity(0);

		strokeEnabled = false;
		strokeSprite.ctx.clearRect(0, 0, strokeSprite.getSize().width, strokeSprite.getSize().height);

		//this card 往左水平移動並消失
		var ani = new lime.animation.MoveTo(cs.flashcards.Width*-1,0).enableOptimizations()
		goog.events.listen(ani, lime.animation.Event.STOP, function() {
			//flipCard.setPosition(0, cs.flashcards.Height*-1);
			flipCard.setPosition(cs.flashcards.Width, 0);
			//出題
			cs.flashcards.getOneQuestion();
			//new card 由上往底移動出現
			flipCard.runAction(new lime.animation.MoveTo(0, 0).enableOptimizations());
		});
		flipCard.runAction(ani);
	});
	
	penSprite = new lime.Sprite()
						.setFill(cs.flashcards.penIcon)
						.setSize(64,64)
						.setOpacity(alphaValueDisabled)
						.setPosition(32, cs.flashcards.Height-270);
	buttonLayer.appendChild(penSprite);
	
	//penIcon button 的滑鼠事件
	goog.events.listen(penSprite,['mousedown','touchstart'],function(e){
		if(this.getOpacity() == 1) {
			this.setOpacity(alphaValueDisabled);
			colorPicker.setOpacity(0);
			strokeEnabled = false;
			flipCard.enabled = true;
		} else {
			flipCard.enabled = false; 
			this.setOpacity(1);
			colorPicker.setOpacity(1);
			eraserSprite.setOpacity(alphaValueDisabled);
			strokeEnabled = true;
		}
	});
	
	//eraserIcon
	eraserSprite = new lime.Sprite()
						.setFill(cs.flashcards.eraserIcon)
						.setSize(64,64)
						.setOpacity(alphaValueDisabled)
						.setPosition(32, cs.flashcards.Height-180);
	buttonLayer.appendChild(eraserSprite);
	
	//eraserIcon button 的滑鼠事件
	goog.events.listen(eraserSprite,['mousedown','touchstart'],function(e){
		if(this.getOpacity() == 1) {
			this.setOpacity(alphaValueDisabled);
			strokeEnabled = false;
			flipCard.enabled = true;
		} else {
			this.setOpacity(1);
			flipCard.enabled = false; 
			penSprite.setOpacity(alphaValueDisabled);
			colorPicker.setOpacity(0);
			strokeEnabled = true;
		}
	});

	
	//newIcon
	newSprite = new lime.Sprite()
						.setFill(cs.flashcards.newIcon)
						.setSize(64,64)
						.setOpacity(alphaValueDisabled)
						.setPosition(32, cs.flashcards.Height-90);
	buttonLayer.appendChild(newSprite);
	
	//newIcon button 的滑鼠事件
	goog.events.listen(newSprite,['mousedown','touchstart'],function(e){
		if(this.getOpacity() == 1) {
			this.setOpacity(alphaValueDisabled);			
			//clear stroke area
			strokeSprite.ctx.clearRect(0, 0, strokeSprite.getSize().width, strokeSprite.getSize().height);
		}
	});
	
	//color picker
	var colorPicker = cs.flashcards.colorPicker();
	colorPicker.setPosition(penSprite.getPosition()).setOpacity(0);
;
	buttonLayer.appendChild(colorPicker);

	
	var x = cs.flashcards.Width/2;
	var y = cs.flashcards.Height/2;
	loadingLabel = new lime.Label()
						.setText('Loading...')
						.setSize(570,100)
						.setFontSize(50)
						.setFontColor('#ffffff')
						.setFill('#808000') //#33ff00')
						.setPadding(20,20,20,20)
						.setOpacity(0.75)
						.setFontFamily(cs.flashcards.font)
						.setPosition(x,y);
	topLayer.appendChild(loadingLabel);
	isChecking = true;
	
	//塗鴨區
	strokeSprite = new lime.CanvasContext()
								.setSize(cs.flashcards.contexWidth+70, cs.flashcards.contexHeight+70)
								//.setAnchorPoint(0.5,0.5)
								.setPosition(x, y);
	strokeSprite.ctx = strokeSprite.getDeepestDomElement().getContext('2d');
	strokeLayer.appendChild(strokeSprite);

	strokeEnabled = false;
	
	//塗鴨區的滑鼠事件
	goog.events.listen(strokeSprite,['mousedown','touchstart'],function(e){		
		if(penSprite.getOpacity() < 1 && eraserSprite.getOpacity() < 1) {
			strokeEnabled = false;
		}
		if(strokeEnabled) {		
			strokePos1 = cs.flashcards.shiftPosition(e.position);
			strokeStarted = true;
		
			//if(!stroke.isFinished) {
			//	stroke.savePoints(stroke.pos1.x, stroke.pos1.y);
			//	stroke.checkPoint(stroke.pos1.x, stroke.pos1.y);
			//}
			//listen for move event
			e.swallow(['mousemove', 'touchmove'], function(e) {
				if(strokeEnabled) {				
					strokePos2 = cs.flashcards.shiftPosition(e.position);
					var X0 = strokePos1.x;
					var Y0 = strokePos1.y;
					var X1 = strokePos2.x;
					var Y1 = strokePos2.y;
					if(strokeStarted && ((X1-X0)*(X1-X0)+(Y1-Y0)*(Y1-Y0)>=4)) {
						//if(!stroke.isFinished) {
						//	stroke.savePoints(stroke.pos2.x, stroke.pos2.y);
						//}
						cs.flashcards.draw_line();
					}
				}
			});
			//listen for end event
			e.swallow(['mouseup','touchend', 'touchcancel'],function(e){
				if(strokeStarted) {
					strokeStarted = false;
				}		
			});
		}
	});
	
	cs.flashcards.loadJS();

	// set current scene active
	director.replaceScene(scene);

}


cs.flashcards.loadJS = function() {
	game.Util.loadSettingFromExternalScript(cs.flashcards.jsFlashcardsSetFile, function() {
		if(typeof(question_and_answers) != 'undefined') {
			cs.flashcards.init();
		} else {
			loadingLabel.setText('題庫載入失敗');
		}
	});
};
	
//-------------------------------------------------
// initialize
//-------------------------------------------------
cs.flashcards.init = function() {	
	try {
		topLayer.removeAllChildren();
	} catch(e) {};
	
	if(typeof(textFontSize)!='undefined' &&  !isNaN(textFontSize)) {
		cardFrontLabel.setFontSize(textFontSize);
		cardBackLabel.setFontSize(textFontSize);
	}
	if(typeof(textAlign)!='undefined') {
		cardFrontLabel.setAlign(textAlign);
		cardBackLabel.setAlign(textAlign);
	}
	cs.flashcards.getOneQuestion();
};
cs.flashcards.getOneQuestion  = function() {
	cs.flashcards.clickEnabled = true;
	
	flipCard.enabled = true; 
	
	isChecking = false;
	cardSelected = '';
	var cardsTotal = Math.floor(question_and_answers.length/2);
	if(typeof(currentIndex) == 'undefined') {
		currentIndex = 0;
	}
	if(currentIndex >= cardsTotal) {
		currentIndex = 0;
	}
	if(currentIndex == 0) {
		if(order_random == true) {
			cs.flashcards.randomIndex = game.Util.makeRandomIndex(0, cardsTotal-1);
		}
	}
	if(order_random == true) {
		var qIndex = cs.flashcards.randomIndex[currentIndex++]*2;
	} else {
		var qIndex = currentIndex*2;
		currentIndex++;
	}
	
	flipCard.hideBack();
	isChecking = false;
	cardSelected = '';
	
	cardFrontLabel.setText(question_and_answers[qIndex]);
	cardBackLabel.setText(question_and_answers[qIndex+1]);
};

cs.flashcards.isDrawing = function() {
	return (penSprite.getOpacity()==1 ||
				eraserSprite.getOpacity()==1 ||
				newSprite.getOpacity()==1 ||
				colorPicker.getOpacity()==1 
			);
}

//-------------------------------------------------
// 計算繪圖座標
//-------------------------------------------------
cs.flashcards.shiftPosition = function(pos) {
	pos.x += strokeSprite.getSize().width/2;
	pos.y += strokeSprite.getSize().height/2;
	return pos;
}
//-------------------------------------------------
//	將兩點連線
//-------------------------------------------------
cs.flashcards.draw_line = function() {
	var ctx = strokeSprite.ctx;
	if(penSprite.getOpacity() == 1 && eraserSprite.getOpacity()<1) {
		newSprite.setOpacity(1); //enable clear all
		ctx.lineWidth = strokePenSize;
		ctx.lineJoin = 'miter';//"bevel,round,miter";
		ctx.strokeStyle = strokeStyle;
		ctx.globalAlpha = 0.5;
		ctx.globalCompositeOperation = 'source-over';
		ctx.beginPath();
		ctx.moveTo(strokePos1.x, strokePos1.y);
		ctx.lineTo(strokePos2.x, strokePos2.y);
		ctx.closePath();
		ctx.stroke();
	} else {		//----------eraser
		/*
		ctx.strokeStyle = '#ffffff';
		ctx.globalAlpha = 1;
		ctx.lineWidth = 20;
		ctx.lineJoin = 'round'
		ctx.globalCompositeOperation = "copy";  
		ctx.strokeStyle = ("rgba(255,255,255,255)"); //context.fillStyle = "rgba(255,0,0,0)";
		*/
		ctx.globalCompositeOperation = 'destination-out';
		var radius = 20;
		ctx.moveTo(strokePos1.x, strokePos1.y);
		ctx.arc(strokePos1.x, strokePos1.y, radius, 0, Math.PI * 2, false);
		ctx.fill();
		//ctx.fillStyle = '#ffffff';
        //ctx.fillRect(0, 0, 800,600);
	}
	//ctx.globalAlpha = 1;
	strokePos1.x = strokePos2.x;
	strokePos1.y = strokePos2.y;
}

cs.flashcards.colorPicker = function() {
	var color = new Array('#000000','#FF0000','#00FF00',
							'#0000FF','#FFFF00','#00FFFF',
							'#FF00FF','#C0C0C0','#FFFFFF');
	var size = 42;
	var picker = new lime.RoundedRect().setRadius(10).setSize(65, 65)
							//.setFill('#000000')
							.setStroke(3,'#000000')
							.setOpacity(1)
							.setPosition(0,0);
	var colorArray = new Array();
	for(var i=0; i<9; i++) {
		colorArray[i] = new lime.RoundedRect().setRadius(10).setSize(size, size)
							.setFill(color[i])
							.setStroke(1,'#989898')
							.setOpacity(1)
							.setPosition(0, -21-1*(i+1)*(size+1));
		picker.appendChild(colorArray[i]);
		goog.events.listen(colorArray[i],['mousedown','touchstart'],function(e){
			var p = this.getParent();
			if(p.getOpacity() == 1) {
				p.setStroke(3,this.getFill());
				strokeStyle = 'rgba('+this.getFill().getRgba().toString()+')';
			}
		});	
	}
	return picker;
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.flashcards.start', cs.flashcards.start);

//set main namespace
goog.provide('cs.sort_scale');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Polygon');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');

goog.require('cs.sort_scale.Scale');
goog.require('game.FadeOutMessage');
goog.require('game.Audio');

cs.sort_scale.Width = 1024;
cs.sort_scale.Height = 768;
cs.sort_scale.dragEnabled = false;

cs.sort_scale.debug = 0;

cfg_sound_move_file = 'assets/sound_move.mp3';
cfg_sound_move_mp3 = 'SUQzAwAAAAAfdlBSSVYAAAAOAABQZWFrVmFsdWUAIR4AAFBSSVYAAAARAABBdmVyYWdlTGV2ZWwAewQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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';
cfg_sound_move_ogg = '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';


// entrypoint
cs.sort_scale.start = function(){
	var director = new lime.Director(document.body,cs.sort_scale.Width ,cs.sort_scale.Height),
		scene = new lime.Scene();

	backgroundLayer = new lime.Layer();
	scaleLayer = new lime.Layer();
	topLayer = new lime.Layer();
	scene.appendChild(backgroundLayer);
	scene.appendChild(scaleLayer);
	scene.appendChild(topLayer);
	
	//get browser's language & set messages
	cs.sort_scale.lang = (navigator.language || navigator.userLanguage).toLowerCase();
	if( cs.sort_scale.lang == 'zh-tw' || cs.sort_scale.lang == 'zh-cn' ) {
		buttonCaptionPlay = '開始';
		buttonCaptionFinish = '完成';
		buttonCaptionRetry = '重玩';
		buttonWidth = 80;
		buttonFontSize = 36;
		messageFailure = '加油, 再試一次!';
		messageDone = '太棒了, 完成排序!';
	} else {
		buttonCaptionPlay = 'PLAY';
		buttonCaptionFinish = 'DONE';
		buttonCaptionRetry = 'RETRY';
		buttonWidth = 120;
		buttonFontSize = 28;
		messageFailure = 'Try Again !';
		messageDone = 'Good Job ^.^';
	}
	
	//add a scale to scene
	scale = new cs.sort_scale.Scale()
							.setPosition(cs.sort_scale.Width/2,300)
							.setDegree(0);
	scaleLayer.appendChild(scale);
	
	var finishButton = cs.sort_scale.finishButton()
						.setPosition(cs.sort_scale.Width/2,500);
	backgroundLayer.appendChild(finishButton);
	
	//add eight box at the bottom of the scene
	box = new Array();
	var startX = (cs.sort_scale.Width-120*8)/2+60;
	for(var i=0; i<8; i++) {
		box[i] = new lime.Sprite()
							.setStroke(1)
							.setSize(120,140)
							.setFill('#FAFAFA')
							.setPosition(startX+i*120,cs.sort_scale.Height-90);
		box[i].isBox = true;
		box[i].boxId = i;
		backgroundLayer.appendChild(box[i]);
	}
	
	//weight of bottles , from 100~450
	weight = new Array();
	for(var i=0; i<8; i++) {
		weight[i] = 100+i*50;
	}
	
	indexWeightOrderByAsc = new Array();
	
	//add 8 bottles to scene
	bottles = new Array();
	for(var i=0; i<8; i++) {
		if(i<4) {
			var x = cs.sort_scale.Width-60;
		} else {
			var x = 60;
		}
		bottles[i] = new lime.Sprite()
								.setFill('assets/bottle'+(i+1)+'.png')
								.setRotation(0)
								.setPosition(x,100+(i%4)*140);
		bottles[i].onLeft = false;
		bottles[i].onRight = false;
		bottles[i].boxId = -1;
		
		var n = Math.floor(Math.random()*weight.length);		
		var w = weight[n];
		weight.splice(n, 1);
		indexWeightOrderByAsc[((w-100)/50)] = i;
		bottles[i].weight = w;
		bottles[i].label = new lime.Label()
									.setText(w)
									.setFontSize(24)
									.setHidden( cs.sort_scale.debug ? 0 : 1 )
									.setPosition(0,-10);
		bottles[i].appendChild(bottles[i].label);
		bottles[i].oldPosition = bottles[i].getPosition();
		cs.sort_scale.makeDraggable(bottles[i]);
		topLayer.appendChild(bottles[i]);
	}

	timer = cs.sort_scale.newTimer(0, '#336699', true);
	timer.setPosition(cs.sort_scale.Width/2, 30);
	backgroundLayer.appendChild(timer);

	//sound object
	soundEffect = new game.Audio(cfg_sound_move_file, cfg_sound_move_mp3, cfg_sound_move_ogg);

	
	director.makeMobileWebAppCapable();
	director.setDisplayFPS(false);	//關掉左上角的 FPS 資訊
	
	// set current scene active
	director.replaceScene(scene);

}

cs.sort_scale.makeDraggable = function(sprite) {
	goog.events.listen(sprite, ['mousedown','touchstart'], function(e){
		if(!cs.sort_scale.dragEnabled) return;
		var oldPosition = sprite.getPosition();
		var drag = e.startDrag(false, null, sprite); // snaptocenter, bounds, target
		// Avoid dragging multiple items together
		e.event.stopPropagation();
		//listen for end event
		e.swallow(['mouseup','touchend', 'touchcancel'], function(e){
			dropTarget = undefined;
			if(sprite.onLeft) {
				scale.setLeft(scale.getLeft()-sprite.weight);
			} else if(sprite.onRight) {
				scale.setRight(scale.getRight()-sprite.weight);
			} else if(sprite.boxId >= 0) {
				box[sprite.boxId].setFill('#FAFAFA');
				sprite.boxId = -1;
			}
			sprite.onLeft = false;
			sprite.onRight = false;
			var pos =  new Object();
			pos.pos = sprite.getPosition();
			pos.pos.y += sprite.getSize().height*2/3;
			pos.screenPosition = sprite.getParent().localToScreen(pos.pos);
			if( scale.getDiscLeft().hitTest(pos) || scale.getDiscLeft().hitTest(e)) {
				//drop this bottle to scale left side
				dropTarget = scale.getDiscLeft();
				scale.setLeft(scale.getLeft()+sprite.weight);
				sprite.onLeft = true;
				sprite.onRight = false;
			} else if( scale.getDiscRight().hitTest(pos)  || scale.getDiscRight().hitTest(e) ) {
				//drop this bottle to scale right side
				dropTarget = scale.getDiscRight();
				scale.setRight(scale.getRight()+sprite.weight);
				sprite.onLeft = false;
				sprite.onRight = true;
			} else {
				//drop this bottle to bottom box ?
				for(var i=0; i<8; i++) {
					if(box[i].hitTest(pos) || box[i].hitTest(e)) {
						dropTarget = box[i];
						sprite.onLeft = false;
						sprite.onRight = false;
						dropTarget.setFill('#CEE3F6');
						break;
					}
				}
			}
			//update scale status
			var isScaleRotated = scale.checkBalance();
			//play sound effect 
			if(isScaleRotated) {
				soundEffect.setVolume(1);
				soundEffect.playing_ = false;
				soundEffect.play();
			}
			if(dropTarget != undefined) {				
				var targetPos = dropTarget.getPosition();
				if(dropTarget.isBox == undefined) {
					var parentPos = dropTarget.getParent().getPosition();
					var rootPos = dropTarget.getParent().getParent().getPosition();
					var x = rootPos.x + parentPos.x + targetPos.x;
					//var y = dropTarget.localToScreen(dropTarget.getPosition()).y-90;
					var y = dropTarget.localToNode(dropTarget.getPosition(),scale.getParent()).y-121;
				} else {
					var x = targetPos.x;
					var y = targetPos.y;
					if(dropTarget.boxId != undefined) {
						sprite.boxId = dropTarget.boxId;
					}
				}
				sprite.setPosition(x,y);
			} else {
				//if(cs.sort_scale.isInTheArea(sprite.getPosition(), scale.getPosition(), scale.base.getSize() ) ) {
					sprite.setPosition(sprite.oldPosition);					
				//}
			}
			cs.sort_scale.checkBottlePosition();
		});
	});	
}

cs.sort_scale.checkBottlePosition = function() {
	for(var i=0; i<bottles.length; i++) {
		var dropTarget = undefined;
		if(bottles[i].onLeft) {
			dropTarget = scale.getDiscLeft();
		} else if(bottles[i].onRight) {
			dropTarget = scale.getDiscRight();
		}
		if(dropTarget != undefined) {
			//var y = dropTarget.localToScreen(dropTarget.getPosition()).y-90;
			var y = dropTarget.localToNode(dropTarget.getPosition(),scale.getParent()).y-121;
			var pos = bottles[i].getPosition();
			pos.y = y;
			bottles[i].setPosition(pos);
		}
	}
}
cs.sort_scale.isInTheArea = function(pos1, pos2, size) {
	return (Math.abs(pos1.x - pos2.x) <= size.width/2 && Math.abs(pos1.y-pos2.y) <= size.height/2);
}
cs.sort_scale.finishButton = function() {
	//按鈕:finish
	var r = 110;
	//外圈圓
	finishButton = new lime.Circle().setSize(r,r)
						.setFill('#F5A9A9')
						.setStroke(5, '#ff0000');
	//內圈圓
	finishButton.inner = new lime.Circle().setSize(r*.85,r*.85)
						.setFill('#FA8258')
						.setStroke(2,'#FF4000');
	finishButton.appendChild(finishButton.inner);
	//文字
	finishButton.label = new lime.Label().setText(buttonCaptionPlay)
						.setSize(buttonWidth, 80)
						.setFontSize(buttonFontSize)
						.setPosition(0,15-(buttonFontSize-40)/2)
						.setFontColor('#ff0000');
	finishButton.appendChild(finishButton.label);
	finishButton.getDeepestDomElement().title = buttonCaptionPlay;
	goog.events.listen(finishButton,['mouseup','touchend'],function(){
		var thisButton = finishButton;
		//模擬按下的動畫
		var ani = new lime.animation.Spawn(
			new lime.animation.MoveBy(2,2).setDuration(.1),		//移動
			new lime.animation.ScaleBy(.95).setDuration(.1)		//縮小
		);
		var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
		this.runAction(ani2);	//開始播放動畫
		//動畫放完就...
		goog.events.listen(ani2, lime.animation.Event.STOP, function() {
			if(thisButton.label.getText() == buttonCaptionPlay) {
				//start to play
				thisButton.label.setText( buttonCaptionFinish );
				thisButton.inner.setFill('#00ff00')
								.setStroke(2,'#FF4000');
				cs.sort_scale.dragEnabled = true;
				cs.sort_scale.playTimer();
				
				if( !soundEffect.isSoundInit() ) {
					soundEffect.soundInit();
				}
		
			} else if(thisButton.label.getText() == buttonCaptionFinish) {
				//finish
				cs.sort_scale.dragEnabled = false;
				cs.sort_scale.pauseTimer();
				thisButton.label.setText( buttonCaptionRetry );
				thisButton.inner.setFill('#ffff00')
								.setStroke(2,'#FF4000');

				for(var i=0; i<bottles.length; i++) {
					bottles[i].label.setHidden(0);
				}
				var isFailure = false;
				var total = bottles.length;
				var lightestBoxId = bottles[indexWeightOrderByAsc[0]].boxId;
				if( lightestBoxId == 0 || lightestBoxId == total-1) {
					for(var i=0; i<total; i++) {
						var id = bottles[indexWeightOrderByAsc[i]].boxId;
						var checkId = i;
						if( lightestBoxId > 0 ) {
							checkId = total-1-i
						}
						if(id != checkId) {
							isFailure = true;
							break;
						}
					}
				} else {
					isFailure = true;
				}
				if(isFailure) {
					txt = messageFailure;
				} else {
					txt = messageDone;
				}
				var message = new game.FadeOutMessage()//.setSize(500,200)
										//.setFontSize(24)
										.setFontColor('#ffff99')
										.setFill(0xff, 0x66, 0x33, 0.5)
										//.setStroke(4,'#0000ff')
										.setText(txt)
										//.setRadius(20)
										.setDelay(3)
										.play()
										.setPosition(cs.sort_scale.Width/2, cs.sort_scale.Height/5);
				topLayer.appendChild(message);
			} else {	//reset
				cs.sort_scale.dragEnabled = false;
				cs.sort_scale.resetTimer();
				cs.sort_scale.pauseTimer();
				timer.label.setText(0);
				for(var i=0; i<8; i++) {
					weight[i] = 100+i*50;
				}
				
				for(var i=0; i<8; i++) {
					var n = Math.floor(Math.random()*weight.length);
					var w = weight[n];
					weight.splice(n, 1);
					indexWeightOrderByAsc[((w-100)/50)] = i;
					bottles[i].weight = w;
					bottles[i].label.setText(w)
								.setHidden( cs.sort_scale.debug ? 0 : 1 );
					bottles[i].setPosition(bottles[i].oldPosition);
					bottles[i].onLeft = false;
					bottles[i].onRight = false;
					bottles[i].boxId = -1;
					box[i].setFill('#FAFAFA');
				}
				thisButton.label.setText(buttonCaptionPlay);
				thisButton.inner.setFill('#FA8258')
									.setStroke(2,'#FF4000');
				scale.resetAll();

			}
		},false, this);
	});
	return finishButton;
}



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
cs.sort_scale.newTimer = function(time, color, pause, callback) {
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
	timer.label = new lime.Label().setText(0).setFontSize(24).setFontColor(color)
									.setPosition(0,35);
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
cs.sort_scale.pauseTimer = function() {
	timer.pause = true;
};
cs.sort_scale.playTimer = function() {
	timer.pause = false;
	if(timer.time > 0) {	//倒數
		var t = new Date().valueOf() - 1000*( timer.time - parseInt(timer.label.getText()) );
	} else {	//正數
		var t = new Date().valueOf();
	}
	timer.start = new Date(t); 
};
cs.sort_scale.resetTimer = function() {
	timer.start = new Date(); 
	timer.pause = false;
}

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('cs.sort_scale.start', cs.sort_scale.start);

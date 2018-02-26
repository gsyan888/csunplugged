goog.provide('game.AudioPlayer');

goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.Polygon');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.Sequence');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');

goog.require('game.AudioPlayerAudio');

/**
 * AudioPlayer
 * @param {string} file name of audio to play
 * @constructor
 * @extends lime.Circle
 */
game.AudioPlayer = function(filePath) {
    lime.Circle.call(this);
	this.autoPlay = false;
	
	//this.sound = new lime.audio.Audio(filePath);
	lime.audio.AudioContext = false;
	this.sound = new game.AudioPlayerAudio(filePath);
	
	//this.player = this.createPlayer(parent);
	this.createPlayer();
};
goog.inherits(game.AudioPlayer, lime.Circle);


game.AudioPlayer.prototype.setAutoPlay = function(t) {
	this.autoPlay = t;
	return this;
};
game.AudioPlayer.prototype.getDuration = function() {
	return this.sound.baseElement.duration;
};
game.AudioPlayer.prototype.getTimeRemain = function() {
	return (this.sound.baseElement.duration - this.sound.baseElement.currentTime);
}
game.AudioPlayer.prototype.play = function() {
	this.sound.baseElement.play();
	return this;
};
game.AudioPlayer.prototype.stop = function() {
	this.sound.baseElement.pause();
	return this;
};
game.AudioPlayer.prototype.isEnd = function() {
	if( !this.sound.isPlaying() ) {
		return true;
	} else {
		return this.sound.baseElement.currentTime >= this.sound.baseElement.duration;
	}
}
game.AudioPlayer.prototype.setSrc = function(filePath) {
	this.sound.baseElement.src = filePath;
};
game.AudioPlayer.prototype.createPlayer = function() {
	//外圈的圓
	var circleStatus = this ;
	circleStatus.setSize(150,150).setFill(0,0x99,0);
	//parent.appendChild(circleStatus);
	//內圈的圓(當 play/pause 按鈕)
	var dotParent = new lime.Circle().setSize(110,110).setFill(0,0x66,0, .5).setPosition(0,0).setRotation(45);
	circleStatus.appendChild(dotParent);
	//播放位置指示的小圓
	var dot = new lime.Circle().setSize(20,20).setFill(0,255,0,.5).setPosition(-65,0);
	dotParent.appendChild(dot);
	//剩餘時間(文字)
	var txtStatus = new lime.Label().setSize(120,30).setPosition(0, 58)
								.setText('00:00:00').setFontColor('#00ff00');
	circleStatus.appendChild(txtStatus);
	//播放的圖示
	var triangle = new lime.Polygon(-50, -30, 10, 0, -50, 30).setFill(0, 255, 0, .7).setPosition(25, 0).setStroke(3,'#006600');
	circleStatus.appendChild(triangle);
	
	var sound = this.sound;
	//內圈圓被按下時
	goog.events.listen(dotParent,['mousedown','touchstart'],function(e){
		//當按鍵放開時
		e.swallow(['mouseup','touchend'],function(){
			//模擬按下的動畫
            var ani = new lime.animation.Spawn(
				new lime.animation.MoveBy(2,2).setDuration(.1),		//移動
                new lime.animation.ScaleBy(.95).setDuration(.1)		//縮小
            );
			var ani2 = new lime.animation.Sequence(ani, ani.reverse());	//播放兩次動畫,一正,一反
			triangle.runAction(ani2);	//開始播放動畫
			//如果非暫停(播放中)或已播放完就暫停, 反之就播放
			if( !sound.baseElement.paused && !sound.baseElement.ended) {
				sound.baseElement.pause();	//暫停
			} else {
				sound.baseElement.play();	//播放
			}
        });
	});
	//可以開始播放時
	goog.events.listen(sound.baseElement,'canplay',function(){
		if( !isNaN(sound.baseElement.duration) ) {
			var ss = sound.baseElement.duration - sound.baseElement.currentTime;	//取得剩餘時間
			txtStatus.setText( getTimeString(ss) );		//顯示剩餘時間
			//playStatus.setText( getTimeString(ss) );
			dotParent.setRotation(45);	//將播放位置歸零
			if(this.autoPlay) {
				sound.baseElement.play();	
			}
			//sound.baseElement.pause();
		} else {
			txtStatus.setText( '載入' );
			//playStatus.setText( '載入' );
		}
	},false, this);
	//iPad 在沒按按鈕前, 只會觸發 suspend ,不會載入
	goog.events.listen(sound.baseElement,['suspend', 'abort'], function() {
		txtStatus.setText( '等待播放' );
		//playStatus.setText( '等待播放' );
	});
	goog.events.listen(sound.baseElement,'error', function() {
		var err = 'ERR';
		switch(sound.baseElement.error.code) {
			case 1 : //MEDIA_ERR_ABORTED :
				err = '被取消';
				break;
			case 2 : //MEDIA_ERR_NETWORK :
				err = '網路出錯';
				break;
			case 3 : //MEDIA_ERR_DECODE :
				err = '無法解碼';
				break;
			case 4 : //MEDIA_ERR_SRC_NOT_SUPPORTED :
				err = '無法載入';
				break;
		}		
		txtStatus.setText( err );
		//playStatus.setText( err );		
	});
	//要播放時
	goog.events.listen(sound.baseElement,'play', function() {
		//暫停的圖示
		triangle.setPoints(-50,-30, 0,-30, 0,30, -50,30).setFill(0xcc,0x99,0);
		triangle.addPoints(-50,-30, -30,-30, -20,-30, -20,30, -30,30, -30, -30).setStroke(5,'#006600').setOpacity(.5);
	});
	//暫停時
	goog.events.listen(sound.baseElement,'pause', function() {
		//播放的圖示(三角)
		triangle.setPoints(-50,-30, 10,0, -50,30).setFill(0, 255, 0, .7).setStroke(3,'#006600').setOpacity(1);
	});
	//正在播放時
	goog.events.listen(sound.baseElement,'timeupdate',function(){
		//如果已取得聲音總長度
		if( !isNaN(sound.baseElement.duration) && !isNaN(sound.baseElement.currentTime) ) {
			var ss = sound.baseElement.duration - sound.baseElement.currentTime;	//剩餘秒數
			/*
			//----------長條型播放位置指示器
			var bg_width = playStatus.getSize().width;	//總時間長度
			var w = bg_width*(sound.baseElement.currentTime/sound.baseElement.duration); //已播放時間長度
			var h = playStatusBar.getSize().height; //高
			var pos = playStatus.getPosition();
			var x = pos.x - bg_width/2 + 1 + w/2;
			playStatusBar.setSize(w, h).setPosition(x, pos.y);	//依前面計算結果, 設定指示器大小、位置
			playStatus.setText( getTimeString(ss) );
			//--------------------長條型 end
			*/
			
			//以旋轉內圈圓的方式顯示播放位置
			dotParent.setRotation(45-270*(sound.baseElement.currentTime/sound.baseElement.duration));
			//填入剩餘時間
			txtStatus.setText( getTimeString(ss) );
		}
	});
	
	return circleStatus;
};
//將秒數轉為 '時:分:秒' 並自動補 0 的格式
getTimeString = function(sec) {
	ss = parseInt(Math.round(sec));
	var mm = Math.floor(ss/60);
	var hh = Math.floor(mm/60);
	var ss = Math.floor(ss%60);
	ss = (ss < 10 ? '0'+ss : ss);
	mm = (mm < 10 ? '0'+mm : mm);
	hh = (hh < 10 ? '0'+hh : hh);
	return hh+':'+mm+':'+ss;
}

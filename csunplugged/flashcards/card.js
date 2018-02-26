goog.provide('cs.flashcards.Card');

goog.require('lime.Layer');

cs.flashcards.Card = function(opt_front, opt_back, value) {
    lime.Layer.call(this);
	
	if (goog.isDef(opt_front)) {
        this.setFront(opt_front);
    }
	if (goog.isDef(opt_back)) {
        this.setBack(opt_back);
    }
	this.enabled = true;
	
	this.value1 = '';
	this.value2 = '';
	
	this.scaleToZero = new lime.animation.ScaleTo(1, 0).setDuration(.1);
	this.scaleToNormal = new lime.animation.ScaleTo(1, 1).setDuration(.1);
	var p = this;
	//按下時就進行翻面
	goog.events.listen(this, ['mousedown','touchstart'],function(e){
		if(p.enabled && !isChecking && !strokeEnabled) {
			if(typeof p.scaleToZero.targets[0] != 'undefined') {
				p.scaleToZero.removeTarget(p.scaleToZero.targets[0]);
			}
			var s = this.front.getScale();
			if(s.y == 0) {
				this.back.runAction(p.scaleToZero);
				cardSelected = '';
			} else {
				this.front.runAction(p.scaleToZero);
				if(cardSelected != '') {
					isChecking = true;	//設定這個,讓其它牌不能按
				}
			}
		}
	});
	//當縮到最小的動作停止後, 開始將一面顯示(翻出來)
	goog.events.listen(p.scaleToZero, lime.animation.Event.STOP,function(){
		//var p = this.targets[0].getParent();
		p.scaleToNormal.removeTarget(p.scaleToNormal.targets[0]);	//清除 target, 準備執行恢復為原來大小的程序
		if(p.front == this.targets[0]) {	//目前顯示的是正面
			p.back.runAction(p.scaleToNormal);		//翻到背面
		} else {							//目前顯示的是背面
			p.front.runAction(p.scaleToNormal);		//翻到正面
		}
	});
	//當恢復成正常大小的動作停止後
	goog.events.listen(p.scaleToNormal, lime.animation.Event.STOP,function(){
		if(p.back == this.targets[0]) {
			if(cardSelected == '') {
				cardSelected = p;
			} else {
				//cs.flashcards.checkAnswer(p);
			}			
		} else {							
			//p.front.runAction(p.scaleToNormal);		//翻到正面
		}
	});
};

goog.inherits(cs.flashcards.Card, lime.Layer);


cs.flashcards.Card.prototype.setFront = function(front) {
    this.front = front;
    this.appendChild(this.front);
};

cs.flashcards.Card.prototype.setBack = function(back) {
    this.back = back;
	this.back.setScale(1,0);
    this.appendChild(this.back);
};

cs.flashcards.Card.prototype.showFront = function() {
	var s = this.front.getScale();
	if(s.y == 0) {
		if(typeof this.scaleToZero.targets[0] != 'undefined') {
			this.scaleToZero.removeTarget(this.scaleToZero.targets[0]);
		}
		this.back.runAction(this.scaleToZero);
	}
}
cs.flashcards.Card.prototype.showBack = function() {
	var s = this.back.getScale();
	if(s.y == 0) {
		if(typeof this.scaleToZero.targets[0] != 'undefined') {
			this.scaleToZero.removeTarget(this.scaleToZero.targets[0]);
		}
		this.front.runAction(this.scaleToZero);
	}
}
cs.flashcards.Card.prototype.isFront = function() {
	return (this.front.getScale().y > 0);	
}
cs.flashcards.Card.prototype.isBack = function() {
	return (this.back.getScale().y > 0);	
}

cs.flashcards.Card.Value = function(v1, v2) {
	this.question = v1;
	this.answer = v2;
}

cs.flashcards.Card.prototype.setValue = function(v1, v2) {
	this.value_ = new cs.flashcards.Card.Value(v1, v2);
	//this.value = v;
	return this;
};

cs.flashcards.Card.prototype.getValue = function() {
	return this.value_;
}
cs.flashcards.Card.prototype.setEnabled = function(v) {
	if(v != true) {
		v = false;
	}
	this.enabled = v;
};
cs.flashcards.Card.prototype.getEnabled = function(v) {
	return this.enabled;
};
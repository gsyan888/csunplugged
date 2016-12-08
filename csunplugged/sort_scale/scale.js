goog.provide('cs.sort_scale.Scale');

goog.require('lime.Layer');

/**
 * Scale object. 
 * @constructor
 * @extends lime.Layer
 */
cs.sort_scale.Scale = function() {
    lime.Layer.call(this);

	this.pointer = new lime.Sprite()
						.setFill('assets/scale_pointer.png')
						.setRotation(0)
						.setPosition(-5,1);
	
	this.disc_left = new lime.Sprite()
								.setFill('assets/scale_disc_1.png')
								.setRotation(0)
								.setPosition(-118,20);
	this.disc_left.active = new lime.Sprite()
								.setFill('assets/scale_disc_2.png')
								.setHidden(1)
								.setPosition(0,0);
	this.disc_left.appendChild(this.disc_left.active);
	
	this.disc_right = new lime.Sprite()
								.setFill('assets/scale_disc_1.png')
								.setRotation(0)
								.setPosition(116,20);																		
	this.disc_right.active = new lime.Sprite()
								.setFill('assets/scale_disc_2.png')
								.setHidden(1)
								.setPosition(0,0);
	this.disc_right.appendChild(this.disc_right.active);
	
								
	this.base = new lime.Sprite() 
								 .setFill('assets/scale_base.png')
								 .setPosition(0,35);
								 
	this.appendChild(this.pointer);
	this.pointer.appendChild(this.disc_left);
	this.pointer.appendChild(this.disc_right);
	this.appendChild(this.base);
	
	this.left = 0;
	this.right = 0;
	
};

goog.inherits(cs.sort_scale.Scale, lime.Layer);


cs.sort_scale.Scale.prototype.setDegree = function(degree) {
    this.pointer.setRotation(degree);
    this.disc_left.setRotation(degree*-1);
	this.disc_right.setRotation(degree*-1);
	return this;
};
cs.sort_scale.Scale.prototype.checkBalance = function() {
	var isRotated = false;
	if(this.left > this.right) {
		if(this.pointer.getRotation() != 10) {
			isRotated = true;
		}
		this.setDegree(10);
	} else if(this.left < this.right){
		if(this.pointer.getRotation() != -10) {
			isRotated = true;
		}		
		this.setDegree(-10);
	} else {
		if(this.pointer.getRotation() != 0) {
			isRotated = true;
		}		
		this.setDegree(0);
	}
	return isRotated;
}
cs.sort_scale.Scale.prototype.getDiscLeft = function() {
	return this.disc_left;
};
cs.sort_scale.Scale.prototype.getDiscRight = function() {
	return this.disc_right;
};
cs.sort_scale.Scale.prototype.getLeft = function() {
	return this.left;
}
cs.sort_scale.Scale.prototype.getRight = function() {
	return this.right;
}
cs.sort_scale.Scale.prototype.setLeft = function(value) {
	if(value < 0) {
		value = 0;
	}
	this.left = value;
	if(value == 0) {
		this.disc_left.active.setHidden(1)
	} else {
		this.disc_left.active.setHidden(0)
	}
}
cs.sort_scale.Scale.prototype.setRight = function(value) {
	if(value < 0) {
		value = 0;
	}
	this.right = value;
	if(value == 0) {
		this.disc_right.active.setHidden(1)
	} else {
		this.disc_right.active.setHidden(0)
	}
}
cs.sort_scale.Scale.prototype.resetAll = function() {
	this.setLeft(0);
	this.setRight(0);
	this.checkBalance();
}
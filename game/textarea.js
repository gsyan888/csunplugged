goog.provide('lime.Renderer.DOM.TEXTAREA');
goog.provide('game.Textarea');

//goog.require('goog.ui.LabelInput');

goog.require('lime');
goog.require('lime.Layer');

goog.require('lime.Label');

/**
 * Input object. 
 * @constructor
 * @extends lime.Node
 */
game.Textarea = function() {
    lime.Layer.call(this);
		
    this.domClassName = goog.getCssName('.lime-director textarea');
	
	//this.setAnchorPoint(0,0);
	
    /**
     * Fill object used while drawing
     * @type {lime.fill.Fill}
     * @private
     */
    this.fill_ = null;
    this.stroke_ = null;
	
	this.text_area = goog.dom.createDom('textarea', {'type' : 'text', 'style' : '-webkit-transform-origin: 0 0; -moz-transform-origin: 0 0; -o-transform-origin: 0 0; position: absolute; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; -moz-user-select: text; -webkit-user-select: text;  -webkit-user-drag: auto;'});
	//this.labelInput = new goog.ui.LabelInput();
	//this.labelInput.setLabel('請輸入');
	//this.labelInput.createDom();
	//this.labelInput.enterDocument();
	//this.text_area = this.labelInput.getElement();
	
	//lime.style.setSize(this.text_area, 256, 196);
	//goog.style.setPosition(this.text_area, -128,-98);
	//console.log(this.text_area.style);
	this.appendChild(this.text_area);
	
	
	//讓 input 可以輸入文字
	goog.events.listen(this.text_area,['mousedown','touchstart'],function(e){
		this.text_area.focus ();
		
		e.stopPropagation(); // Avoid dragging multiple items together
		
		var pos = this.text_area.selectionStart;
		this.text_area.setSelectionRange(pos, pos);
		/*		
		var fontSize = this.getFontSize();
		var x0 = this.getPosition().x/2;
		this._cursorStart = -1;

		if(typeof(e.offsetX) != 'undefined') {
			this._cursorStart = Math.floor((e.offsetX)/fontSize);
		} else if(typeof(e.clientX) != 'undefined') {
			this._cursorStart = Math.floor((e.clientX-x0+fontSize/2)/fontSize);
		}		
		if(this._cursorStart >= 0) {
			this.text_area.setSelectionRange(this._cursorStart,this._cursorStart);
		}
		*/
		
	}, false, this);
	
	goog.events.listen(this.text_area,['mouseup', 'touchend', 'touchcancel'],function(e){
		this.text_area.focus ();
		e.stopPropagation();
		var pos = this.text_area.selectionStart;
		this.text_area.setSelectionRange(pos, this.text_area.selectionEnd);
		
	},false, this);
		
	goog.events.listen(this.text_area,'blur', function(e) {
		//在 iOS 上會在使用鍵盤後, 畫面往上偏移, 利用這行移回來
		window.scrollTo(0, 0);
	}, false, this);
	
	//this.setFontSize(14);
	//this.setFontColor('#000000');
	
	//this.setFontSize(24);
	
};
goog.inherits(game.Textarea, lime.Layer);

/**
 * Common name for input objects
 * @type {string}
 */
game.Textarea.prototype.id = 'lime-textarea';

game.Textarea.prototype.getTextarea = function() {
	return this.text_area;
}

game.Textarea.prototype._setSize = function(w, h) {
	if(typeof w != 'undefined') {
		if(typeof h == 'undefined') {
			var h = w.height;
			w = w.width;
		}
		//this.label.setSize(w, h);
		goog.style.setSize(this.text_area, w, h);
		goog.style.setPosition(this.text_area, -1*w/2,-1*h/2);
		//console.log(this.text_area);
	}
	return this;
};

/**
 * Returns font size in pixels
 * @return {number} Font size in px.
 */
game.Textarea.prototype.getFontSize = function() {
    return this.fontSize_;
};

/**
 * Set the font size in pixels
 * @param {number} value New font size in px.
 * @return {lime.Label} object itself.
 */
game.Textarea.prototype.setFontSize = function(value) {
    this.fontSize_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};

/**
 * Returns font color as string
 * @return {string} Font color.
 */
game.Textarea.prototype.getFontColor = function() {
    return this.fontColor_;
};

/**
 * Sets the font color. Accepts #hex, rgb(), rgba() or plain color name.
 * @param {string} value New color.
 * @return {lime.Label} object itself.
 */
game.Textarea.prototype.setFontColor = function(value) {
    this.fontColor_ = value;
    this.setDirty(lime.Dirty.FONT);
    return this;
};


/**
 * Gets fill parameters
 * @return {lime.fill.Fill} Fill object.
 */
game.Textarea.prototype.getFill = function() {
    return this.fill_;
};
game.Textarea.prototype.setFill = function(fill, opt_g, opt_b, opt_a) {
    this.fill_ = lime.fill.parse(goog.array.toArray(arguments));
	this.setDirty(lime.Dirty.FONT);
    return this;
};
/**
 * Return Stroke object if one is set
 * @return {lime.fill.Stroke} Stroke object.
 */
game.Textarea.prototype.getStroke = function(){
    return this.stroke_;
};

/**
 * Sets stroke parameters.
 * @param {*} stroke Stroke object or width and (mixed type) Color.
 * @return {game.Textarea} object itself.
 */
game.Textarea.prototype.setStroke = function(stroke){
    if(stroke && !(stroke instanceof lime.fill.Stroke)){
        stroke = new lime.fill.Stroke(goog.array.toArray(arguments));
    }
    this.stroke_ = stroke;
    this.setDirty(lime.Dirty.CONTENT);
    return this;
};

/** @inheritDoc */
game.Textarea.prototype.supportedRenderers = [
	lime.Renderer.DOM.makeSubRenderer(lime.Renderer.DOM.TEXTAREA)
];

/**
 * @inheritDoc
 * @this {game.Textarea}
 */
lime.Renderer.DOM.TEXTAREA.draw = function(el) {
    //var style = el.style;
	var style = this.text_area.style;
	
	var size = this.getSize();
	this._setSize(size);

	if (!goog.isNull(this.fill_)) {
        this.fill_.setDOMStyle(this.text_area,this);
    }
    if (!goog.isNull(this.stroke_)) {
        this.stroke_.setDOMStyle(this.text_area, this);
        this.hadStroke_ = true;
    } else if (this.hadStroke_) {
        goog.style.setStyle(this.text_area, 'border-width', 0);
        this.hadStroke_ = false;
    }	
    if (this.dirty_ & lime.Dirty.FONT) {
        //style['lineHeight'] = this.getLineHeight();
        //style['padding'] = goog.array.map(this.padding_,function(p){return p;},this).join('px ') + 'px';
		//style['background'] = this.getFill();
        style['color'] = this.getFontColor();
		var p = Math.floor(this.getFontSize()/2)+'px';
		style['padding'] =  p+' '+p+' '+p+' '+p;
        //style['fontFamily'] = this.getFontFamily();
        style['fontSize'] = this.getFontSize() + 'px';
        //style['fontWeight'] = this.getFontWeight();
        //style['textAlign'] = this.getAlign();
        //style['font-style'] = this.getStyle();
        //style['textShadow'] = this.hasShadow_() ? this.getShadowColor() + ' ' + this.getShadowOffset().x + 'px ' + this.getShadowOffset().y + 'px ' + this.getShadowBlur() + 'px' : '';
    }
};


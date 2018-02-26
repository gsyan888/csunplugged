goog.provide('game.Qrcode');

goog.require('game.Qrcode.grid');
goog.require('game.Qrcode.version');
goog.require('game.Qrcode.detector');
goog.require('game.Qrcode.formatinf');
goog.require('game.Qrcode.errorlevel');
goog.require('game.Qrcode.bitmat');
goog.require('game.Qrcode.datablock');
goog.require('game.Qrcode.bmparser');
goog.require('game.Qrcode.datamask');
goog.require('game.Qrcode.rsdecoder');
goog.require('game.Qrcode.gf256poly');
goog.require('game.Qrcode.gf256');
goog.require('game.Qrcode.decoder');
goog.require('game.Qrcode.qrcode');
goog.require('game.Qrcode.findpat');
goog.require('game.Qrcode.alignpat');
goog.require('game.Qrcode.databr');
goog.require('game.Qrcode.jqueryQrcode');

goog.require('lime.Sprite');
goog.require('lime.CanvasContext');

/**
 * Qrcode Object
 * @constructor
 * @param {string} text to generate QR Code
 */
game.Qrcode = function(txt) {
	lime.Sprite.call(this);
	
	this.txt = txt;
	this.colorDark = "#000000";
	this.colorLight = "#ffffff";	
	this.level = QRCode.CorrectLevel.M;
	
	//this.setAnchorPoint(0,0);
	//this.setStroke(5);
	this.setSize(150, 150)
	/*
	this.qrcodeCanvas = new lime.CanvasContext()
								.setSize(128,128)
								.setFill('#ffff00')
								.setPosition(0, 0);
	this.appendChild(this.qrcodeCanvas);
	*/
	
};
goog.inherits(game.Qrcode, lime.Sprite);

game.Qrcode.prototype.setText = function(value) {
	this.txt = value;
	return this;
};

game.Qrcode.prototype.setColorDark = function(value) {
	this.colorDark = value;
	return this;
};

game.Qrcode.prototype.setColorLight = function(value) {
	this.colorLight = value;
	return this;
};
game.Qrcode.prototype.setLevel = function(value) {
	switch(value) {
		case 'L' :
			this.level = QRCode.CorrectLevel.L;
			break;
		case 'Q' :
			this.level = QRCode.CorrectLevel.Q;
			break;
		case 'H' :
			this.level = QRCode.CorrectLevel.H;
			break;
		default :
			this.level = QRCode.CorrectLevel.M;
			break;
	}
	return this;
};
game.Qrcode.prototype.clear = function() {
	if(typeof(this.qr) != 'undefined') {
		this.qr.clear();
	}
	return this;
};
game.Qrcode.prototype.makeCode = function() {
	var size = this.getSize();
	//this.qrcodeCanvas.setSize(size.width, size.height);
	//console.log(this.qrcodeCanvas.getDeepestDomElement().getContext('2d').canvas);
	this.qr = new QRCode(this.getDeepestDomElement(), {
		text: this.txt,
		width: size.width,
		height: size.height,
		colorDark : this.colorDark,
		colorLight : this.colorLight,
		correctLevel : this.level 
	});
	/*
	qr._oDrawing.makeImage = function() {
		//console.log(qr._oQRCode.getModuleCount());
		//qrcodeCanvas.setFill(this._elCanvas.toDataURL("image/png"));
		this._el.draw = function(_oContext) {
			console.log(this._el);
            var _htOption = qr._htOption;
			var nCount = qr._oQRCode.getModuleCount();
			var nWidth = _htOption.width / nCount;
			var nHeight = _htOption.height / nCount;
			var nRoundedWidth = Math.round(nWidth);
			var nRoundedHeight = Math.round(nHeight);
			var nOffsetX = _htOption.width/2;	//add by gsyan
			var nOffsetY = _htOption.height/2;	//add by gsyan
			console.log([nOffsetX, nOffsetY]);
			_oContext.clearRect(0, 0, nWidth, nHeight);
			for (var row = 0; row < nCount; row++) {
				for (var col = 0; col < nCount; col++) {
					var bIsDark = qr._oQRCode.isDark(row, col);
					var nLeft = col * nWidth-64 - nOffsetX;
					var nTop = row * nHeight-64 - nOffsetY;
					_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
					_oContext.lineWidth = 1;
					_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;					
					_oContext.fillRect(nLeft, nTop, nWidth, nHeight);
					
					// 안티 앨리어싱 방지 처리
					_oContext.strokeRect(
						Math.floor(nLeft) + 0.5,
						Math.floor(nTop) + 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
					
					_oContext.strokeRect(
						Math.ceil(nLeft) - 0.5,
						Math.ceil(nTop) - 0.5,
						nRoundedWidth,
						nRoundedHeight
					);
				}
			}	
		}
		
	};
	*/
	this.qr.makeCode(this.txt);
	return this;
};
goog.provide('game.Chinese');

goog.require('lime.Sprite');
goog.require('lime.Label');
goog.require('lime.userAgent');

/**
 * @constructor
 */
game.Chinese = function(callback) {
    lime.Sprite.call(this);
	this.defaultFontSize = 32;
	this.fontsize = this.defaultFontSize;
	this.fontcolor = '#000000';
	this.font = '標楷體';
	
};
goog.inherits(game.Chinese, lime.Sprite);

game.Chinese.prototype.setFontSize = function(value) {
	if( typeof(this.text) != 'undefined' ) {
		var scale = value/this.defaultFontSize;
		this.setScale(scale);
	}
	this.fontsize = value;
	return this;
};
game.Chinese.prototype.setFontColor = function(value) {
	this.fontcolor = value;
	return this;
};
game.Chinese.prototype.setFontFamily = function(value) {
	this.font = value;
	return this;
};
/**
 * 中文加注音
 */
game.Chinese.prototype.setText = function(txt) {
	this.text = txt;
	var chArray = txt.split(' ');
	if( this.typeOfWord(txt.replace(' ','')) == '注音' ) {
		var xOffset = this.fontsize*.6;
	} else {
		var xOffset = this.fontsize*1.4;
	}
	var x0 = xOffset*(chArray.length-1)/-2;
	for(var i=0; i<chArray.length; i++) {
		var x = x0 + i*xOffset;
		var ch = this.getAllChineseCharacters(chArray[i])
							.setPosition(x,0);
		this.appendChild(ch);
	}
	this.width = xOffset*chArray.length;
	return this;
};

/**
 * 加帶注音的字
 * 
 * 參數:
 *			txt 帶有注音+國字的字串
 *
 */
game.Chinese.prototype.getAllChineseCharacters = function(txt) {
	var allPh = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ˙";
	//var txt = 'ㄅㄚ吧';
	//先檢查注音是在前還是在後, 擷取國字、注音、調號
	if(allPh.indexOf(txt.substr(0, 1)) < 0 
				|| txt.substr(txt.length-1, 1)=='︶') {	//注音在後
		var ch_txt = txt.substr(0, 1);	//第一個字是國字
		if(txt.length >1) {				//如果總字串長度大於一,代表有注音
			var ph_txt = txt.substr(1);	//由第二個字起, 到最後都是注音
		} else {	
			var ph_txt = '　';	//沒注音的,所有把注音的位置改用全形空白代替
		}
	} else {	//注音在前,國字在最後一個字的
		var ch_txt = txt.substr(txt.length-1,1);	//取最後一個字當國字
		//也有可能是都沒國字,先檢查應該是國字的是否為注音
		if( allPh.indexOf(ch_txt) >= 0) {
			var ch_txt = '';	//國字設為空的,稍後將注音的位置往左調整
			var ph_txt = txt;	//全部都是注音
		} else {
			var ph_txt = txt.substr(0, txt.length-1);	//去掉最後一個字為注音
		}
	}

	var defaultSize = 120;
	var ch_fontsize = defaultSize;	//預設用 60 來計算位置
	var ph_fontsize = Math.floor(ch_fontsize/4);
	if(ch_txt != '') {
		var xx = -0.75*ph_fontsize;
	} else {
		var xx = -2.5*ph_fontsize;	//沒有國字的，把位置再往左一點
	}
	var yy = Math.round(-this.fontsize*0.05);
	var last_txt = ph_txt.substr(ph_txt.length-1);
	switch(last_txt) {
		case 'ˇ' :
		case 'ˋ' :
		case 'ˊ' :
			ph_txt = ph_txt.substr(0, ph_txt.length-1);
			break;
		case '˙' :
			ph_txt = last_txt + ph_txt.substr(0, ph_txt.length-1);
			last_txt = '';
			break;
		case '︶' :
			//ph_txt = ph_txt.substr(0, ph_txt.length-1);
			//break;
		default :
			last_txt = '';
			break;
	}
	//debug
	var sprite = new lime.Sprite(); //.setSize(fontsize*1.5,fontsize).setStroke(1,'#009900');
	character = new lime.Label();
	phone1 = new lime.Label();
	phone2 = new lime.Label();
	sprite.appendChild(character);
	sprite.appendChild(phone1);
	sprite.appendChild(phone2);
	//國字
	character.setSize(ch_fontsize,ch_fontsize).setFontSize(ch_fontsize).setText(ch_txt)
           .setPosition(xx, yy).setFontColor(this.fontcolor).setFontFamily(this.font);
	if(ch_txt == '？') {
		character.setStroke(1,'#ff66ff').setSize(ch_fontsize,ch_fontsize+5);
	}
	//注音
	if(ph_txt != '︵　︶' && ph_txt != '︵︶') {
		phone1.setSize(ph_fontsize,ph_fontsize*ph_txt.length).setFontSize(ph_fontsize).setText(ph_txt)
				.setPosition(xx + 0.5*ch_fontsize+0.5*ph_fontsize, yy).setFontColor(this.fontcolor).setFontFamily(this.font);
	} else {
		ph_txt = "︵\n　\n　\n︶";
		phone1.setSize(ph_fontsize,ph_fontsize*2).setFontSize(ph_fontsize).setText(ph_txt)
				.setPosition(xx + (ch_fontsize+ph_fontsize)*0.5, yy-ph_fontsize).setFontColor(this.fontcolor).setFontFamily(this.font);
	}
	//調號
	phone2.setSize(ph_fontsize,ph_fontsize).setFontSize(lime.userAgent.IOS || lime.userAgent.ANDROID ? ph_fontsize*2 : ph_fontsize).setText(last_txt)
            .setPosition(xx + ch_fontsize*0.5+ph_fontsize*1.3, yy + (ph_txt.length-2)*ph_fontsize/2).setFontColor(this.fontcolor).setFontFamily(this.font);
	sprite.setScale(this.fontsize/defaultSize);
	return sprite;
}
//--------------------------------------------------
//倒轉字(注音在前國字在後者先轉換順序)
//--------------------------------------------------
game.Chinese.prototype.WordFirst = function( chracter ) {
	var phString = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ˙";
	if ( chracter.length > 1 ) {
		var wFirst = chracter.substr(0,1);	//取出第一個字
		var wLast =  chracter.substr(-1,1);	//取出最後一個字
		//第一個字為注音而且最後一個字為國字
		if( phString.indexOf( wFirst ) > -1 && phString.indexOf( wLast) == -1 ) {
			chracter = wLast + chracter.substr(0,chracter.length-1);
		}
	}
	return chracter;
}
//--------------------------------------------------
//倒轉字(注音在前國字在後者先轉換順序)
//每個陣列元素都代表一個國字
//--------------------------------------------------
game.Chinese.prototype.arrayWordFirst = function( arrayIn ) {
	for(i=0; i< arrayIn.length; i++) {
		arrayIn[i] = this.WordFirst(arrayIn[i]);
	}
	return arrayIn;
}

//-------------------------------------------------
//判斷字串的型態
//-------------------------------------------------
game.Chinese.prototype.typeOfWord = function( word ) {
	var phString = "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ˙";
	var i=0;
	var phCount = 0;
	for(i=0; i < word.length; i++) {
		if ( phString.indexOf(word.substr(i,1)) > -1 ) {
			phCount++;
		}
	}
	if (phCount == word.length) {
		return "注音";		//純注音
	} else {
		if (phCount == 0) {
			return "國字";		//純國字
		} else {
			return "混合";		//混合
		}
	}
};

//-------------------------------------------------
//製作帶有注音的題幹 (去掉解答的部份)
//		qString : 帶有注音的題幹
//		ans : 正確答案
//-------------------------------------------------
game.Chinese.prototype.questionStringRemoveAnswer = function(qString, ans) {
	var result = '';
	var w = qString.split(' ');
	for(var i=0; i<w.length; i++) {
		var wordStr = w[i];
		var ansAt = wordStr.indexOf(ans);
		if(ansAt >= 0) {	//找到題目中有答案,將它置換為括號或問號
			var temp = this.WordFirst(wordStr).split( this.WordFirst(ans) );	//分解前調為先國字後注音的格式
			if ( temp.length == 2 ) {
				if ( this.typeOfWord(ans) == "注音" ) {		//注音是答案
					wordStr = temp[0]+"︵　︶";				//去掉注音加括號
				} else  { 	//國字是答案
					wordStr = "？"+temp[1];					//將國字換成空白
				}
			} else {		//國字注音全字都是答案
				wordStr = "？";				//整個字去掉
			}
		}
		if(result != '') {
			result += ' ';
		}
		result += wordStr;
	}
	return result;
};

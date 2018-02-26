goog.provide('game.Util');


//-------------------------------------------------
//
//-------------------------------------------------
//取得網址中的某一個參數(已編碼過的)
game.Util.gup = function( name ){
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+name+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( window.location.href ); 
	if( results == null )    return "";  
	else    return results[1];
}

/**
 * 載入指定的文字檔(.js or 其它)
 */
game.Util.loadSetting = function(src, callback) {
	if( src.toLowerCase().lastIndexOf('.js') >=0 ) {	//載入 .js
		if( typeof callback == 'function' ) {
			game.Util.loadSettingFromExternalScript(src, callback);
		} else {
			game.Util.loadSettingFromExternalScript(src);
		}
	} else {	//載入其它的檔案(文字檔, onLine 狀態才可以
		if( typeof callback == 'function' ) {
			game.Util.get_file_contents(src, game.Util.parseTextSetting, callback);
		} else {
			game.Util.get_file_contents(src, game.Util.parseTextSetting);
		}
	}
};

//由 .txt 檔讀入題庫設定後解析內容
game.Util.parseTextSetting = function(data, callback) {
	var result = new Object;
	if(data != '') {
		data = data.replace(/\r/g,'');
		var src = data.split('&');
		for(var i in src) {
			if(src[i].replace(/\n/g,'') != '') {
				var equAt = src[i].indexOf('=');	//找到第一個等號
				if( equAt > 0 ) {
					var q = new Array();
					q[0] = src[i].substr(0, equAt);
					q[1] = src[i].substr(equAt+1);
					q[1] = q[1].replace(/\n/g,"\\n");	//先把換行字元轉為 \\n ,以免執行 eval 時出錯
					eval('result.' + q[0] + '=' + '"'+q[1]+'"');
				}
			}
		}
	}
	if( typeof callback == 'function') {
		callback(result);
	}
}	

/**
 * 由外部的 .js 載入設檔值, 並執行 callback 的指令
 * @private
 */
game.Util.loadSettingFromExternalScript = function(scriptSrc, callback)  {
	var nocacheVal = '?nocache=' + new Date().getTime();	//為了避免 cache 的問題,在檔名後加亂數
	var scriptToAdd = document.createElement('script');		//建立一個 scriptElement
	
	scriptToAdd.setAttribute('type','text/javascript');
	scriptToAdd.setAttribute('charset','utf-8');
	//scriptToAdd.setAttribute('src', scriptSrc + nocacheVal);	//避免 cache 時用的
	scriptToAdd.setAttribute('src', scriptSrc);
	//載入成功時
	scriptToAdd.onload = scriptToAdd.onreadystatechange = function() {
		if (!scriptToAdd.readyState || scriptToAdd.readyState === "loaded" || scriptToAdd.readyState === "complete") {
			scriptToAdd.onload = scriptToAdd.onreadystatechange = null;
			document.getElementsByTagName('head')[0].removeChild(scriptToAdd);	//將變數載入後移除 script
			callback();	//執行指定的函數
        };
	};
	//無法載入時, 將設定用預設值
	scriptToAdd.onerror = function() {
		scriptToAdd.onerror = null;	//將事件移除
		document.getElementsByTagName('head')[0].removeChild(scriptToAdd);	//移除 script
		if( typeof callback == 'function' ) {
			callback();	//執行指定的函數
		}
	}
	
	//在 head 的最前頭加上前述的 scriptElement
	var docHead = document.getElementsByTagName("head")[0];
	docHead.insertBefore(scriptToAdd, docHead.firstChild);
};

/**
 * 由外部的檔案讀取資料, 
 * 成功讀取後, 把資料儲存在 localStorage (以檔名當作 key)
 * 最後執行指定的函數。
 *
 */
game.Util.get_file_contents = function(text_url, callback, param) {
	/*
	//alert(navigator.onLine);
	if(!navigator.onLine) {
		if(typeof localStorage[text_url] != 'undefined') {
			callback(localStorage[text_url]);
		} else {
			alert('error : ' + text_url );
			callback("");
		}
		return;
	}
	*/

	if (window.XMLHttpRequest) {     
      var req = new XMLHttpRequest(); 
	}     
	else if (window.ActiveXObject) {     
      var req = new ActiveXObject("Microsoft.XMLHTTP");     
	}     
	
	req.open('GET', text_url);

	req.onreadystatechange = function() {     
   		if (req.readyState == 4) {
			if(req.status == 200) {	//200 為成功讀入資料; 404 : Not Found
				localStorage[text_url] = req.responseText; //將資料儲存,留著備用
				if( typeof callback == 'function' ) {
					if( typeof param != 'undefined' ) {
						callback(req.responseText, param);
					} else 	{
						callback(req.responseText);
					}
				}
			} else {
				//如果有儲存,試著載入資料
				//alert(req.status + ' : ' + text_url);
				if( typeof localStorage[text_url] != 'undefined' ) {
					//alert(localStorage[text_url]);
					if( typeof callback == 'function' ) {
						if( typeof param != 'undefined' ) {
							callback(localStorage[text_url], param);
						} else {
							callback(localStorage[text_url]);
						}
					}
				} else {
					if( typeof callback == 'function' ) {
						if( typeof param != 'undefined' ) {
							callback("", param);
						} else {
							callback("");
						}
					}
				}
			}
		}
	}
	try {
		req.send(null);
	} catch(e) {
		//錯誤發生時
		//alert(e);
	}
};

//依範圍產生亂數陣列
game.Util.makeRandomIndex = function(iMin, iMax) {
	var total = 5;		//重覆幾次
	var source = new Array();
	var result = new Array();
	//如果大小相反,就進行交換
	if( iMin > iMax ) {
		var m = iMax;
		iMax = iMin;
		iMin = m;
	}
	//把可用的號碼填入陣列中暫存
	for(var i=iMin,j=0; i<=iMax; i++) {
		source[j++] = i;
	}
	var c = 0;
	while( c < total) {
		//由可用的號碼中隨機抽一個置入結果中,並將已抽的去掉
		var i=0;
		while(source.length > 0) {
			var r = Math.floor(Math.random()*source.length);
			result[i++] = source[r];	//暫存隨機取的
			source.splice(r, 1);				//已抽過的去掉
		}
		source = result.slice();
		c++;
	}
	return result;
}


//
//brightness : 0~5 , 0:darkest
//
game.Util.getRandomColor  = function (brightness) {
	//code from :
	//	http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
	//
	//return '#'+Math.random().toString(16).substr(-6);
	var color;
	if(typeof brightness != 'undefined') {
		//6 levels of brightness from 0 to 5, 0 being the darkest
		var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
		var mix = [brightness*51, brightness*51, brightness*51]; //51 => 255/5
		var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function(x){ return Math.round(x/2.0)})
		color = "rgb(" + mixedrgb.join(",") + ")";
	} else {
		var letters = 'ABCDE'.split('');
		color = '#';
		for (var i=0; i<3; i++ ) {
			color += letters[Math.floor(Math.random() * letters.length)];
		}
	}
    return color;
}


game.Util.isImage = function(str) {
	var extNames = new Array('.jpg', '.jpeg', '.png', '.gif', '.bmp');
	str = str.toString();
	var fName = str.toLowerCase();
	var len = str.length;
	for(var i in extNames) {
		var extAt = fName.lastIndexOf(extNames[i])
		if( extAt >= 0 
				&& extAt == len-extNames[i].length) {
			return true;
		}
	}
	return false;
}

//判斷字串是否為 .mp3 路徑
game.Util.isMP3 = function(str) {
	if(str.toLowerCase().lastIndexOf(".mp3") < 0) {
		return false;
	} else {
		return true;
	}
}

//判斷是否為分數的表示式
game.Util.isFraction = function(str) {
	try {
		var f = str.match(/\[\d+:\d+:\d+\]|\[\d+:\d+\]/);
	} catch(e) { var f = null; }
	if( typeof f == 'object' && f != null ) {
		return true;
	} else {
		return false;
	}
};

//-------------------------------------------------
//判斷字串的型態
//-------------------------------------------------
game.Util.typeOfWord = function( word ) {
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
//--------------------------------------------------
//倒轉字(注音在前國字在後者先轉換順序)
//--------------------------------------------------
game.Util.WordFirst = function( chracter ) {
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
};

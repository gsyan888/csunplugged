//*****************************************************
// 題庫
//*****************************************************
//每一題庫包括兩部份(欄位) : 選單及短文
//	1.中括號的左括號下第一行為選單標題 
//	2.function() 的下一行為短文內容
//
menuItemAndTextLines= new Array(

[
"第一關",
	function(){/*--這一行請勿更改--
Pitter patter
-----*/}.toString().slice("function(){/*--這一行請勿更改--".length+2,-9)
]

,	//本逗號之後為下一個選單的內容, 所以新增別忘了加逗號

[
"第二關",
	function(){/*--這一行請勿更改--
I have a pen, I have an apple.
Oh! apple pen.
I have a pen, I have a pineapple.
Oh! pineapple pan.
Apple pen, pineapple pen.
OH! pen pineapple apple pen
-----*/}.toString().slice("function(){/*--這一行請勿更改--".length+2,-9)
]

,
[
"chinese",
	function(){/*--這一行請勿更改--	
永和有永和路，中和有中和路，
中和的中和路有接永和的中和路，
永和的永和路沒接中和的永和路；
永和的中和路有接永和的永和路，
中和的永和路沒接中和的中和路。
-----*/}.toString().slice("function(){/*--這一行請勿更改--".length+2,-9)
]
	

);	//********************題庫結束*****************************

//*****************************************************
//
//*****************************************************
cfg_textFontSize = 40;		//文字字型大小
cfg_caseSensitive = false;	//是否區分大小寫

//messages
cfg_messageButtonPatternSelect = '開始選取保留目標';
cfg_messageButtonPatternOk = '保留標的選取完成';
cfg_messageButtonTargetSelect = '開始選取壓縮標的';
cfg_messageButtonTargetOk = '壓縮標的選取完成';
cfg_messageButtonCompressStart = '點擊開始壓縮';
cfg_messageButtonCompressOk = '繼續進行';

cfg_messageButtonFinish = '全部完成';

cfg_messageResultCaption = '壓縮結果';
cfg_messageResultButtonOk = '回主選單';
cfg_messageResultPrefix = '總共用了 ';
cfg_messageResultMiddle = ' 個壓縮步驟；壓縮了 ';
cfg_messageResultPostfix = ' 個字元';
cfg_messageDelayResult = 3000;

cfg_messagePatternSelectErr1 = '至少要選取 2 個字元';
cfg_messagePatternSelectErr2 = '標的必須連續選取，請勿跨字';
cfg_messageDelayPatternSelectErr = 2;

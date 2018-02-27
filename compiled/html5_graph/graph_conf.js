//***************************************************
//
// This file will load by  graph.js
//
//***************************************************

//*************************************************
// Set the locale message filename's postfix
//	ex. set the value to 'tw' will load lang_tw.js
//*************************************************
cfg_locale_LANG = 'tw';

//顏色選擇時可用的清單, 節點圖形只用前7個
cfg_colors = new Array(
	  '#000000'
	, '#FF0000'
	, '#00CC00'
	, '#0000FF'
	, '#FFFF00'
	, '#00FFFF'
	, '#FF00FF'
	, '#C0C0C0'
	, '#ff8000'
);

cfg_nodeObjectDefaultColor = '#00CC00'; //節點新增時預設的顏色
cfg_lineDefaultColor 	   = '#000000';	//連接線新增時預設的顏色

cfg_nodeObjectSize = 100; 	//節點的預設大小
cfg_lineSize = 10; 			//節點連接線的預設粗細
cfg_longpressTime = 300;	//預設按住多久後為長按

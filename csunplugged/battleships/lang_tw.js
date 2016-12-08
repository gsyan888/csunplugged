//*******************************************
//
// This file will load by  battleships.js 
//
//******************************************

//******************************************
// Level Settings
//******************************************
//	欄位依序為
//		船隻數量,	每列最多幾艘,	是否按號碼排,	種類(0:全亂數  1:二元	2:雜湊) 各關闖關說明
//
cfg_levelSettings = new Array(
		  [ 5,	5, false, 0, "前方迎來敵方船艦10艘，船身編號似乎並無排列規則。其中一艘是前鋒指揮官所在，請想辦法擊沉他的船艦。" ]
		, [ 26, 9, false, 0, "前方是第二批敵方船鑑，這次數量增加至26艘，船身編號仍無排列規則。請想辦法擊沉指揮官的船艦。" ]
		, [ 10, 5, true, 1, "你遭遇到對方的主力軍隊所在，10艘船隻已按照由小到大的編號順序排列整齊，我方情報員已潛入，但他無法傳遞目標的正確位置，只能提示如何調整目標。請依據情報員的協助，設法找出指揮官的船艦並擊沉他。" ]
		, [ 26, 9, true, 1, "原來前面的艦隊只是嚇唬人的，這裡的26艘船艦才是真正的進攻集團。船隻仍然按照由小到大的編號順序排列，讓我們的情報員繼續提供炮擊位置的暗示，盡快擊沉指揮官船艦吧！" ]
		, [ 10, 10, false, 2, "你成功殲滅了敵軍主力，現在來到了敵軍的船泊。這裡停了10艘飛彈軍艦，依據情報員回傳的密報，將船隻編號的四位數字分別相加後，相加結果的個位數字即停泊的港口編號。請根據這個規則，設法擊沉載有飛彈的目標軍艦。" ]
		, [ 26, 10, false, 2, "最後，排列在你前方的是26艘航空母艦，其中一艘載有毀滅性的核子飛彈。所幸從前一關的情報內容，船隻停泊的港口規則還是一樣的，將船隻編號的四位數字相加後，結果的個位數字即為停泊的位置。已經縮小搜尋範圍了，請找出那艘航空母艦，擊沉它吧！" ]
);

//******************************************
// 訊息內容
//******************************************
cfg_messagePortHintPrefix = "目標已在 ";			//幾號港提示(前)
cfg_messagePortHintPostfix = " 號港口，請射擊";		//幾號港提示(後)

cfg_messageTargetHitted = "擊中目標";		//擊中目標
cfg_messageTargetMissed = "沒射中";   		//沒射中

cfg_messageTooLow = "目標編號似乎更大";		//目標編號似乎更大 
cfg_messageTooHigh = "目標編號似乎更小";	//目標編號似乎更小

//next button
cfg_messageNextLevel = "下一關";	//下一關
cfg_messagePlayAgain = "重新玩";	//重新玩

//game over : record message
cfg_messageRecordPrefix = "任務完成！花費時間：";		//成績
cfg_messageRecordHour = "時";
cfg_messageRecordMin = "分";
cfg_messageRecordSec = "秒";

//description dialog 
cfg_messageDescriptionLevelPrefix = "第 ";
cfg_messageDescriptionLevelPostfix = " 關";
cfg_messageDescriptionButtonOk = "開始";

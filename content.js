/* ========================================== 
  
  【製造残】
  
  ・501アウト→相手がキャンセル→501アウト
    音声が出ないはず。


 ========================================== */
$(function(){
    var t_round;
    var t_player;
    var t_legs;
    var gameShotFlg;

    // https://qiita.com/taiko1/items/240eea6eb597701f83bb
    var speak = new SpeechSynthesisUtterance();

    function init() {
        var t_round = $('.input_area').attr("round");   // 0
        var t_player = $('.input_area').attr("player"); // 0
        t_legs = $("#legs").text();
        gameShotFlg = false;
        speak.rate  = 0.80;
        speak.pitch = 1;
        speak.lang  = 'en-GB';  //(日本語:ja-JP, アメリカ英語:en-US, イギリス英語:en-GB, 中国語:zh-CN, 韓国語:ko-KR)
    }

    function analsys() {
        var legs = $("#legs").text();
        if (legs == undefined || legs == "" || legs == null) {
            t_legs = "";
            return;
        }
        if (speak.voice != 'Google UK English Male') {
            var voices = speechSynthesis.getVoices();
            if(!voices || !voices.length){
                return;
            }
            voices.some(function(v, i){
                if(v.name == 'Google UK English Male') {
                    speak.voice = v;
                    return true;
                }
            });
        }
        if (t_legs != legs) {
            // newLegs判定
            init();
            if($('.input_area').length > 0) {
                // 入力できる場合
                speak.rate  = 0.50;
                speak.volume = 1.50;
                speak.text = "Game On!";
                speechSynthesis.speak(speak);
            }
        }

        var round = $('.input_area').attr("round");
        var player = $('.input_area').attr("player");
        if (t_round != round || t_player != player) {
	        var point = $('.score_input[round="'+t_round+'"][player="'+t_player+'"]').text();
	        // var url = chrome.runtime.getURL(point+".mp3");
            // var music = new Audio(url);
            // music.play();  // 再生
            if (point >= 170) {
                speak.rate  = 0.30;
                speak.volume = 1.50;
            }
            speak.text = point;
            if (point == "") {
                t_round = round;
                t_player = player;
                return;
            }
            if (point == 0) {
                speak.text = "no score!";
            }
            speechSynthesis.speak(speak);
            
            speak.rate  = 0.80;
            speak.volume = 1.00;
            
            point = $('.score_left[round="'+(round - 1)+'"][player="'+player+'"]').text();
            if (0 < point && point <= 170) {
                if (point != 169 && point != 168 && point != 166 && point != 165 && point != 163 && point != 162 && point != 159) {
                    speak.text = "You require " + point;
                    speechSynthesis.speak(speak);
                }
            }
            
            t_round = round;
            t_player = player;
            
        } else {
            // ゲーム終了判定
            // オンライン対戦以外
            var point = $('.score_input[round="'+round+'"][player="'+player+'"]').text();
            if (!gameShotFlg) {
                if (point == 'x1' || point == 'x2' || point == 'x3') {
                    speak.rate  = 0.50;
                    speak.volume = 1.50;
                    speak.text = "Game Shot!";
                    speechSynthesis.speak(speak);
                    gameShotFlg = true;
                    speak.rate  = 0.80;
                    speak.volume = 1.00;
                }
            }
        }
    }
    
    setInterval(analsys ,500);
    
});

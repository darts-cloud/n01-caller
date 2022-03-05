/* ========================================== 
  [[[TODO]]]
・発生ON／OFできるようにする。
・音声認識版も作る？
============================================ */

class Caller {

    static PLAYER1 = 1;
    static PLAYER2 = 2;
    
    constructor() {
        this.init();
        this.prev_legs = "";
    }
    
    /* ======================== */
    /* html analsys functions
    /* ======================== */
    getLegs() {
        let legs = $("#legs").text();
        if (legs == undefined || legs == "" || legs == null) {
            legs = "";
        }
        return legs;
    }
    
    getRound() {
        return $('.input_area').attr("round");
    }
    
    getPlayerName(player) {
        let name = $(`#p${player}_name`).text();
        return name.replace("* ", "");
    }
    
    getPlayer() {
        return $('.input_area').attr("player");
    }
    
    getPoint(round, player) {
        return $(`.score_input[round=${round}][player=${player}]`).text();
    }
    
    getRequirePoint(round, player) {
        return $(`.score_left[round=${round-1}][player=${player}]`).text();
    }
    
    isGameshot() {
        return $('.score_input:contains("x")').length != 0;
    }
    
    getGameshotRound() {
        return parseInt($('.score_input:contains("x")').attr("round"));
    }
    
    getWinPlayer() {
        return parseInt($('.score_input:contains("x")').attr("player"));
    }
    
    getLatestRound() {
        let tdObj;
        $("#score_body tr").each(function(i, v){
            if(v.id == "score_list_start") {
                return true;
            }
            if($(v).find(".score_left:empty").length != 0) {
                tdObj = v;
                return false;
            }
        });
        let round = tdObj.id;
        round = round.replace("round_", "");
        return round;
    }
    
    /* ======================== */
    /* functions
    /* ======================== */
    sets(round, player) {
        this.prev_round = round;
        this.prev_player = player;
    }

    init() {
        this.prev_round = this.getRound();   // 0
        this.prev_player = this.getPlayer(); // 0
        this.prev_legs = this.getLegs();
        this.gameShotFlg = false;
    }
    
    isLoaded() {
        return true;
    }

    analsys() {
        let legs = this.getLegs();
        //if (legs == "" || !this.loaded) {
        if (legs == "") {
            this.prev_legs = "";
            return;
        }
        if (!this.isLoaded()) {
            return;
        }
        if (this.isGameshot()) {
            if (this.gameShotFlg) {
                return;
            }
            // Game Shot
            let pl = this.getWinPlayer();
            this.callGameShot(pl);
            this.gameShotFlg = true;
            return ;
        }

        this.gameShotFlg = false;
        
        let round = this.getRound();
        let player = this.getPlayer();
        let latestRound = this.getLatestRound();
        
        if (round != latestRound) {
            return;
        }

        if (this.prev_legs != legs && round == 0) {
            // new leg
            this.init();

            // next game start
            let p1Name = this.getPlayerName(Caller.PLAYER1);
            let p2Name = this.getPlayerName(Caller.PLAYER2);
            this.callGameOn(p1Name, p2Name);
        }
        
        if (this.prev_round != round || this.prev_player != player) {
            
            let point = this.getPoint(this.prev_round, this.prev_player);
            if (point == "") {
                this.sets(round, player);
                return;
            }
            
            // Call Point
            this.callPoint(point);
            
            point = this.getRequirePoint(round, player);
            if (this.canDoubleOut(point)) {
                // Call Require Point
                this.callYouRequire(point);
            }

            this.sets(round, player);
        }
    }
    
    canDoubleOut (point) {
        if (point == "") {
            return false;
        }
        if (point < 0 || 170 < point) {
            return false;
        }
        
        if (point == 169 || point == 168 ||
            point == 166 || point == 165 ||
            point == 163 || point == 162 || point == 159) {
            return false;
        }
        
        return true;
    }

    canLoad(_url) {
        try {
            let xhr;
            xhr = new XMLHttpRequest();
            xhr.open("HEAD", _url, false);  //同期モード
            xhr.send(null);
            return xhr.status;
        }  catch(e) {
            return 404;
        }
    }
    
    isFirstLeg() {
        let legs = this.getLegs();
        legs = legs.replaceAll("(", "");
        legs = legs.replaceAll(")", "");
        legs = legs.replaceAll("0", "");
        legs = legs.replaceAll("-", "");
        legs = legs.replaceAll(" ", "");

        return legs == "";
    }

    /* ======================== */
    /* override functions
    /* ======================== */
    
    callGameOn (p1Name, p2Name) {
        alert("GameOn");
    }
    
    callGameShot(player) {
        alert("GameShot");
    }
    
    callPoint(point) {
        alert(point);
    }
    
    callYouRequire(point) {
        alert(`you require ${point}`)
    }
}

class SpeechCaller extends Caller {

    constructor() {
        super();
        this.rate  = 0.80;
        this.pitch = 1;
        this.lang  = 'en-GB';  //(日本語:ja-JP, アメリカ英語:en-US, イギリス英語:en-GB, 中国語:zh-CN, 韓国語:ko-KR)
        this.voice = null;
    }

    init() {
        super.init();
    }
    
    isLoaded() {
        // It takes a few seconds to load the voice.
        if (this.voice != null) {
            return true;
        }
        
        let voice = null;
        let voices = speechSynthesis.getVoices();
        if(!voices || !voices.length){
            return false;
        }
        voices.some(function(v, i){
            if(v.name == 'Google UK English Male') {
                voice = v;
                return true;
            }
        });
        this.voice = voice;
        return false;
    }
    
    getSpeechSynthesisUtterance() {
        let speak = new SpeechSynthesisUtterance();
        speak.rate  = this.rate;
        speak.pitch = this.pitch;
        speak.lang  = this.lang;
        if (this.voice != null) {
            speak.voice = this.voice;
        }
        return speak;
    }
    
    call(speak) {
        speechSynthesis.speak(speak);
    }
    
    callGameOn(p1Name, p2Name) {
        let speak = this.getSpeechSynthesisUtterance();
        speak.rate  = 0.50;
        speak.volume = 1.50;
        speak.text = `${p1Name} vs ${p2Name}.Game On!`;
        this.call(speak);
    }
    
    callGameShot (player) {
        let speak = this.getSpeechSynthesisUtterance();
        speak.rate  = 0.50;
        speak.volume = 1.50;
        let pl = "";
        if (player == 0) {
            pl = "player1";
        } else {
            pl = "player2";
        }
        speak.text = `Game Shot!Won by ${pl}`;
        this.call(speak);
    }
    
    callPoint(point) {
        let speak = this.getSpeechSynthesisUtterance();
        if (point >= 170) {
            speak.rate  = 0.30;
            speak.volume = 1.50;
        }
        speak.text = point;
        if (point == 0) {
            speak.text = "no score!";
        }
        this.call(speak);
    }
    
    callYouRequire(point) {
        let speak = this.getSpeechSynthesisUtterance();
        speak.text = "You require " + point;
        this.call(speak);
    }
}

class SoundCaller extends Caller {

    constructor() {
        super();
        this.queue = [];
        this.sound = new Audio();
        
        let obj = this;
        this.sound.addEventListener("ended", function() {
            obj.playSound();
        }, false);
    }
    
    init() {
        super.init();
    }
    
    addSound(name) {
        let url = chrome.runtime.getURL(`/voice/${name}.mp3`);
        this.queue.push(url);
        this.playSound();
    }
    playSound() {
        if (this.sound.src != "" && !this.sound.ended) {
            return;
        }
        if (this.queue.length > 0) {
            let url = this.queue.shift();
            let status = this.canLoad(url);
            console.log("url:", url);
            console.log("status:", status);
            if (status == 200) {
                this.sound.src = url;
                // this.sound.load();
                this.sound.play();
            }
        }
    }

    callGameOn(p1Name, p2Name) {
        this.addSound("GameOn");
    }
    
    callGameShot (player) {
        let round = this.getGameshotRound() + 1;
        if (round <= 6) {
            this.addSound(`gameshot9`);
            return;
        }
        let point = this.getRequirePoint(round - 1, player);
        if (point >= 100) {
            this.addSound("gameshoth");
        } else {
            this.addSound("gameshot");
        }
    }
    
    callPoint(point) {
        if (point >= 100) {
            this.addSound(`${point}h`);
        } else {
            this.addSound(`${point}`);
        }
    }

    callYouRequire(point) {
        this.addSound("you_require");
        this.addSound(point);
    }
}


class Sound {
    
    constructor() {
        this.listeners = {};
    }
    
    trigger(method, payload = null) {
        const callback = this.listeners[method];
        if(typeof callback === 'function'){
            callback(payload);
        }
    }
    
    addEventListener(method, callback) {
        this.listeners[method] = callback;
    }

    removeEventListener (method) {
        delete this.listeners[method];
    }

    canLoad(_url) {
        try {
            let xhr;
            xhr = new XMLHttpRequest();
            xhr.open("HEAD", _url, false);  //同期モード
            xhr.send(null);
            return xhr.status;
        }  catch(e) {
            return 404;
        }
    }

}

class SpeechSynthesisSound extends Sound {

    constructor() {
        super();
        
        this.rate  = 0.9;
        this.pitch = 1.0;
        this.volume = 1.5;
        this.lang  = 'en-GB';  //(日本語:ja-JP, アメリカ英語:en-US, イギリス英語:en-GB, 中国語:zh-CN, 韓国語:ko-KR)
        this.voice = null;
    }
    
//    isLoaded() {
//        // It takes a few seconds to load the voice.
//        if (this.voice != null) {
//            return true;
//        }
//        
//        let voice = null;
//        let voices = speechSynthesis.getVoices();
//        if(!voices || !voices.length){
//            return false;
//        }
//        voices.some(function(v, i){
//            if(v.name == 'Google UK English Male') {
//                voice = v;
//                return true;
//            }
//        });
//        this.voice = voice;
//        return false;
//    }

    getSpeechSynthesisUtterance() {
        let speak = new SpeechSynthesisUtterance();
        speak.rate  = this.rate;
        speak.pitch = this.pitch;
        speak.lang  = this.lang;
        if (this.voice != null) {
            speak.voice = this.voice;
        }
        let obj = this;
        speak.addEventListener("start", function() {
            obj.trigger("start");
        }, false);
        speak.addEventListener("end", function() {
            obj.trigger("next");
        }, false);

        return speak;
    }

    call(sentence) {
        let speak = this.getSpeechSynthesisUtterance();
        speak.text = sentence;
        speechSynthesis.speak(speak);

        // call is success
        return true;
    }

}

class VoiceSound extends Sound {

    constructor() {
        super();
        this.sound = new Audio();
        let obj = this;
        this.sound.addEventListener("play", function() {
            obj.trigger("start");
        }, false);
        this.sound.addEventListener("ended", function() {
            obj.trigger("next");
        }, false);
    }

    call(content) {
        let url = chrome.runtime.getURL(`/voice/${content}.mp3`);
        let status = this.canLoad(url);
        console.log("url:", url);
        console.log("status:", status);
        if (status == 200) {
            this.sound.src = url;
            this.sound.play();
        } else {
            // call error
            return false;
        }
        
        // call is success
        return true;
    }

}

class SoundCallerEx extends SoundCaller {

    static SPEECH_SYNTHESIS = 1;
    static SOUND = 2;

    constructor() {
        super();
        this.isCalling = false;
        this.queue = [];
        this.speech = new SpeechSynthesisSound();
        let obj = this;
//        this.speech.addEventListener("start", function() {
//            obj.isCalling = true;
//        });
        this.speech.addEventListener("next", function() {
            obj.isCalling = false;
            obj.call();
        });
        this.sound  = new VoiceSound();
//        this.sound.addEventListener("start", function() {
//            obj.isCalling = true;
//        });
        this.sound.addEventListener("next", function() {
            obj.isCalling = false;
            obj.call();
        });
    }

    init() {
        super.init();
    }

    addSpeechSynthesis(sentence) {
        this.queue.push([SoundCallerEx.SPEECH_SYNTHESIS, sentence]);
        this.call();
    }

    addSound(point) {
        this.queue.push([SoundCallerEx.SOUND, point]);
        this.call();
    }

    call() {
        if (this.queue.length <= 0) {
            return;
        }
        if (this.isCalling) {
            return;
        }
        this.isCalling = true;

        let ary = this.queue.shift();
        let type = ary[0];
        let content = ary[1];
        let sound;
        if (type == SoundCallerEx.SPEECH_SYNTHESIS) {
            sound = this.speech;
        } else if(type == SoundCallerEx.SOUND) {
            sound = this.sound;
        }
        
        if (!sound.call(content)) {
            // call is error
            this.isCalling = false;
        }
    }

    callGameOn(p1Name, p2Name) {
        if(this.isFirstLeg()) {
            if (p1Name == "Player 1") {
                this.addSound("player1");
            } else {
                this.addSpeechSynthesis(`${p1Name}`);
            }
            
            this.addSpeechSynthesis("vs");
            
            if (p2Name == "Player 2") {
                this.addSound("player2");
            } else {
                this.addSpeechSynthesis(`${p2Name}`);
            }
        }
        this.addSound("gameon");
    }

    callGameShot (player) {
        super.callGameShot(player);
    }

}

$(function(){
    // let caller = new SpeechCaller();
    // let caller = new SoundCaller();
    let caller = new SoundCallerEx();

    setInterval(function() {
        caller.analsys();
    } ,500);
});

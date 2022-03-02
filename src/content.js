/* ========================================== 

  【Bug】
・最終ラウンド以外に上がり目が来ると、ゲームショットと言わない。
・発生ON／OFできるようにする。
・Player1 Win
・音声認識版も作る？
============================================ */

class Caller {

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
    
    getPlayer() {
        return $('.input_area').attr("player");
    }
    
    getPoint(round, player) {
        return $(`.score_input[round=${round}][player=${player}]`).text();
    }
    
    getRequirePoint(round, player) {
        return $(`.score_left[round=${round-1}][player=${player}]`).text();
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
        let round = this.getRound();
        let player = this.getPlayer();
        let latestRound = this.getLatestRound();
        if (round != latestRound) {
            return;
        }

        // alert(`${this.prev_legs} != ${legs} && ${round} == 0`);
        if (this.prev_legs != legs && round == 0) {
            // new leg
            this.init();

            // next game start
            this.callGameOn();
        }
        
        if (this.prev_round == round && this.prev_player == player) {
            
            let point = this.getPoint(round, player);

            if (point == 'x1' || point == 'x2' || point == 'x3') {
                if (this.gameShotFlg) {
                    return;
                }
                // Game Shot
                this.callGameShot();
                this.gameShotFlg = true;
            } else {
                this.gameShotFlg = false;
            }

        } else {

            let point = this.getPoint(this.prev_round, this.prev_player);
            if (point == "") {
                this.sets(round, player);
                return;
            }
            
            // Call Point
            this.callPoint(point);
            
            point = this.getRequirePoint(round, player);
            if (canDoubleOut(point) {
                // Call Require Point
                this.callYouRequire(point);
            }

            this.sets(round, player);
        }
    }
    
    canDoubleOut (point) {
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
    
    /* ======================== */
    /* override functions
    /* ======================== */
    
    callGameOn () {
        alert("GameOn");
    }
    
    callGameShot () {
        alert("GameOn");
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
    
    callGameOn() {
        let speak = this.getSpeechSynthesisUtterance();
        speak.rate  = 0.50;
        speak.volume = 1.50;
        speak.text = "Game On!";
        this.call(speak);
    }
    
    callGameShot () {
        let speak = this.getSpeechSynthesisUtterance();
        speak.rate  = 0.50;
        speak.volume = 1.50;
        speak.text = "Game Shot!";
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

    callGameOn() {
        this.addSound("GameOn");
    }
    
    callGameShot () {
        this.addSound("GameShot");
    }
    
    callPoint(point) {
        this.addSound(point);
    }
    callYouRequire(point) {
        this.addSound("you_require");
        this.addSound(point);
    }
}

$(function(){
    // var caller = new SpeechCaller();
    var caller = new SoundCaller();

    setInterval(function() {
        caller.analsys();
    } ,500);
});

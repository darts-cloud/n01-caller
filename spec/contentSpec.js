describe("CallerTest", function() {
  let speechCaller;
  let soundCaller;

  beforeEach(function() {
    speechCaller = new SpeechCaller();
    soundCaller = new SoundCaller();
  });
  
  describe("1.Call Test", function() {
    it("Call Test [Game On]", function() {
      speechCaller.callGameOn();
      soundCaller.callGameOn();
    });
  });
  
  describe("2.Call Test", function() {

    it("Call Test [Game Shot]", function() {
      let player = 0;
      speechCaller.callGameShot(player);
      soundCaller.callGameShot(player);
      player = 1;
      speechCaller.callGameShot(player);
      soundCaller.callGameShot(player);
    });
  });
  
  describe("3.Call Test", function() {

    it("Call Test [0-60 Point]", function() {
      for (let i=0; i<=60; i++) {
        if (i == 163 || i == 166 || i == 169 || i == 172 || i == 173 || i == 175 || i == 176 || i == 178 || i == 179) {
          continue;
        }
        speechCaller.callPoint(i);
        soundCaller.callPoint(i);
      }
    });
  });
  
  describe("4.Call Test", function() {

    it("Call Test [61-120 Point]", function() {
      for (let i=61; i<=120; i++) {
        if (i == 163 || i == 166 || i == 169 || i == 172 || i == 173 || i == 175 || i == 176 || i == 178 || i == 179) {
          continue;
        }
        speechCaller.callPoint(i);
        soundCaller.callPoint(i);
      }
    });
  });
  
  describe("5.Call Test", function() {

    it("Call Test [121-180 Point]", function() {
      for (let i=121; i<=180; i++) {
        if (i == 163 || i == 166 || i == 169 || i == 172 || i == 173 || i == 175 || i == 176 || i == 178 || i == 179) {
          continue;
        }
        speechCaller.callPoint(i);
        soundCaller.callPoint(i);
      }
    });
  });
  
  describe("6.Call Test", function() {

    it("Call Test [You Require 0-60 Point]", function() {
      for (let i=1; i<=60; i++) {
        if (!speechCaller.canDoubleOut(i)) {
          continue;
        }
        speechCaller.callYouRequire(i);
        soundCaller.callYouRequire(i);
      }
    });
  });
  
  describe("7.Call Test", function() {

    it("Call Test [You Require 61-120 Point]", function() {
      
      for (let i=61; i<=120; i++) {
        if (!speechCaller.canDoubleOut(i)) {
          continue;
        }
        speechCaller.callYouRequire(i);
        soundCaller.callYouRequire(i);
      }
    });
  });
  
  describe("8.Call Test", function() {

    it("Call Test [You Require 121-180 Point]", function() {
      for (let i=121; i<=180; i++) {
        if (!speechCaller.canDoubleOut(i)) {
          continue;
        }
        speechCaller.callYouRequire(i);
        soundCaller.callYouRequire(i);
      }
    });
  });

});

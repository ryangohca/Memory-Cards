var timer = (function(){
  class Timer {
    constructor() {
      this.stopped = false;
      this.secondsLeft = null;
    }

    async startTimer(seconds, update, callback) {
      this.secondsLeft = seconds;
      this.stopped = false;
      for (var i = this.secondsLeft; i > 0; i--) {
        this.secondsLeft = i;
        update(this.secondsLeft);
        for (var j = 0; j < 100; j++){
          if (this.stopped) return;
          await sleep(10);
        }
      }
      callback();
    }

    async stopTimer(){
      this.stopped = true;
      await sleep(10);
    }
  }
  return {"Timer": Timer};
})();
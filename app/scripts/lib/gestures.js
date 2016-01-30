'use strict';


  function Gesture(game) {
    this.game = game;

    this.swipeDispatched = false;
    this.holdDispatched = false;

    this.isTouching = false;
    this.isHolding = false;

    this.onSwipe = new Phaser.Signal();
    this.onTap = new Phaser.Signal();
    this.onHold = new Phaser.Signal();

  }

  Gesture.prototype.update = function() {
    var distance = Phaser.Point.distance(this.game.input.activePointer.position, this.game.input.activePointer.positionDown);
    var duration = this.game.input.activePointer.duration;

    this.updateSwipe(distance, duration);
    this.updateTouch(distance, duration);
  };

  Gesture.prototype.updateSwipe = function(distance, duration) {
    if (duration === -1) {
      this.swipeDispatched = false;
    } else if (!this.swipeDispatched && distance > 150 &&  duration > 100 && duration < Gesture.TIMES.SWIPE) {
      var positionDown = this.game.input.activePointer.positionDown;
      this.onSwipe.dispatch(this, positionDown);

      this.swipeDispatched = true;
    }
  };

  Gesture.prototype.updateTouch = function(distance, duration) {
    var positionDown = this.game.input.activePointer.positionDown;

    if (duration === -1) {
      if (this.isTouching) {
        this.onTap.dispatch(this, positionDown);
      }

      this.isTouching = false;
      this.isHolding = false;
      this.holdDispatched = false;

    } else if (distance < 10) {
      if (duration < Gesture.TIMES.HOLD) {
        this.isTouching = true;
      } else {
        this.isTouching = false;
        this.isHolding = true;

        if (!this.holdDispatched) {
          this.holdDispatched = true;

          this.onHold.dispatch(this, positionDown);
        }
      }
    } else {
      this.isTouching = false;
      this.isHolding = false;
    }
  };

  Gesture.SWIPE = 0;
  Gesture.TAP = 1;
  Gesture.HOLD = 2;

  Gesture.TIMES = {
    HOLD: 150,
    SWIPE: 250
  };




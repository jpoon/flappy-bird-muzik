import {Muzik} from './muzik';
import {RingBuffer} from './util';

export var stateStarting = 'Starting';
export var statePlaying = 'Playing';
export var stateGameOver = 'GameOver';

class Styles {
 public static BackgroundColor: string = '#5DD5E3';
}

export class Starting extends Phaser.State {
  headphones: Muzik;

  init(headphones: Muzik) {
    this.headphones = headphones;
  }

  preload() {
    this.game.stage.backgroundColor = Styles.BackgroundColor;
  }

  create() {
    //  Capture headphone buttons
    this.headphones.configureButtonUp(() => {
      this.nextState();
    }); 

    let titleTextStyle = { font: '32px Arial Black', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 5 };
    let titleText = this.game.add.text(this.game.world.centerX, 100, 'MuzikFlappyBird', titleTextStyle);
    titleText.anchor.set(0.5);

    let instructionTextStyle = { font: '18px Consolas', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: (this.game.world.width - 80)};
    let instructionText = this.game.add.text(this.game.world.centerX, 250, 'How to play:\n1) Connect your Muzik Ones\n2) Control the bird by\n   tilting your Muzik Ones\n   up/down.', instructionTextStyle);
    instructionText.anchor.set(0.5);

    let startTextStyle = { font: '18px Consolas', fill: '#ffffff', align: 'center'};
    let startText = this.game.add.text(this.game.world.centerX, 420, 'Press UP to Start', instructionTextStyle);
    startText.anchor.set(0.5);
  }

  update() {
    if (this.game.input.activePointer.justPressed()) {
      this.nextState();
    }
  }

  private nextState() {
    this.game.state.start(statePlaying, true, false, this.headphones);
  }
}

export class Playing extends Phaser.State {
  game: Phaser.Game;
  headphones: Muzik;

  pipes: Phaser.Group;
  bird: Phaser.Sprite;
  score: number;
  labelScore: Phaser.Text;
  jumpSound: Phaser.Sound;
  timer: Phaser.TimerEvent;

  headphoneForwardAngle: RingBuffer = new RingBuffer(5);
  headphoneSampleCount: number = 0;

  init(headphones: Muzik) {
    this.headphones = headphones;
  }

  preload() {
    this.headphones.configureAccelerometer((x, y, z, norm, forwardAngle, sideAngle) => {
      this.headphoneForwardAngle.push(forwardAngle); 
      this.headphoneSampleCount++;

      if (this.headphoneSampleCount % 3 === 0) {
        this.jump(this.headphoneForwardAngle.average());
        this.headphoneSampleCount = 0;
      }
    });

    this.game.stage.backgroundColor = Styles.BackgroundColor;

    this.game.load.image('bird', 'assets/bird.png');
    this.game.load.image('pipe', 'assets/pipe.png');
    this.game.load.image('jumpbutton', 'assets/jump.png');
  }

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.pipes = this.game.add.group();
    this.pipes.enableBody = true;
    this.pipes.createMultiple(20, 'pipe');
    this.timer = this.game.time.events.loop(1750, this.addRowOfPipes, this);

    this.bird = this.game.add.sprite(100, 245, 'bird');
    this.game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;

    // New anchor position
    this.bird.anchor.setTo(-0.2, 0.5);

    var jumpbutton = this.game.add.button(this.game.world.centerX - 40, 420, 'jumpbutton', this.jump, this, 2, 1, 0);

    this.score = 0;
    this.labelScore = this.game.add.text(20, 20, String(this.score), { font: '30px Arial', fill: '#ffffff' });
  }

  update() {
    if (this.bird.inWorld === false)
      this.restartGame();

      this.game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

      // Slowly rotate the bird downward, up to a certain point.
      if (this.bird.angle < 20)
        this.bird.angle += 1;
  }

  jump(headphoneForwardAngle?: number) {
    // If the bird is dead, he can't jump
    if (this.bird.alive === false)
      return;

    // if there are headphones connected
    let yVelocity = -350;
    if (headphoneForwardAngle !== undefined && typeof headphoneForwardAngle === 'number') {
      yVelocity = headphoneForwardAngle * 25;
    }

    this.bird.body.velocity.y = yVelocity;

    // Jump animation
    this.game.add.tween(this.bird).to({ angle: -20 }, 100).start();
  }

  hitPipe() {
    // If the bird has already hit a pipe, we have nothing to do
    if (this.bird.alive === false)
      return;

    // Set the alive property of the bird to false
    this.bird.alive = false;

    // Prevent new pipes from appearing
    this.game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEachAlive(function (p) {
      p.body.velocity.x = 0;
    }, this);
  }

  restartGame() {
    this.game.state.start(stateGameOver, true, false, this.score, this.headphones);
  }

  private addOnePipe(x, y) {
    var pipe = this.pipes.getFirstDead();

    pipe.reset(x, y);
    pipe.body.velocity.x = -200;
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  }

  private addRowOfPipes() {
    var hole = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < 8; i++)
      if (i !== hole && i !== hole + 1)
        this.addOnePipe(400, i * 60 + 10);

    this.score += 1;
    this.labelScore.text = String(this.score);
  }
}

export class GameOver extends Phaser.State {
  score: number;
  headphones: Muzik;

  init(score: number, headphones: Muzik) {
    this.score = score;
    this.headphones = headphones;
  }

  preload() {
    this.game.stage.backgroundColor = Styles.BackgroundColor;

    //  Capture headphone buttons
    this.headphones.configureButtonUp(() => {
      this.nextState();
    }); 
  }

  create() {
    let scoreTextStyle = { font: '32px Arial', fill: '#ffffff', align: 'center', wordWrap: true, wordWrapWidth: (this.game.world.width - 50)};
    let scoreText = this.game.add.text(this.game.world.centerX, 125, 'Score: ' + this.score, scoreTextStyle);
    scoreText.anchor.set(0.5);

    let instructionTextStyle = { font: '18px Consolas', fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: (this.game.world.width - 50)};
    let instructionText = this.game.add.text(this.game.world.centerX, 425, 'Press UP to continue', instructionTextStyle);
    instructionText.anchor.set(0.5);
  }

  update() {
    if (this.game.input.activePointer.justPressed()) {
      this.nextState();
    }
  }

  private nextState() {
    this.game.state.start(stateStarting, true, false, this.headphones);
  }
}
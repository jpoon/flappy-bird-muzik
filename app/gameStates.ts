import {Muzik} from './muzik';
import {RingBuffer} from './util';

export var stateStarting = "Starting";
export var statePlaying = "Playing";
export var stateGameOver = "GameOver";

class Styles {
 public static BackgroundColor : string = '#5DD5E3'
}

export class Starting extends Phaser.State {
    counter: number;
    text: Phaser.Text;
    headphones: Muzik;

    init(headphones: Muzik) {
        this.headphones = headphones;
    }

    preload() {
        this.game.stage.backgroundColor = Styles.BackgroundColor;
    }

    create() {
        this.counter = 3;
        this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, String(this.counter), {
            font: "64px Arial", fill: "#ffffff", align: "center"
        });
        this.text.anchor.setTo(0.5, 0.5);

        this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this);
    }

    private updateCounter() {
        if (--this.counter == 0) {
            this.game.state.start(statePlaying, true, false, this.headphones);
        }
        this.text.setText(String(this.counter));

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

    headphoneForwardAngle: RingBuffer;
    headphoneSampleCount: number;

    constructor() {
        super();

        this.headphoneForwardAngle = new RingBuffer(5);
        this.headphoneSampleCount = 0;
    }

    init(headphones: Muzik) {
        this.headphones = headphones;
    }

    preload() {
        this.headphones.configureAccelerometer((x, y, z, norm, forwardAngle, sideAngle) => {
            this.headphoneForwardAngle.push(forwardAngle); 
            this.headphoneSampleCount++;

            if (this.headphoneSampleCount % 3 == 0) {
                this.jump(this.headphoneForwardAngle.average());
                this.headphoneSampleCount = 0;
            }
        });

        this.game.stage.backgroundColor = Styles.BackgroundColor;

        this.game.load.image('bird', 'assets/bird.png');
        this.game.load.image('pipe', 'assets/pipe.png');

        // Load the jump sound
        this.game.load.audio('jump', 'assets/jump.wav');

        this.game.load.image('jumpbutton', 'assets/jump.png');
    }

    create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = this.game.add.group();
        this.pipes.enableBody = true;
        this.pipes.createMultiple(20, 'pipe');
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);

        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;

        // New anchor position
        this.bird.anchor.setTo(-0.2, 0.5);

        var jumpbutton = this.game.add.button(this.game.world.centerX - 40, 420, 'jumpbutton', this.jump, this, 2, 1, 0);

        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

        // Add the jump sound
        this.jumpSound = this.game.add.audio('jump');
    }

    update() {
        if (this.bird.inWorld == false)
            this.restartGame();

        this.game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

        // Slowly rotate the bird downward, up to a certain point.
        if (this.bird.angle < 20)
            this.bird.angle += 1;
    }

    jump(headphoneForwardAngle?: number) {
        // If the bird is dead, he can't jump
        if (this.bird.alive == false)
            return;

        // if there are headphones connected
        let yVelocity = -350;
        if (headphoneForwardAngle != undefined && typeof headphoneForwardAngle === "number") {
            yVelocity = headphoneForwardAngle * 25;
        }

        this.bird.body.velocity.y = yVelocity;

        // Jump animation
        this.game.add.tween(this.bird).to({ angle: -20 }, 100).start();

        // Play sound
        this.jumpSound.play();
    }

    hitPipe() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
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

    addOnePipe(x, y) {
        var pipe = this.pipes.getFirstDead();

        pipe.reset(x, y);
        pipe.body.velocity.x = -200;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    }

    addRowOfPipes() {
        var hole = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 60 + 10);

        this.score += 1;
        this.labelScore.text = String(this.score);
    }
}

export class GameOver extends Phaser.State {
    titleText: Phaser.Text;
    congratsText: Phaser.Text;
    instructionText: Phaser.Text;
    score: number;
    headphones: Muzik;

    init(score: number, headphones: Muzik) {
        this.score = score;
        this.headphones = headphones;
    }

    preload() {
        this.game.stage.backgroundColor = Styles.BackgroundColor;

        this.headphones.configureButtonUp(() => {
            this.game.state.start(stateStarting, true, false, this.headphones);
        }); 
    }

    create() {
        this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'Score: ' + this.score, {
            font: '32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        this.congratsText.anchor.set(0.5, 0.5);

        this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Press the UP button play again', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        this.instructionText.anchor.set(0.5, 0.5);
    }

    update() {
        if (this.game.input.activePointer.justPressed()) {
            this.game.state.start(stateStarting, true, false, this.headphones);
        }
    }
}
import * as GameStates from './gameStates';
import {Muzik} from './muzik';

export class Game {
    game: Phaser.Game;
    headphones: Muzik;

    constructor(width: number, height: number, divName: string) {
        this.game = new Phaser.Game(width, height, Phaser.AUTO, divName);
        this.game.state.add(GameStates.stateStarting, GameStates.Starting);
        this.game.state.add(GameStates.statePlaying, GameStates.Playing);
        this.game.state.add(GameStates.stateGameOver, GameStates.GameOver);
    }
  
    public start(headphones: Muzik) {
        this.headphones = headphones;
        this.game.state.start(GameStates.stateStarting, true, false, headphones);
    }
}

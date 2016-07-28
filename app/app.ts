import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {Game} from './game';
import {Muzik} from './muzik';

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {
  rootPage: any = HomePage;
  headphones: Muzik = new Muzik();

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
    }).then(() => {
      return this.headphones.connect();
    }).then(() => {
      let game = new Game(400, 490, 'gameDiv');
      game.start(this.headphones);
    }).catch(e => {
      console.warn(e);
    })
  }
}

ionicBootstrap(MyApp);

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
  headphones: Muzik;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      //this.headphones = new Muzik();
      //this.headphones.configureAccelerometer(this.muzikAccelerometerDataStream);

      //this.headphonesConnect();

      let game = new Game(400, 490, 'gameDiv');
       game.start();
    });
  }

  private headphonesConnect() {
    this.headphones.getIsConnected().then(isConnected => { 
      if (!isConnected) {
        this.headphones.connect()
          .then(state => console.log(state))
          .catch(err => {
            console.log(err + ": Retrying...");
            this.headphonesConnect();
        });
      }
    });
  }

  private muzikAccelerometerDataStream(x: number, y: number, z: number, norm: number, forwardAngle: number, sideAngle: number) {
    console.log(x, " ", y, " ", z, " ", norm, " ", forwardAngle, " ", sideAngle);
  }
}

ionicBootstrap(MyApp);

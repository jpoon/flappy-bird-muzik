export class Muzik {

  public static isPlatformSupported() : boolean {
    try {
      muzik;
    } catch (e) {
      return false;
    }
    return true;
  }

  public connect() : Promise<boolean> {
    if (!Muzik.isPlatformSupported()) {
      return new Promise(resolve => resolve(false));
    }

    return new Promise(resolve => {
      this.isConnected().then(isConnected => { 
        if (!isConnected) {
          this.connectHelper()
            .then(state => {
              console.log("Connected");
              resolve(true);
            })
            .catch(err => {
              console.log(err + ": Retrying...");
              setTimeout(this.connect(), 250);
          });
        }
      });
    });
  }

  public isConnected() : Promise<boolean> {
    if (!Muzik.isPlatformSupported()) {
      return new Promise(resolve => resolve(false));
    }

    return new Promise(resolve => {
      muzik.isConnected(isConnected => {
        resolve(isConnected);
      })
    });
  }

  public configureAccelerometer(callback) {
    if (Muzik.isPlatformSupported()) {
      muzik.registerForAccelerometerDataStream(callback);
    }
  }

  public configureButtonUp(callback) {
    if (Muzik.isPlatformSupported()) {
      muzik.registerForGestures(callback, muzik.GESTURE.BUTTON_UP);
    }
  }

  private connectHelper() : Promise<muzik.CONNECTION_STATE> {
    return new Promise((resolve, reject) => {
      muzik.startServer();
      muzik.registerForConnectionState(state => {
        switch (state) {
          case muzik.CONNECTION_STATE.HEADPHONES_CONNECTED:
            resolve(state);
            break;
          default:
            reject(state);
            break;
         }
      });
    });
  }
}
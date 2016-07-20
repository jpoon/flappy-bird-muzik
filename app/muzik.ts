export class Muzik {
  
  constructor() {
    if (!muzik) {
      console.warn("Are you running this on a device?");
    }
  }

  public connect() : Promise<boolean> {
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
              this.connect();
          });
        }
      });
    });
  }

  public isConnected() : Promise<boolean> {
    return new Promise((resolve) => {
      muzik.isConnected(isConnected => {
        resolve(isConnected);
      })
    });
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

  public configureAccelerometer(callback) {
    muzik.registerForAccelerometerDataStream(callback);
  }
}
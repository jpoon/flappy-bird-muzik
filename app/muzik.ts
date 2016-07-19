export class Muzik {
  
  constructor() {
    if (!muzik) {
      console.warn("Are you running this on a device?");
    }
  }

  public connect() : Promise<muzik.CONNECTION_STATE> {
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

  public getIsConnected() : Promise<boolean> {
    return new Promise((resolve) => {
      muzik.isConnected(isConnected => {
        resolve(isConnected);
      })
    });
  }

  public configureAccelerometer(callback) {
    muzik.registerForAccelerometerDataStream(callback);
  }
}
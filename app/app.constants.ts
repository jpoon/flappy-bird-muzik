export class Configuration {
    public static Server: string = 'http://localhost:1337/';
    public static ApiUrl: string = 'scores/';
    public static ServerWithApiUrl = Configuration.Server + Configuration.ApiUrl;
}
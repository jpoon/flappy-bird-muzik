import { Configuration } from './app.constants';

declare var require: any;
let request = require('request-promise-native');

export class Score {
    username: string;
    score: number;
    id: number;
    createdAt: Date;
    rank: number;

    public static FromJson(json: any): Score {
        let score: Score = new Score();

        if (json) {
            score.username = json['username'];
            score.score = json['score'];
            score.id = json['id'];
            score.createdAt = json['createdAt'];
            score.rank = json['rank'];
        }

        return score;
    }
}

export class Leaderboard {  
    getLeaders(): Promise<Score[]> {
        return request.get(Configuration.ServerWithApiUrl).then(result => {
            let scoresJson = JSON.parse(result);
            let scores: Score[] = [];

            for (let json of scoresJson) {
                scores.push(Score.FromJson(json));
            }

            return scores;
        }).catch((err) => {
            console.error(err);
            return err;
        });
    }

    getRank(id: number): Promise<Score> {
        return request.get(Configuration.ServerWithApiUrl + id).then(result => {
            let json = JSON.parse(result)[0];
            return Score.FromJson(json);
        }).catch((err) => {
            console.error(err);
            return err;
        });
    }

    postScore(username: string, score: number): Promise<Score> {
        return request.get(Configuration.ServerWithApiUrl + 'create?username=' + username + '&score=' + score).then(result => {
            let json = JSON.parse(result);
            return Score.FromJson(json);
        }).catch((err) => {
            console.error(err);
            return err;
        });
    }
}
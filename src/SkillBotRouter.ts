import * as bodyParser from "body-parser";
import * as express from "express";
import {SkillBotMessage} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";
import {UserSession} from "./UserSession";

export class SkillBotRouter {
    private sessions: {[id: string]: UserSession} = {};

    public router(): express.Router {
        const router = express.Router();

        router.use(bodyParser.json());
        router.use(bodyParser.urlencoded());

        router.get("/ping", (request: express.Request, response: express.Response) => {
            response.send("hello");
        });

        router.get("/version", (request: express.Request, response: express.Response) => {
            const packageJSON = require("../../package.json");
            response.contentType("text/plain");
            response.send(packageJSON.version);
        });

        router.get("/message", async (request: express.Request, response: express.Response) => {
            // const messageJSON = request.body;
            const userID = request.query.userID;
            const channel = request.query.channel;
            const messageString = request.query.utterance;
            const source = request.query.source;

            const message = new SkillBotMessage(source, channel, userID, messageString);
            try {
                const reply = await this.process(message);
                // We respond immediately or we start getting retries
                response.status(200);
                response.send(JSON.stringify(reply));
                console.log("Response sent");
                return;
            } catch (e) {
                console.error(e);
                response.status(500);
                response.send(e.toString());
                return;
            }
        });

        return router;
    }

    private process(message: SkillBotMessage): Promise<SkillBotReply> {
        let session;
        if (message.sessionKey() in this.sessions) {
            session = this.sessions[message.sessionKey()];
        } else {
            session = new UserSession(message.userID);
            this.sessions[message.sessionKey()] = session;
        }

        return session.handleMessage(message);
    }
}

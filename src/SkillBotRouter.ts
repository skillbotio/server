import * as bodyParser from "body-parser";
import * as express from "express";
import {SkillBotMessage} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";
import {SkillManager} from "./SkillManager";
import {UserSession} from "./UserSession";

export class SkillBotRouter {
    private userSessions: {[id: string]: UserSession} = {};
    private channelSessions: {[id: string]: UserSession} = {};

    public router(): express.Router {
        const router = express.Router();
        router.use(bodyParser.json());
        router.use(bodyParser.urlencoded());

        router.get("/", (request: express.Request, response: express.Response) => {
            response.render("index");
        });

        router.get("/ping", (request: express.Request, response: express.Response) => {
            response.send("hello");
        });

        router.get("/version", (request: express.Request, response: express.Response) => {
            const packageJSON = require("../../package.json");
            response.contentType("text/plain");
            response.send(packageJSON.version);
        });

        router.get("/skills", (request: express.Request, response: express.Response) => {
            if (this.authenticate(request, response)) {
                response.send(JSON.stringify(SkillManager.INSTANCE.skills, null, 2));
            }
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

    private authenticate(request: express.Request, response: express.Response): boolean {
        const apiToken = process.env.API_ACCESS_TOKEN as string;
        if (request.header("x-access-token") !== apiToken) {
            response.status(403);
            response.send("Invalid x-access-token set - required for call.");
            return false;
        }
        return true;
    }

    private process(message: SkillBotMessage): Promise<SkillBotReply> {
        let session;
        // For messages the come in, if there is already an active skill being used in the channel
        //  we associate them with that
        // This allows users to "share" access to a skill
        if (message.channelKey() in this.channelSessions) {
            const channelSession = this.channelSessions[message.channelKey()];
            if (channelSession.isInSkill()) {
                session = channelSession;
            }
        }

        // If no current active skill in the channel, then we use the session associated with the user
        // Or if the user does not have a session, create a new one
        if (!session) {
            if (message.sessionKey() in this.userSessions) {
                session = this.userSessions[message.sessionKey()];
            } else {
                session = new UserSession(message.userID);
                this.userSessions[message.sessionKey()] = session;
                this.channelSessions[message.channelKey()] = session;
            }
        }

        return session.handleMessage(message);
    }
}

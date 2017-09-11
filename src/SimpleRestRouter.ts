import * as bodyParser from "body-parser";
import * as express from "express";
import {MessageHandler} from "./MessageHandler";
import {SkillBotMessage} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";

export class SimpleRestRouter {
    public router(): express.Router {
        const router = express.Router();

        router.use(bodyParser.json());
        router.use(bodyParser.urlencoded());

        router.get("/ping", (request: express.Request, response: express.Response) => {
            response.send("hello");
        });

        router.get("/message", async (request: express.Request, response: express.Response) => {
            // const messageJSON = request.body;
            const userID = request.query.userID;
            const messageString = request.query.message;

            const message = new SkillBotMessage(userID, messageString);
            const reply = await this.handleMessage(message);

            // We respond immediately or we start getting retries
            response.status(200);
            response.send(JSON.stringify(reply));
            console.log("Response sent");
            return;
        });

        return router;
    }

    private handleMessage(message: SkillBotMessage): Promise<SkillBotReply> {
        const handler = new MessageHandler();
        return handler.process(message);
    }
}

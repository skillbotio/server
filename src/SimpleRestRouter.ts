import * as bodyParser from "body-parser";
import * as express from "express";
import {MessageHandler} from "./MessageHandler";
import {SkillBotMessage} from "./SkillBotMessage";

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
            const messageString = request.query.utterance;

            const message = new SkillBotMessage(userID, messageString);
            try {
                const reply = await MessageHandler.Instance().process(message);
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
}

import * as bodyParser from "body-parser";
import * as express from "express";

export class SilentRouter {
    public router(): express.Router {
        const router = express.Router();

        router.use(bodyParser.json());
        router.use(bodyParser.urlencoded());

        router.get("/ping", (request: express.Request, response: express.Response) => {
            response.send("hello");
        });

        router.post("/message", (request: express.Request, response: express.Response) => {
            const message = request.body;

            console.log("Message: " + JSON.stringify(message));
            const silentMessage = new SilentMesage(message);

            // We respond immediately or we start getting retries
            response.status(200);
            response.send({});
            console.log("Response sent");
            return;
        });

        return router;
    }
}
import * as bodyParser from "body-parser";
import * as express from "express";
import * as net from "net";
import {MessageDataStore} from "./MessageDataStore";
import {SkillBotRouter} from "./SkillBotRouter";
import {SkillConfigurationRouter} from "./SkillConfigurationRouter";
import {SkillLoader} from "./SkillLoader";

require("dotenv").config();

export class SkillBotServer {
    private server: net.Server;

    public async start(serverPort: number): Promise<void> {
        const app = express();

        // JSON Parser
        app.use(bodyParser.json());

        // Swagger is the only static for now
        app.use(express.static("static"));

        app.use(new SkillBotRouter().router());

        app.use(new SkillConfigurationRouter().router());

        // This grabs all the skills we know about from the data store
        await SkillLoader.loadAll();

        // Initialize message data store
        MessageDataStore.initialize();

        await new Promise((resolve, reject) => {
            this.server = app.listen(serverPort, () => {
                console.log("SkillBot running on port: " + serverPort);
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.close(() => {
                console.log("SkillBot stopped");
                resolve();
            });
        });
    }
}

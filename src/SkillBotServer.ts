import * as bodyParser from "body-parser";
import * as express from "express";
import * as https from "https";
import * as net from "net";
import {MessageDataStore} from "./MessageDataStore";
import {SkillBotRouter} from "./SkillBotRouter";
import {SkillConfigurationRouter} from "./SkillConfigurationRouter";
import {SkillLoader} from "./SkillLoader";

require("dotenv").config();

export class SkillBotServer {
    private server: net.Server;

    public async start(forceNoSSL: boolean = false): Promise<void> {
        // console.log("CERT:" + process.env.SSL_CERT + " CLIENT: " + process.env.SLACK_CLIENT_ID);
        const serverPort = forceNoSSL || !process.env.SSL_CERT ? 3001 : 443;
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

        if (!forceNoSSL && process.env.SSL_CERT) {
            const cert = process.env.SSL_CERT as string;
            const key = process.env.SSL_KEY as string;

            const credentials = {
                cert: cert.replace(/\\n/g, "\n"),
                key: key.replace(/\\n/g, "\n"),
            };

            this.server = https.createServer(credentials, app);
            await new Promise((resolve, reject) => {
                this.server.listen(serverPort, () => {
                    console.log("SkillBot running on port 443");
                    resolve();
                });
            });
        } else {
            await new Promise((resolve, reject) => {
                this.server = app.listen(serverPort, () => {
                    console.log("SkillBot running on port: " + serverPort);
                    resolve();
                });
            });
        }
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

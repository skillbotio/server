import * as bodyParser from "body-parser";
import * as express from "express";
import * as https from "https";
import * as net from "net";
import {SimpleRestRouter} from "./SimpleRestRouter";
import {SkillConfigurationRouter} from "./SkillConfigurationRouter";
import {SkillLoader} from "./SkillLoader";

require("dotenv").config();

export class SkillBotServer {
    private server: net.Server;

    public async start(): Promise<void> {
        // console.log("CERT:" + process.env.SSL_CERT + " CLIENT: " + process.env.SLACK_CLIENT_ID);
        const serverPort = process.env.SSL_CERT ? 443 : 3001;
        const app = express();

        // JSON Parser
        app.use(bodyParser.json());

        // Swagger is the only static for now
        app.use(express.static("static"));

        app.use(new SimpleRestRouter().router());

        app.use(new SkillConfigurationRouter().router());

        SkillLoader.loadAll();

        if (process.env.SSL_CERT) {
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

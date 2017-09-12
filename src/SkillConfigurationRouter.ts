import * as bodyParser from "body-parser";
import * as express from "express";
import {DataStore} from "./DataStore";
import {ISkillConfiguration} from "./ISkillConfiguration";

export class SkillConfigurationRouter {
    public router(): Promise<express.Router> {
        const router = express.Router();

        router.use(bodyParser.json());
        router.use(bodyParser.urlencoded());

        router.get("/skill/:skillID", async (request: express.Request, response: express.Response) => {
            const secretKey = request.header("secretKey");
            if (!secretKey) {
                response.status(400);
                response.send("Invalid request - must include secretKey as header to validate");
                return;
            }

            const skill = await dataStore.findSkill(request.params.skillID);
            if (!skill) {
                response.status(404);
                response.send("Skill not found: " + request.params.skillID);
                return;
            } else if (skill.secretKey !== secretKey) {
                response.status(403);
                response.send("Invalid request - secretKey does not match for skill");
                return;
            }

            response.json(skill);
        });

        router.post("/skill", async (request: express.Request, response: express.Response) => {
            const skillJSON: ISkillConfiguration = request.body;
            try {
                const sourceID = skillJSON.sourceID;
                const source = await dataStore.findSource(sourceID);
                const secretKey = skillJSON.secretKey;

                if (!source) {
                    return this.notOkay(response, 404, "Skill not found: " + request.params.skillID);
                } else if (source.secretKey !== secretKey) {
                    return this.notOkay(response, 403, "Invalid request - secretKey does not match for skill");
                }
                if (!sourceID || !secretKey) {
                    return this.notOkay(response, 404,
                        "Invalid request - must include sourceID and secretKey of source to associate with");
                }

                await dataStore.saveSkill(skillJSON);
                // Just send a 200 if this saves
                response.status(200);
                response.send();
            } catch (e) {
                return this.notOkay(response, 500, e.toString());
            }
        });

        const dataStore = new DataStore();
        return new Promise((resolve) => {
            dataStore.initialize();
            resolve(router);
        });
    }

    private notOkay(response: express.Response, statusCode: number, message: string): void {
        response.status(404);
        response.send("Invalid request - must include sourceID and secretKey of source to associate with");
        return;
    }
}

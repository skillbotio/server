import * as bodyParser from "body-parser";
import * as express from "express";
import {ISkillConfiguration} from "./ISkillConfiguration";
import {SkillDataStore} from "./SkillDataStore";

export class SkillConfigurationRouter {
    public router(): express.Router {
        const router = express.Router();

        router.use(bodyParser.json());

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

        router.get("/skill", async (request: express.Request, response: express.Response) => {
            const token = request.header("x-access-token");
            if (token !== process.env.API_ACCESS_TOKEN) {
                response.status(400);
                response.send("Invalid request - must include secretKey as header to validate");
                return;
            }

            const skills = await dataStore.findSkills();
            response.json(skills);
        });

        router.post("/skill", async (request: express.Request, response: express.Response) => {
            const skillJSON: ISkillConfiguration = request.body;
            try {
                const sourceID = skillJSON.sourceID;
                const source = await dataStore.findSource(sourceID);
                const secretKey = skillJSON.secretKey;

                if (!source) {
                    return this.notOkay(response, 404, "Source not found: " + request.params.sourceID);
                } else if (source.secretKey !== secretKey) {
                    return this.notOkay(response, 403, "Invalid request - secretKey does not match for skill");
                }

                await dataStore.saveSkill(skillJSON);
                // Just send a 200 if this saves
                response.status(200);
                response.send();
            } catch (e) {
                return this.notOkay(response, 500, e.toString());
            }
        });

        const dataStore = new SkillDataStore();
        dataStore.initialize();
        return router;
    }

    private notOkay(response: express.Response, statusCode: number, message: string): void {
        response.status(statusCode);
        response.send(message);
        return;
    }
}

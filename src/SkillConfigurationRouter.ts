import * as bodyParser from "body-parser";
import * as express from "express";
import {ISkillConfiguration} from "./ISkillConfiguration";
import {SkillDataStore} from "./SkillDataStore";
import {SkillManager} from "./SkillManager";
import {ExternalConfiguration} from "./ExternalConfiguration";

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

        router.post("/skill", async (request: express.Request, response: express.Response) => {
            const skillJSON: ISkillConfiguration = request.body;
            try {
                const skillID = skillJSON.id;
                const skill = await dataStore.findSkill(skillID);

                if (skill) {
                    skillJSON.secretKey = skill.secretKey;
                    skillJSON.sourceID = skill.sourceID;
                } else {
                    await ExternalConfiguration.configure(skillJSON);
                }

                await dataStore.saveSkill(skillJSON);

                // Refresh the cache for this skill
                SkillManager.INSTANCE.put(skillJSON);

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

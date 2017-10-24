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
            const skill = await dataStore.findSkill(request.params.skillID);
            if (!skill) {
                response.status(404);
                response.send("Skill not found: " + request.params.skillID);
                return;
            }

            response.json(skill);
        });

        router.post("/skill", async (request: express.Request, response: express.Response) => {
            const skillJSON: ISkillConfiguration = request.body;
            try {
                console.log("POSTING Skill: " + skillJSON.id + " Name: " + skillJSON.name);
                const skillID = skillJSON.id;
                const skill = await dataStore.findSkill(skillID);

                console.log("POSTING Skill: " + skillJSON.id
                    + " Name: " + skillJSON.name
                    + " Exists: " + (skill !== undefined));
                if (skill) {
                    skillJSON.secretKey = skill.secretKey;
                    skillJSON.sourceID = skill.sourceID;
                } else {
                    await ExternalConfiguration.configure(skillJSON);
                }

                await dataStore.saveSkill(skillJSON);

                // Refresh the cache for this skill
                SkillManager.INSTANCE.put(skillJSON);

                console.log("POSTING Skill: " + skillJSON.id + " Name: " + skillJSON.name + " Saved");

                // Just send a 200 if this saves
                response.status(200);
                response.send();
            } catch (e) {
                console.error(e);
                return this.notOkay(response, 500, e.toString());
            }
        });

        const dataStore = new SkillDataStore();
        return router;
    }

    private notOkay(response: express.Response, statusCode: number, message: string): void {
        response.status(statusCode);
        response.send(message);
        return;
    }
}

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
            const skill = await dataStore.findSkill(request.params.skillID);
            response.json(skill);
        });

        router.post("/skill", async (request: express.Request, response: express.Response) => {
            const skillJSON: ISkillConfiguration = request.body;
            try {
                await dataStore.saveSkill(skillJSON);
                // Just send a 200 if this saves
                response.status(200);
                response.send();
            } catch (e) {
                response.status(500);
                response.send(e.toString());
            }


        });

        const dataStore = new DataStore();
        return new Promise((resolve) => {
            dataStore.initialize();
            resolve(router);
        });
    }
}

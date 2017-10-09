import * as fs from "fs";
import * as path from "path";
import {ISkillConfiguration} from "./ISkillConfiguration";
import {SkillDataStore} from "./SkillDataStore";
import {SkillManager} from "./SkillManager";

export class SkillLoader {

    public static async loadAll(): Promise<void> {
        const ds = new SkillDataStore().initialize();
        const skills: {[id: string]: ISkillConfiguration} = await ds.findSkills();
        for (const skillName of Object.keys(skills)) {
            SkillManager.INSTANCE.put(skills[skillName]);
        }
    }

    public load(directory: string): ISkillConfiguration {
        const modelFile = path.join(directory, "IntentSchema.json");
        const utterancesFile = path.join(directory, "SampleUtterances.txt");
        const skill: ISkillConfiguration = {
            id: "WeStudyBillionaires",
            intentSchema: fs.readFileSync(modelFile).toString(),
            invocationName: "We Study Billionaires",
            name: "We Study Billionaires",
            sampleUtterances: fs.readFileSync(utterancesFile).toString(),
            secretKey: "DummySecretKey",
            sourceID: "DummySourceID",
            url: "https://streamer.bespoken.link",
        };

        return skill;
    }
}
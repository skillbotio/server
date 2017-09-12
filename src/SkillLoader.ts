import * as fs from "fs";
import * as path from "path";
import {ISkillConfiguration} from "./ISkillConfiguration";

const directories = ["/Users/jpk/dev/streamer/speechAssets"];

export class SkillLoader {

    public loadAll(): ISkillConfiguration[] {
        const skills = [];
        for (const directory of directories) {
            skills.push(this.load(directory));
        }
        return skills;
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
import * as fs from "fs";
import * as path from "path";
import {Skill} from "./Skill";

const directories = ["/Users/jpk/dev/streamer/speechAssets"];

export class SkillLoader {

    public loadAll(): Skill[] {
        const skills = [];
        for (const directory of directories) {
            skills.push(this.load(directory));
        }
        return skills;
    }

    public load(directory: string): Skill {
        const modelFile = path.join(directory, "IntentSchema.json");
        const utterancesFile = path.join(directory, "SampleUtterances.txt");
        const skill = new Skill();
        skill.intentSchema = fs.readFileSync(modelFile).toString();
        skill.utterances = fs.readFileSync(utterancesFile).toString();
        skill.invocationName = "We Study Billionaires";
        skill.url = "https://streamer.bespoken.link";
        return skill;
    }
}
import {ISkillConfiguration} from "./ISkillConfiguration";

const AWSCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: "us-east-1",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

export class DataStore {
    public dynasty: any;
    public constructor() {
        this.dynasty = require("dynasty")(AWSCredentials);
    }

    public initialize(): Promise<DataStore> {
        return this.dynasty.describe("Skills").then(() => {
            return this;
        }).catch((error: any) => {
            return this.dynasty.create("Skills", { key_schema: { hash: ["id", "string"] } }).then(() => {
                return this;
            });
        });
    }

    public saveSkill(skill: ISkillConfiguration): Promise<void> {
        return this.skills().insert(skill);
    }

    public findSkill(id: string): Promise<ISkillConfiguration | undefined> {
        return this.skills().find(id);
    }

    private skills(): any {
        return this.dynasty.table("Skills");
    }
}

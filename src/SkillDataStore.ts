import {ISkillConfiguration} from "./ISkillConfiguration";

export class SkillDataStore {
    private static admin: any;
    private database: any;

    public constructor() {
        // admin is a static variable that is only mean to be initialized once
        // If we configure it more than once, we get an error
        if (!SkillDataStore.admin) {
            SkillDataStore.admin = require("firebase-admin");
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            let privateKey = process.env.FIREBASE_PRIVATE_KEY as string;
            const databaseURL = process.env.FIREBASE_DATABASE_URL;

            privateKey = privateKey.replace(/\\n/g, "\n");

            SkillDataStore.admin.initializeApp({
                credential: SkillDataStore.admin.credential.cert({
                    clientEmail,
                    privateKey,
                    projectId,
                }),
                databaseURL,
            });
        }
    }

    public initialize(): SkillDataStore {
        this.database = SkillDataStore.admin.database();
        return this;
    }

    public saveSkill(skill: ISkillConfiguration): Promise<void> {
        return this.database.ref("skills/" + skill.id).set(skill);
    }

    public findSkill(id: string): Promise<ISkillConfiguration | undefined> {
        return this.database.ref("skills/" + id).once("value").then((snapshot: any) => {
            if (snapshot.val()) {
                return Promise.resolve(snapshot.val());
            } else {
                return Promise.resolve(undefined);
            }
        });
    }

    public findSkills(): Promise<{[id: string]: ISkillConfiguration}> {
        return this.database.ref("skills").once("value").then((snapshot: any) => {
            if (snapshot.val()) {
                return Promise.resolve(snapshot.val());
            } else {
                return Promise.resolve(undefined);
            }
        });
    }

    public findSource(id: string): Promise<any | undefined> {
        return this.database.ref("sources/" + id).once("value").then((snapshot: any) => {
            if (snapshot.val()) {
                return Promise.resolve(snapshot.val());
            } else {
                return Promise.resolve(undefined);
            }
        });
    }
}

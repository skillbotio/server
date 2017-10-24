import * as request from "request-promise-native";
import {ISkillConfiguration} from "./ISkillConfiguration";

export class ExternalConfiguration {
    // Configures a skill with the Bespoken Spoke and Source if it does not already exist
    public static async configure(skillbotConfig: ISkillConfiguration) {
        await this.createSource(skillbotConfig);
        // Create a pipe if this is a lambda
        if (skillbotConfig.lambdaARN) {
            await ExternalConfiguration.createPipe(skillbotConfig);
        }
    }

    private static async createSource(skillbotConfig: ISkillConfiguration): Promise<void> {
        console.log("Fetch source: " + skillbotConfig.id);
        const source = await request.get({
            json: true,
            uri: "https://source-api.bespoken.tools/v1/sourceId",
        });

        const sourceBody: any = {
            source: {
                id: source.id,
                liveDebug: false,
                name: skillbotConfig.name,
                secretKey: source.secretKey,
            },
        };

        skillbotConfig.sourceID = source.id;
        skillbotConfig.secretKey = source.secretKey;

        const options = {
            body: sourceBody,
            headers: {},
            json: true,
            timeout: 10000,
            uri: "https://source-api.bespoken.tools/v1/createSource",
        };

        console.log("Assign source: " + skillbotConfig.id + " source: " + skillbotConfig.sourceID);
        try {
            await request.post(options);
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }
    }

    private static async createPipe(skillbotConfig: ISkillConfiguration): Promise<any> {
        const options: any = {
            body: {
                // The secret key for the Skill
                diagnosticsKey: null,
                endPoint: {
                    // The unique name/ID for the skill
                    name: skillbotConfig.sourceID,
                },
                path: "/",
                proxy: false,
                uuid: skillbotConfig.secretKey,
            },
            headers: {
                "x-access-token": "4772616365-46696f72656c6c61",
            },
            json: true, // Automatically parses the JSON string in the response
            timeout: 30000,
            uri: "https://api.bespoken.link/pipe",
        };

        if (skillbotConfig.url) {
            options.body.http = {
                url: skillbotConfig.url,
            };
            options.body.pipeType = "HTTP";
        } else {
            const aws = skillbotConfig.aws as any;
            options.body.lambda = {
                awsAccessKeyId: aws.accessKeyId,
                awsSecretAccessKey: aws.secretAccessKey,
                lambdaARN: skillbotConfig.lambdaARN,
                region: aws.region,
            };
            options.body.pipeType = "LAMBDA";
        }

        return await request.post(options);
    }
}

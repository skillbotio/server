export interface ISkillConfiguration {
    aws?: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
    id: string;
    imageURL?: string;
    intentSchema?: any;
    interactionModel?: any;
    invocationName: string;
    lambdaARN?: string;
    name: string;
    sampleUtterances?: any;
    secretKey: string;
    sourceID: string;
    url: string;
}

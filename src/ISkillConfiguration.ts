export interface ISkillConfiguration {
    id: string;
    name: string;
    invocationName: string;
    url: string;
    intentSchema?: any;
    interactionModel?: any;
    sampleUtterances?: any;
}

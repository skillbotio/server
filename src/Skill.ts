export class Skill {
    public name: string;
    public invocationName: string;
    public url: string;
    public interactionModel: string;
    public utterances: string;

    public id(): string {
        return this.name;
    }
}

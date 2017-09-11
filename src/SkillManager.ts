import {ISkillConfiguration} from "./ISkillConfiguration";

export class SkillManager {
    public static Instance = new SkillManager();
    public skills: {[invocationName: string]: ISkillConfiguration} = {};

    public get(invocationName: string): ISkillConfiguration | undefined {
        let skill;
        if (invocationName.toLowerCase() in this.skills) {
           skill = this.skills[invocationName];
        }
        return skill;
    }

    public put(skill: ISkillConfiguration) {
        skill.invocationName = skill.invocationName.toLowerCase();
        this.skills[skill.invocationName] = skill;
    }
}

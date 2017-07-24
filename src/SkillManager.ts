import {Skill} from "./Skill";

export class SkillManager {
    public static Instance = new SkillManager();
    public skills: {[invocationName: string]: Skill} = {};

    public get(invocationName: string): Skill | undefined {
        let skill;
        if (invocationName.toLowerCase() in this.skills) {
           skill = this.skills[invocationName];
        }
        return skill;
    }

    public put(skill: Skill) {
        skill.invocationName = skill.invocationName.toLowerCase();
        this.skills[skill.invocationName] = skill;
    }
}

import {Skill} from "./Skill";
import {SkillManager} from "./SkillManager";

export class SilentMessage {
    public skill: Skill;
    public skillMessage: string;

    public constructor(public fullMessage: string) {
        this.parse();
    }

    public parse(): void {
        const regex = new RegExp("(ask|tell|open)\\s(.*)");
        const matchArray = this.fullMessage.match(regex);
        if (matchArray) {
            const m = matchArray[2];
            const words = m.split(" ");
            for (let i = 1; i < words.length; i++) {
                const phrase = words.slice(0, i).join(" ");
                console.log("Phrase: " + phrase);
                const skill = SkillManager.Instance.get(phrase);
                if (skill) {
                    this.skill = skill;
                    this.skillMessage = words.slice(i).join(" ");
                    break;
                }
            }
        }
    }
}

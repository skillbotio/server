import {Skill} from "./Skill";
import {SkillManager} from "./SkillManager";

export class SilentMessage {
    public skillAddress: string;
    public skill: Skill;
    public skillMessage: string;

    public constructor(public userID: string, public fullMessage: string) {
        this.fullMessage = fullMessage.toLowerCase();
        this.parse();
    }

    public parse(): void {
        const regex = new RegExp("(ask|tell|open|launch)\\s(.*)");
        const matchArray = this.fullMessage.match(regex);
        if (matchArray) {
            this.skillAddress = matchArray[1];
            const skillMessage = matchArray[2];
            const words = skillMessage.split(" ");
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

        if (this.skillMessage) {
            this.skillMessage = this.cleanSkillMessage(this.skillMessage);
        }
    }

    public isForSkill() {
        return this.skill;
    }

    public isLaunch() {
        let launch = false;
        if (this.skillAddress) {
            if (this.skillAddress === "open" || this.skillAddress === "launch") {
                launch = true;
            }
        }
        return launch;
    }

    private cleanSkillMessage(message: string): string {
        if (message.startsWith("to ")) {
            message = message.replace("to ", "");
        }
        return message;
    }
}

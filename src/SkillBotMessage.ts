import {SkillManager} from "./SkillManager";
import {ISkillConfiguration} from "./ISkillConfiguration";

export class SkillBotMessage {
    public skillUtterance?: SkillUtterance;

    public constructor(public userID: string, public fullMessage: string) {
        this.fullMessage = fullMessage.toLowerCase();
        this.parse();
    }

    public isForSkill(): boolean {
        return (this.skillUtterance !== undefined);
    }

    private parse(): void {
        const regex = new RegExp("(ask|tell|open|launch)\\s(.*)");
        const matchArray = this.fullMessage.match(regex);
        if (matchArray) {
            let skillUtterance;
            let skill;
            const skillAddress = matchArray[1];
            const skillNamePlusUtterance = matchArray[2];
            const words = skillNamePlusUtterance.split(" ");
            // Try to figure out which part is the skill and which is the message to the skill
            for (let i = 0; i < words.length; i++) {
                const phrase = words.slice(0, i + 1).join(" ");
                console.log("Phrase: " + phrase);
                skill = SkillManager.Instance.get(phrase);

                // If we match a registered skill name, we assume that is what we want to use
                if (skill) {
                    const utteranceString = words.slice(i + 1).join(" ");
                    skillUtterance = new SkillUtterance(skill, skillAddress, utteranceString);
                    break;
                }
            }

            if (skill) {
                this.skillUtterance = skillUtterance;
            } else {
                throw new Error("No matching skill for call: " + this.fullMessage);
            }
        }
    }
}

export class SkillUtterance {
    public utterance: string;
    public constructor(public skill: ISkillConfiguration, public skillAddress: string, public rawUtterance: string) {
        this.utterance = this.cleanSkillUtterance(this.rawUtterance);
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

    public cleanSkillUtterance(utterance: string): string {
        if (utterance.startsWith("to ")) {
            utterance = utterance.replace("to ", "");
        }
        return utterance;
    }
}

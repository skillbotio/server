import {VirtualAlexa} from "virtual-alexa";
import {SkillBotMessage, SkillUtterance} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";

export class UserSession {
    private enginesByID: {[id: string]: VirtualAlexa} = {};

    public constructor(private userID: string) {}

    public handleMessage(message: SkillBotMessage): Promise<SkillBotReply> {
        if (message.isForSkill()) {
            const alexa = this.virtualAlexa(message.skillUtterance as SkillUtterance);
            alexa.context().setUserID(this.userID);
            return this.invokeSkill(alexa, message);
        } else {
            return Promise.resolve(new SkillBotReply(message, "No reply for this message"));
        }
    }

    private async invokeSkill(alexa: VirtualAlexa, message: SkillBotMessage): Promise<SkillBotReply> {
        const skillUtterance = message.skillUtterance as SkillUtterance;
        const json = skillUtterance.isLaunch()
            ? await alexa.launch()
            : await alexa.utter(skillUtterance.utterance);

        return SkillBotReply.alexaResponseToReply(message, json);
    }

    private virtualAlexa(skillUtterance: SkillUtterance) {
        let alexa = this.enginesByID[skillUtterance.skill.id];
        if (!alexa) {
            const builder = VirtualAlexa.Builder();
            if (skillUtterance.skill.interactionModel) {
                builder.interactionModel(skillUtterance.skill.interactionModel);
            } else {
                builder.intentSchema(skillUtterance.skill.intentSchema);
                builder.sampleUtterances(skillUtterance.skill.sampleUtterances);
            }

            builder.skillURL(skillUtterance.skill.url);
            alexa = builder.create();

            this.enginesByID[skillUtterance.skill.id] = alexa;
        }
        return alexa;
    }

}
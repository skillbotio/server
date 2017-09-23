import {VirtualAlexa} from "virtual-alexa";
import {ISkillConfiguration} from "./ISkillConfiguration";
import {IMessage, MessageDataStore} from "./MessageDataStore";
import {SkillBotMessage, SkillUtterance} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";
import {SkillManager} from "./SkillManager";

export class UserSession {
    private activeSkill?: VirtualAlexa;
    private dataStore: MessageDataStore;
    private defaultSkill: VirtualAlexa;

    public constructor(private userID: string) {
        // We instantiate a default skill for each user
        // This handles everything not directed at a specific skill
        const skill = SkillManager.Instance.get("Skillbot Default") as ISkillConfiguration;
        this.dataStore = new MessageDataStore();
        if (skill) {
            this.defaultSkill = VirtualAlexa.Builder()
                .interactionModel(skill.interactionModel as any)
                .skillURL(skill.url as string).create();
        }
    }

    public handleMessage(message: SkillBotMessage): Promise<SkillBotReply> {
        if (message.isForSkill()) {
            const alexa = this.virtualAlexa(message);
            alexa.context().setUserID(this.userID);
            return this.invokeSkill(alexa, message);

        } else if (this.activeSkill) {
            return this.invokeSkill(this.activeSkill, message);

        } else if (this.defaultSkill) {
            return this.invokeSkill(this.defaultSkill, message, true);

        } else {
            throw new Error("This should not happen - no default configured and no matching skill");
        }
    }

    private async invokeSkill(alexa: VirtualAlexa,
                              message: SkillBotMessage,
                              defaulted = false): Promise<SkillBotReply> {
        const user: any = await this.dataStore.findUserByID(message.source, message.userID);
        let onboarding = false;
        if (!user || !user.attributes || !user.attributes.postalCode) {
            onboarding = true;
        }

        let reply;
        // Set a filter on the VirtualAlexa instance to set data that is useful
        alexa.filter((request) => {
            // We add a skillBot object to the request, with the source set on it
            request.skillbot = {
                source: message.source,
            };

            if (onboarding) {
                request.skillbot.onboarding = true;
            }
        });

        if (message.isForSkill()) {
            const skillUtterance = message.skillUtterance as SkillUtterance;
            const json = skillUtterance.isLaunch()
                ? await alexa.launch()
                : await alexa.utter(skillUtterance.utterance);
            reply = SkillBotReply.alexaResponseToReply(message, json);

        } else if (!defaulted && message.isEndSession()) {
            // We do not wait on an end session - no reply is allowed
            alexa.endSession();
            reply = SkillBotReply.sessionEnded(message);

        } else {
            const json = await alexa.utter(message.fullMessage);
            reply = SkillBotReply.alexaResponseToReply(message, json);

        }

        if (reply.sessionEnded) {
            this.activeSkill = undefined;
        }

        // Save the message - we do this async
        this.saveMessage(message, reply).then(() => {
            console.log("Message saved");
        });

        // Save the user - we do async
        // Either inserts or updates the user, with attributes from payload
        this.saveUser(user, message, reply).then(() =>  {
            console.log("Saved user");
        });

        return reply;
    }

    private saveMessage(message: SkillBotMessage, reply: any): Promise<IMessage> {
        const messageModel: any = {
            message: message.fullMessage,
            reply,
            source: message.source,
            userID: message.userID,
        };
        return this.dataStore.saveMessage(messageModel);
    }

    // Check if the skill returns data we want to save with the user
    //  We automatically store any data coming back on sessionAttributes.user in the response
    private async saveUser(user: any, message: SkillBotMessage, reply: any): Promise<void> {
        if (!user) {
            user = {
                attributes: {},
                source: message.source,
                userID: message.userID,
            } as any;
        }

        // If we have the reply JSON
        if (reply.raw) {
            const sessionAttributes = reply.raw.sessionAttributes;
            if (sessionAttributes && sessionAttributes.user) {
                const userData = sessionAttributes.user;
                for (const userAttribute of Object.keys(userData)) {
                    const value = userData[userAttribute];
                    user.attributes[userAttribute] = value;
                }
            }
        }

        // We do not wait on the actual save user call
        await this.dataStore.saveUser(user);
        return Promise.resolve();
    }

    private virtualAlexa(message: SkillBotMessage): VirtualAlexa {
        const skillUtterance = message.skillUtterance as SkillUtterance;

        // If we don't have an active skill, or this is a new skill that has been invoked,
        //  we creata new emulator
        if (!this.activeSkill || (this.activeSkill as any).id !== skillUtterance.skill.id) {
            const builder = VirtualAlexa.Builder();
            if (skillUtterance.skill.interactionModel) {
                builder.interactionModel(skillUtterance.skill.interactionModel);
            } else {
                builder.intentSchema(skillUtterance.skill.intentSchema);
                builder.sampleUtterances(skillUtterance.skill.sampleUtterances);
            }

            builder.skillURL(skillUtterance.skill.url);
            this.activeSkill = builder.create();

            // We store the skill ID on the emulator for convenience
            (this.activeSkill as any).id = skillUtterance.skill.id;
        }
        return this.activeSkill;
    }
}

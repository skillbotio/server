import {VirtualAlexa} from "virtual-alexa";
import {ISkillConfiguration} from "./ISkillConfiguration";
import {IMessage, IUser, MessageDataStore} from "./MessageDataStore";
import {SkillBotMessage, SkillUtterance} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";
import {SkillManager} from "./SkillManager";

export class UserSession {
    private _activeSkill?: SkillHolder;
    private dataStore: MessageDataStore;
    private defaultSkill: SkillHolder;

    public constructor(private userID: string) {
        // We instantiate a default skill for each user
        // This handles everything not directed at a specific skill
        const skill = SkillManager.Instance.get("Skillbot Default") as ISkillConfiguration;
        this.dataStore = new MessageDataStore();
        if (skill) {
            const defaultAlexa = VirtualAlexa.Builder()
                .interactionModel(skill.interactionModel as any)
                .skillURL(skill.url as string).create();
            this.defaultSkill = new SkillHolder(skill, defaultAlexa);
        }
    }

    public async handleMessage(message: SkillBotMessage): Promise<SkillBotReply> {
        const user: any = await this.dataStore.findUserByID(message.source, message.userID);

        let skillbotReply;
        if (this.onboarding(user)) {
            // If we are onboarding
            this.applyFilter(user, message, this.defaultSkill);
            const json = await this.defaultSkill.virtualAlexa.utter(message.fullMessage);
            skillbotReply = SkillBotReply.alexaResponseToReply(this.defaultSkill.skill, message, json);

        } else if (message.addressesSkill()) {
            // If this message explicitly addresses a skill
            const skill = this.activeSkill(message);
            this.applyFilter(user, message, skill);

            const skillUtterance = message.skillUtterance as SkillUtterance;
            const json = skillUtterance.isLaunch()
                ? await skill.virtualAlexa.launch()
                : await skill.virtualAlexa.utter(skillUtterance.utterance);

            skillbotReply = SkillBotReply.alexaResponseToReply(skill.skill, message, json);

        } else if (this._activeSkill) {
            // If we already have an active skill
            this.applyFilter(user, message, this._activeSkill);
            if (message.isEndSession()) {
                const json = await this._activeSkill.virtualAlexa.endSession();
                skillbotReply = SkillBotReply.sessionEnded(this._activeSkill.skill, json);
            } else {
                const json = await this._activeSkill.virtualAlexa.utter(message.fullMessage);
                skillbotReply = SkillBotReply.alexaResponseToReply(this._activeSkill.skill, message, json);
            }

        } else {
            // Otherwise just just send this to the default skill
            this.applyFilter(user, message, this.defaultSkill);
            const json = await this.defaultSkill.virtualAlexa.utter(message.fullMessage);
            skillbotReply = SkillBotReply.alexaResponseToReply(this.defaultSkill.skill, message, json);
        }

        if (skillbotReply.sessionEnded) {
            this._activeSkill = undefined;
        }

        skillbotReply.user = user;

        // Save the message - we do this async
        this.saveMessage(message, skillbotReply).then(() => {
            console.log("Message saved");
        });

        // Save the user - we do async
        // Either inserts or updates the user, with attributes from payload
        this.saveUser(user, message, skillbotReply).then(() =>  {
            console.log("Saved user");
        });

        return skillbotReply;
    }

    private applyFilter(user: IUser, message: SkillBotMessage, skill: SkillHolder) {
        // Make sure the user ID is set
        skill.virtualAlexa.context().setUserID(this.userID);

        // Set a filter on the VirtualAlexa instance to set data that is useful
        skill.virtualAlexa.filter((request) => {
            // For debugging - print out the request
            console.log("Alexa Request: " + JSON.stringify(request, null, 2));

            // Capture the request on the message
            message.rawJSON = request;

            // We add a skillBot object to the request, with the source set on it
            request.skillbot = {
                source: message.source,
            };

            if (user && user.attributes) {
                if (user.attributes.postalCode) {
                    request.skillbot.postalCode = user.attributes.postalCode;
                }

                if (user.attributes && user.attributes.country) {
                    request.skillbot.countryCode = user.attributes.country;
                }
            }

            if (this.onboarding(user)) {
                request.skillbot.onboarding = true;
            }
        });
    }

    private onboarding(user: IUser): boolean {
        return !user || !user.attributes || !user.attributes.postalCode;
    }

    private saveMessage(message: SkillBotMessage, reply: any): Promise<IMessage> {
        const messageModel: any = {
            channel: message.channel,
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
            const sessionAttributes = reply.raw.response.sessionAttributes;
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

    private activeSkill(message: SkillBotMessage): SkillHolder {
        const skillUtterance = message.skillUtterance as SkillUtterance;

        // If we don't have an active skill, or this is a new skill that has been invoked,
        //  we creata new emulator
        if (!this._activeSkill || this._activeSkill.skill.id !== skillUtterance.skill.id) {
            const builder = VirtualAlexa.Builder();
            if (skillUtterance.skill.interactionModel) {
                builder.interactionModel(skillUtterance.skill.interactionModel);
            } else {
                builder.intentSchema(skillUtterance.skill.intentSchema);
                builder.sampleUtterances(skillUtterance.skill.sampleUtterances);
            }

            builder.skillURL(skillUtterance.skill.url);
            this._activeSkill = new SkillHolder(skillUtterance.skill, builder.create());
        }

        return this._activeSkill;
    }
}

export class SkillHolder {
    public constructor(public skill: ISkillConfiguration, public virtualAlexa: VirtualAlexa) {}
}

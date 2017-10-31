import {ISkillConfiguration} from "./ISkillConfiguration";
import {SkillBotMessage} from "./SkillBotMessage";
import {IUser} from "./MessageDataStore";

export class SkillBotReply {
    public static alexaResponseToReply(skill: ISkillConfiguration,
                                       message: SkillBotMessage,
                                       replyJSON: any): SkillBotReply {
        console.log("Alexa Response: " + JSON.stringify(replyJSON, null, 2));
        const reply = new SkillBotReply();
        if (replyJSON.response) {
            const outputSpeech = replyJSON.response.outputSpeech;
            let isAudio = false;
            if (outputSpeech) {
                if (outputSpeech.type === "PlainText") {
                    reply.text = outputSpeech.text;
                } else if (outputSpeech.type === "SSML") {
                    reply.text = SkillBotReply.cleanSSML(outputSpeech.ssml);
                    isAudio = true;
                }
            }

            const card = replyJSON.response.card;
            if (card) {
                reply.card = {};
                reply.card.title = card.title;
                // If the reply is audio, we prefer the card text if available
                // Then no need for text-to-speech
                if (isAudio) {
                    if (card.content) {
                        reply.card.content = card.content;
                    } else if (card.text) {
                        reply.card.content = card.text;
                    }
                }

                if (card.image) {
                    if (card.image.largeImageUrl) {
                        reply.card.imageURL = card.image.largeImageUrl;
                    } else if (card.smallImageUrl) {
                        reply.card.imageURL = card.image.smallImageUrl;
                    }
                }
            }

            if (replyJSON.response.directives) {
                const directive = replyJSON.response.directives[0];
                if (directive.type === "AudioPlayer.Play") {
                    reply.streamURL = directive.audioItem.stream.url;
                }
            }

            if (replyJSON.response.shouldEndSession) {
                reply.sessionEnded = true;
            }
        }

        if (skill) {
            reply.skill = {
                id: skill.id,
                imageURL: skill.imageURL,
                name: skill.name,
            };
        }

        reply.raw = {
            request: message.rawJSON,
            response: replyJSON,
        };
        return reply;
    }

    public static sessionEnded(skill: ISkillConfiguration, message: SkillBotMessage) {
        const reply = new SkillBotReply();

        reply.skill = {
            id: skill.id,
            imageURL: skill.imageURL,
            name: skill.name,
        };

        reply.sessionEnded = true;
        reply.text = "Goodbye!";
        return reply;
    }

    public static error(errorMessage: string) {
        const reply = new SkillBotReply();
        reply.text = errorMessage;
        return reply;
    }

    private static cleanSSML(ssml: string): string {
        const index = ssml.indexOf("<");
        if (index !== -1) {
            const endIndex = ssml.indexOf(">");
            const firstPart = ssml.substring(0, index);
            const secondPart = ssml.substring(endIndex + 1);
            ssml = firstPart + SkillBotReply.cleanSSML(secondPart);
        }
        return ssml.trim();
    }

    public card?: ISkillBotCard;
    public raw: {
        request: any;
        response: any;
    };
    public sessionEnded: boolean = false;
    public skill?: {
        id: string;
        name: string;
        imageURL?: string;
    };
    public streamURL: string;
    public user: IUser;

    public constructor(public text?: string) {}

}

export interface ISkillBotCard {
    content?: string;
    imageURL?: string;
    subTitle?: string;
    title?: string;
}

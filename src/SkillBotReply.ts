import {ISkillConfiguration} from "./ISkillConfiguration";
import {SkillBotMessage} from "./SkillBotMessage";

export class SkillBotReply {
    public static alexaResponseToReply(skill: ISkillConfiguration,
                                       message: SkillBotMessage,
                                       replyJSON: any): SkillBotReply {
        console.log("Alexa Response: " + JSON.stringify(replyJSON, null, 2));
        const reply = new SkillBotReply(message);
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
                imageURL: skill.imageURL,
                name: skill.name,
            };
        }

        reply.raw = replyJSON;
        return reply;
    }

    public static sessionEnded(message: SkillBotMessage) {
        const reply = new SkillBotReply(message);
        reply.sessionEnded = true;
        reply.text = "Goodbye!";
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

    public sessionEnded: boolean = false;
    public card?: ISkillBotCard;
    public raw: any;
    public skill?: {
        name: string;
        imageURL?: string;
    };
    public streamURL: string;
    public text: string;

    public constructor(public message: SkillBotMessage, text?: string) {}

}

export interface ISkillBotCard {
    content?: string;
    imageURL?: string;
    subTitle?: string;
    title?: string;
}

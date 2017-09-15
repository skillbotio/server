import {SkillBotMessage} from "./SkillBotMessage";

export class SkillBotReply {
    public static alexaResponseToReply(message: SkillBotMessage, response: any): SkillBotReply {
        const reply = new SkillBotReply(message);
        const outputSpeech = response.response && response.response.outputSpeech;
        let isAudio = false;
        if (outputSpeech) {
            if (outputSpeech.type === "PlainText") {
                reply.text = outputSpeech.text;
            } else if (outputSpeech.type === "SSML") {
                reply.text = SkillBotReply.cleanSSML(outputSpeech.ssml);
                isAudio = true;
            }
        }

        const card = response.response && response.response.card;
        if (card) {
            reply.title = card.title;
            // If the reply is audio, we prefer the card text if available
            // Then no need for text-to-speech
            if (isAudio) {
                if (card.content) {
                    reply.text = card.content;
                } else if (card.text) {
                    reply.text = card.text;
                }
            }

            if (card.image) {
                if (card.largeImageUrl) {
                    reply.imageURL = card.image.largeImageUrl;
                } else if (card.smallImageUrl) {
                    reply.imageURL = card.image.smallImageUrl;
                }
            }
        }

        if (response.response.directives) {
            const directive = response.response.directives[0];
            if (directive.type === "AudioPlayer.Play") {
                reply.streamURL = directive.audioItem.stream.url;
            }
        }

        reply.raw = response;
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

    public imageURL: string;
    public raw: any;
    public streamURL: string;
    public subTitle: string;
    public text: string;
    public title: string;

    public constructor(public message: SkillBotMessage, text?: string) {}

}

import {SilentMessage} from "./SilentMessage";

export class SilentReply {
    public static alexaResponseToReply(message: SilentMessage, response: any): SilentReply {
        const reply = new SilentReply(message);
        const outputSpeech = response.response && response.response.outputSpeech;
        let isAudio = false;
        if (outputSpeech) {
            if (outputSpeech.type === "PlainText") {
                reply.text = outputSpeech.text;
            } else if (outputSpeech.type === "SSML") {
                reply.text = SilentReply.cleanSSML(outputSpeech.ssml);
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
        return reply;
    }

    private static cleanSSML(ssml: string): string {
        return ssml;
    }

    public imageURL: string;
    public subTitle: string;
    public text: string;
    public title: string;

    public constructor(public message: SilentMessage, text?: string) {}

}

import {VirtualAlexa} from "virtual-alexa";
import {SilentMessage} from "./SilentMessage";
import {SilentReply} from "./SilentReply";

export class Skill {
    public name: string;
    public invocationName: string;
    public url: string;
    public intentSchema: any;
    public interactionModel: any;
    public sampleUtterances: any;

    public id(): string {
        return this.name;
    }

    public invoke(message: SilentMessage): Promise<SilentReply> {
        const builder = VirtualAlexa.Builder();
        if (this.interactionModel) {
            builder.interactionModel(this.interactionModel);
        } else {
            builder.intentSchema(this.intentSchema);
            builder.sampleUtterances(this.sampleUtterances);
        }

        builder.skillURL(this.url);
        const alexa = builder.create();

        let promise;
        if (message.isLaunch()) {
            promise = alexa.launch().then((json) => {
                return SilentReply.alexaResponseToReply(message, json);
            });
        } else {
            promise = alexa.utter(message.skillMessage).then((json) => {
                return SilentReply.alexaResponseToReply(message, json);
            });
        }
        return promise;
    }
}

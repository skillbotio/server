import {BSTAlexa} from "bespoken-tools";
import {SilentMessage} from "./SilentMessage";
import {SilentReply} from "./SilentReply";

export class UserSession {
    private enginesByID: {[id: string]: BSTAlexa} = {};

    public constructor(userID: string) {

    }

    public handleMessage(message: SilentMessage): Promise<SilentReply> {
        if (message.isForSkill()) {
            const alexa = this.emulator(message);
            return new Promise((resolve, reject) => {
                alexa.spoken(message.skillMessage, function(error: any, response: any) {
                    const reply = new SilentReply(message);

                    resolve()
                });
            });
        } else {
            return Promise.resolve(new SilentReply(message, "No reply for this message"));
        }
    }

    private emulator(message: SilentMessage) {
        let alexa = this.enginesByID[message.skill.id()];
        if (!alexa) {
            alexa = new BSTAlexa(message.skill.url);
            this.enginesByID[message.skill.id()] = alexa;
        }
        return alexa;
    }

}
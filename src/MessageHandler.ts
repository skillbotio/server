import {SkillBotMessage} from "./SkillBotMessage";
import {SkillBotReply} from "./SkillBotReply";
import {UserSession} from "./UserSession";

export class MessageHandler {
    public static Instance(): MessageHandler {
        return MessageHandler.INSTANCE;
    }

    private static INSTANCE = new MessageHandler();

    private sessions: {[id: string]: UserSession} = {};

    private constructor() {}

    public process(message: SkillBotMessage): Promise<SkillBotReply> {
        let session;
        if (message.userID in this.sessions) {
            session = this.sessions[message.userID];
        } else {
            session = new UserSession(message.userID);
            this.sessions[message.userID] = session;
        }

        return session.handleMessage(message);
    }
}

import {SkillBotServer} from "../src/SkillBotServer";

const server = new SkillBotServer();
server.start(parseInt(process.env.SERVER_PORT as string, 10));

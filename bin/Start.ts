import {SkillBotServer} from "../src/SkillBotServer";

require("dotenv").config();

console.log("PORT: " + process.env.SERVER_PORT);
const server = new SkillBotServer();
server.start(parseInt(process.env.SERVER_PORT as string, 10));

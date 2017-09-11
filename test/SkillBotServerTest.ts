import {assert} from "chai";
import * as nock from "nock";
import * as request from "request-promise";
import {Skill} from "../src/Skill";
import {SkillBotServer} from "../src/SkillBotServer";
import {SkillManager} from "../src/SkillManager";

const interactionModel = {
    intents: [
        {
            name: "Play",
            samples: ["play", "play next", "play now"],
        },
        {
            name: "SlottedIntent",
            samples: ["slot {SlotName}"],
            slots: [
                {name: "SlotName", type: "SLOT_TYPE"},
            ],
        },
        {
            name: "MultipleSlots",
            samples: ["multiple {SlotA} and {SlotB}", "reversed {SlotB} then {SlotA}"],
            slots: [
                {name: "SlotA", type: "SLOT_TYPE"},
                {name: "SlotB", type: "SLOT_TYPE"},
            ],
        },
    ],
};

describe("SkillBot End-to-End Tests", function() {
    describe("Calls mock skill", () => {
        let server: SkillBotServer;
        beforeEach(async () => {
            server = new SkillBotServer();
            await server.start();
        });

        afterEach(async () => {
            await server.stop();
        });

        it("Parses simple response", (done) => {
            const skill = new Skill();
            skill.interactionModel = interactionModel;
            skill.invocationName = "Test";
            skill.url = "http://skill.com/fake_url";
            SkillManager.Instance.put(skill);

            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .reply(200, {
                    response: {
                        outputSpeech: {
                            ssml: "<speak> Hi </speak>",
                            type: "SSML",
                        },
                    },
                });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&message=ask test play",
            };
            request(options).then((reply) => {
                assert.isDefined(reply.text);
                assert.equal(reply.text, "Hi");
                done();
            }).catch( (err) => {
                console.log(err);
                assert.fail(err);
            });

        });
    });
});

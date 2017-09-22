import {assert} from "chai";
import * as nock from "nock";
import * as request from "request-promise-native";
import {ISkillConfiguration} from "../src/ISkillConfiguration";
import {SkillBotServer} from "../src/SkillBotServer";
import {SkillManager} from "../src/SkillManager";
import {IUser, MessageDataStore} from "../src/MessageDataStore";

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
    this.timeout(5000);
    let server: SkillBotServer;
    beforeEach(async () => {
        server = new SkillBotServer();
        await server.start(true);

        const skill: ISkillConfiguration = {
            id: "testID",
            interactionModel,
            invocationName: "skillbot test",
            name: "test skill",
            secretKey: "testSecretKey",
            sourceID: "testSourceID",
            url: "http://skill.com/fake_url",
        };

        SkillManager.Instance.put(skill);
        await MessageDataStore.initialize();
    });

    afterEach(async () => {
        await server.stop();
    });

    describe("Calls mock skill", () => {
        it("Handles simple message", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url", (body: any) => {
                    // Test to make sure that the body is set correctly
                    return body.skillbot && body.skillbot.source === "slack";
                })
                .reply(200, {
                    response: {
                        card: {
                            content: "My TextField",
                            image: {
                                largeImageUrl: "https://i.giphy.com/media/3o7buirYcmV5nSwIRW/480w_s.jpg",
                            },
                            title: "My Title",
                        },
                        outputSpeech: {
                            ssml: "<speak> Hi </speak>",
                            type: "SSML",
                        },
                    },
                    sessionAttributes: {
                        user: {
                            userProperty: "test",
                            userPropertyBoolean: true,
                        },
                    },
                });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=ask skillbot test play&source=slack",
            };

            const reply = await request(options);
            assert.isDefined(reply.text);
            assert.equal(reply.text, "Hi");
            assert.equal(reply.card.content, "My TextField");
            assert.equal(reply.card.title, "My Title");
            assert.equal(reply.card.imageURL, "https://i.giphy.com/media/3o7buirYcmV5nSwIRW/480w_s.jpg");

            // Check the session data was saved
            const ds = new MessageDataStore();

            // The timing of this test is tricky - we save the user asynchronously on the server
            //  So it may not be saved when we go to look for it - perhaps add a setTimeout or nextTick here?
            const user = await ds.findUserByID("slack", "JPK") as IUser;
            assert.equal(user.attributes.userProperty, "test");
            assert.isTrue(user.attributes.userPropertyBoolean);
        });

        it("Handles session interaction", async () => {
            const skill: ISkillConfiguration = {
                id: "testID",
                interactionModel,
                invocationName: "skillbot test",
                name: "test skill",
                secretKey: "testSecretKey",
                sourceID: "testSourceID",
                url: "http://skill.com/fake_url",
            };

            SkillManager.Instance.put(skill);

            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .times(2)
                .reply(200, {
                    response: {
                        card: {
                            content: "My TextField",
                            image: {
                                largeImageUrl: "https://i.giphy.com/media/3o7buirYcmV5nSwIRW/480w_s.jpg",
                            },
                            title: "My Title",
                        },
                        outputSpeech: {
                            ssml: "<speak> Hi </speak>",
                            type: "SSML",
                        },
                    },
                });

            nock("http://skill.com")
                .post("/fake_url")
                .times(1)
                .reply(200, {
                    response: {
                        shouldEndSession: true,
                    },
                });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=ask skillbot test play",
            };

            let reply = await request(options);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=play",
            };
            reply = await request(callTwo);
            assert.isFalse(reply.sessionEnded);
            assert.equal(reply.text, "Hi");

            const callThree = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=play",
            };
            reply = await request(callThree);
            assert.isTrue(reply.sessionEnded);
        });

        it("Handles explicit session end", async () => {
            const skill: ISkillConfiguration = {
                id: "testID",
                interactionModel,
                invocationName: "skillbot test",
                name: "test skill",
                secretKey: "testSecretKey",
                sourceID: "testSourceID",
                url: "http://skill.com/fake_url",
            };

            SkillManager.Instance.put(skill);

            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .reply(200, {
                    response: {
                        card: {
                            content: "My TextField",
                            image: {
                                largeImageUrl: "https://i.giphy.com/media/3o7buirYcmV5nSwIRW/480w_s.jpg",
                            },
                            title: "My Title",
                        },
                        outputSpeech: {
                            ssml: "<speak> Hi </speak>",
                            type: "SSML",
                        },
                    },
                });

            nock("http://skill.com")
                .post("/fake_url")
                .times(1)
                .reply(200, {
                    response: {
                        shouldEndSession: true,
                    },
                });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=ask skillbot test play",
            };

            let reply = await request(options);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&utterance=quit",
            };
            reply = await request(callTwo);
            assert.isTrue(reply.sessionEnded);
            assert.equal(reply.text, "Goodbye!");
        });
    });

    describe("Saves/Updates with Skill Configuration", function() {
        this.timeout(20000);
        it("Saves and finds a skill", async () => {
            // This test relies on running against the dev firebase instance
            // It also requires there already be a source "testDoNotDelete"
            const skill: ISkillConfiguration = {
                id: "testIDToSave",
                interactionModel,
                invocationName: "test",
                name: "test skill",
                secretKey: "testSecretKey",
                sourceID: "testDoNotDelete",
                url: "http://skill.com/fake_url",
            };

            const saveOptions = {
                body: skill,
                json: true, // Automatically stringifies the body to JSON
                method: "POST",
                uri: "http://localhost:3001/skill",
            };

            await request(saveOptions);

            const findOptions = {
                headers: {
                    secretKey: "testSecretKey",
                },
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/skill/testIDToSave",
            };

            const savedSkill = await request(findOptions);
            assert.equal(savedSkill.id, "testIDToSave");
            assert.equal(savedSkill.interactionModel.intents.length, 3);
        });

        it("Cannot find a skill with bad key", async () => {
            const findOptions = {
                headers: {
                    secretKey: "nonExistentKey",
                },
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/skill/testIDToSave",
            };

            try {
                await request(findOptions);
            } catch (e) {
                assert.equal(e.name, "StatusCodeError");
                assert.isTrue(e.message.startsWith("403"));
            }
        });

        it("Cannot find a skill", async () => {
            const findOptions = {
                headers: {
                    secretKey: "nonExistentKey",
                },
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/skill/testIDDoesNotExist",
            };

            try {
                await request(findOptions);
            } catch (e) {
                assert.equal(e.name, "StatusCodeError");
                assert.isTrue(e.message.startsWith("404"));
            }
        });
    });
});

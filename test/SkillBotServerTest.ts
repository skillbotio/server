import {assert} from "chai";
import * as nock from "nock";
import * as request from "request-promise-native";
import {ISkillConfiguration} from "../src/ISkillConfiguration";
import {IUser, MessageDataStore} from "../src/MessageDataStore";
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
    this.timeout(10000);

    const mockSkillResponse = {
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
                userProperty2: "test2",
                userPropertyBoolean: true,
            },
        },
    };

    let server: SkillBotServer;
    beforeEach(async () => {
        server = new SkillBotServer();
        await server.start(3001);

        const skill: ISkillConfiguration = {
            id: "testID",
            imageURL: "https://bespoken.io/wp-content/uploads/Bespoken-Alpaca-Web-720x720-2-e1501010481243.png",
            interactionModel,
            invocationName: "skillbot test",
            name: "test skill",
            secretKey: "testSecretKey",
            sourceID: "testSourceID",
            url: "http://skill.com/fake_url",
        };

        SkillManager.INSTANCE.put(skill);
        await MessageDataStore.initialize();
    });

    afterEach(async () => {
        await server.stop();
    });

    describe("Calls mock skill", () => {
        it("Handles simple message", async () => {
            // We use nock to intercept network calls and return a mock response
            const randomValue = Math.random() + "";
            (mockSkillResponse.sessionAttributes.user as any).testRandom = randomValue;
            nock("http://skill.com")
                .post("/fake_url", (body: any) => {
                    // Test to make sure that the body is set correctly
                    return body.skillbot && body.skillbot.source === "UNIT";
                })
                .reply(200, mockSkillResponse);

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL1"
                    + "&utterance=ask skillbot test play",
            };

            const reply = await request(options);
            assert.isDefined(reply.text);
            assert.equal(reply.text, "Hi");
            assert.equal(reply.card.content, "My TextField");
            assert.equal(reply.card.title, "My Title");
            assert.equal(reply.card.imageURL, "https://i.giphy.com/media/3o7buirYcmV5nSwIRW/480w_s.jpg");
            assert.equal(reply.skill.name, "test skill");
            assert.isDefined(reply.skill.imageURL);
            // Check the session data was saved
            const ds = new MessageDataStore();

            // The timing of this test is tricky - we save the user asynchronously on the server
            //  So it may not be saved when we go to look for it - perhaps add a setTimeout or nextTick here?
            const user = await ds.findUserByID("UNIT", "JPK") as IUser;
            assert.equal(user.attributes.userProperty, "test");
            assert.equal(user.attributes.testRandom, randomValue);
            assert.isTrue(user.attributes.userPropertyBoolean);
        });

        it("Is onboarding for a new user", async () => {
            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=NEW_USER"
                + "&source=UNIT"
                + "&channel=CHANNEL1"
                + "&utterance=ask skillbot test play",
            };

            const reply = await request(options);
            assert.isTrue(reply.text.indexOf("Just a couple questions") !== -1);
        });

        it("Handles session interaction", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .times(2)
                .reply(200, mockSkillResponse);

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
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL1"
                    + "&utterance=ask skillbot test play",
            };

            let reply = await request(options);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL1"
                    + "&utterance=play",
            };
            reply = await request(callTwo);
            assert.isFalse(reply.sessionEnded);
            assert.equal(reply.text, "Hi");

            const callThree = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL1"
                    + "&utterance=play",
            };
            reply = await request(callThree);
            assert.isTrue(reply.sessionEnded);
        });

        it("Handles missing skill", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .reply(200, mockSkillResponse);

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                + "&source=UNIT"
                + "&channel=CHANNEL1"
                + "&utterance=ask nonexistent skill",
            };

            const reply = await request(options);
            assert.isFalse(reply.sessionEnded);
            assert.include(reply.text, "No skill found");
        });

        it("Handles explicit session end", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .reply(200, mockSkillResponse);

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
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL1"
                    + "&utterance=ask skillbot test play",
            };

            let reply = await request(options);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK&channel=CHANNEL1&source=UNIT&utterance=quit",
            };
            reply = await request(callTwo);
            assert.isTrue(reply.sessionEnded);
            assert.isDefined(reply.raw.request);
            assert.isUndefined(reply.raw.response);
            assert.equal(reply.text, "Goodbye!");
        });

        it("Handles two separate sessions by channel", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url", (body: any) => {
                        // Test to make sure that the body is set correctly
                        return body.session.new === true;
                    })
                .times(2)
                .reply(200, { response: {} });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL_1"
                    + "&utterance=ask skillbot test play",
            };

            await request(options);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                    + "&source=UNIT"
                    + "&channel=CHANNEL_2"
                    + "&utterance=ask skillbot test play",
            };
            const reply = await request(callTwo);
            assert.isTrue(reply.raw.request.session.new);
        });

        it("Handles one sessions for multiple users in channel when interacting with active skill", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .times(2)
                .reply(200, { response: {} });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                + "&source=UNIT"
                + "&channel=CHANNEL_1"
                + "&utterance=ask skillbot test play",
            };

            let reply = await request(options);
            assert.isTrue(reply.raw.request.session.new);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK2"
                + "&source=UNIT"
                + "&channel=CHANNEL_1"
                + "&utterance=yes",
            };
            reply = await request(callTwo);
            assert.equal(reply.raw.request.session.user.userId, "JPK");
        });

        it("Handles two sessions for multiple users in channel when opening a skill", async () => {
            // We use nock to intercept network calls and return a mock response
            nock("http://skill.com")
                .post("/fake_url")
                .times(2)
                .reply(200, { response: {} });

            const options = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK"
                + "&source=UNIT"
                + "&channel=CHANNEL_1"
                + "&utterance=ask skillbot test play",
            };

            let reply = await request(options);
            assert.isTrue(reply.raw.request.session.new);

            const callTwo = {
                json: true, // Automatically stringifies the body to JSON
                method: "GET",
                uri: "http://localhost:3001/message?userID=JPK2"
                + "&source=UNIT"
                + "&channel=CHANNEL_1"
                + "&utterance=ask skillbot test play",
            };
            reply = await request(callTwo);
            assert.equal(reply.raw.request.session.user.userId, "JPK2");
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
                secretKey: "8e5f16e7-0bb1-40a6-832d-c192c5a72a6f",
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

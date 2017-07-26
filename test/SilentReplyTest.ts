import {assert} from "chai";
import {SilentMessage} from "../src/SilentMessage";
import {SilentReply} from "../src/SilentReply";

describe("SilentMessage", function() {
    const TEST_USER_ID = "123";

    describe("alexaResponseToReply()", () => {
        it("Parses simple response", function() {
            const message = new SilentMessage(TEST_USER_ID, "ask pisco facts for a fact");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.equal(message.skillMessage, "play");
        });

        it("Parses simple message, ignores casing", function() {
            const message = new SilentMessage(TEST_USER_ID, "Ask we study Billionaires to Play");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.equal(message.skillMessage, "play");
        });

        it("Parses launch message", function() {
            const message = new SilentMessage(TEST_USER_ID, "open we study Billionaires to Play");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.isTrue(message.isLaunch());
        });
    });
});

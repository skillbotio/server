import {assert} from "chai";
import {SkillBotMessage, SkillUtterance} from "../src/SkillBotMessage";
import {SkillLoader} from "../src/SkillLoader";
import {SkillManager} from "../src/SkillManager";

describe("SkillBotMessageTest", function() {
    const TEST_USER_ID = "123";
    before(function() {
        const loader = new SkillLoader();
        const skills = loader.loadAll();
        for (const skill of skills) {
            SkillManager.Instance.put(skill);
        }
    });

    describe("#parse", () => {
        it("Parses simple message", function() {
            const message = new SkillBotMessage(TEST_USER_ID, "ask we study billionaires to play");
            assert.isDefined(message.skillUtterance);
            assert.equal((message.skillUtterance as SkillUtterance).skill.name, "We Study Billionaires");
            assert.equal((message.skillUtterance as SkillUtterance).utterance, "play");
        });

        it("Parses simple message, ignores casing", function() {
            const message = new SkillBotMessage(TEST_USER_ID, "Ask we study Billionaires to Play");
            assert.equal((message.skillUtterance as SkillUtterance).skill.name, "We Study Billionaires");
            assert.equal((message.skillUtterance as SkillUtterance).utterance, "play");
        });

        it("Parses launch message", function() {
            const message = new SkillBotMessage(TEST_USER_ID, "open we study Billionaires to Play");
            assert.isTrue((message.skillUtterance as any).isLaunch());
        });
    });
});

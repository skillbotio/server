import {assert} from "chai";
import {SilentMessage} from "../src/SilentMessage";
import {SkillLoader} from "../src/SkillLoader";
import {SkillManager} from "../src/SkillManager";

describe("SilentMessage", function() {
    before(function() {
        const loader = new SkillLoader();
        const skills = loader.loadAll();
        for (const skill of skills) {
            SkillManager.Instance.put(skill);
        }
    });

    describe("#parse", () => {
        it("Parses simple message", function() {
            const message = new SilentMessage("ask we study billionaires to play");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.equal(message.skillMessage, "play");
        });

        it("Parses simple message, ignores casing", function() {
            const message = new SilentMessage("Ask we study Billionaires to Play");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.equal(message.skillMessage, "play");
        });

        it("Parses launch message", function() {
            const message = new SilentMessage("open we study Billionaires to Play");
            assert.equal(message.skill.invocationName, "we study billionaires");
            assert.isTrue(message.isLaunch());
        });
    });
});

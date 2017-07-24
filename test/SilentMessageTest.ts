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
        });
    });
});

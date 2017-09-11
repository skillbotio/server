import {assert} from "chai";
import {DataStore} from "../src/DataStore";
import {ISkillConfiguration} from "../src/ISkillConfiguration";

require("dotenv").config();

describe("SkillBotMessageTest", () => {
    describe("#initialize()", () => {
        it("Initializes succesfully", async () => {
            try {
                const ds = await new DataStore().initialize();
                assert.isDefined(ds);
            } catch (e) {
                assert.fail(e);
            }
        });
    });

    describe("#saveSkill()", function() {
        this.timeout(10000);
        it("Saves and fetches a record", async () => {
            const ds = await new DataStore().initialize();
            const skill: ISkillConfiguration = {
                id: "testID",
                interactionModel: { model: true },
                invocationName: "test",
                name: "test skill",
                url: "http://skill.com/fake_url",
            };

            await ds.saveSkill(skill);
            const savedSkill = await ds.findSkill(skill.id) as ISkillConfiguration;
            assert.equal(savedSkill.name, "test skill");
            assert.isTrue(savedSkill.interactionModel.model);
        });
    });
});

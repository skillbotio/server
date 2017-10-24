import {assert} from "chai";
import {ISkillConfiguration} from "../src/ISkillConfiguration";
import {SkillDataStore} from "../src/SkillDataStore";

require("dotenv").config();

describe("SkillDataStore Test", function() {
    this.timeout(10000);

    describe("#initialize()", () => {
        it("Initializes succesfully", async () => {
            try {
                const ds = new SkillDataStore();
                assert.isDefined(ds);
            } catch (e) {
                console.log(e);
                assert.fail(e);
            }
        });
    });

    describe("#saveSkill()", () => {
        it("Saves and fetches a record", async () => {
            const ds = new SkillDataStore();
            const skill: ISkillConfiguration = {
                id: "testID",
                interactionModel: { model: true },
                invocationName: "test",
                name: "test skill",
                secretKey: "testSecretKey",
                sourceID: "testSourceID",
                url: "http://skill.com/fake_url",
            };

            await ds.saveSkill(skill);
            const savedSkill = await ds.findSkill(skill.id) as ISkillConfiguration;
            assert.equal(savedSkill.name, "test skill");
            assert.isTrue(savedSkill.interactionModel.model);
        });
    });

    describe("#findSkill()", () => {
        it("Find a record", async () => {
            const ds = new SkillDataStore();
            const savedSkill = await ds.findSkill("testID") as ISkillConfiguration;
            assert.equal(savedSkill.name, "test skill");
            assert.isTrue(savedSkill.interactionModel.model);
        });

        it("Cannot find a record", async () => {
            const ds = new SkillDataStore();
            const savedSkill = await ds.findSkill("testIDDoesNotExist") as ISkillConfiguration;
            assert.isUndefined(savedSkill);
        });
    });

    describe("#findSkills()", () => {
        it("Finds skills", async () => {
            const ds = new SkillDataStore();
            const savedSkills = await ds.findSkills() as any;
            assert.isTrue(Object.keys(savedSkills).length >= 1);
        });
    });
});

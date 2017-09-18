import {assert} from "chai";
import {IUser, MessageDataStore} from "../src/MessageDataStore";

require("dotenv").config();

describe("SkillDataStore Test", function() {
    this.timeout(10000);

    describe("#connect()", () => {
        it("Connect succesfully", async () => {
            try {
                await new MessageDataStore().connect();
            } catch (e) {
                console.log(e);
                assert.fail(e);
            }
        });
    });

    describe("#saveUser()", () => {
        it("Saves and fetches a user", async () => {
            const ds = await new MessageDataStore().connect();
            const user = {
                source: "UNIT_TEST",
                userID: "userID",
            } as any;

            await ds.saveUser(user);
            const savedUser = await ds.findUserByID("UNIT_TEST", "userID") as IUser;
            // assert.isDefined(savedUser._id);
            assert.equal(savedUser.userID, "userID");
            assert.isDefined(savedUser.createdAt);
            assert.isDefined(savedUser.modifiedAt);
        });
    });

    describe("#fetchUser()", () => {
        it("Fetches a user that does not exist", async () => {
            const ds = await new MessageDataStore().connect();
            const savedUser = await ds.findUserByID("UNIT_TEST", "userIDDoesNotExistForReal") as IUser;
            assert.isUndefined(savedUser);
        });
    });
});

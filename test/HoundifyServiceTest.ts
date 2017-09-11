// import {assert} from "chai";
// import {HoundifyService} from "../src/HoundifyService";
// import {SilentMessage} from "../src/SilentMessage";

describe("HoundifyService", function() {
    // const TEST_USER_ID = "123";
    before(() => {
        require("dotenv").config();
    });

    describe("#handle()", () => {
        this.timeout(5000);
        // it("Handles what time is it", function(done) {
        //     const message = new SilentMessage(TEST_USER_ID, "what time is it?");
        //     const service = new HoundifyService();
        //     service.handle(message).then((reply) => {
        //         assert.isTrue(reply.text.indexOf("The Current Location") !== -1);
        //         assert.isUndefined(reply.imageURL);
        //         done();
        //     });
        // });
        //
        // it("Handles who are you", function(done) {
        //     const message = new SilentMessage(TEST_USER_ID, "who are you?");
        //     const service = new HoundifyService();
        //     service.handle(message).then((reply) => {
        //         assert.isTrue(reply.text.indexOf("There are 8 songs") !== -1);
        //         assert.isUndefined(reply.imageURL);
        //         done();
        //     });
        // });
        //
        // it("Handles what is the weather", function(done) {
        //     const message = new SilentMessage(TEST_USER_ID, "what is the weather?");
        //     const service = new HoundifyService();
        //     service.handle(message).then((reply) => {
        //         assert.isDefined(reply.text);
        //         assert.isDefined(reply.imageURL);
        //         done();
        //     });
        // });
    });
});

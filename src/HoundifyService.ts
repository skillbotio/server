import {SilentMessage} from "./SilentMessage";
import {SilentReply} from "./SilentReply";
const Houndify = require("houndify");

export class HoundifyService {
    private client: any;
    private clientID: string;
    public constructor() {
        this.clientID = process.env.HOUNDIFY_CLIENT_ID as string;
        const clientSecret = process.env.HOUNDIFY_CLIENT_SECRET;
        this.client = new Houndify.HoundifyClient({
            clientId: this.clientID,
            clientKey: clientSecret,
        });

    }
    public handle(message: SilentMessage): Promise<SilentReply> {
        // See https://houndify.com/reference/RequestInfo.
        // Use bignumber-js (https://www.npmjs.com/package/bignumber.js)
        // for passing number out of safe number range in RequestInfo
        const requestInfo = {
            ClientID: this.clientID,
            Latitude: 37.388309,
            Longitude: -121.973968,
        };

        return new Promise((resolve, reject) => {
            // send text search request to Houndify backend
            this.client.textSearch.query(message.fullMessage, requestInfo, {
                // Optionally you can override default listeners
                // for this specific query
                onResponse: (response: any, info: any) => {
                    console.log("Houndify Response: " + JSON.stringify(response));
                    console.log("Houndify Info: " + JSON.stringify(info));
                    const reply = new SilentReply(message);
                    if (response.AllResults.length > 0) {
                        const result = response.AllResults[0];
                        if (result.TemplateData) {
                            if (result.TemplateData.Items[0].TemplateName === "ImageCarousel") {
                                reply.imageURL = result.TemplateData.Items[0].TemplateData.Slides[0].ImageURL;
                            }
                        }
                        reply.text = result.WrittenResponseLong;
                    }
                    resolve(reply);
                },
            });
        });
    }

}
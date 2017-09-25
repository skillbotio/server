import * as mongoose from "mongoose";

// Saves records to mongo
export class MessageDataStore {
    public static async initialize(): Promise<void> {
        const uri = process.env.MONGO_URL as string;
        // We use a require here because otherwise we get an error trying to do this assignment to mongoose.Promise
        require("mongoose").Promise = global.Promise;
        return await mongoose.connect(uri, { useMongoClient: true});
    }

    public async saveUser(user: IUser): Promise<IUser> {
        // If the id is set, means this is an existing document
        if (user._id) {
            return await userModel.update({ source: user.source, userID: user.userID }, user);
        } else {
            return await userModel.create(user);
        }
    }

    public async findUserByID(source: string, userID: string): Promise<IUser | undefined> {
        const users = await userModel.find({ source, userID });
        if (users.length > 0) {
            return users[0];
        } else {
            return undefined;
        }
    }

    public async saveMessage(message: IMessage): Promise<IMessage> {
        return await messageModel.create(message);
    }

    public async findMessageByID(messageID: string): Promise<IMessage> {
        return await messageModel.findById(messageID) as IMessage;
    }
}

// Below here is all our mongo schema stuff

// Validation function for saving created timestamp on objects - used for IMessage and IUser
const prevalidate = function(next: () => void) {
    if (this._doc) {
        const doc = this._doc as IModel;
        const now = new Date();
        if (!doc.createdAt) {
            doc.createdAt = now;
        }
    }
    next();
};

export interface IModel extends mongoose.Document {
    createdAt?: Date;
}

export interface IUser extends IModel {
    userID: string;
    source: string;
    attributes: {[id: string]: string};
}

const userSchema = new mongoose.Schema({
        attributes: {
            required: true,
            type: Object,
        },
        createdAt: {
            required: true,
            type: Date,
        },
        source: {
            required: true,
            type: String,
        },
        userID: {
            required: true,
            type: String,
        },
    },
    { minimize: false }); // This forces mongo to save empty objects;

userSchema.pre("validate", prevalidate);

const userModel = mongoose.model<IUser>("user", userSchema, "users", true);

export interface IMessage extends IModel {
    channel: string;
    userID: string;
    source: string;
    message: string;
    reply: any;
}

const messageSchema = new mongoose.Schema({
        channel: {
            required: true,
            type: String,
        },
        createdAt: {
            required: true,
            type: Date,
        },
        message: {
            required: true,
            type: String,
        },
        reply: {
            required: false,
            type: Object,
        },
        source: {
            required: true,
            type: String,
        },
        userID: {
            required: true,
            type: String,
        },
    },
    { minimize: false }); // This forces mongo to save empty objects);

messageSchema.pre("validate", prevalidate);

const messageModel = mongoose.model<IMessage>("message", messageSchema, "messages", true);

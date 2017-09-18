import * as mongoose from "mongoose";

// Saves records to mongo
export class MessageDataStore {
    public async connect(): Promise<MessageDataStore> {
        const uri = process.env.MONGO_URL as string;
        // We use a require here because otherwise we get an error trying to do this assignment to mongoose.Promise
        require("mongoose").Promise = global.Promise;
        await mongoose.connect(uri, { useMongoClient: true});
        return this;
    }

    public async saveUser(user: IUser) {
        try {
            await userModel.create(user);
        } catch (e) {
            console.log(e);
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
}

export interface IUser extends mongoose.Document {
    userID: string;
    source: string;
    createdAt?: Date;
    modifiedAt?: Date;
}

const userSchema = new mongoose.Schema({
    createdAt: {
        required: true,
        type: Date,
    },
    modifiedAt: {
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
});

userSchema.pre("validate", function(next) {
    if (this._doc) {
        const doc = this._doc as IUser;
        const now = new Date();
        if (!doc.createdAt) {
            doc.createdAt = now;
        }
        doc.modifiedAt = now;
    }
    next();
});

const userModel = mongoose.model<IUser>("user", userSchema, "users", true);

import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String
    },
    username: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    joined: {
        type: Date,
        default: Date.now()
    }
});

export const UserModel = mongoose.model('User', UserSchema);

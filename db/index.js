import mongoose from "mongoose";

export const connectDb = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to mongodb !!');
}

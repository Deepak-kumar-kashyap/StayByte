import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;

        if (!mongoUrl) {
            throw new Error("Missing MongoDB connection string. Please set MONGODB_URL or MONGODB_URI in your .env file.");
        }

        await mongoose.connect(mongoUrl);
        console.log("✅ DB connected");
    } catch (error) {
        console.log("DB error:", error.message || error);
        throw error;
    }
};

export default connectDB